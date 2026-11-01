import { isUUID } from 'class-validator';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { USER_REPOSITORY, type UserRepository } from '../domain/user.repository';
import type { AuthUser } from './current-user.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = request.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (!token) {
      throw new UnauthorizedException('Token manquant');
    }
    let claims: AuthUser & { sessionVersion?: number };
    try {
      claims = await this.jwt.verifyAsync<AuthUser & { sessionVersion?: number }>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Token invalide ou expiré');
    }
    if (typeof claims.sub !== 'string' || !isUUID(claims.sub)) {
      throw new UnauthorizedException('Identité invalide');
    }
    const user = await this.users.findAccessById(claims.sub);
    if (
      !user?.active ||
      user.role !== claims.role ||
      user.sessionVersion !== (claims.sessionVersion ?? 0)
    ) {
      throw new UnauthorizedException('Session révoquée ou compte désactivé');
    }
    request.user = { sub: user.id, role: user.role, email: user.email };
    return true;
  }
}
