const { configureAdmin } = require('../scripts/configure-admin.cjs');

describe('super administrator configuration', () => {
  const env = { SEED_ADMIN_EMAIL: 'owner@example.com', SEED_ADMIN_PASSWORD: 'PrivatePassword2026' };
  const setup = () => {
    const user = {
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([{ id: 'existing-admin' }]),
      update: jest.fn().mockResolvedValue({ email: env.SEED_ADMIN_EMAIL }),
      create: jest.fn(),
    };
    const db = { $transaction: jest.fn(async (callback) => callback({ user })) };
    const hash = jest.fn().mockResolvedValue('hashed-password');
    return { db, user, hash };
  };
  it('updates the existing admin and revokes refresh sessions without storing plaintext', async () => {
    const { db, user, hash } = setup();
    await configureAdmin(db, hash, env);
    expect(user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'existing-admin' },
        data: {
          email: env.SEED_ADMIN_EMAIL,
          passwordHash: 'hashed-password',
          refreshTokenHash: null,
          sessionVersion: { increment: 1 },
          active: true,
        },
      }),
    );
    expect(user.create).not.toHaveBeenCalled();
    expect(JSON.stringify(user.update.mock.calls)).not.toContain(env.SEED_ADMIN_PASSWORD);
  });
  it('refuses to promote a client with the target address', async () => {
    const { db, user, hash } = setup();
    user.findUnique.mockResolvedValue({ id: 'client', role: 'CLIENT' });
    await expect(configureAdmin(db, hash, env)).rejects.toThrow('non administrateur');
    expect(user.update).not.toHaveBeenCalled();
  });
  it('refuses to choose arbitrarily between several admin accounts', async () => {
    const { db, user, hash } = setup();
    user.findMany.mockResolvedValue([{ id: 'one' }, { id: 'two' }]);
    await expect(configureAdmin(db, hash, env)).rejects.toThrow('Plusieurs administrateurs');
    expect(user.update).not.toHaveBeenCalled();
  });
  it('creates an admin only if no admin already exists', async () => {
    const { db, user, hash } = setup();
    user.findMany.mockResolvedValue([]);
    await configureAdmin(db, hash, env);
    expect(user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: 'ADMIN',
          email: env.SEED_ADMIN_EMAIL,
          passwordHash: 'hashed-password',
        }),
      }),
    );
  });
});
