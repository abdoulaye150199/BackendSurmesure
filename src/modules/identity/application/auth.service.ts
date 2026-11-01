import { isUUID } from 'class-validator';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { canonicalPhone } from '../../../shared/domain/contact';
import { AccountRole } from '../domain/account-role';
import { tokenDurationSeconds } from '../domain/token-duration';
import {
  AccountConflictError,
  type AccountRecord,
  USER_REPOSITORY,
  type UserRepository,
} from '../domain/user.repository';
import { ChangeEmployeePasswordDto, LoginDto, RegisterDto, StylistRegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}
  async register(dto: RegisterDto | StylistRegisterDto) {
    if (await this.users.findByEmail(dto.email)) {
      throw new ConflictException('Un compte utilise déjà cet email');
    }
    const role = 'businessName' in dto ? AccountRole.STYLIST : AccountRole.CLIENT;
    const { firstName, lastName, email, phone, password } = dto;
    const businessName = 'businessName' in dto ? dto.businessName : undefined;
    let user: AccountRecord;
    try {
      user = await this.users.create({
        firstName,
        lastName,
        email: email.trim().toLowerCase(),
        phone: canonicalPhone(phone),
        passwordHash: await argon2.hash(password),
        role,
        ...(businessName ? { businessName } : {}),
      });
    } catch (error) {
      if (error instanceof AccountConflictError) {
        throw new ConflictException(
          'Cet e-mail ou ce numéro de téléphone est déjà associé à un compte.',
        );
      }
      throw error;
    }
    return this.issueTokens(user);
  }
  async login(dto: LoginDto, requiredRole?: AccountRole) {
    const user = await this.users.findByEmail(dto.email);
    if (
      !user ||
      !user.active ||
      (requiredRole && user.role !== requiredRole) ||
      !(await argon2.verify(user.passwordHash, dto.password))
    ) {
      throw new UnauthorizedException('Identifiants invalides');
    }
    return this.issueTokens(user);
  }
  async refresh(token: string) {
    let payload: { sub: string };
    try {
      payload = await this.jwt.verifyAsync<{ sub: string }>(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide');
    }
    if (!isUUID(payload.sub)) {
      throw new UnauthorizedException('Refresh token invalide');
    }
    const user = await this.users.findById(payload.sub);
    if (
      !user?.active ||
      !user.refreshTokenHash ||
      !(await argon2.verify(user.refreshTokenHash, token))
    ) {
      throw new UnauthorizedException('Refresh token invalide');
    }
    return this.issueTokens(user, user.refreshTokenHash);
  }
  async changeEmployeePassword(userId: string, dto: ChangeEmployeePasswordDto) {
    const user = await this.users.findById(userId);
    if (
      !user?.active ||
      user.role !== AccountRole.EMPLOYEE ||
      !(await argon2.verify(user.passwordHash, dto.currentPassword))
    ) {
      throw new UnauthorizedException('Le mot de passe actuel est incorrect.');
    }
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Choisissez un nouveau mot de passe différent.');
    }
    const passwordHash = await argon2.hash(dto.newPassword);
    if (!(await this.users.changePassword(userId, user.passwordHash, passwordHash))) {
      throw new ConflictException('Le compte a été modifié. Reconnectez-vous avant de réessayer.');
    }
    return this.issueTokens({
      ...user,
      passwordHash,
      mustChangePassword: false,
      sessionVersion: (user.sessionVersion ?? 0) + 1,
    });
  }
  async logout(userId: string) {
    await this.users.revokeSessions(userId);
    return { success: true };
  }
  async me(userId: string) {
    const user = await this.users.findById(userId);
    if (!user?.active) {
      throw new UnauthorizedException();
    }
    return this.publicUser(user);
  }
  private async issueTokens(user: AccountRecord, previousRefreshHash?: string) {
    const payload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      sessionVersion: user.sessionVersion ?? 0,
    };
    const [token, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: tokenDurationSeconds(this.config.get<string>('JWT_ACCESS_TTL', '15m')),
        jwtid: randomUUID(),
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: tokenDurationSeconds(this.config.get<string>('JWT_REFRESH_TTL', '30d')),
        jwtid: randomUUID(),
      }),
    ]);
    if (
      !(await this.users.saveRefreshToken(
        user.id,
        await argon2.hash(refreshToken),
        user.sessionVersion ?? 0,
        previousRefreshHash,
      ))
    ) {
      throw new UnauthorizedException('Session révoquée ou déjà renouvelée. Reconnectez-vous.');
    }
    return { token, refreshToken, data: this.publicUser(user) };
  }
  private publicUser(user: AccountRecord) {
    return {
      id: user.id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      isActive: user.active,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
