import type { CursorPage } from './page.dto';
export declare function paginate<T extends {
    id: string;
}>(rows: T[], limit: number): CursorPage<T>;
