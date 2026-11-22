import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from '../src/modules/identity/application/auth.service';
import { AccountRole } from '../src/modules/identity/domain/account-role';

describe('dedicated administrator login', () => {
  const credentials = { email: 'admin@example.test', password: 'PrivatePassword2026!' };
  let passwordHash: string;
  beforeAll(async () => {
    passwordHash = await argon2.hash(credentials.password);
  });

  function setup(role: AccountRole = AccountRole.ADMIN) {
    const users = {
      findByEmail: jest.fn().mockResolvedValue({
        id: 'user',
        role,
        active: true,
        approvalStatus: 'approved',
        passwordHash,
      }),
    };
    const service = new AuthService(users as never, {} as never, {} as never, {} as never);
    const tokens = jest
      .spyOn(service, 'issueTokens')
      .mockResolvedValue({ token: 'session' } as never);
    return { service, tokens };
  }

  it.each([undefined, AccountRole.CLIENT, AccountRole.STYLIST, AccountRole.EMPLOYEE])(
    'refuses administrator credentials outside the administrator endpoint (%s)',
    async (requiredRole) => {
      const { service, tokens } = setup();
      await expect(service.login(credentials, requiredRole)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(tokens).not.toHaveBeenCalled();
    },
  );

  it('accepts valid administrator credentials through the dedicated endpoint', async () => {
    const { service, tokens } = setup();
    await expect(service.login(credentials, AccountRole.ADMIN)).resolves.toEqual({
      token: 'session',
    });
    expect(tokens).toHaveBeenCalledTimes(1);
  });

  it('still rejects an incorrect administrator password', async () => {
    const { service, tokens } = setup();
    await expect(
      service.login({ ...credentials, password: 'wrong' }, AccountRole.ADMIN),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(tokens).not.toHaveBeenCalled();
  });

  it.each([AccountRole.CLIENT, AccountRole.STYLIST, AccountRole.EMPLOYEE])(
    'preserves shared login for %s',
    async (role) => {
      const { service, tokens } = setup(role);
      await expect(service.login(credentials)).resolves.toEqual({ token: 'session' });
      expect(tokens).toHaveBeenCalledTimes(1);
    },
  );
});
