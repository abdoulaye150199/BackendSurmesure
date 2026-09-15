import { AppointmentStatus, OrderStatus, PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const clientPassword = process.env.SEED_CLIENT_PASSWORD ?? 'Client@2026!';
  const stylistPassword = process.env.SEED_STYLIST_PASSWORD ?? 'Styliste@2026!';
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!!adminEmail !== !!adminPassword) {
    throw new Error('SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD doivent être fournis ensemble.');
  }

  if (adminEmail && adminPassword) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        firstName: 'Abdallah',
        lastName: 'Administrateur',
        phone: '+221770000100',
        role: UserRole.ADMIN,
        active: true,
        passwordHash: await argon2.hash(adminPassword),
      },
      create: {
        firstName: 'Abdallah',
        lastName: 'Administrateur',
        email: adminEmail,
        phone: '+221770000100',
        role: UserRole.ADMIN,
        passwordHash: await argon2.hash(adminPassword),
      },
    });
  }

  const client = await prisma.user.upsert({
    where: { email: 'client@surmesure.sn' },
    update: {
      firstName: 'Fatou',
      lastName: 'Ndiaye',
      phone: '+221770000101',
      role: UserRole.CLIENT,
      active: true,
      passwordHash: await argon2.hash(clientPassword),
    },
    create: {
      firstName: 'Fatou',
      lastName: 'Ndiaye',
      email: 'client@surmesure.sn',
      phone: '+221770000101',
      role: UserRole.CLIENT,
      passwordHash: await argon2.hash(clientPassword),
    },
  });

  const stylist = await prisma.user.upsert({
    where: { email: 'styliste@surmesure.sn' },
    update: {
      firstName: 'Awa',
      lastName: 'Diop',
      phone: '+221770000102',
      role: UserRole.STYLIST,
      active: true,
      passwordHash: await argon2.hash(stylistPassword),
    },
    create: {
      firstName: 'Awa',
      lastName: 'Diop',
      email: 'styliste@surmesure.sn',
      phone: '+221770000102',
      role: UserRole.STYLIST,
      passwordHash: await argon2.hash(stylistPassword),
    },
  });

  const stylistProfile = await prisma.stylistProfile.upsert({
    where: { userId: stylist.id },
    update: { businessName: 'Atelier Awa', specialties: ['Cérémonie', 'Sur mesure'], rating: 4.9 },
    create: {
      userId: stylist.id,
      businessName: 'Atelier Awa',
      about: 'Créations de cérémonie élégantes et confection sur mesure à Dakar.',
      specialties: ['Cérémonie', 'Sur mesure'],
      rating: 4.9,
    },
  });

  const catalog = [
    { id: '11111111-1111-4111-8111-111111111111', title: 'Robe Ndar', description: 'Silhouette de cérémonie aux finitions graphiques.', imageUrl: '/assets/look-2.png', price: 89000, colors: ['Prune', 'Ivoire'] },
    { id: '22222222-2222-4222-8222-222222222222', title: 'Boubou Alizé', description: 'Boubou contemporain aux volumes fluides.', imageUrl: '/assets/look-1.png', price: 115000, colors: ['Wax', 'Noir'] },
    { id: '33333333-3333-4333-8333-333333333333', title: 'Ensemble Kër', description: 'Ensemble élégant pensé pour les grands rendez-vous.', imageUrl: '/assets/look-3.png', price: 74000, colors: ['Rose', 'Or'] },
  ];
  for (const item of catalog) {
    await prisma.catalogItem.upsert({
      where: { id: item.id },
      update: { stylistId: stylistProfile.id, title: item.title, description: item.description, imageUrl: item.imageUrl, price: item.price, availableColors: item.colors, active: true },
      create: { id: item.id, stylistId: stylistProfile.id, title: item.title, description: item.description, imageUrl: item.imageUrl, price: item.price, availableColors: item.colors },
    });
  }

  const orders = [
    { id: '44444444-4444-4444-8444-444444444444', description: 'Robe Ndar', status: OrderStatus.inProgress, totalPrice: 89000, notes: 'Livraison prévue après l’essayage final.' },
    { id: '55555555-5555-4555-8555-555555555555', description: 'Boubou Alizé', status: OrderStatus.pending, totalPrice: 115000, notes: 'En attente de validation des détails.' },
    { id: '66666666-6666-4666-8666-666666666666', description: 'Ensemble Kër', status: OrderStatus.completed, totalPrice: 74000, notes: 'Confection terminée, prête à être livrée.' },
  ];
  for (const order of orders) {
    await prisma.order.upsert({
      where: { id: order.id },
      update: { stylistId: stylistProfile.id, clientId: client.id, clientName: `${client.firstName} ${client.lastName}`, clientPhone: client.phone, description: order.description, status: order.status, totalPrice: order.totalPrice, notes: order.notes },
      create: { ...order, stylistId: stylistProfile.id, clientId: client.id, clientName: `${client.firstName} ${client.lastName}`, clientPhone: client.phone },
    });
  }

  await prisma.measurement.upsert({
    where: { id: '77777777-7777-4777-8777-777777777777' },
    update: { stylistId: stylistProfile.id, clientId: client.id, clientName: `${client.firstName} ${client.lastName}`, clientPhone: client.phone, values: { poitrine: 92, taille: 74, hanches: 100, hauteur: 168, epaules: 38, cou: 34, longueurRobe: 142, entrejambe: 78 } },
    create: { id: '77777777-7777-4777-8777-777777777777', stylistId: stylistProfile.id, clientId: client.id, clientName: `${client.firstName} ${client.lastName}`, clientPhone: client.phone, values: { poitrine: 92, taille: 74, hanches: 100, hauteur: 168, epaules: 38, cou: 34, longueurRobe: 142, entrejambe: 78 }, notes: 'Profil client de démonstration.' },
  });

  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 4);
  appointmentDate.setHours(15, 30, 0, 0);
  await prisma.appointment.upsert({
    where: { id: '88888888-8888-4888-8888-888888888888' },
    update: { clientId: client.id, stylistId: stylistProfile.id, service: 'Essayage final', startsAt: appointmentDate, status: AppointmentStatus.confirmed, notes: 'Essayage de la Robe Ndar.' },
    create: { id: '88888888-8888-4888-8888-888888888888', clientId: client.id, stylistId: stylistProfile.id, service: 'Essayage final', startsAt: appointmentDate, status: AppointmentStatus.confirmed, notes: 'Essayage de la Robe Ndar.' },
  });

  console.log(adminEmail
    ? `Données de démonstration et compte administrateur ${adminEmail} créés.`
    : 'Comptes et données de démonstration des dashboards créés.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
