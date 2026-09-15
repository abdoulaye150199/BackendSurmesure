import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './application/auth.service';
import { USER_REPOSITORY } from './domain/user.repository';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { AuthController } from './presentation/auth.controller';
import { JwtAuthGuard } from './presentation/jwt-auth.guard';
import { RolesGuard } from './presentation/roles.guard';
@Module({ imports: [JwtModule.register({})], controllers: [AuthController], providers: [AuthService, JwtAuthGuard, RolesGuard, { provide: USER_REPOSITORY, useClass: PrismaUserRepository }], exports: [JwtAuthGuard, RolesGuard, JwtModule] })
export class AuthModule {}
