import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrderDto } from '../src/modules/commerce/application/commerce.dto';
import { CommerceService } from '../src/modules/commerce/application/commerce.service';

describe('stylist order creation', () => {
  const input = { clientName: ' Fatou Ndiaye ', clientPhone: '+221 77 000 00 01', description: ' Robe de cérémonie ', totalPrice: 45000, notes: '' };
  const setup = () => {
    const db = {
      stylistProfile: { findFirst: jest.fn().mockResolvedValue({ id: 'atelier', userId: 'stylist' }) },
      user: { findFirst: jest.fn() },
      $queryRaw: jest.fn().mockResolvedValue([]),
      order: { create: jest.fn().mockImplementation(async ({ data }) => ({ id: 'order', ...data })) },
    };
    return { db, service: new CommerceService(db as never) };
  };

  it('accepts the form without requiring an account identifier', async () => {
    expect(await validate(plainToInstance(CreateOrderDto, input), { whitelist: true, forbidNonWhitelisted: true })).toEqual([]);
  });

  it('creates an order for a client without an account', async () => {
    const { db, service } = setup();
    const order = await service.createOrder('atelier', 'stylist', input);
    expect(order).toMatchObject({ clientId: null, stylistId: 'atelier', clientPhone: '+221770000001', clientName: 'Fatou Ndiaye', description: 'Robe de cérémonie' });
    expect(db.order.create).toHaveBeenCalledTimes(1);
  });

  it('links an existing client account found by phone', async () => {
    const { db, service } = setup();
    db.$queryRaw.mockResolvedValue([{ id: 'client', phone: '+221770000001' }]);
    expect(await service.createOrder('atelier', 'stylist', input)).toMatchObject({ clientId: 'client' });
  });

  it('refuses to create an order in another stylist’s atelier', async () => {
    const { db, service } = setup();
    await expect(service.createOrder('atelier', 'intruder', input)).rejects.toBeInstanceOf(ForbiddenException);
    expect(db.order.create).not.toHaveBeenCalled();
  });

  it('rejects an explicit client identifier belonging to a different phone', async () => {
    const { db, service } = setup();
    db.user.findFirst.mockResolvedValue({ id: 'other-client', phone: '+221780000002' });
    await expect(service.createOrder('atelier', 'stylist', { ...input, clientId: 'other-client' })).rejects.toBeInstanceOf(BadRequestException);
    expect(db.order.create).not.toHaveBeenCalled();
  });
});
