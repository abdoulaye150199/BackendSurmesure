import { AppointmentStatus, OrderStatus, PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function upsertDemoUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
  profileImage: string;
}) {
  const { password, ...data } = input;
  return prisma.user.upsert({
    where: { email: data.email },
    update: { profileImage: data.profileImage },
    create: { ...data, passwordHash: await argon2.hash(password) },
  });
}

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
      update: {},
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

  const client = await upsertDemoUser({
    firstName: 'Fatou', lastName: 'Ndiaye', email: 'client@surmesure.sn',
    phone: '+221770000101', role: UserRole.CLIENT, password: clientPassword,
    profileImage: '/assets/stylist-awa.png',
  });
  const mariama = await upsertDemoUser({
    firstName: 'Mariama', lastName: 'Fall', email: 'mariama.demo@surmesure.sn',
    phone: '+221770000103', role: UserRole.CLIENT, password: clientPassword,
    profileImage: '/assets/stylist-awa.png',
  });

  const stylistSpecs = [
    {
      firstName: 'Awa', lastName: 'Diop', email: 'styliste@surmesure.sn', phone: '+221770000102',
      businessName: 'Atelier Awa', about: 'Créations de cérémonie élégantes et confection sur mesure à Dakar.',
      specialties: ['Cérémonie', 'Sur mesure'], rating: 4.9, profileImage: '/assets/stylist-awa.png',
    },
    {
      firstName: 'Mame', lastName: 'Sarr', email: 'mame@surmesure.sn', phone: '+221770000104',
      businessName: 'Maison Diarra', about: 'Lignes contemporaines, matières fortes et finitions précises à Saint-Louis.',
      specialties: ['Moderne', 'Boubous'], rating: 4.8, profileImage: '/assets/stylist-mame.png',
    },
    {
      firstName: 'Fatou', lastName: 'Diallo', email: 'fatou.styliste@surmesure.sn', phone: '+221770000105',
      businessName: 'Seynabou Studio', about: 'Le savoir-faire traditionnel revisité avec une sensibilité actuelle à Dakar.',
      specialties: ['Traditionnel', 'Ensembles'], rating: 4.7, profileImage: '/assets/stylist-fatou.png',
    },
  ];

  const stylists = [];
  for (const spec of stylistSpecs) {
    const user = await upsertDemoUser({
      firstName: spec.firstName,
      lastName: spec.lastName,
      email: spec.email,
      phone: spec.phone,
      role: UserRole.STYLIST,
      password: stylistPassword,
      profileImage: spec.profileImage,
    });
    const profile = await prisma.stylistProfile.upsert({
      where: { userId: user.id },
      update: {
        businessName: spec.businessName,
        about: spec.about,
        specialties: spec.specialties,
        rating: spec.rating,
      },
      create: {
        userId: user.id,
        businessName: spec.businessName,
        about: spec.about,
        specialties: spec.specialties,
        rating: spec.rating,
      },
    });
    stylists.push({ user, profile });
  }

  const [awa, mame, fatou] = stylists;
  const catalog = [
    { id: '11111111-1111-4111-8111-111111111111', stylistId: awa.profile.id, title: 'Robe Ndar', description: 'Silhouette de cérémonie aux finitions graphiques.', imageUrl: '/assets/look-2.png', price: 89000, colors: ['Prune', 'Ivoire'] },
    { id: '22222222-2222-4222-8222-222222222222', stylistId: mame.profile.id, title: 'Boubou Alizé', description: 'Boubou contemporain aux volumes fluides.', imageUrl: '/assets/look-1.png', price: 115000, colors: ['Wax', 'Noir'] },
    { id: '33333333-3333-4333-8333-333333333333', stylistId: fatou.profile.id, title: 'Ensemble Kër', description: 'Ensemble élégant pensé pour les grands rendez-vous.', imageUrl: '/assets/look-3.png', price: 74000, colors: ['Rose', 'Or'] },
    { id: '99999999-9999-4999-8999-999999999991', stylistId: awa.profile.id, title: 'Robe Sine', description: 'Robe de cérémonie fluide inspirée des teintes du Sahel.', imageUrl: '/assets/look-1.png', price: 97000, colors: ['Prune', 'Ivoire'] },
    { id: '99999999-9999-4999-8999-999999999992', stylistId: fatou.profile.id, title: 'Boubou Héritage', description: 'Boubou traditionnel revisité avec des finitions brodées.', imageUrl: '/assets/look-3.png', price: 128000, colors: ['Sable', 'Or'] },
    { id: '99999999-9999-4999-8999-999999999993', stylistId: mame.profile.id, title: 'Ensemble Dakar', description: 'Ensemble deux pièces aux lignes modernes.', imageUrl: '/assets/look-2.png', price: 82000, colors: ['Rose', 'Noir'] },
  ];
  for (const item of catalog) {
    const { colors, ...itemData } = item;
    await prisma.catalogItem.upsert({
      where: { id: item.id },
      update: { ...itemData, availableColors: colors, active: true },
      create: { ...itemData, currency: 'XOF', availableColors: colors },
    });
  }

  const orders = [
    { id: '44444444-4444-4444-8444-444444444444', stylist: awa, client, description: 'Robe Ndar', status: OrderStatus.inProgress, totalPrice: 89000, notes: 'Essayage prévu après la finition des manches.' },
    { id: '55555555-5555-4555-8555-555555555555', stylist: mame, client, description: 'Boubou Alizé', status: OrderStatus.pending, totalPrice: 115000, notes: 'En attente de validation des détails.' },
    { id: '66666666-6666-4666-8666-666666666666', stylist: fatou, client, description: 'Ensemble Kër', status: OrderStatus.completed, totalPrice: 74000, notes: 'Confection terminée, prête à être livrée.' },
    { id: '99999999-9999-4999-8999-999999999994', stylist: awa, client: mariama, description: 'Boubou Héritage', status: OrderStatus.pending, totalPrice: 115000, notes: 'Tissu fourni par la cliente.' },
  ];
  for (const order of orders) {
    const { stylist, client: orderClient, ...data } = order;
    await prisma.order.upsert({
      where: { id: data.id },
      update: {
        stylistId: stylist.profile.id,
        clientId: orderClient.id,
        clientName: `${orderClient.firstName} ${orderClient.lastName}`,
        clientPhone: orderClient.phone,
        description: data.description,
        status: data.status,
        totalPrice: data.totalPrice,
        notes: data.notes,
      },
      create: {
        ...data,
        stylistId: stylist.profile.id,
        clientId: orderClient.id,
        clientName: `${orderClient.firstName} ${orderClient.lastName}`,
        clientPhone: orderClient.phone,
      },
    });
  }

  await prisma.measurement.upsert({
    where: { id: '77777777-7777-4777-8777-777777777777' },
    update: {
      stylistId: awa.profile.id,
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      clientPhone: client.phone,
      values: { poitrine: 92, epaules: 38, cou: 34, tourBras: 29, taille: 74, hanches: 101, longueurRobe: 142, entrejambe: 78, hauteur: 168, longueurManche: 59 },
      notes: 'Mesures prises à l’atelier · profil démo',
    },
    create: {
      id: '77777777-7777-4777-8777-777777777777',
      stylistId: awa.profile.id,
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      clientPhone: client.phone,
      values: { poitrine: 92, epaules: 38, cou: 34, tourBras: 29, taille: 74, hanches: 101, longueurRobe: 142, entrejambe: 78, hauteur: 168, longueurManche: 59 },
      notes: 'Mesures prises à l’atelier · profil démo',
    },
  });

  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 4);
  appointmentDate.setHours(15, 30, 0, 0);
  await prisma.appointment.upsert({
    where: { id: '88888888-8888-4888-8888-888888888888' },
    update: { clientId: client.id, stylistId: awa.profile.id, service: 'Essayage final', startsAt: appointmentDate, status: AppointmentStatus.confirmed, notes: 'Premier essayage à l’atelier.' },
    create: { id: '88888888-8888-4888-8888-888888888888', clientId: client.id, stylistId: awa.profile.id, service: 'Essayage final', startsAt: appointmentDate, status: AppointmentStatus.confirmed, notes: 'Premier essayage à l’atelier.' },
  });

  console.log('Données de démonstration synchronisées : 3 stylistes, 6 créations, 4 commandes, 1 fiche de mesures et 1 rendez-vous.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
