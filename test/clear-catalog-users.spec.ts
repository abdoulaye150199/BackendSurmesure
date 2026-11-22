const { clearCatalogUsers } = require('../scripts/clear-catalog-users.cjs') as {
  clearCatalogUsers(
    db: unknown,
    apply?: boolean,
  ): Promise<{
    mode: string;
    adminsConserves: number;
    affected: Record<string, number>;
  }>;
};

describe('catalog and non-administrator cleanup', () => {
  function setup() {
    const names = [
      'catalogLike',
      'catalogItem',
      'adminRegistrationRead',
      'clientNotification',
      'appointment',
      'measurement',
      'order',
      'personnel',
      'stylistProfile',
      'user',
    ] as const;
    const mutations: string[] = [];
    const models = {} as Record<
      (typeof names)[number],
      {
        count: jest.Mock;
        deleteMany: jest.Mock;
        findMany: jest.Mock;
      }
    >;
    for (const name of names) {
      models[name] = {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn(),
        deleteMany: jest.fn(async () => {
          mutations.push(name);
          return { count: 1 };
        }),
      };
    }
    const tx = { ...models, $executeRaw: jest.fn().mockResolvedValue(0) };
    tx.user.findMany = jest.fn().mockResolvedValue([{ id: 'client' }, { id: 'stylist' }]);
    tx.stylistProfile.findMany = jest.fn().mockResolvedValue([{ id: 'atelier' }]);
    const db = { $transaction: jest.fn(async (action) => action(tx)) };
    return { tx, db, mutations, names };
  }

  it('previews targeted rows by default without executing any mutation or lock', async () => {
    const { tx, db, mutations } = setup();
    const result = await clearCatalogUsers(db);
    expect(result.mode).toBe('aperçu sans suppression');
    expect(result.adminsConserves).toBe(1);
    expect(mutations).toEqual([]);
    expect(tx.$executeRaw).not.toHaveBeenCalled();
    expect(tx.user.findMany).toHaveBeenCalledWith({
      where: { role: { not: 'ADMIN' } },
      select: { id: true },
    });
  });

  it('deletes in dependency order, preserves administrators and verifies the result', async () => {
    const { tx, db, mutations, names } = setup();
    tx.user.count
      .mockReset()
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(1);
    tx.catalogItem.count.mockResolvedValue(0);
    const result = await clearCatalogUsers(db, true);
    expect(result.mode).toBe('suppression');
    expect(mutations).toEqual(names);
    expect(tx.$executeRaw).toHaveBeenCalledTimes(1);
    expect(tx.user.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['client', 'stylist'] }, role: { not: 'ADMIN' } },
    });
    expect(tx.order.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [{ clientId: { in: ['client', 'stylist'] } }, { stylistId: { in: ['atelier'] } }],
      },
    });
    expect(tx.catalogItem.deleteMany).toHaveBeenCalledWith({ where: {} });
  });

  it('stops the transaction at a deletion failure', async () => {
    const { tx, db } = setup();
    tx.order.deleteMany.mockRejectedValue(new Error('foreign key failure'));
    await expect(clearCatalogUsers(db, true)).rejects.toThrow('foreign key failure');
    expect(tx.stylistProfile.deleteMany).not.toHaveBeenCalled();
    expect(tx.user.deleteMany).not.toHaveBeenCalled();
  });

  it('rejects the transaction if any non-administrator remains', async () => {
    const { tx, db } = setup();
    tx.catalogItem.count.mockResolvedValue(0);
    await expect(clearCatalogUsers(db, true)).rejects.toThrow('Vérification finale échouée');
  });

  it('rejects the transaction if the administrator count changes', async () => {
    const { tx, db } = setup();
    tx.user.count
      .mockReset()
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);
    tx.catalogItem.count.mockResolvedValue(0);
    await expect(clearCatalogUsers(db, true)).rejects.toThrow('Vérification finale échouée');
  });
});
