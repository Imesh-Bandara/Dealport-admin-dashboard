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

const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_TIMEOUT_MS = 10_000;

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
   * Generates a short marketing-style product description via the Gemini
   * API. Never throws an unhandled error — every failure mode (missing key,
   * timeout, non-200, unparseable response) is mapped to a clean HTTP
   * exception with a message safe to show the admin.
   */
  async generateDescription(
    dto: GenerateDescriptionDto,
  ): Promise<{ description: string }> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'AI description generation is not configured (missing GEMINI_API_KEY).',
      );
    }

    const prompt = this.buildDescriptionPrompt(dto);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          signal: controller.signal,
        },
      );
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        this.logger.warn('Gemini API call timed out');
        throw new RequestTimeoutException(
          'AI description generation timed out. Please try again.',
        );
      }
      this.logger.warn(
        `Gemini API call failed: ${err instanceof Error ? err.message : 'unknown error'}`,
      );
      throw new ServiceUnavailableException(
        'Could not reach the AI description service. Please try again.',
      );
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      this.logger.warn(`Gemini API responded with ${response.status}`);
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

    const text = this.extractGeminiText(data);
    if (!text) {
      throw new ServiceUnavailableException(
        'AI description service returned an empty response.',
      );
    }

    return { description: text.trim() };
  }

  private buildDescriptionPrompt(dto: GenerateDescriptionDto): string {
    const details = [`Product name: ${dto.name}`];
    if (dto.category) details.push(`Category: ${dto.category}`);
    if (dto.price !== undefined) details.push(`Price: $${dto.price}`);

    return [
      'Write a short e-commerce product description: 2-3 sentences, upbeat',
      'and persuasive marketing tone, plain text only (no markdown, no',
      'quotation marks around the output).',
      '',
      details.join('\n'),
    ].join('\n');
  }

  private extractGeminiText(data: unknown): string | null {
    if (typeof data !== 'object' || data === null) return null;
    const candidates = (data as { candidates?: unknown }).candidates;
    if (!Array.isArray(candidates) || candidates.length === 0) return null;
    const content = (candidates[0] as { content?: unknown })?.content;
    const parts = (content as { parts?: unknown })?.parts;
    if (!Array.isArray(parts) || parts.length === 0) return null;
    const text = (parts[0] as { text?: unknown })?.text;
    return typeof text === 'string' ? text : null;
  }
}
