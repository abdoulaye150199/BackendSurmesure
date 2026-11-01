import { HttpException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ApiExceptionFilter } from '../src/shared/presentation/api-exception.filter';
describe('safe HTTP failures', () => {
  let errorLogger: jest.SpyInstance;
  beforeEach(() => {
    errorLogger = jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    errorLogger.mockRestore();
  });
  const execute = (error: unknown) => {
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    new ApiExceptionFilter().catch(error, {
      switchToHttp: () => ({ getResponse: () => response }),
    } as never);
    return response;
  };
  it.each([
    ['P2002', 409],
    ['P2003', 409],
    ['P2025', 404],
    ['P2034', 409],
    ['P2999', 500],
  ])('maps %s to HTTP %s without leaking database details', (code, status) => {
    const response = execute(
      new Prisma.PrismaClientKnownRequestError('PRIVATE SQL CONTENT', {
        code: String(code),
        clientVersion: 'test',
      }),
    );
    expect(response.status).toHaveBeenCalledWith(status);
    expect(JSON.stringify(response.json.mock.calls)).not.toContain('PRIVATE SQL');
  });
  it('preserves intentional HTTP validation errors', () => {
    const response = execute(new HttpException('Invalid request', 400));
    expect(response.json).toHaveBeenCalledWith({ statusCode: 400, message: 'Invalid request' });
  });
  it('sanitizes validation and unknown exceptions', () => {
    expect(
      execute(
        new Prisma.PrismaClientValidationError('private arguments', { clientVersion: 'test' }),
      ).status,
    ).toHaveBeenCalledWith(400);
    const result = execute(new Error('password=private'));
    expect(result.status).toHaveBeenCalledWith(500);
    expect(JSON.stringify(result.json.mock.calls)).not.toContain('private');
    expect(JSON.stringify(errorLogger.mock.calls)).not.toContain('password');
  });
});
