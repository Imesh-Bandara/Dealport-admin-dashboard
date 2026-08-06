import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  RequestTimeoutException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma, ProductStatus, StockStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { GenerateDescriptionDto } from './dto/generate-description.dto';

// Groq (groq.com) hosts open models behind an OpenAI-compatible chat
// completions API — not to be confused with xAI's "Grok". Swapped in here
// after Gemini's free tier proved unusable (new Google Cloud projects were
// stuck at a hard 0 quota even with billing linked); Groq's free tier
// doesn't require a billing account at all.
const AI_MODEL = 'llama-3.3-70b-versatile';
const AI_TIMEOUT_MS = 10_000;

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.ProductWhereInput = {
      ...(query.search
        ? {
            name: {
              contains: query.search,
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { category: true, tags: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, tags: true },
    });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  // Only validates the range when both ends are present in the same payload —
  // a PATCH that only touches one end isn't cross-checked against the
  // product's existing stored value.
  private assertValidExpirationWindow(start?: string, end?: string) {
    if (start && end && new Date(end) < new Date(start)) {
      throw new BadRequestException(
        'expirationEnd must not be before expirationStart',
      );
    }
  }

  async create(dto: CreateProductDto) {
    this.assertValidExpirationWindow(dto.expirationStart, dto.expirationEnd);
    const { tags, categoryId, ...rest } = dto;
    return this.prisma.product.create({
      data: {
        ...rest,
        stockStatus: rest.stockStatus ?? StockStatus.IN_STOCK,
        status: rest.status ?? ProductStatus.DRAFT,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        tags: tags?.length
          ? {
              connectOrCreate: tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: { category: true, tags: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    this.assertValidExpirationWindow(dto.expirationStart, dto.expirationEnd);
    const { tags, categoryId, ...rest } = dto;
    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        category:
          categoryId === undefined
            ? undefined
            : categoryId === null
              ? { disconnect: true }
              : { connect: { id: categoryId } },
        tags: tags
          ? {
              set: [],
              connectOrCreate: tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: { category: true, tags: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
    return { id, deleted: true };
  }

  async topProducts(limit = 4) {
    return this.prisma.product.findMany({
      orderBy: { totalOrders: 'desc' },
      take: limit,
      include: { category: true },
    });
  }

  async bestSelling(limit = 4) {
    return this.prisma.product.findMany({
      where: { status: ProductStatus.PUBLISHED },
      orderBy: { totalOrders: 'desc' },
      take: limit,
      include: { category: true },
    });
  }

  async stats() {
    const [totalProducts, published, outOfStock] =
      await this.prisma.$transaction([
        this.prisma.product.count(),
        this.prisma.product.count({
          where: { status: ProductStatus.PUBLISHED },
        }),
        this.prisma.product.count({
          where: { stockStatus: StockStatus.OUT_OF_STOCK },
        }),
      ]);
    return { totalProducts, published, outOfStock };
  }

  /**
   * Generates a short marketing-style product description via Groq's
   * OpenAI-compatible chat completions API. Never throws an unhandled
   * error — every failure mode (missing key, timeout, non-200, unparseable
   * response) is mapped to a clean HTTP exception with a message safe to
   * show the admin.
   */
  async generateDescription(
    dto: GenerateDescriptionDto,
  ): Promise<{ description: string }> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'AI description generation is not configured (missing GROQ_API_KEY).',
      );
    }

    const { system, user } = this.buildDescriptionPrompt(dto);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: AI_MODEL,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
          }),
          signal: controller.signal,
        },
      );
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        this.logger.warn('Groq API call timed out');
        throw new RequestTimeoutException(
          'AI description generation timed out. Please try again.',
        );
      }
      this.logger.warn(
        `Groq API call failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
      throw new ServiceUnavailableException(
        'Could not reach the AI description service. Please try again.',
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      this.logger.warn(`Groq API responded with ${response.status}`);
      throw new ServiceUnavailableException(
        'AI description generation failed. Please try again or write one manually.',
      );
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new ServiceUnavailableException(
        'AI description service returned an unreadable response.',
      );
    }

    const text = this.extractGroqText(data);
    if (!text) {
      throw new ServiceUnavailableException(
        'AI description service returned an empty response.',
      );
    }

    return { description: text.trim() };
  }

  private buildDescriptionPrompt(dto: GenerateDescriptionDto): {
    system: string;
    user: string;
  } {
    const details = [`Product name: ${dto.name}`];
    if (dto.category) details.push(`Category: ${dto.category}`);
    if (dto.price !== undefined) details.push(`Price: $${dto.price}`);

    return {
      system:
        'You write short e-commerce product descriptions: 2-3 sentences, ' +
        'upbeat and persuasive marketing tone, plain text only (no markdown, ' +
        'no quotation marks around the output).',
      user: details.join('\n'),
    };
  }

  private extractGroqText(data: unknown): string | null {
    if (typeof data !== 'object' || data === null) return null;
    const choices = (data as { choices?: unknown }).choices;
    if (!Array.isArray(choices) || choices.length === 0) return null;
    const message = (choices[0] as { message?: unknown })?.message;
    const content = (message as { content?: unknown })?.content;
    return typeof content === 'string' ? content : null;
  }
}
