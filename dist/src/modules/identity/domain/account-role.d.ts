export declare const AccountRole: {
    readonly CLIENT: "CLIENT";
    readonly STYLIST: "STYLIST";
    readonly EMPLOYEE: "EMPLOYEE";
    readonly ADMIN: "ADMIN";
};
export type AccountRole = (typeof AccountRole)[keyof typeof AccountRole];
