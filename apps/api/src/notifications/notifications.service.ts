import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_LIST_LIMIT = 20;
const MAX_LIST_LIMIT = 100;

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Fire-and-forget style: callers (ProductsService) await this after a
   *  successful mutation, but a notification failing to write should never
   *  be treated the same as the underlying product mutation failing. */
  async log(type: NotificationType, message: string) {
    return this.prisma.notification.create({ data: { type, message } });
  }

  async findRecent(limit = DEFAULT_LIST_LIMIT) {
    const take = Math.min(Math.max(limit, 1), MAX_LIST_LIMIT);
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  async unreadCount() {
    const count = await this.prisma.notification.count({
      where: { read: false },
    });
    return { count };
  }

  async markRead(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification ${id} not found`);
    }
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllRead() {
    const result = await this.prisma.notification.updateMany({
      where: { read: false },
      data: { read: true },
    });
    return { count: result.count };
  }
}
