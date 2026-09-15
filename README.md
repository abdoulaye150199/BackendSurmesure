# Backend SurMesure

API Node.js/NestJS organisée en **monolithe modulaire DDD**. Les modules `identity` et `commerce` isolent le domaine, les cas d'usage, les adaptateurs Prisma et les contrôleurs HTTP. Ce découpage permet d'extraire un module en microservice plus tard sans imposer dès maintenant la complexité d'un système distribué.

## Démarrage

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npx prisma migrate dev --name init
npm run start:dev
```

PostgreSQL est exposé sur le port hôte `5434` afin de ne pas entrer en conflit avec les installations locales sur `5432` et `5433`.

- API : `http://localhost:3001/v1`
- Swagger : `http://localhost:3001/docs`
- Santé : `GET /v1/health/live` et `GET /v1/health/ready`

Flutter peut être lancé avec `--dart-define=API_BASE=http://10.0.2.2:3000/v1` sur émulateur Android (`localhost` sur iOS/web).

En développement, CORS accepte les origines `localhost` et `127.0.0.1` sur tout port afin de prendre en charge le port aléatoire de Flutter Web. En production, seules les origines exactes déclarées dans `CORS_ORIGINS` sont autorisées.

## Architecture

```text
src/modules/<contexte>/
  domain/          Entités, invariants et ports (sans framework)
  application/     Cas d'usage et DTO
  infrastructure/  Adaptateurs PostgreSQL/Prisma
  presentation/    Contrôleurs HTTP et guards
```

Le processus est stateless et peut être répliqué derrière un load balancer. Les index composés et la pagination par curseur évitent les scans coûteux. En production : utiliser un pooler PostgreSQL (PgBouncer), un gestionnaire de secrets, plusieurs réplicas, des migrations en tâche séparée, un stockage objet/CDN pour les images et une file (BullMQ/SQS) pour remplacer le stub de notification.

## Routes compatibles avec le front

- `/v1/auth/register`, `/login`, `/refresh`, `/logout`
- `/v1/auth/stylist/signup`, `/login`, `/me`, `/logout`
- `/v1/catalog`, `/stylists`, `/home`, `/appointments`
- `/v1/stylist/:id/orders`, `/measurements`, `/personnel`
- `/v1/orders/:id`, `/measurements/:id`, `/personnel/:id`

Les routes d'atelier vérifient toujours que le JWT appartient au styliste ciblé. Les mots de passe et refresh tokens sont hachés avec Argon2.
# BackendSurmesure
