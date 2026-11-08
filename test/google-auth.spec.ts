import {
  ConflictException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { Prisma } from '@prisma/client';
import { GoogleAuthService } from '../src/modules/identity/application/google-auth.service';
import { AuthService } from '../src/modules/identity/application/auth.service';

describe('Google authentication boundaries', () => {
  const identity = { sub: 'google-123', email: 'awa@example.com', email_verified: true };
  const dto = {
    credential: 'signed-token',
    role: 'stylist' as const,
    firstName: 'Awa',
    lastName: 'Diop',
    phone: '+221770000000',
    businessName: 'Atelier Awa',
  };
  const user = { id: 'user-1', googleSubject: identity.sub, role: 'CLIENT', active: true };
  let verify: jest.SpyInstance;
  let db: { user: { findUnique: jest.Mock; create: jest.Mock } };
  let auth: { issueTokens: jest.Mock };
  let service: GoogleAuthService;

  beforeEach(() => {
    verify = jest
      .spyOn(OAuth2Client.prototype, 'verifyIdToken')
      .mockResolvedValue({ getPayload: () => identity } as never);
    db = {
      user: {
        findUnique: jest.fn().mockResolvedValue(user),
        create: jest.fn().mockResolvedValue(user),
      },
    };
    auth = { issueTokens: jest.fn().mockResolvedValue({ token: 'session' }) };
    service = new GoogleAuthService(
      { get: () => 'public-client.apps.googleusercontent.com' } as never,
      db as never,
      auth as never,
    );
  });
  afterEach(() => jest.restoreAllMocks());

  it('validates the token audience and looks up Google subject, never email', async () => {
    await expect(service.login('signed-token')).resolves.toEqual({ token: 'session' });
    expect(verify).toHaveBeenCalledWith({
      idToken: 'signed-token',
      audience: 'public-client.apps.googleusercontent.com',
    });
    expect(db.user.findUnique).toHaveBeenCalledWith({
      where: { googleSubject: identity.sub, deletedAt: null },
    });
  });
  it('does not register or link an unknown Google account during login', async () => {
    db.user.findUnique.mockResolvedValue(null);
    await expect(service.login('signed-token')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(db.user.create).not.toHaveBeenCalled();
    expect(auth.issueTokens).not.toHaveBeenCalled();
  });
  it.each([
    { ...user, active: false },
    { ...user, role: 'ADMIN' },
    { ...user, role: 'EMPLOYEE' },
  ])('refuses inactive or privileged accounts: %j', async (record) => {
    db.user.findUnique.mockResolvedValue(record);
    await expect(service.login('signed-token')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(auth.issueTokens).not.toHaveBeenCalled();
  });
  it('rejects expired, wrongly signed or wrong-audience tokens before database access', async () => {
    verify.mockRejectedValue(new Error('Invalid token'));
    await expect(service.login('invalid')).rejects.toBeInstanceOf(UnauthorizedException);
    expect(db.user.findUnique).not.toHaveBeenCalled();
  });
  it('rejects unverified email addresses', async () => {
    verify.mockResolvedValue({ getPayload: () => ({ ...identity, email_verified: false }) });
    await expect(service.register(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(db.user.create).not.toHaveBeenCalled();
  });
  it('creates a Google identity only through registration and preserves stylist profile data', async () => {
    await service.register(dto);
    expect(db.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        googleSubject: identity.sub,
        email: identity.email,
        role: 'STYLIST',
        stylist: { create: { businessName: dto.businessName, specialties: [] } },
        passwordHash: expect.stringMatching(/^\$argon2/),
      }),
    });
  });
  it('refuses duplicate email/phone/subject without overwriting an existing account', async () => {
    db.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: '6' }),
    );
    await expect(service.register(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(auth.issueTokens).not.toHaveBeenCalled();
  });
  it('remains disabled until an OAuth Client ID is configured', async () => {
    service = new GoogleAuthService({ get: () => undefined } as never, db as never, auth as never);
    await expect(service.login('token')).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(verify).not.toHaveBeenCalled();
  });
  it('refuses password login for Google-only accounts', async () => {
    const users = { findByEmail: jest.fn().mockResolvedValue(user) };
    const passwordAuth = new AuthService(users as never, {} as never, {} as never);
    await expect(
      passwordAuth.login({ email: identity.email, password: 'anything' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
