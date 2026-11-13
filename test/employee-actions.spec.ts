import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from '../src/modules/identity/application/auth.service';
import { createCommerceService } from './commerce.fixture';

describe('employee actions', () => {
  const setup = () => {
    const db = {
      personnel: { findFirst: jest.fn().mockResolvedValue({ stylistId: 'assigned-atelier' }) },
      order: {
        create: jest.fn().mockResolvedValue({ id: 'order' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      measurement: { create: jest.fn() },
      catalogItem: { create: jest.fn() },
      $queryRaw: jest.fn().mockResolvedValue([]),
      $transaction: jest.fn(),
    };
    db.$transaction.mockImplementation((callback) => callback(db));
    return { db, service: createCommerceService(db as never) };
  };
  it('attaches orders and pending measurements to the assigned atelier', async () => {
    const { db, service } = setup();
    await service.createEmployeeOrder('employee', {
      clientName: 'Fatou Ndiaye',
      clientPhone: '+221770000001',
      description: 'Tenue de cérémonie',
      totalPrice: 30000,
      measurements: { taille: 74 },
    });
    expect(db.order.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ stylistId: 'assigned-atelier', clientId: null }),
    });
    expect(db.measurement.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        stylistId: 'assigned-atelier',
        source: 'employee',
        validatedAt: null,
        validatedById: null,
      }),
    });
    expect(db.personnel.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'employee',
          active: true,
          user: { is: { active: true, role: 'EMPLOYEE' } },
        },
      }),
    );
  });
  it('publishes and lists only within the assigned atelier', async () => {
    const { db, service } = setup();
    await service.createEmployeeCatalog('employee', {
      title: 'Création',
      description: '',
      imageUrl: 'https://example.com/model.jpg',
      price: 1000,
      currency: 'XOF',
      availableColors: [],
    });
    expect(db.catalogItem.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ stylistId: 'assigned-atelier' }),
    });
    await service.listEmployeeOrders('employee', { limit: 100 });
    expect(db.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { stylistId: 'assigned-atelier', status: undefined } }),
    );
  });
  it('refuses new actions when the assignment is inactive', async () => {
    const { db, service } = setup();
    db.personnel.findFirst.mockResolvedValue(null);
    await expect(service.createEmployeeOrder('employee', {} as never)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(service.createEmployeeCatalog('employee', {} as never)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(db.order.create).not.toHaveBeenCalled();
    expect(db.catalogItem.create).not.toHaveBeenCalled();
  });
});

describe('employee password change', () => {
  const setup = async () => {
    const user = {
      id: 'employee',
      role: 'EMPLOYEE',
      active: true,
      mustChangePassword: true,
      email: 'employee@example.com',
      passwordHash: await argon2.hash('InitialPassword2026'),
    };
    const users = {
      findById: jest.fn().mockResolvedValue(user),
      changePassword: jest.fn().mockResolvedValue(true),
      saveRefreshToken: jest.fn().mockResolvedValue(true),
    };
    const jwt = { signAsync: jest.fn().mockResolvedValue('token') };
    const config = {
      getOrThrow: jest.fn().mockReturnValue('secret'),
      get: jest.fn((_key, fallback) => fallback),
    };
    return {
      user,
      users,
      service: new AuthService(users as never, jwt as never, config as never, { send: jest.fn() } as never),
    };
  };
  it('requires the current password before changing anything', async () => {
    const { users, service } = await setup();
    await expect(
      service.changeEmployeePassword('employee', {
        currentPassword: 'wrong',
        newPassword: 'PersonalPassword2026',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(users.changePassword).not.toHaveBeenCalled();
  });
  it('hashes the new password and returns a session without the first-login reminder', async () => {
    const { user, users, service } = await setup();
    const result = await service.changeEmployeePassword('employee', {
      currentPassword: 'InitialPassword2026',
      newPassword: 'PersonalPassword2026',
    });
    const [id, expectedHash, newHash] = users.changePassword.mock.calls[0];
    expect(id).toBe('employee');
    expect(expectedHash).toBe(user.passwordHash);
    expect(await argon2.verify(newHash, 'PersonalPassword2026')).toBe(true);
    expect(result.data.mustChangePassword).toBe(false);
    expect(result.data).not.toHaveProperty('passwordHash');
  });
  it('rejects a concurrent password change', async () => {
    const { users, service } = await setup();
    users.changePassword.mockResolvedValue(false);
    await expect(
      service.changeEmployeePassword('employee', {
        currentPassword: 'InitialPassword2026',
        newPassword: 'PersonalPassword2026',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(users.saveRefreshToken).not.toHaveBeenCalled();
  });
});
