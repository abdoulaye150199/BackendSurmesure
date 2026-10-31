import { ConflictException, ForbiddenException } from '@nestjs/common';
import { CommerceService } from '../src/modules/commerce/application/commerce.service';

describe('measurement validation by stylist', () => {
  const record = { id: 'sheet', stylistId: 'atelier', clientId: 'client', source: 'client', modelName: 'Tenue de fête', values: { poitrine: 92 }, updatedAt: new Date('2026-10-31T12:00:00Z'), stylist: { userId: 'stylist' } };
  const setup = () => {
    const db = {
      stylistProfile: { findFirst: jest.fn().mockResolvedValue({ id: 'atelier', userId: 'stylist' }), findUnique: jest.fn().mockResolvedValue({ id: 'atelier' }) },
      user: { findFirst: jest.fn().mockResolvedValue({ id: 'client', firstName: 'Fatou', lastName: 'Ndiaye', phone: '+221770000001' }), findUnique: jest.fn().mockResolvedValue({ id: 'client', firstName: 'Fatou', lastName: 'Ndiaye', phone: '+221770000001' }) },
      measurement: {
        create: jest.fn().mockImplementation(async ({ data }) => ({ id: 'new-sheet', validatedAt: null, ...data })),
        findFirst: jest.fn().mockResolvedValue(record), findUnique: jest.fn().mockResolvedValue(record),
        update: jest.fn().mockImplementation(async ({ data }) => ({ id: 'sheet', ...data })),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findUniqueOrThrow: jest.fn().mockResolvedValue({ ...record, validatedAt: new Date(), validatedById: 'stylist' }),
      },
    };
    return { db, service: new CommerceService(db as never) };
  };
  const validation = { modelName: 'Tenue de fête', expectedUpdatedAt: record.updatedAt.toISOString() };

  it('automatically validates measurements taken by the stylist', async () => {
    const { db, service } = setup();
    await service.createMeasurement('atelier', 'stylist', { clientName: 'Fatou', clientPhone: '+221770000001', measurements: { poitrine: 92 }, notes: '' });
    expect(db.measurement.create).toHaveBeenCalledWith({ data: expect.objectContaining({ source: 'stylist', validatedAt: expect.any(Date), validatedById: 'stylist' }) });
  });

  it('leaves a client-created model pending validation', async () => {
    const { service } = setup();
    const saved = await service.createClientModelMeasurements('client', { stylistId: 'atelier', modelName: 'Tenue de fête', measurements: { poitrine: 92 } });
    expect(saved).toMatchObject({ source: 'client', validatedAt: null });
  });

  it('validates only the selected sheet for the reviewed model', async () => {
    const { db, service } = setup();
    const saved = await service.validateMeasurement('sheet', 'stylist', validation);
    expect(db.measurement.updateMany).toHaveBeenCalledWith({ where: { id: 'sheet', stylistId: 'atelier', updatedAt: record.updatedAt }, data: { modelName: 'Tenue de fête', validatedAt: expect.any(Date), validatedById: 'stylist' } });
    expect(saved.validatedById).toBe('stylist');
    expect(saved.measurements).toEqual({ poitrine: 92 });
  });

  it('prevents another stylist from validating the sheet', async () => {
    const { db, service } = setup();
    await expect(service.validateMeasurement('sheet', 'other-stylist', validation)).rejects.toBeInstanceOf(ForbiddenException);
    expect(db.measurement.updateMany).not.toHaveBeenCalled();
  });

  it('refuses validation if the client changed the measurements since review', async () => {
    const { db, service } = setup();
    db.measurement.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.validateMeasurement('sheet', 'stylist', validation)).rejects.toBeInstanceOf(ConflictException);
  });

  it('clears validation whenever the client edits a previously approved sheet', async () => {
    const { db, service } = setup();
    await service.saveClientMeasurements('client', { stylistId: 'atelier', measurementId: 'sheet', measurements: { poitrine: 94 } });
    expect(db.measurement.update).toHaveBeenCalledWith({ where: { id: 'sheet' }, data: expect.objectContaining({ source: 'client', validatedAt: null, validatedById: null, values: { poitrine: 94 } }) });
  });

  it('keeps client-sent measures pending when the stylist corrects them until explicit approval', async () => {
    const { db, service } = setup();
    await service.updateMeasurement('sheet', 'stylist', { measurements: { poitrine: 94 } });
    const savedData = db.measurement.update.mock.calls[0][0].data;
    expect(savedData).toMatchObject({ values: { poitrine: 94 }, validatedAt: null, validatedById: null });
    expect(savedData).not.toHaveProperty('source');
  });
});
