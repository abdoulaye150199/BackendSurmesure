import type { CursorPage } from './page.dto';

export function paginate<T extends { id: string }>(rows: T[], limit: number): CursorPage<T> {
  const hasMore = rows.length > limit;
  const data = rows.slice(0, limit);
  return { data, meta: { hasMore, nextCursor: hasMore ? data.at(-1)!.id : null } };
}
