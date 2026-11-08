import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AdministrationService } from '../src/modules/commerce/application/services/administration.service';
import { PrismaUserRepository } from '../src/modules/identity/infrastructure/prisma-user.repository';

describe('Administrator account deletion', () => {
  function setup(role: UserRole = UserRole.CLIENT) {
    const tx = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'target', role }),
        update: jest.fn(),
        updateMany: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      stylistProfile: { findUnique: jest.fn().mockResolvedValue({ id: 'atelier' }) },
      personnel: {
        findMany: jest.fn().mockResolvedValue([{ userId: 'employee' }, { userId: null }]),
        updateMany: jest.fn(),
      },
      catalogItem: { updateMany: jest.fn() },
      appointment: { updateMany: jest.fn() },
    };
    const db = { ...tx, $transaction: jest.fn(async (action) => action(tx)) };
    return { tx, db, service: new AdministrationService(db as never) };
  }

  it('revokes a client and preserves its historical records', async () => {
    const { tx, service } = setup();
    await expect(service.adminDeleteUser('administrator', 'target')).resolves.toEqual({
      success: true,
      id: 'target',
      deletion: 'logical',
      historyPreserved: true,
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: 'target' },
      data: {
        active: false,
        deletedAt: expect.any(Date),
        refreshTokenHash: null,
        sessionVersion: { increment: 1 },
      },
    });
    expect(tx.appointment.updateMany).toHaveBeenCalledWith({
      where: { clientId: 'target', status: { in: ['pending', 'confirmed'] } },
      data: { status: 'cancelled' },
    });
  });
  it('disables the stylist team and catalog in the same transaction', async () => {
    const { tx, db, service } = setup(UserRole.STYLIST);
    await service.adminDeleteUser('administrator', 'target');
    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.user.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['employee'] }, role: 'EMPLOYEE', deletedAt: null },
      data: expect.objectContaining({
        active: false,
        deletedAt: expect.any(Date),
        sessionVersion: { increment: 1 },
      }),
    });
    expect(tx.catalogItem.updateMany).toHaveBeenCalledWith({
      where: { stylistId: 'atelier' },
      data: { active: false },
    });
    expect(tx.personnel.updateMany).toHaveBeenCalledWith({
      where: { stylistId: 'atelier' },
      data: { active: false },
    });
  });
  it('disables only the personnel record when deleting an employee', async () => {
    const { tx, service } = setup(UserRole.EMPLOYEE);
    await service.adminDeleteUser('administrator', 'target');
    expect(tx.personnel.updateMany).toHaveBeenCalledWith({
      where: { userId: 'target' },
      data: { active: false },
    });
    expect(tx.catalogItem.updateMany).not.toHaveBeenCalled();
  });
  it.each(['administrator', 'target'])(
    'protects administrator accounts, actor %s',
    async (actor) => {
      const { tx, service } = setup(UserRole.ADMIN);
      await expect(service.adminDeleteUser(actor, 'target')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(tx.user.update).not.toHaveBeenCalled();
    },
  );
  it('refuses missing or already deleted accounts', async () => {
    const { tx, service } = setup();
    tx.user.findUnique.mockResolvedValue(null);
    await expect(service.adminDeleteUser('administrator', 'target')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(tx.user.update).not.toHaveBeenCalled();
  });
  it('does not permit reactivation of a deleted account', async () => {
    const { tx, service } = setup();
    tx.user.findUnique.mockResolvedValue(null);
    await expect(
      service.adminSetUserStatus('administrator', 'target', true),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(tx.user.findUnique).toHaveBeenCalledWith({ where: { id: 'target', deletedAt: null } });
  });
  it('excludes deleted accounts from password, refresh and access lookups', async () => {
    const { db, tx } = setup();
    const repository = new PrismaUserRepository(db as never);
    await repository.findByEmail('CLIENT@example.com');
    expect(tx.user.findUnique).toHaveBeenLastCalledWith({
      where: { email: 'client@example.com', deletedAt: null },
    });
    await repository.findById('target');
    expect(tx.user.findUnique).toHaveBeenLastCalledWith({
      where: { id: 'target', deletedAt: null },
    });
    await repository.findAccessById('target');
    expect(tx.user.findUnique).toHaveBeenLastCalledWith(
      expect.objectContaining({ where: { id: 'target', deletedAt: null } }),
    );
  });
  it('paginates users and never selects password or token hashes', async () => {
    const { db, service } = setup();
    await service.adminUsers({ limit: 20 });
    const query = db.user.findMany.mock.calls[0][0];
    expect(query.where).toEqual({ deletedAt: null });
    expect(query.take).toBe(21);
    expect(query.select.passwordHash).toBeUndefined();
    expect(query.select.refreshTokenHash).toBeUndefined();
  });
});
