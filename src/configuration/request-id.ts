import { randomUUID } from 'node:crypto';
import { isUUID } from 'class-validator';
export function createRequestId(header: string | string[] | undefined): string {
  return typeof header === 'string' && isUUID(header) ? header : randomUUID();
}
