import {
  ConflictException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { canonicalPhone } from '../../../shared/domain/contact';
import { AuthService } from './auth.service';
import { GoogleRegisterDto } from './auth.dto';

@Injectable()
export class GoogleAuthService {
  private readonly google = new OAuth2Client();
  constructor(
    private readonly config: ConfigService,
    private readonly db: PrismaService,
    private readonly auth: AuthService,
  ) {}

  configuration() {
    return { clientId: this.config.get<string>('GOOGLE_CLIENT_ID') || null };
  }

  private async verify(credential: string) {
    const clientId = this.configuration().clientId;
    if (!clientId)
      {throw new ServiceUnavailableException('La connexion Google est momentanément indisponible.');}
    try {
      const ticket = await this.google.verifyIdToken({ idToken: credential, audience: clientId });
      const identity = ticket.getPayload();
      if (!identity?.sub || !identity.email || identity.email_verified !== true)
        {throw new Error('Invalid identity');}
      return identity;
    } catch {
      throw new UnauthorizedException('Identité Google invalide ou expirée. Réessayez.');
    }
  }

  async login(credential: string) {
    const identity = await this.verify(credential);
    const user = await this.db.user.findUnique({ where: { googleSubject: identity.sub } });
    if (!user?.active || !['CLIENT', 'STYLIST'].includes(user.role)) {
      throw new UnauthorizedException(
        'Aucun compte inscrit avec Google. Inscrivez-vous d’abord avec Google.',
      );
    }
    return this.auth.issueTokens(user);
  }

  async register(dto: GoogleRegisterDto) {
    const identity = await this.verify(dto.credential);
    try {
      const user = await this.db.user.create({
        data: {
          googleSubject: identity.sub,
          email: identity.email!.trim().toLowerCase(),
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: canonicalPhone(dto.phone),
          // No usable password is issued for a Google account.
          passwordHash: await argon2.hash(randomBytes(48).toString('base64url')),
          role: dto.role === 'stylist' ? 'STYLIST' : 'CLIENT',
          ...(dto.role === 'stylist'
            ? { stylist: { create: { businessName: dto.businessName!, specialties: [] } } }
            : {}),
        },
      });
      return this.auth.issueTokens(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(
          'Cet e-mail, ce numéro ou ce compte Google est déjà inscrit. Aucun compte existant n’a été rattaché.',
        );
      }
      throw error;
    }
  }
}
