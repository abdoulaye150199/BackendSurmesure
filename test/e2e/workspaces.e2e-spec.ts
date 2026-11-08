import { JwtService } from '@nestjs/jwt';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { UserRole, type User } from '@prisma/client';
import * as argon2 from 'argon2';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { configureApplication } from '../../src/configure-application';
import { PrismaService } from '../../src/infrastructure/prisma/prisma.service';

/** Real HTTP, real guards, real PostgreSQL. The setup refuses production URLs. */
describe('workspace HTTP contracts', () => {
  let app: NestExpressApplication;
  let db: PrismaService;
  let jwt: JwtService;
  let owner: User;
  let stranger: User;
  let client: User;
  let admin: User;
  let employee: User;
  let atelierId: string;
  let otherAtelierId: string;
  let orderId: string;
  let measurementId: string;
  let legacyOrderId: string;
  let appointmentId: string;
  const tokens = new Map<string, string>();
  const password = 'TestOnlyPassword2026!';

  async function token(user: User): Promise<string> {
    const cached = tokens.get(user.id);
    if (cached) {
      return cached;
    }
    const value = await jwt.signAsync(
      { sub: user.id, role: user.role, email: user.email, sessionVersion: user.sessionVersion },
      { secret: process.env.JWT_ACCESS_SECRET, expiresIn: '15m' },
    );
    tokens.set(user.id, value);
    return value;
  }
  async function authorization(user: User) {
    return `Bearer ${await token(user)}`;
  }
  function http() {
    return request(app.getHttpServer());
  }

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication<NestExpressApplication>({
      logger: false,
      bodyParser: false,
    });
    configureApplication(app);
    await app.init();
    await app.listen(0, '127.0.0.1');
    db = app.get(PrismaService);
    jwt = app.get(JwtService);
    // This database is guarded by setup-env.ts and contains only test fixtures.
    await db.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
    const passwordHash = await argon2.hash(password);
    async function user(name: string, role: UserRole, phone: string) {
      return db.user.create({
        data: {
          firstName: name,
          lastName: 'Test',
          email: `${name}@example.com`,
          phone,
          role,
          passwordHash,
        },
      });
    }
    owner = await user('owner', UserRole.STYLIST, '+221770000011');
    stranger = await user('stranger', UserRole.STYLIST, '+221770000012');
    client = await user('client', UserRole.CLIENT, '+221770000013');
    admin = await user('admin', UserRole.ADMIN, '+221770000014');
    employee = await user('employee', UserRole.EMPLOYEE, '+221770000015');
    const atelier = await db.stylistProfile.create({
      data: { userId: owner.id, businessName: 'Atelier qualité', specialties: [] },
    });
    const other = await db.stylistProfile.create({
      data: { userId: stranger.id, businessName: 'Autre atelier', specialties: [] },
    });
    atelierId = atelier.id;
    otherAtelierId = other.id;
    await db.personnel.create({
      data: {
        stylistId: atelierId,
        userId: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        specialization: 'Couture',
      },
    });
  });
  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('serves liveness and database readiness', async () => {
    await http().get('/v1/health/live').expect(200);
    await http().get('/v1/health/ready').expect(200);
  });
  it('rejects missing tokens, invalid tokens and wrong roles', async () => {
    await http().get('/v1/admin/dashboard').expect(401);
    await http().get('/v1/admin/dashboard').auth('invalid', { type: 'bearer' }).expect(401);
    await http()
      .get('/v1/admin/dashboard')
      .set('Authorization', await authorization(client))
      .expect(403);
  });
  it('detects the role during shared login and refreshes the session exactly once', async () => {
    const login = await http()
      .post('/v1/auth/login')
      .send({ email: owner.email, password })
      .expect(201);
    expect(login.body.data.role).toBe('STYLIST');
    expect(login.body.data.passwordHash).toBeUndefined();
    expect(login.body.data.sessionVersion).toBeUndefined();
    const refresh = await http()
      .post('/v1/auth/refresh')
      .send({ refreshToken: login.body.refreshToken })
      .expect(201);
    expect(refresh.body.refreshToken).not.toBe(login.body.refreshToken);
    await http()
      .post('/v1/auth/refresh')
      .send({ refreshToken: login.body.refreshToken })
      .expect(401);
  });
  it('rejects invalid credentials and signing into another role', async () => {
    await http()
      .post('/v1/auth/login')
      .send({ email: client.email, password: 'wrong' })
      .expect(401);
    await http().post('/v1/auth/admin/login').send({ email: client.email, password }).expect(401);
  });
  it('validates bodies, unknown properties, identifiers and pagination', async () => {
    const auth = await authorization(owner);
    await http()
      .post(`/v1/stylist/${atelierId}/orders`)
      .set('Authorization', auth)
      .send({ clientName: ' ', totalPrice: '' })
      .expect(400);
    await http().get('/v1/catalog?limit=101').expect(400);
    await http().get('/v1/catalog?cursor=not-a-uuid').expect(400);
    await http().get('/v1/catalog/not-a-uuid').expect(400);
    await http()
      .post('/v1/auth/login')
      .send({ email: client.email, password, role: 'ADMIN' })
      .expect(400);
  });
  it('creates a guest order and its validated measurements atomically', async () => {
    const response = await http()
      .post(`/v1/stylist/${atelierId}/orders`)
      .set('Authorization', await authorization(owner))
      .send({
        clientName: 'Client Test',
        clientPhone: client.phone,
        description: 'Tenue test',
        totalPrice: 40000,
        measurements: { taille: 74 },
        durationDays: 7,
        dueAt: new Date(Date.now() + 86400000).toISOString(),
      })
      .expect(201);
    orderId = response.body.id;
    expect(response.body.clientId).toBeNull();
    const sheet = await db.measurement.findFirstOrThrow({ where: { stylistId: atelierId } });
    measurementId = sheet.id;
    expect(sheet.validatedAt).not.toBeNull();
    expect(sheet.values).toEqual({ taille: 74 });
  });
  it('prevents another atelier from reading or changing the order', async () => {
    const auth = await authorization(stranger);
    await http().get(`/v1/stylist/${atelierId}/orders`).set('Authorization', auth).expect(403);
    await http()
      .patch(`/v1/orders/${orderId}`)
      .set('Authorization', auth)
      .send({ status: 'inProgress' })
      .expect(403);
  });
  it('does not disclose guest history merely because an account uses the same phone', async () => {
    const legacy = await db.order.create({
      data: {
        stylistId: atelierId,
        clientId: client.id,
        clientName: 'Client Test',
        clientPhone: client.phone,
        description: 'Ancien lien non vérifié',
        totalPrice: 100,
      },
    });
    legacyOrderId = legacy.id;
    const sheet = await db.measurement.create({
      data: {
        stylistId: atelierId,
        clientId: client.id,
        clientName: 'Client Test',
        clientPhone: client.phone,
        values: { taille: 74 },
      },
    });
    await http()
      .put('/v1/client/measurements')
      .set('Authorization', await authorization(client))
      .send({ measurementId: sheet.id, stylistId: atelierId, measurements: { taille: 80 } })
      .expect(404);
    const auth = await authorization(client);
    expect(
      (await http().get('/v1/orders').set('Authorization', auth).expect(200)).body.data,
    ).toEqual([]);
    expect(
      (await http().get('/v1/measurements').set('Authorization', auth).expect(200)).body,
    ).toEqual([]);
    expect((await db.order.findUniqueOrThrow({ where: { id: orderId } })).clientId).toBeNull();
  });
  it('requires explicit owner confirmation and links only the owner atelier history', async () => {
    await db.order.create({
      data: {
        stylistId: otherAtelierId,
        clientName: 'Client Test',
        clientPhone: client.phone,
        description: 'Autre commande',
        totalPrice: 1000,
      },
    });
    const auth = await authorization(owner);
    const candidates = await http()
      .get(`/v1/stylist/${atelierId}/clients/link-candidates`)
      .query({ phone: client.phone })
      .set('Authorization', auth)
      .expect(200);
    expect(candidates.body.map((item: { id: string }) => item.id)).toContain(client.id);
    const route = `/v1/stylist/${atelierId}/clients/link`;
    await http()
      .post(route)
      .set('Authorization', auth)
      .send({ clientId: client.id, phone: client.phone, identityConfirmed: false })
      .expect(400);
    await http()
      .post(route)
      .set('Authorization', await authorization(employee))
      .send({ clientId: client.id, phone: client.phone, identityConfirmed: true })
      .expect(403);
    await http()
      .post(route)
      .set('Authorization', auth)
      .send({ clientId: client.id, phone: client.phone, identityConfirmed: true })
      .expect(201);
    const orders = await http()
      .get('/v1/orders')
      .set('Authorization', await authorization(client))
      .expect(200);
    expect(orders.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([orderId, legacyOrderId]),
    );
    expect(await db.order.count({ where: { stylistId: otherAtelierId, clientId: null } })).toBe(1);
  });
  it('rejects booleans, numeric strings and null measurements', async () => {
    for (const measurements of [{ taille: true }, { taille: '74' }, null]) {
      await http()
        .put(`/v1/measurements/${measurementId}`)
        .set('Authorization', await authorization(owner))
        .send({ measurements })
        .expect(400);
    }
    await http()
      .patch(`/v1/orders/${orderId}`)
      .set('Authorization', await authorization(owner))
      .send({ totalPrice: null })
      .expect(400);
  });
  it('keeps client-entered measurements pending until the owner validates their current version', async () => {
    const created = await http()
      .post('/v1/client/measurements')
      .set('Authorization', await authorization(client))
      .send({ stylistId: atelierId, modelName: 'Tenue client', measurements: { taille: 75 } })
      .expect(201);
    expect(created.body.validatedAt).toBeNull();
    const route = `/v1/measurements/${created.body.id}/validate`;
    const body = { modelName: 'Tenue validée', expectedUpdatedAt: created.body.updatedAt };
    await http()
      .patch(route)
      .set('Authorization', await authorization(stranger))
      .send(body)
      .expect(403);
    await http()
      .patch(route)
      .set('Authorization', await authorization(owner))
      .send(body)
      .expect(200);
    await http()
      .patch(route)
      .set('Authorization', await authorization(owner))
      .send(body)
      .expect(409);
    await http()
      .put('/v1/client/measurements')
      .set('Authorization', await authorization(client))
      .send({ measurementId: created.body.id, stylistId: atelierId, measurements: { taille: 76 } })
      .expect(200);
    expect(
      (await db.measurement.findUniqueOrThrow({ where: { id: created.body.id } })).validatedAt,
    ).toBeNull();
  });
  it('protects order lifecycle transitions', async () => {
    const auth = await authorization(owner);
    const route = `/v1/orders/${orderId}`;
    await http().patch(route).set('Authorization', auth).send({ status: 'delivered' }).expect(400);
    for (const status of ['inProgress', 'completed', 'delivered']) {
      await http().patch(route).set('Authorization', auth).send({ status }).expect(200);
    }
    await http().patch(route).set('Authorization', auth).send({ status: 'inProgress' }).expect(400);
  });
  it('persists client notifications and isolates the read API by recipient', async () => {
    const sent = await http()
      .post(`/v1/orders/${orderId}/notify`)
      .set('Authorization', await authorization(owner))
      .send({ message: 'Votre tenue est disponible.' })
      .expect(201);
    expect(sent.body.queued).toBe(false);
    const list = await http()
      .get('/v1/client/notifications')
      .set('Authorization', await authorization(client))
      .expect(200);
    expect(list.body.data[0].id).toBe(sent.body.notificationId);
    await http()
      .patch(`/v1/client/notifications/${sent.body.notificationId}/read`)
      .set('Authorization', await authorization(client))
      .expect(200);
  });
  it('creates a pending appointment, detects slot conflicts and allows only its stylist to confirm', async () => {
    const payload = {
      stylistId: atelierId,
      service: 'Essayage',
      startsAt: new Date(Date.now() + 86400000).toISOString(),
      notes: 'Tissu fourni',
    };
    const created = await http()
      .post('/v1/appointments')
      .set('Authorization', await authorization(client))
      .send(payload)
      .expect(201);
    appointmentId = created.body.id;
    expect(created.body.status).toBe('pending');
    await http()
      .post('/v1/appointments')
      .set('Authorization', await authorization(client))
      .send(payload)
      .expect(409);
    await http()
      .patch(`/v1/appointments/${appointmentId}/status`)
      .set('Authorization', await authorization(stranger))
      .send({ status: 'confirmed' })
      .expect(403);
    await http()
      .patch(`/v1/appointments/${appointmentId}/status`)
      .set('Authorization', await authorization(owner))
      .send({ status: 'confirmed' })
      .expect(200);
  });
  it('rejects terminal appointment transitions and frees a cancelled slot', async () => {
    const auth = await authorization(owner);
    const original = await db.appointment.findUniqueOrThrow({ where: { id: appointmentId } });
    await http()
      .patch(`/v1/appointments/${appointmentId}/status`)
      .set('Authorization', auth)
      .send({ status: 'cancelled' })
      .expect(200);
    await http()
      .patch(`/v1/appointments/${appointmentId}/status`)
      .set('Authorization', auth)
      .send({ status: 'confirmed' })
      .expect(400);
    await http()
      .post('/v1/appointments')
      .set('Authorization', await authorization(client))
      .send({
        stylistId: atelierId,
        service: 'Nouvel essayage',
        startsAt: original.startsAt.toISOString(),
      })
      .expect(201);
  });
  it('scopes employee orders to the assigned atelier and keeps their measurements pending', async () => {
    const auth = await authorization(employee);
    const created = await http()
      .post('/v1/employee/orders')
      .set('Authorization', auth)
      .send({
        clientName: 'Autre Client',
        clientPhone: client.phone,
        description: 'Commande équipe',
        totalPrice: 1000,
        measurements: { taille: 74 },
      })
      .expect(201);
    expect(created.body.stylistId).toBe(atelierId);
    const sheet = await db.measurement.findFirstOrThrow({
      where: { modelName: 'Commande équipe' },
    });
    expect(sheet.source).toBe('employee');
    expect(sheet.validatedAt).toBeNull();
    await http().get('/v1/employee/me').set('Authorization', auth).expect(200);
    await http().get('/v1/employee/orders').set('Authorization', auth).expect(200);
    await http().get('/v1/employee/measurements').set('Authorization', auth).expect(200);
  });
  it('lists and updates the atelier profile and public directory', async () => {
    const auth = await authorization(owner);
    await http().get('/v1/home').expect(200);
    await http().get('/v1/stylists?limit=1').expect(200);
    await http()
      .get(`/v1/stylist/${atelierId}/measurements`)
      .set('Authorization', auth)
      .expect(200);
    await http()
      .get(`/v1/stylist/${atelierId}/measurements/search?q=Client`)
      .set('Authorization', auth)
      .expect(200);
    await http()
      .get(`/v1/stylist/${atelierId}/appointments`)
      .set('Authorization', auth)
      .expect(200);
    await http()
      .get('/v1/appointments')
      .set('Authorization', await authorization(client))
      .expect(200);
    await http()
      .put('/v1/stylist/profile')
      .set('Authorization', auth)
      .send({
        businessName: 'Atelier qualité modifié',
        about: 'Un atelier de test',
        specialties: ['Couture'],
        profileImage: '',
      })
      .expect(200);
    expect(
      (await db.stylistProfile.findUniqueOrThrow({ where: { id: atelierId } })).businessName,
    ).toBe('Atelier qualité modifié');
  });
  it('creates and edits an explicit client measurement and safely deletes it', async () => {
    const auth = await authorization(owner);
    const created = await http()
      .post(`/v1/stylist/${atelierId}/measurements`)
      .set('Authorization', auth)
      .send({
        clientId: client.id,
        clientName: 'Client Test',
        clientPhone: client.phone,
        measurements: { taille: 74 },
      })
      .expect(201);
    await http()
      .put(`/v1/measurements/${created.body.id}`)
      .set('Authorization', auth)
      .send({ measurements: { taille: 75 }, notes: 'Relevé atelier' })
      .expect(200);
    await http()
      .delete(`/v1/measurements/${created.body.id}`)
      .set('Authorization', await authorization(stranger))
      .expect(403);
    await http()
      .delete(`/v1/measurements/${created.body.id}`)
      .set('Authorization', auth)
      .expect(200);
    await http()
      .delete(`/v1/measurements/${created.body.id}`)
      .set('Authorization', auth)
      .expect(404);
  });
  it('handles employee intake and publication without granting owner privileges', async () => {
    const auth = await authorization(employee);
    const created = await http()
      .post('/v1/employee/measurements')
      .set('Authorization', auth)
      .send({
        clientName: 'Client Équipe',
        clientPhone: client.phone,
        measurements: { taille: 74 },
      })
      .expect(201);
    await http()
      .put(`/v1/employee/measurements/${created.body.id}`)
      .set('Authorization', auth)
      .send({ measurements: { taille: 75 }, notes: 'À vérifier' })
      .expect(200);
    await http()
      .post('/v1/employee/catalog')
      .set('Authorization', auth)
      .send({
        title: 'Pièce équipe',
        imageUrl: '/assets/look-1.png',
        price: 1000,
        availableColors: [],
      })
      .expect(201);
    await http()
      .post('/v1/employee/measurements')
      .set('Authorization', auth)
      .send({
        clientId: client.id,
        clientName: 'Client',
        clientPhone: client.phone,
        measurements: { taille: 74 },
      })
      .expect(400);
    await http()
      .put('/v1/stylist/profile')
      .set('Authorization', auth)
      .send({ businessName: 'Intrusion' })
      .expect(403);
  });
  it('creates, edits and revokes employee accounts through both supported management routes', async () => {
    const auth = await authorization(owner);
    const payload = {
      firstName: 'Nouvel',
      lastName: 'Employé',
      email: 'new-employee@example.com',
      phone: '+221770000099',
      password,
      specialization: 'Broderie',
    };
    const created = await http()
      .post(`/v1/stylist/${atelierId}/personnel/accounts`)
      .set('Authorization', auth)
      .send(payload)
      .expect(201);
    expect(created.body.user.passwordHash).toBeUndefined();
    await http()
      .post(`/v1/stylist/${atelierId}/personnel/accounts`)
      .set('Authorization', auth)
      .send(payload)
      .expect(409);
    await http().get(`/v1/stylist/${atelierId}/personnel`).set('Authorization', auth).expect(200);
    await http()
      .put(`/v1/stylist/${atelierId}/personnel/${created.body.id}`)
      .set('Authorization', auth)
      .send({ firstName: 'Nouveau', specialization: 'Couture', active: false })
      .expect(200);
    expect((await db.user.findUniqueOrThrow({ where: { id: created.body.userId } })).active).toBe(
      false,
    );
    await http()
      .patch(`/v1/stylist/${atelierId}/personnel/${created.body.id}/access`)
      .set('Authorization', auth)
      .send({ active: true })
      .expect(200);
    await http()
      .delete(`/v1/stylist/${atelierId}/personnel/${created.body.id}`)
      .set('Authorization', auth)
      .expect(200);
    expect((await db.user.findUniqueOrThrow({ where: { id: created.body.userId } })).active).toBe(
      false,
    );
    const legacy = await http()
      .post(`/v1/stylist/${atelierId}/personnel`)
      .set('Authorization', auth)
      .send({
        firstName: 'Sans',
        lastName: 'Compte',
        email: 'legacy@example.com',
        phone: '+221770000098',
        specialization: 'Couture',
      })
      .expect(201);
    await http().delete(`/v1/personnel/${legacy.body.id}`).set('Authorization', auth).expect(200);
  });
  it('supports all public account registration routes without trusting a supplied role', async () => {
    const newClient = {
      firstName: 'Inscrit',
      lastName: 'Client',
      email: 'registered@example.com',
      phone: '+221770000097',
      password,
    };
    const registered = await http().post('/v1/auth/register').send(newClient).expect(201);
    expect(registered.body.data.role).toBe('CLIENT');
    await http().post('/v1/auth/register').send(newClient).expect(409);
    await http()
      .post('/v1/auth/register')
      .send({ ...newClient, email: 'other@example.com' })
      .expect(409);
    await http().get('/v1/auth/me').auth(registered.body.token, { type: 'bearer' }).expect(200);
    const newStylist = {
      ...newClient,
      email: 'registered-stylist@example.com',
      phone: '+221770000096',
      businessName: 'Nouvel atelier',
    };
    const stylist = await http().post('/v1/auth/stylist/signup').send(newStylist).expect(201);
    expect(stylist.body.data.role).toBe('STYLIST');
    await http()
      .get('/v1/auth/stylist/me')
      .auth(stylist.body.token, { type: 'bearer' })
      .expect(200);
    await http()
      .post('/v1/auth/stylist/logout')
      .auth(stylist.body.token, { type: 'bearer' })
      .expect(201);
    await http()
      .get('/v1/auth/stylist/me')
      .auth(stylist.body.token, { type: 'bearer' })
      .expect(401);
    await http()
      .post('/v1/auth/client/login')
      .send({ email: newClient.email, password })
      .expect(201);
    await http()
      .post('/v1/auth/stylist/login')
      .send({ email: newStylist.email, password })
      .expect(201);
    await http()
      .post('/v1/auth/employee/login')
      .send({ email: employee.email, password })
      .expect(201);
    await http()
      .get('/v1/auth/admin/me')
      .set('Authorization', await authorization(admin))
      .expect(200);
  });
  it('updates catalog entries and stores idempotent visitor likes', async () => {
    const auth = await authorization(owner);
    const created = await http()
      .post('/v1/catalog')
      .set('Authorization', auth)
      .send({
        title: 'Pièce aimée',
        imageUrl: '/assets/look-1.png',
        price: 1000,
        availableColors: [],
      })
      .expect(201);
    await http()
      .patch(`/v1/catalog/${created.body.id}`)
      .set('Authorization', auth)
      .send({ title: 'Pièce modifiée', price: 2000 })
      .expect(200);
    const visitorId = '99999999-9999-4999-8999-999999999999';
    const likeRoute = `/v1/catalog/${created.body.id}/like`;
    const like = await http().post(likeRoute).send({ visitorId, liked: true }).expect(201);
    expect(like.body.likesCount).toBe(1);
    expect(
      (await http().post(likeRoute).send({ visitorId, liked: true }).expect(201)).body.likesCount,
    ).toBe(1);
    expect(
      (await http().post(likeRoute).send({ visitorId, liked: false }).expect(201)).body.likesCount,
    ).toBe(0);
  });
  it('permits admin order edits while retaining lifecycle checks', async () => {
    await http()
      .patch(`/v1/admin/orders/${orderId}`)
      .set('Authorization', await authorization(admin))
      .send({ notes: 'Supervision' })
      .expect(200);
    await http()
      .put(`/v1/orders/${orderId}`)
      .set('Authorization', await authorization(owner))
      .send({ notes: 'Atelier' })
      .expect(200);
    const deletable = await db.order.create({
      data: {
        stylistId: atelierId,
        clientName: 'Test',
        clientPhone: client.phone,
        description: 'À supprimer',
        totalPrice: 100,
      },
    });
    await http()
      .delete(`/v1/orders/${deletable.id}`)
      .set('Authorization', await authorization(owner))
      .expect(200);
  });
  it('changes employee passwords and rejects their previous access token immediately', async () => {
    const oldAuthorization = await authorization(employee);
    const changed = await http()
      .post('/v1/auth/employee/password')
      .set('Authorization', oldAuthorization)
      .send({ currentPassword: password, newPassword: 'NewEmployeePassword2026' })
      .expect(201);
    await http().get('/v1/employee/me').set('Authorization', oldAuthorization).expect(401);
    await http().get('/v1/employee/me').auth(changed.body.token, { type: 'bearer' }).expect(200);
  });
  it('sanitizes public catalog output and hides unpublished items', async () => {
    const created = await http()
      .post('/v1/catalog')
      .set('Authorization', await authorization(owner))
      .send({
        title: 'Création test',
        imageUrl: '/assets/look-1.png',
        price: 15000,
        availableColors: ['Or'],
      })
      .expect(201);
    await http().get(`/v1/catalog/${created.body.id}`).expect(200);
    await http()
      .patch(`/v1/catalog/${created.body.id}`)
      .set('Authorization', await authorization(stranger))
      .send({ title: 'Intrusion' })
      .expect(403);
    await http()
      .delete(`/v1/catalog/${created.body.id}`)
      .set('Authorization', await authorization(owner))
      .expect(200);
    await http().get(`/v1/catalog/${created.body.id}`).expect(404);
    await http()
      .post('/v1/catalog')
      .set('Authorization', await authorization(owner))
      .send({
        title: 'Image dangereuse',
        imageUrl: 'javascript:alert(1)',
        price: 1,
        availableColors: [],
      })
      .expect(400);
  });
  it('allows admin supervision, rejects self-deactivation and immediately revokes another account', async () => {
    const auth = await authorization(admin);
    await http().get('/v1/admin/dashboard').set('Authorization', auth).expect(200);
    await http()
      .patch(`/v1/admin/users/${admin.id}/status`)
      .set('Authorization', auth)
      .send({ active: false })
      .expect(400);
    const previousToken = await authorization(stranger);
    await http()
      .patch(`/v1/admin/users/${stranger.id}/status`)
      .set('Authorization', auth)
      .send({ active: false })
      .expect(200);
    await http()
      .get(`/v1/stylist/${otherAtelierId}/orders`)
      .set('Authorization', previousToken)
      .expect(401);
    await http().post('/v1/auth/login').send({ email: stranger.email, password }).expect(401);
  });
  it('protects deletion routes and revokes deleted accounts while preserving workshop history', async () => {
    const passwordHash = await argon2.hash(password);
    const stylist = await db.user.create({
      data: {
        role: 'STYLIST',
        firstName: 'Deletion',
        lastName: 'Stylist',
        email: 'deletion-stylist@example.com',
        phone: '+221770000081',
        passwordHash,
      },
    });
    const staff = await db.user.create({
      data: {
        role: 'EMPLOYEE',
        firstName: 'Deletion',
        lastName: 'Employee',
        email: 'deletion-employee@example.com',
        phone: '+221770000082',
        passwordHash,
      },
    });
    const atelier = await db.stylistProfile.create({
      data: { userId: stylist.id, businessName: 'Deletion atelier', specialties: [] },
    });
    await db.personnel.create({
      data: {
        stylistId: atelier.id,
        userId: staff.id,
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone,
        specialization: 'Couture',
      },
    });
    const item = await db.catalogItem.create({
      data: {
        stylistId: atelier.id,
        title: 'Deletion model',
        imageUrl: '/assets/model.png',
        price: 5000,
      },
    });
    const order = await db.order.create({
      data: {
        stylistId: atelier.id,
        clientName: 'History client',
        clientPhone: '+221770000083',
        description: 'Preserved history',
        totalPrice: 5000,
      },
    });
    const staffAuth = await authorization(staff);
    const stylistAuth = await authorization(stylist);
    const adminAuth = await authorization(admin);
    await http().delete(`/v1/admin/users/${stylist.id}`).expect(401);
    await http()
      .delete(`/v1/admin/users/${stylist.id}`)
      .set('Authorization', await authorization(client))
      .expect(403);
    await http().delete(`/v1/admin/users/${admin.id}`).set('Authorization', adminAuth).expect(400);
    await http()
      .delete(`/v1/admin/users/${stylist.id}`)
      .set('Authorization', adminAuth)
      .expect(200);
    expect(
      (await db.user.findUniqueOrThrow({ where: { id: stylist.id } })).deletedAt,
    ).not.toBeNull();
    expect((await db.user.findUniqueOrThrow({ where: { id: staff.id } })).active).toBe(false);
    expect(await db.order.findUnique({ where: { id: order.id } })).not.toBeNull();
    expect((await db.catalogItem.findUniqueOrThrow({ where: { id: item.id } })).active).toBe(false);
    await http().get('/v1/auth/me').set('Authorization', staffAuth).expect(401);
    await http().get('/v1/auth/me').set('Authorization', stylistAuth).expect(401);
    await http()
      .patch(`/v1/admin/users/${stylist.id}/status`)
      .set('Authorization', adminAuth)
      .send({ active: true })
      .expect(404);
    const listing = await http()
      .get('/v1/admin/users?limit=100')
      .set('Authorization', adminAuth)
      .expect(200);
    expect(
      listing.body.data.some((row: { id: string }) => [stylist.id, staff.id].includes(row.id)),
    ).toBe(false);
    await http().get(`/v1/catalog/${item.id}`).expect(404);
  });
  it('revokes the current token on logout', async () => {
    const auth = await authorization(client);
    await http().post('/v1/auth/logout').set('Authorization', auth).expect(201);
    await http().get('/v1/orders').set('Authorization', auth).expect(401);
  });
});
