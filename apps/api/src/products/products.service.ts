import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductStatus, StockStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
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

  async create(dto: CreateProductDto) {
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
}
