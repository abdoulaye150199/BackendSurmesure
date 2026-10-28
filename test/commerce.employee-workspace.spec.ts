import { ForbiddenException } from '@nestjs/common';
import { CommerceService } from '../src/modules/commerce/application/commerce.service';

describe('employee workspace access', () => {
  const employee = {
    id: 'personnel-id',
    stylistId: 'atelier-id',
    userId: 'employee-user-id',
    stylist: { id: 'atelier-id', businessName: 'Atelier Awa' },
  };
  const makeService = () => {
    const db = {
      personnel: { findFirst: jest.fn().mockResolvedValue(employee) },
      measurement: { findMany: jest.fn(), create: jest.fn() },
      user: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    return { service: new CommerceService(db as never), db };
  };

  it('refuses access when the employee assignment is inactive or missing', async () => {
    const { service, db } = makeService();
    db.personnel.findFirst.mockResolvedValue(null);
    await expect(service.employeeContext('employee-user-id')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('lists measurement records only from the employee assigned atelier', async () => {
    const { service, db } = makeService();
    db.measurement.findMany.mockResolvedValue([{ id: 'measurement-id', values: { poitrine: 92 } }]);
    const result = await service.listEmployeeMeasurements('employee-user-id', 100);
    expect(db.personnel.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ userId: 'employee-user-id' }) }));
    expect(db.measurement.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { stylistId: 'atelier-id' } }));
    expect(result.data[0]).toMatchObject({ id: 'measurement-id', measurements: { poitrine: 92 } });
  });

  it('creates a client measurement record without inventing a client login', async () => {
    const { service, db } = makeService();
    db.measurement.create.mockResolvedValue({ id: 'measurement-id', clientId: null, values: { taille: 74 } });
    const result = await service.createEmployeeMeasurement('employee-user-id', {
      clientName: 'Fatou Ndiaye', clientPhone: '+221770000001', measurements: { taille: 74 }, notes: '',
    });
    expect(db.measurement.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ stylistId: 'atelier-id', clientId: null, clientName: 'Fatou Ndiaye' }),
    }));
    expect(result.measurements).toEqual({ taille: 74 });
  });
});
