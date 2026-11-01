import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { canonicalPhone } from '../../../../shared/domain/contact';
@Injectable()
export class CommerceAccessService {
  constructor(private readonly db: PrismaService) {}
  async stylistProfile(routeId: string, actorId: string) {
    const profile = await this.db.stylistProfile.findFirst({
      where: { OR: [{ id: routeId }, { userId: routeId }] },
    });
    if (!profile) {
      throw new NotFoundException('Styliste introuvable');
    }
    if (profile.userId !== actorId) {
      throw new ForbiddenException('Accès interdit à cet atelier');
    }
    return profile;
  }
  async employeeProfile(actorId: string) {
    const person = await this.db.personnel.findFirst({
      where: {
        userId: actorId,
        active: true,
        user: { is: { active: true, role: UserRole.EMPLOYEE } },
      },
      include: { stylist: { select: { id: true, businessName: true } } },
    });
    if (!person) {
      throw new ForbiddenException('Accès employé désactivé ou introuvable');
    }
    return person;
  }
  async assertClientPhone(clientId: string, phone: string): Promise<void> {
    const client = await this.db.user.findFirst({
      where: { id: clientId, active: true, role: UserRole.CLIENT },
      select: { phone: true },
    });
    if (!client || canonicalPhone(client.phone) !== canonicalPhone(phone)) {
      throw new BadRequestException('Le compte client ne correspond pas au téléphone indiqué.');
    }
  }
}
