/** Rôles du domaine Identity, indépendants de l'ORM utilisé. */
export const AccountRole = {
  CLIENT: 'CLIENT',
  STYLIST: 'STYLIST',
  EMPLOYEE: 'EMPLOYEE',
  ADMIN: 'ADMIN',
} as const;

export type AccountRole = (typeof AccountRole)[keyof typeof AccountRole];
