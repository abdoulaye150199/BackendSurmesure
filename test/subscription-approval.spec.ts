import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { SubscriptionPlan } from '@prisma/client';
import { AuthService } from '../src/modules/identity/application/auth.service';
import { AdministrationService } from '../src/modules/commerce/application/services/administration.service';
import { SubscriptionGuard } from '../src/modules/identity/presentation/subscription.guard';
import { StylistWorkspaceController } from '../src/modules/commerce/presentation/controllers/stylist.controller';

describe('Stylist subscription approval', () => {
  it.each<SubscriptionPlan>(['ESSENTIEL', 'ATELIER', 'STUDIO'])(
    'keeps %s registrations inactive until an admin assigns a plan',
    async (requestedPlan) => {
      let account: Record<string, unknown>;
      const users = {
        findByEmail: jest.fn().mockImplementation(async () => account ?? null),
        create: jest.fn().mockImplementation(
          async (data) =>
            (account = {
              id: 'stylist',
              profileImage: '',
              refreshTokenHash: null,
              sessionVersion: 0,
              subscriptionPlan: null,
              createdAt: new Date(),
              updatedAt: new Date(),
              ...data,
            }),
        ),
        saveRefreshToken: jest.fn().mockResolvedValue(true),
      };
      const jwt = { signAsync: jest.fn().mockResolvedValue('session-token') };
      const config = { getOrThrow: () => 'test-secret', get: (_: string, value: string) => value };
      const mail = { send: jest.fn() };
      const auth = new AuthService(users as never, jwt as never, config as never, mail as never);
      const credentials = { email: 'atelier@example.test', password: 'MotDePasse!2026' };
      const result = await auth.register({
        ...credentials,
        firstName: 'Awa',
        lastName: 'Diop',
        phone: '+221770000000',
        businessName: 'Atelier Awa',
        requestedPlan,
      });
      expect(result).toMatchObject({
        status: 'pending',
        data: { isActive: false, approvalStatus: 'pending', requestedPlan, subscriptionPlan: null },
      });
      expect(result).not.toHaveProperty('token');
      expect(jwt.signAsync).not.toHaveBeenCalled();
      expect(users.saveRefreshToken).not.toHaveBeenCalled();
      expect(mail.send).not.toHaveBeenCalled();
      await expect(auth.login(credentials)).rejects.toBeInstanceOf(ForbiddenException);

      const db = {
        user: {
          findUnique: jest.fn().mockImplementation(async () => account),
          update: jest
            .fn()
            .mockImplementation(
              async ({ data }) => (account = { ...account, ...data, sessionVersion: 1 }),
            ),
        },
      };
      const admin = new AdministrationService(db as never);
      await expect(admin.adminSetUserStatus('admin', 'stylist', true)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(db.user.update).not.toHaveBeenCalled();
      await admin.adminApproveUser('admin', 'stylist', 'ATELIER');
      expect(db.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            active: true,
            approvalStatus: 'approved',
            subscriptionPlan: 'ATELIER',
            approvedById: 'admin',
            sessionVersion: { increment: 1 },
          }),
        }),
      );
      expect(await auth.login(credentials)).toMatchObject({
        token: 'session-token',
        data: { isActive: true, subscriptionPlan: 'ATELIER', requestedPlan },
      });
    },
  );

  it('never attributes a stylist plan to a client or administrator', async () => {
    const user = { findUnique: jest.fn().mockResolvedValue({ role: 'CLIENT' }), update: jest.fn() };
    const admin = new AdministrationService({ user } as never);
    await expect(admin.adminApproveUser('admin', 'client', 'STUDIO')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(user.update).not.toHaveBeenCalled();
  });
});

describe('Subscription permissions', () => {
  const context = (user: object, method: keyof StylistWorkspaceController) =>
    ({
      getHandler: () => StylistWorkspaceController.prototype[method],
      getClass: () => StylistWorkspaceController,
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  const pages = [
    {
      plan: 'ESSENTIEL',
      allowed: ['orders', 'addCatalog', 'updateProfile'],
      denied: ['measurements', 'linkCandidates', 'appointments', 'personnel'],
    },
    {
      plan: 'ATELIER',
      allowed: ['orders', 'measurements', 'appointments', 'linkCandidates'],
      denied: ['personnel', 'createEmployeeAccount'],
    },
    {
      plan: 'STUDIO',
      allowed: ['orders', 'measurements', 'appointments', 'personnel', 'createEmployeeAccount'],
      denied: [],
    },
  ] as const;
  for (const { plan, allowed, denied } of pages) {
    for (const method of allowed)
      it(`allows ${plan} to access ${method}`, async () => {
        const guard = new SubscriptionGuard(new Reflector(), {} as never);
        await expect(
          guard.canActivate(context({ role: 'STYLIST', subscriptionPlan: plan }, method)),
        ).resolves.toBe(true);
      });
    for (const method of denied)
      it(`blocks ${plan} from ${method} on the server`, async () => {
        const guard = new SubscriptionGuard(new Reflector(), {} as never);
        await expect(
          guard.canActivate(context({ role: 'STYLIST', subscriptionPlan: plan }, method)),
        ).rejects.toBeInstanceOf(ForbiddenException);
      });
  }
  it('refuses workspace access without an admin-assigned plan', async () => {
    const guard = new SubscriptionGuard(new Reflector(), {} as never);
    await expect(
      guard.canActivate(context({ role: 'STYLIST', subscriptionPlan: null }, 'orders')),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('revokes employee access when the employer no longer has Studio', async () => {
    const personnel = { findFirst: jest.fn().mockResolvedValue(null) };
    const guard = new SubscriptionGuard(new Reflector(), { personnel } as never);
    await expect(
      guard.canActivate(context({ sub: 'employee', role: 'EMPLOYEE' }, 'personnel')),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(personnel.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          stylist: { user: { is: { active: true, deletedAt: null, subscriptionPlan: 'STUDIO' } } },
        }),
      }),
    );
  });
});
