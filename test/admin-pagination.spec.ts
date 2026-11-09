import { AdministrationService } from '../src/modules/commerce/application/services/administration.service';
import { AdminUsersQueryDto } from '../src/modules/commerce/application/dto/administration.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('Admin user pagination', () => {
  it('counts all matching accounts and returns only the requested page', async () => {
    const user = {
      count: jest.fn().mockResolvedValue(25),
      findMany: jest
        .fn()
        .mockResolvedValue(Array.from({ length: 11 }, (_, i) => ({ id: String(i) }))),
    };
    const service = new AdministrationService({ user } as never);
    const result = await service.adminUsers({
      page: 2,
      limit: 10,
      search: ' Awa ',
      role: 'CLIENT',
    });
    const query = user.findMany.mock.calls[0][0];
    expect(query.skip).toBe(10);
    expect(query.take).toBe(11);
    expect(query.where).toEqual(user.count.mock.calls[0][0].where);
    expect(query.where).toMatchObject({ deletedAt: null, role: 'CLIENT', OR: expect.any(Array) });
    expect(result.data).toHaveLength(10);
    expect(result.meta).toMatchObject({ total: 25, page: 2, totalPages: 3, hasMore: true });
  });
  it('clamps the page after accounts are removed', async () => {
    const user = {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
    };
    const service = new AdministrationService({ user } as never);
    const result = await service.adminUsers({ page: 4, limit: 10 });
    expect(result.meta).toMatchObject({ total: 0, page: 1, totalPages: 1, hasMore: false });
    expect(user.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0 }));
  });
  it('rejects invalid pages and roles while accepting query string numbers', async () => {
    expect(
      await validate(plainToInstance(AdminUsersQueryDto, { page: '2', limit: '10' })),
    ).toHaveLength(0);
    expect(
      (await validate(plainToInstance(AdminUsersQueryDto, { page: '0', role: 'OWNER' }))).length,
    ).toBeGreaterThan(0);
  });
});
