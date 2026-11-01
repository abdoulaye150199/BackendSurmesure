import { ConflictException } from '@nestjs/common';
import { createCommerceService } from './commerce.fixture';
describe('concurrent writes', () => {
  it('refuses to overwrite a newer order version', async () => {
    const record = {
      id: 'order',
      status: 'pending',
      updatedAt: new Date(),
      stylist: { userId: 'owner' },
    };
    const db = {
      order: {
        findUnique: jest.fn().mockResolvedValue(record),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
        findUniqueOrThrow: jest.fn(),
      },
    };
    await expect(
      createCommerceService(db as never).updateOrder('order', 'owner', { status: 'inProgress' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(db.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'order', updatedAt: record.updatedAt } }),
    );
    expect(db.order.findUniqueOrThrow).not.toHaveBeenCalled();
  });
  it('refuses to overwrite a newer appointment status', async () => {
    const db = {
      appointment: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'appointment',
          status: 'pending',
          stylist: { userId: 'owner' },
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
    };
    await expect(
      createCommerceService(db as never).updateStylistAppointmentStatus(
        'appointment',
        'owner',
        'confirmed',
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
