import { CommerceService } from '../src/modules/commerce/application/commerce.service';

describe('client orders entered before signup', () => {
  it('links guest history using the authenticated account before reading orders', async () => {
    const order = {
      id: 'order-before-signup', clientId: 'new-client',
      createdAt: new Date('2026-10-01T12:00:00Z'),
      dueAt: new Date('2026-11-01T12:00:00Z'), measurements: { poitrine: 92 },
    };
    const db = {
      $executeRaw: jest.fn().mockResolvedValue(1),
      order: { findMany: jest.fn().mockResolvedValue([order]) },
    };
    const service = new CommerceService(db as never);
    const result = await service.clientOrders('new-client', { limit: 20 });

    const query = db.$executeRaw.mock.calls[0][0];
    expect(query.values).toEqual(['new-client']);
    expect(query.text).toContain('orders."clientId" IS NULL');
    expect(query.text).toContain('client."role" = \'CLIENT\'');
    expect(query.text).toContain('client."active" = true');
    expect(query.text).toContain('regexp_replace(orders."clientPhone"');
    expect(query.text).toContain('regexp_replace(client."phone"');
    expect(db.order.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { clientId: 'new-client', status: undefined } }));
    expect(db.$executeRaw.mock.invocationCallOrder[0]).toBeLessThan(db.order.findMany.mock.invocationCallOrder[0]);
    expect(result.data).toEqual([order]);
    expect(result.data[0].dueAt).toEqual(order.dueAt);
    expect(result.data[0].createdAt).toEqual(order.createdAt);
  });

  it('continues to return existing linked orders on subsequent visits', async () => {
    const db = {
      $executeRaw: jest.fn().mockResolvedValue(0),
      order: { findMany: jest.fn().mockResolvedValue([{ id: 'existing', clientId: 'client' }]) },
    };
    const service = new CommerceService(db as never);
    await expect(service.clientOrders('client', { limit: 20 })).resolves.toMatchObject({ data: [{ id: 'existing', clientId: 'client' }] });
  });
});
