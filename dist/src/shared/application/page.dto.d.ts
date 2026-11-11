export declare class PageQueryDto {
    cursor?: string;
    limit: number;
}
export interface CursorPage<T> {
    data: T[];
    meta: {
        nextCursor: string | null;
        hasMore: boolean;
    };
}
