import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { createCommerceService } from './commerce.fixture';

describe('appointment requests', () => {
  const setup = () => {
    const db = {
      user: { findFirst: jest.fn().mockResolvedValue({ id: 'client' }) },
      stylistProfile: { findFirst: jest.fn().mockResolvedValue({ id: 'stylist' }) },
      appointment: {
        create: jest.fn().mockResolvedValue({ id: 'appointment', status: 'pending' }),
        findUnique: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn(),
      },
    };
    const input = {
      stylistId: 'stylist',
      service: '  Prise de mesures  ',
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      notes: ' Nouveau projet ',
    };
    return { db, input, service: createCommerceService(db as never) };
  };
  it('creates a pending request for the authenticated client at the chosen atelier', async () => {
    const { db, input, service } = setup();
    await service.createAppointment('client', input);
    expect(db.appointment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          stylistId: 'stylist',
          clientId: 'client',
          service: 'Prise de mesures',
          startsAt: new Date(input.startsAt),
          notes: 'Nouveau projet',
          status: 'pending',
        },
      }),
    );
    expect(db.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'client', role: 'CLIENT', active: true } }),
    );
  });
  it('rejects past dates and inactive clients', async () => {
    const { db, input, service } = setup();
    await expect(
      service.createAppointment('client', { ...input, startsAt: '2020-01-01T12:00:00Z' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    db.user.findFirst.mockResolvedValue(null);
    await expect(service.createAppointment('client', input)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(db.appointment.create).not.toHaveBeenCalled();
  });
  it('reports a slot conflict instead of silently duplicating requests', async () => {
    const { db, input, service } = setup();
    db.appointment.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('slot', { code: 'P2002', clientVersion: 'test' }),
    );
    await expect(service.createAppointment('client', input)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
  it('allows only the receiving stylist to confirm a request', async () => {
    const { db, service } = setup();
    db.appointment.findUnique.mockResolvedValue({
      id: 'appointment',
      stylist: { userId: 'owner' },
      status: 'pending',
    });
    await expect(
      service.updateStylistAppointmentStatus('appointment', 'another-owner', 'confirmed'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(db.appointment.updateMany).not.toHaveBeenCalled();
    await service.updateStylistAppointmentStatus('appointment', 'owner', 'confirmed');
    expect(db.appointment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'appointment', status: 'pending' },
        data: { status: 'confirmed' },
      }),
    );
  });
});
