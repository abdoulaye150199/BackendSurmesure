import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);
  catch(error: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    if (error instanceof HttpException) {
      const body = error.getResponse();
      response
        .status(error.getStatus())
        .json(typeof body === 'string' ? { statusCode: error.getStatus(), message: body } : body);
      return;
    }
    const failure = this.persistenceFailure(error);
    if (failure.status === HttpStatus.INTERNAL_SERVER_ERROR) {
      // Never log database query arguments, credentials or token bodies.
      this.logger.error({
        message: 'Erreur interne',
        type: error instanceof Error ? error.name : 'UnknownError',
      });
    }
    response.status(failure.status).json({ statusCode: failure.status, message: failure.message });
  }
  private persistenceFailure(error: unknown): { status: number; message: string } {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return { status: 409, message: 'Une ressource utilise déjà ces informations.' };
        case 'P2003':
          return {
            status: 409,
            message: 'Cette opération est incompatible avec les ressources associées.',
          };
        case 'P2025':
          return { status: 404, message: 'Ressource introuvable.' };
        case 'P2034':
          return { status: 409, message: 'Une modification concurrente a eu lieu. Réessayez.' };
      }
    }
    if (error instanceof Prisma.PrismaClientValidationError) {
      return { status: 400, message: 'Paramètres invalides.' };
    }
    return { status: 500, message: 'Erreur interne. Réessayez ultérieurement.' };
  }
}
