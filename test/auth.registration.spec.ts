import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthService } from '../src/modules/identity/application/auth.service';

describe('account registration', () => {
  it('stores only the password hash and never forwards the plaintext password to Prisma', async () => {
    const users = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockImplementation(async (data) => ({
        id: 'user-1',
        ...data,
        refreshTokenHash: null,
        profileImage: '',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      setRefreshTokenHash: jest.fn().mockResolvedValue(undefined),
    };
    const jwt = { signAsync: jest.fn().mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token') };
    const config = {
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
      get: jest.fn((_key: string, fallback: string) => fallback),
    };
    const service = new AuthService(users as never, jwt as never, config as never);
    const password = 'MotDePasse!2026';

    await service.register({
      firstName: 'Fatou',
      lastName: 'Ndiaye',
      email: 'fatou@example.com',
      phone: '+221770000000',
      password,
    });

    const storedAccount = users.create.mock.calls[0][0];
    expect(storedAccount).not.toHaveProperty('password');
    expect(storedAccount.passwordHash).not.toBe(password);
    expect(storedAccount.role).toBe('CLIENT');
    expect(users.setRefreshTokenHash).toHaveBeenCalledWith('user-1', expect.any(String));
  });

  it('returns a conflict when the email or phone is already registered', async () => {
    const duplicate = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
      meta: { target: ['phone'] },
    });
    const users = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockRejectedValue(duplicate),
    };
    const service = new AuthService(users as never, {} as never, {} as never);

    await expect(service.register({
      firstName: 'Fatou', lastName: 'Ndiaye', email: 'fatou@example.com',
      phone: '+221770000000', password: 'MotDePasse!2026',
    })).rejects.toBeInstanceOf(ConflictException);
  });
});
