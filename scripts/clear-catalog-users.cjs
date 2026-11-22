const { existsSync } = require('node:fs');
const { resolve } = require('node:path');

async function clearCatalogUsers(db, apply = false) {
  return db.$transaction(
    async (tx) => {
      if (apply) {
        // Block concurrent writes while resolving and deleting the target accounts.
        await tx.$executeRaw`LOCK TABLE "User", "StylistProfile", "Personnel", "Order", "Measurement", "Appointment", "ClientNotification", "AdminRegistrationRead", "CatalogItem", "CatalogLike" IN EXCLUSIVE MODE`;
      }
      const admins = await tx.user.count({ where: { role: 'ADMIN' } });
      const users = await tx.user.findMany({
        where: { role: { not: 'ADMIN' } },
        select: { id: true },
      });
      const userIds = users.map(({ id }) => id);
      const profiles = await tx.stylistProfile.findMany({
        where: { userId: { in: userIds } },
        select: { id: true },
      });
      const profileIds = profiles.map(({ id }) => id);
      const history = {
        OR: [{ clientId: { in: userIds } }, { stylistId: { in: profileIds } }],
      };
      const steps = [
        ['catalogLike', {}],
        ['catalogItem', {}],
        [
          'adminRegistrationRead',
          {
            OR: [{ adminId: { in: userIds } }, { stylistUserId: { in: userIds } }],
          },
        ],
        [
          'clientNotification',
          {
            OR: [{ clientId: { in: userIds } }, { order: { is: history } }],
          },
        ],
        ['appointment', history],
        ['measurement', history],
        ['order', history],
        [
          'personnel',
          {
            OR: [{ userId: { in: userIds } }, { stylistId: { in: profileIds } }],
          },
        ],
        ['stylistProfile', { userId: { in: userIds } }],
        ['user', { id: { in: userIds }, role: { not: 'ADMIN' } }],
      ];
      const affected = {};
      for (const [model, where] of steps) {
        affected[model] = apply
          ? (await tx[model].deleteMany({ where })).count
          : await tx[model].count({ where });
      }
      if (apply) {
        const remainingUsers = await tx.user.count({ where: { role: { not: 'ADMIN' } } });
        const remainingCatalog = await tx.catalogItem.count();
        const remainingAdmins = await tx.user.count({ where: { role: 'ADMIN' } });
        if (remainingUsers || remainingCatalog || remainingAdmins !== admins) {
          throw new Error('Vérification finale échouée.');
        }
      }
      return {
        mode: apply ? 'suppression' : 'aperçu sans suppression',
        adminsConserves: admins,
        affected,
      };
    },
    { maxWait: 10_000, timeout: 120_000, isolationLevel: 'RepeatableRead' },
  );
}

module.exports = { clearCatalogUsers };

if (require.main === module) {
  async function main() {
    const args = process.argv.slice(2);
    if (args.some((arg) => !['--apply', '--dry-run'].includes(arg)) || args.length > 1) {
      throw new Error('Utilisation : node scripts/clear-catalog-users.cjs [--dry-run | --apply]');
    }
    const envPath = resolve(__dirname, '..', '.env');
    if (existsSync(envPath)) process.loadEnvFile(envPath);
    for (const name of ['UV_THREADPOOL_SIZE', 'TOKIO_WORKER_THREADS', 'RAYON_NUM_THREADS']) {
      process.env[name] ||= '1';
    }
    const url = new URL(process.env.DATABASE_URL);
    url.searchParams.set('connection_limit', '1');
    const { PrismaClient } = require('@prisma/client');
    const db = new PrismaClient({ datasources: { db: { url: url.toString() } } });
    try {
      console.log(`Base : ${url.hostname}${url.pathname}`);
      const result = await clearCatalogUsers(db, args.includes('--apply'));
      console.log(JSON.stringify(result, null, 2));
      if (!args.includes('--apply'))
        console.log('Ajouter --apply pour exécuter la suppression autorisée.');
    } finally {
      await db.$disconnect();
    }
  }
  main().catch((error) => {
    // Avoid printing connection URLs or database credentials in diagnostics.
    console.error(`Nettoyage non effectué (${error.code || error.name}). Transaction non validée.`);
    process.exitCode = 1;
  });
}
