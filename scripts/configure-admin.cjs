const { existsSync } = require('node:fs');
const { join } = require('node:path');

async function configureAdmin(db, hashPassword, env = process.env) {
  const email = env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.SEED_ADMIN_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 10) {
    throw new Error('Définissez SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD (10 caractères minimum).');
  }
  const passwordHash = await hashPassword(password);
  return db.$transaction(async (tx) => {
    const target = await tx.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (target && target.role !== 'ADMIN')
      throw new Error('Cette adresse appartient déjà à un compte non administrateur.');
    const admins = target
      ? []
      : await tx.user.findMany({ where: { role: 'ADMIN' }, select: { id: true }, take: 2 });
    if (!target && admins.length > 1)
      throw new Error(
        'Plusieurs administrateurs existent : indiquez l’adresse du compte à modifier avant de continuer.',
      );
    const current = target ?? admins[0];
    const select = { id: true, email: true, role: true, active: true };
    if (current)
      return tx.user.update({
        where: { id: current.id },
        data: {
          email,
          passwordHash,
          refreshTokenHash: null,
          sessionVersion: { increment: 1 },
          active: true,
        },
        select,
      });
    return tx.user.create({
      data: {
        email,
        passwordHash,
        firstName: 'Abdallah',
        lastName: 'Administrateur',
        phone: env.SEED_ADMIN_PHONE || '+221770000100',
        role: 'ADMIN',
        active: true,
      },
      select,
    });
  });
}

module.exports = { configureAdmin };

if (require.main === module) {
  const envPath = join(__dirname, '..', '.env');
  if (existsSync(envPath)) process.loadEnvFile(envPath);
  const { PrismaClient } = require('@prisma/client');
  const argon2 = require('argon2');
  const db = new PrismaClient();
  configureAdmin(db, (password) => argon2.hash(password))
    .then((user) => console.log(`Compte super administrateur configuré : ${user.email}`))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    })
    .finally(() => db.$disconnect());
}
