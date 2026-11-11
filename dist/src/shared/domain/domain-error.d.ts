export declare class DomainError extends Error {
    readonly code: string;
    constructor(message: string, code: string);
}
