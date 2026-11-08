import { NotFoundException } from '@nestjs/common';
import { createCommerceService } from './commerce.fixture';

describe('stylist profiles', () => {
  const setup = () => {
    const db = {
      stylistProfile: {
        findUnique: jest.fn().mockResolvedValue({ id: 'profile', userId: 'stylist' }),
        findMany: jest.fn().mockResolvedValue([]),
        update: jest.fn().mockResolvedValue({ id: 'profile' }),
      },
    };
    return { db, service: createCommerceService(db as never) };
  };

  it('lists active profiles with an optional cursor', async () => {
    const { db, service } = setup();

    await service.listStylists(10);
    expect(db.stylistProfile.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({
        take: 10,
        where: { user: { is: { active: true, deletedAt: null } } },
      }),
    );

    await service.listStylists(10, 'next-profile');
    expect(db.stylistProfile.findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: { id: 'next-profile' }, skip: 1 }),
    );
  });

  it('updates profile data with or without a new image', async () => {
    const { db, service } = setup();

    await service.updateStylistProfile('stylist', { about: 'Atelier Dakar' });
    expect(db.stylistProfile.update).toHaveBeenLastCalledWith(
      expect.objectContaining({ data: { about: 'Atelier Dakar' } }),
    );

    await service.updateStylistProfile('stylist', {
      about: 'Atelier Dakar',
      profileImage: 'https://example.com/profile.jpg',
    });
    expect(db.stylistProfile.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: {
          about: 'Atelier Dakar',
          user: { update: { profileImage: 'https://example.com/profile.jpg' } },
        },
      }),
    );
  });

  it('returns not found when the profile does not exist', async () => {
    const { db, service } = setup();
    db.stylistProfile.findUnique.mockResolvedValue(null);

    await expect(service.updateStylistProfile('missing', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(db.stylistProfile.update).not.toHaveBeenCalled();
  });
});
