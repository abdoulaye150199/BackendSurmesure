import { NotFoundException } from '@nestjs/common';
import { CommerceService } from '../src/modules/commerce/application/commerce.service';

describe('anonymous catalog likes', () => {
  const makeService = () => {
    const likes = new Set<string>();
    const tx = { catalogLike: {
      createMany: jest.fn(async ({ data }) => { for (const row of data) likes.add(`${row.catalogItemId}:${row.visitorId}`); }),
      deleteMany: jest.fn(async ({ where }) => { likes.delete(`${where.catalogItemId}:${where.visitorId}`); }),
      count: jest.fn(async () => likes.size),
    } };
    const db = {
      catalogItem: { findFirst: jest.fn().mockResolvedValue({ id: 'creation' }), findMany: jest.fn() },
      $transaction: jest.fn(async callback => callback(tx)),
    };
    return { db, tx, service: new CommerceService(db as never) };
  };

  it('counts distinct visitors, makes retries idempotent and allows unlike', async () => {
    const { service, tx } = makeService();
    expect(await service.setCatalogLike('creation', 'visitor-1', true)).toEqual({ liked: true, likesCount: 1 });
    expect(await service.setCatalogLike('creation', 'visitor-1', true)).toEqual({ liked: true, likesCount: 1 });
    expect(tx.catalogLike.createMany).toHaveBeenCalledWith({ data: [{ catalogItemId: 'creation', visitorId: 'visitor-1' }], skipDuplicates: true });
    expect(await service.setCatalogLike('creation', 'visitor-2', true)).toEqual({ liked: true, likesCount: 2 });
    expect(await service.setCatalogLike('creation', 'visitor-1', false)).toEqual({ liked: false, likesCount: 1 });
    expect(await service.setCatalogLike('creation', 'visitor-1', false)).toEqual({ liked: false, likesCount: 1 });
  });

  it('rejects likes for unavailable creations', async () => {
    const { service, db } = makeService();
    db.catalogItem.findFirst.mockResolvedValue(null);
    await expect(service.setCatalogLike('missing', 'visitor', true)).rejects.toBeInstanceOf(NotFoundException);
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('includes persisted totals in catalog responses read by creators', async () => {
    const { service, db } = makeService();
    db.catalogItem.findMany.mockResolvedValue([{ id: 'creation', _count: { likes: 12 } }]);
    expect(await service.listCatalog(10)).toEqual([{ id: 'creation', likesCount: 12 }]);
  });
});
