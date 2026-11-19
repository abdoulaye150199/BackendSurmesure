import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { SubscriptionPlan } from '@prisma/client';
import type { AuthUser } from './current-user.decorator';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

const PLAN_KEY = 'minimumSubscriptionPlan';
const rank: Record<SubscriptionPlan, number> = { ESSENTIEL: 1, ATELIER: 2, STUDIO: 3 };
export const MinimumPlan = (plan: SubscriptionPlan) => SetMetadata(PLAN_KEY, plan);

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly db: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const minimum = this.reflector.getAllAndOverride<SubscriptionPlan>(PLAN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!minimum) return true;
    const user = context.switchToHttp().getRequest<{ user: AuthUser }>().user;
    if (user?.role === 'EMPLOYEE') {
      const personnel = await this.db.personnel.findFirst({
        where: {
          userId: user.sub,
          active: true,
          stylist: { user: { is: { active: true, deletedAt: null, subscriptionPlan: 'STUDIO' } } },
        },
        select: { id: true },
      });
      if (personnel) return true;
      throw new ForbiddenException('L’accès équipe nécessite la formule Studio de votre atelier.');
    }
    if (
      user?.role !== 'STYLIST' ||
      !user.subscriptionPlan ||
      rank[user.subscriptionPlan] < rank[minimum]
    ) {
      throw new ForbiddenException(
        `Cette fonctionnalité nécessite la formule ${minimum}, attribuée par l’administrateur.`,
      );
    }
    return true;
  }
}
