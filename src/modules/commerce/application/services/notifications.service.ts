import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { PageQueryDto } from '../../../../shared/application/page.dto';
import { paginate } from '../../../../shared/application/pagination';

@Injectable()
export class NotificationsService {
  constructor(private readonly db: PrismaService) {}
  async list(clientId: string, query: PageQueryDto) {
    const rows = await this.db.clientNotification.findMany({
      where: { clientId },
      take: query.limit + 1,
      ...(query.cursor && { cursor: { id: query.cursor }, skip: 1 }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return paginate(rows, query.limit);
  }
  async markRead(clientId: string, id: string) {
    await this.db.clientNotification.updateMany({
      where: { id, clientId, readAt: null },
      data: { readAt: new Date() },
    });
    const notification = await this.db.clientNotification.findFirst({ where: { id, clientId } });
    if (!notification) {
      throw new NotFoundException('Notification introuvable');
    }
    return notification;
  }
}
