import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AccountRecord, USER_REPOSITORY, UserRepository } from '../domain/user.repository';
import { LoginDto, RegisterDto, StylistRegisterDto } from './auth.dto';
import { AccountRole } from '../domain/account-role';

@Injectable()
export class AuthService {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository, private readonly jwt: JwtService, private readonly config: ConfigService) {}
  async register(dto: RegisterDto | StylistRegisterDto) {
    if (await this.users.findByEmail(dto.email)) throw new ConflictException('Un compte utilise déjà cet email');
    const user = await this.users.create({ ...dto, passwordHash: await argon2.hash(dto.password), role: dto.role ?? AccountRole.CLIENT });
    return this.issueTokens(user);
  }
  async login(dto: LoginDto, requiredRole?: AccountRole) {
    const user = await this.users.findByEmail(dto.email);
    if (!user || !user.active || requiredRole && user.role !== requiredRole || !await argon2.verify(user.passwordHash, dto.password)) throw new UnauthorizedException('Identifiants invalides');
    return this.issueTokens(user);
  }
  async refresh(token: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET') });
      const user = await this.users.findById(payload.sub);
      if (!user?.refreshTokenHash || !await argon2.verify(user.refreshTokenHash, token)) throw new UnauthorizedException();
      return this.issueTokens(user);
    } catch { throw new UnauthorizedException('Refresh token invalide'); }
  }
  async logout(userId: string) { await this.users.setRefreshTokenHash(userId, null); return { success: true }; }
  async me(userId: string) { const user = await this.users.findById(userId); if (!user) throw new UnauthorizedException(); return this.publicUser(user); }
  private async issueTokens(user: AccountRecord) {
    const payload = { sub: user.id, role: user.role, email: user.email };
    const [token, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: this.config.get('JWT_ACCESS_TTL', '15m') as any }),
      this.jwt.signAsync(payload, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET'), expiresIn: this.config.get('JWT_REFRESH_TTL', '30d') as any }),
    ]);
    await this.users.setRefreshTokenHash(user.id, await argon2.hash(refreshToken));
    return { token, refreshToken, data: this.publicUser(user) };
  }
  private publicUser({ passwordHash: _p, refreshTokenHash: _r, active, ...user }: AccountRecord) { return { ...user, isActive: active }; }
}
