import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { UpdateStylistProfileDto } from '../commerce.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly db: PrismaService) {}
  async updateStylistProfile(actorId: string, dto: UpdateStylistProfileDto) {
    const profile = await this.db.stylistProfile.findUnique({ where: { userId: actorId } });
    if (!profile) {
      throw new NotFoundException('Profil styliste introuvable');
    }
    const { profileImage, ...profileData } = dto;
    return this.db.stylistProfile.update({
      where: { id: profile.id },
      data: {
        ...profileData,
        ...(profileImage !== undefined ? { user: { update: { profileImage } } } : {}),
      },
      include: { user: { select: { firstName: true, lastName: true, profileImage: true } } },
    });
  }

  listStylists(limit: number, cursor?: string) {
    return this.db.stylistProfile.findMany({
      where: { user: { is: { active: true } } },
      take: limit,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: [{ rating: 'desc' }, { id: 'asc' }],
      include: { user: { select: { firstName: true, lastName: true, profileImage: true } } },
    });
  }
}
