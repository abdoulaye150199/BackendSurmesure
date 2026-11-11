import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
export declare class ApiExceptionFilter implements ExceptionFilter {
    private readonly logger;
    catch(error: unknown, host: ArgumentsHost): void;
    private persistenceFailure;
}
