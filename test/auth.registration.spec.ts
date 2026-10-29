import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthService } from '../src/modules/identity/application/auth.service';

describe('account registration', () => {
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
