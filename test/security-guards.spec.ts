import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../src/modules/identity/presentation/jwt-auth.guard';
import { RolesGuard } from '../src/modules/identity/presentation/roles.guard';
const userId = '11111111-1111-4111-8111-111111111111';
describe('live account access guard', () => {
  const setup = () => {
    const request = { headers: { authorization: 'Bearer signed-token' }, user: undefined };
    const context = { switchToHttp: () => ({ getRequest: () => request }) };
    const jwt = {
      verifyAsync: jest.fn().mockResolvedValue({ sub: userId, role: 'CLIENT', sessionVersion: 1 }),
    };
    const users = {
      findAccessById: jest.fn().mockResolvedValue({
        id: userId,
        role: 'CLIENT',
        active: true,
        sessionVersion: 1,
        email: 'client@example.com',
      }),
    };
    const config = { getOrThrow: jest.fn().mockReturnValue('test-secret') };
    return {
      request,
      context,
      jwt,
      users,
      guard: new JwtAuthGuard(jwt as never, config as never, users as never),
    };
  };
  it('attaches current identity without copying arbitrary token claims', async () => {
    const { request, context, guard } = setup();
    await expect(guard.canActivate(context as never)).resolves.toBe(true);
    expect(request.user).toEqual({ sub: userId, role: 'CLIENT', email: 'client@example.com' });
  });
  it('rejects a missing bearer token before querying the database', async () => {
    const { request, context, users, guard } = setup();
    request.headers.authorization = '';
    await expect(guard.canActivate(context as never)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(users.findAccessById).not.toHaveBeenCalled();
  });
  it.each([
    null,
    { id: userId, active: false, role: 'CLIENT', sessionVersion: 1 },
    { id: userId, active: true, role: 'STYLIST', sessionVersion: 1 },
    { id: userId, active: true, role: 'CLIENT', sessionVersion: 2 },
  ])('rejects removed, disabled, changed-role or revoked accounts %#', (user) => {
    const { context, users, guard } = setup();
    users.findAccessById.mockResolvedValue(user);
    return expect(guard.canActivate(context as never)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it('rejects invalid signed identities', async () => {
    const { context, jwt, guard } = setup();
    jwt.verifyAsync.mockResolvedValue({ sub: 'invalid', role: 'CLIENT', sessionVersion: 1 });
    await expect(guard.canActivate(context as never)).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('accepts a legacy version-zero token only while the account is still version zero', async () => {
    const { context, jwt, users, guard } = setup();
    jwt.verifyAsync.mockResolvedValue({ sub: userId, role: 'CLIENT' } as never);
    users.findAccessById.mockResolvedValue({
      id: userId,
      active: true,
      role: 'CLIENT',
      sessionVersion: 0,
      email: 'client@example.com',
    });
    await expect(guard.canActivate(context as never)).resolves.toBe(true);
  });
  it('does not turn a database outage into invalid credentials', async () => {
    const { context, users, guard } = setup();
    users.findAccessById.mockRejectedValue(new Error('database offline'));
    await expect(guard.canActivate(context as never)).rejects.toThrow('database offline');
  });
});
describe('role policy guard', () => {
  it('permits endpoints without a role policy', () => {
    const guard = new RolesGuard({ getAllAndOverride: () => undefined } as never);
    expect(
      guard.canActivate({ getHandler: () => undefined, getClass: () => undefined } as never),
    ).toBe(true);
  });
  it('rejects a role-protected endpoint without an identity', () => {
    const guard = new RolesGuard({ getAllAndOverride: () => ['ADMIN'] } as never);
    expect(() =>
      guard.canActivate({
        getHandler: () => undefined,
        getClass: () => undefined,
        switchToHttp: () => ({ getRequest: () => ({}) }),
      } as never),
    ).toThrow(ForbiddenException);
  });
});
