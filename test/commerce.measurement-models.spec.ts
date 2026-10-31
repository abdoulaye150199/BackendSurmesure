import { NotFoundException } from '@nestjs/common';
import { CommerceService } from '../src/modules/commerce/application/commerce.service';

describe('client measurement models', () => {
  const setup = () => {
    const client = { id: 'client', firstName: 'Fatou', lastName: 'Ndiaye', phone: '+221770000001' };
    const db = {
      user: { findFirst: jest.fn().mockResolvedValue(client), findUnique: jest.fn().mockResolvedValue(client) },
      stylistProfile: { findUnique: jest.fn().mockResolvedValue({ id: 'atelier' }) },
      measurement: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(async ({ data }) => ({ id: 'new-record', ...data })),
        update: jest.fn(),
      },
    };
    return { db, service: new CommerceService(db as never) };
  };
  const input = { stylistId: 'atelier', modelName: ' Robe de fête ', modelType: 'Robe & ensemble', measurements: { poitrine: 92 }, notes: 'Coupe ajustée' };

  it('creates a distinct named sheet without updating existing measurements', async () => {
    const { db, service } = setup();
    const result = await service.createClientModelMeasurements('client', input);
    expect(result).toMatchObject({ modelName: 'Robe de fête', modelType: 'Robe & ensemble', clientId: 'client', measurements: { poitrine: 92 } });
    expect(db.measurement.update).not.toHaveBeenCalled();
    expect(db.measurement.findFirst).not.toHaveBeenCalled();
  });

  it('does not overwrite a named model when updating the general profile', async () => {
    const { db, service } = setup();
    await service.saveClientMeasurements('client', { stylistId: 'atelier', measurements: { taille: 74 } });
    expect(db.measurement.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { clientId: 'client', stylistId: 'atelier', modelName: null } }));
    expect(db.measurement.update).not.toHaveBeenCalled();
  });

  it('requires an explicitly edited sheet to belong to this client and atelier', async () => {
    const { db, service } = setup();
    await expect(service.saveClientMeasurements('client', { stylistId: 'atelier', measurementId: 'foreign-sheet', measurements: { taille: 74 } })).rejects.toBeInstanceOf(NotFoundException);
    expect(db.measurement.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { clientId: 'client', stylistId: 'atelier', id: 'foreign-sheet' } }));
    expect(db.measurement.update).not.toHaveBeenCalled();
  });
});
