import { NotFoundException } from '@nestjs/common';
import { AdministrationService } from '../src/modules/commerce/application/services/administration.service';

describe('Admin registration notifications', () => {
  it('counts all unread registrations independently from the requested page', async () => {
    const first = { id: 'first', registrationReads: [], firstName: 'Awa' };
    const second = { id: 'second', registrationReads: [{ readAt: new Date('2026-11-19T12:00:00Z') }] };
    const user = { findMany: jest.fn().mockResolvedValue([first, second, { id: 'next', registrationReads: [] }]), count: jest.fn().mockResolvedValue(32) };
    const service = new AdministrationService({ user } as never);
    const result = await service.adminNotifications('admin', { limit: 2 });
    expect(result.unreadCount).toBe(32);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].readAt).toBeNull();
    expect(result.data[1].readAt).toEqual(second.registrationReads[0].readAt);
    expect(result.meta).toEqual({ hasMore: true, nextCursor: 'second' });
    expect(user.count).toHaveBeenCalledWith({ where: { role: 'STYLIST', deletedAt: null, requestedPlan: { not: null }, registrationReads: { none: { adminId: 'admin' } } } });
    expect(user.findMany.mock.calls[0][0].select.registrationReads.where).toEqual({ adminId: 'admin' });
    expect(user.findMany.mock.calls[0][0].select).not.toHaveProperty('passwordHash');
  });

  it('stores the read state only for the authenticated administrator and selected registration', async () => {
    const readAt = new Date();
    const user = { findFirst: jest.fn().mockResolvedValue({ id: 'stylist' }) };
    const adminRegistrationRead = { upsert: jest.fn().mockResolvedValue({ stylistUserId: 'stylist', readAt }) };
    const service = new AdministrationService({ user, adminRegistrationRead } as never);
    expect(await service.adminReadNotification('admin', 'stylist')).toEqual({ id: 'stylist', readAt });
    expect(adminRegistrationRead.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { adminId_stylistUserId: { adminId: 'admin', stylistUserId: 'stylist' } }, create: { adminId: 'admin', stylistUserId: 'stylist' }, update: {} }));
  });

  it('refuses to mark a client or deleted account as a stylist registration', async () => {
    const user = { findFirst: jest.fn().mockResolvedValue(null) };
    const adminRegistrationRead = { upsert: jest.fn() };
    const service = new AdministrationService({ user, adminRegistrationRead } as never);
    await expect(service.adminReadNotification('admin', 'client')).rejects.toBeInstanceOf(NotFoundException);
    expect(adminRegistrationRead.upsert).not.toHaveBeenCalled();
  });
});
