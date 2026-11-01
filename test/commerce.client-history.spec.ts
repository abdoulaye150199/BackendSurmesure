import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { createCommerceService } from './commerce.fixture';

describe('history linking requires owner confirmation', () => {
  it('does not write or claim records when a client reads orders or measurements', async () => {
    const db = {
      $executeRaw: jest.fn(),
      order: { findMany: jest.fn().mockResolvedValue([{ id: 'order', clientId: 'client' }]) },
      measurement: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 'sheet', clientId: 'client', values: { taille: 74 } }]),
      },
    };
    const service = createCommerceService(db as never);
    expect((await service.clientOrders('client', { limit: 20 })).data[0].id).toBe('order');
    expect((await service.clientMeasurements('client'))[0].measurements).toEqual({ taille: 74 });
    expect(db.$executeRaw).not.toHaveBeenCalled();
    expect(db.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clientId: 'client', clientConfirmedAt: { not: null }, status: undefined },
      }),
    );
  });
  const setup = () => {
    const tx = {
      user: { findFirst: jest.fn().mockResolvedValue({ phone: '+221770000001' }) },
      $executeRaw: jest.fn().mockResolvedValue(1),
    };
    const db = {
      stylistProfile: {
        findFirst: jest.fn().mockResolvedValue({ id: 'atelier', userId: 'owner' }),
      },
      $transaction: jest.fn(async (callback) => callback(tx)),
      $queryRaw: jest.fn().mockResolvedValue([]),
    };
    return { db, tx, service: createCommerceService(db as never) };
  };
  it('links only unclaimed history in the confirming stylist atelier', async () => {
    const { service, tx } = setup();
    expect(
      await service.linkClientHistory('atelier', 'owner', 'client', '+221 77 000 00 01'),
    ).toEqual({ clientId: 'client', orders: 1, measurements: 1 });
    for (const [query] of tx.$executeRaw.mock.calls) {
      expect(query.text).toContain('"stylistId" =');
      expect(query.text).toContain('"clientId" IS NULL');
      expect(query.values).toEqual(['client', 'atelier', 'client', '+221770000001']);
    }
  });
  it('rejects owner and phone mismatches before assigning any record', async () => {
    const { service, tx } = setup();
    await expect(
      service.linkClientHistory('atelier', 'stranger', 'client', '+221770000001'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.linkClientHistory('atelier', 'owner', 'client', '+221780000002'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(tx.$executeRaw).not.toHaveBeenCalled();
  });
  it('constrains candidate lookup to a matching history record owned by the stylist', async () => {
    const { service, db } = setup();
    await service.clientLinkCandidates('atelier', 'owner', '+221770000001');
    const query = db.$queryRaw.mock.calls[0][0];
    expect(query.text).toContain('EXISTS');
    expect(query.values).toContain('atelier');
    expect(query.text).toContain('"clientConfirmedAt" IS NULL');
  });
});
