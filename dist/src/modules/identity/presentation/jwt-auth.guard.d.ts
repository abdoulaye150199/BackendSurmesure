import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { type UserRepository } from '../domain/user.repository';
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwt;
    private readonly config;
    private readonly users;
    constructor(jwt: JwtService, config: ConfigService, users: UserRepository);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
