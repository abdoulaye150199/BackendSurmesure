# Backend SurMesure

API NestJS / PostgreSQL organisée en monolithe modulaire. Les contextes `identity`, `commerce` et `health` gardent leurs routes publiques existantes sous `/v1`.

## Démarrage local

```bash
cp .env.example .env
docker compose up -d postgres
npm ci
npm run prisma:generate
npm run prisma:deploy
npm run start:dev
```

Le PostgreSQL de développement est exposé sur le port hôte `5434`. L’API utilise `PORT` (3001 dans `.env.example`). Documentation locale : `/docs`. Santé : `/v1/health/live` et `/v1/health/ready`.

## Architecture

- `domain/` : règles pures de cycle de vie et de mensurations, sans Nest ni Prisma.
- `application/services/` : cas d’usage séparés pour commandes, mesures, équipe, profils, catalogue, rendez-vous, administration, rattachements et notifications.
- `application/commerce.service.ts` : façade de compatibilité qui délègue les cas d’usage ; elle ne contient aucune requête de base de données.
- `application/dto/` : contrats HTTP bornés, groupés par responsabilité.
- `presentation/controllers/` : contrôleurs par espace et contrôles de rôle.
- `identity/domain/user.repository.ts` : port du stockage des comptes ; implémentation Prisma dans `identity/infrastructure/`.
- `infrastructure/prisma/` : adaptateur de persistance injecté dans les services de commerce.
- `shared/` : validation, pagination immuable, exceptions HTTP et fonctions de contact communes.

Il s’agit d’une architecture de services NestJS avec règles métier isolées, pas d’une affirmation de DDD strict ou de microservices. Les accès aux données de commerce utilisent explicitement Prisma.

## Sécurité des sessions

Les mots de passe et les refresh tokens sont hachés avec Argon2. Les jetons d’accès portent une version de session. Chaque requête authentifiée vérifie l’existence du compte, son état actif, son rôle courant et sa version en base. Une désactivation, une déconnexion ou un changement du mot de passe employé invalide immédiatement les anciens jetons. Le renouvellement consomme atomiquement l’ancien refresh token ; un jeton déjà renouvelé ne peut pas être rejoué.

Les secrets d’accès et de renouvellement doivent être distincts, d’au moins 32 caractères. Les durées acceptées utilisent `s`, `m`, `h` ou `d` ; un jeton d’accès ne dépasse pas une heure. Les mots de passe, refresh tokens et en-têtes d’authentification sont masqués dans les logs.

### Rattacher l’historique d’un client

Un numéro déclaré à l’inscription n’est **jamais** une preuve d’identité. Lire `GET /v1/orders` ou `GET /v1/measurements` ne rattache aucune donnée.

1. Le styliste vérifie l’identité du client avec lui, selon le processus de son atelier.
2. Il consulte `GET /v1/stylist/:stylistId/clients/link-candidates?phone=...` (le `+` doit être encodé dans la query).
3. Après vérification, il appelle `POST /v1/stylist/:stylistId/clients/link` avec `clientId`, `phone` et `identityConfirmed: true`.
4. Le backend rattache uniquement les commandes et fiches de **cet atelier**, sans réassigner les données d’un autre compte. Le client retrouve alors ses données dans ses routes habituelles.

Seul le propriétaire styliste peut confirmer ce rattachement. Ni un client ni un employé ne peuvent le faire. Les candidats ne sont retournés que pour un numéro déjà présent dans des dossiers à confirmer de l’atelier.

**Migration des anciens liens :** les associations historiques créées à partir du seul téléphone sont masquées côté client jusqu’à confirmation du styliste. Les données restent disponibles dans l’atelier ; elles ne sont pas supprimées. Les fiches créées directement par un client authentifié restent visibles pour leur auteur. Le portail doit utiliser l’API de confirmation ci-dessus pour proposer cette étape au styliste.

### Notifications et rendez-vous

`POST /v1/orders/:id/notify` enregistre une notification **dans l’application** pour le compte client confirmé. La réponse contient son identifiant et `channel: inApp` ; elle ne prétend pas effectuer un envoi SMS ou e-mail.

- `GET /v1/client/notifications` : liste paginée des notifications du compte connecté.
- `PATCH /v1/client/notifications/:id/read` : marque uniquement une notification de ce compte comme lue.

Les rendez-vous suivent `pending → confirmed → completed`, avec annulation possible avant la fin. Les états terminaux ne peuvent pas être rouverts. Un index unique partiel PostgreSQL réserve uniquement les créneaux non annulés. Les modifications de commande et les changements de statut de rendez-vous détectent les écritures concurrentes et renvoient HTTP 409 au lieu d’écraser une modification.

## Contrôles qualité

```bash
npm run lint
npm run format:check
npm run typecheck
npm run build
npm test
```

Pour les tests HTTP et la couverture combinée, utiliser **une base jetable séparée** dont le nom se termine par `_test` :

```bash
export TEST_DATABASE_URL=postgresql://quality:quality-test-only@127.0.0.1:5432/surmesure_quality_test
DATABASE_URL="$TEST_DATABASE_URL" npx prisma migrate deploy
npm run test:e2e
npm run check
```

Les tests HTTP utilisent les vrais guards NestJS et PostgreSQL. Ils tronquent les tables de **leur base de test**. Le lancement refuse les hôtes autres que `localhost`, `127.0.0.1` ou le service CI `postgres`, ainsi que les noms ne finissant pas par `_test`. Ne jamais fournir la base de développement ou de production.

`npm run test:quality` rassemble les suites unitaires et HTTP. Les seuils globaux contrôlés sont 90 % des instructions, lignes et fonctions, et 80 % des branches. Seul le point d’entrée `main.ts` est exclu de la couverture ; les contrôleurs, guards, repositories et règles métier sont inclus.

Le workflow `.github/workflows/quality.yml` exécute ces contrôles avec PostgreSQL 16 et l’audit des dépendances de production à chaque push et pull request. Les correctifs transitifs ciblés dans `overrides` sont également validés par génération Prisma, migrations et tests HTTP. L’audit complet des outils de développement reste à surveiller ; ses dépendances ne sont pas incorporées dans l’image de production.

## Déploiement Render / Neon

- Déclarer `NODE_ENV=production`, `DATABASE_URL`, deux secrets JWT dédiés et `CORS_ORIGINS` avec les origines exactes, dont `https://surmesure-front.vercel.app` et `https://surmesure.liggeypro.com`.
- Sur Render, régler `TRUST_PROXY_HOPS` au nombre réel de proxies de confiance (généralement `1`). Le défaut `0` convient à l’accès local direct.
- `/docs` est désactivé en production sauf si `SWAGGER_ENABLED=true`.
- Appliquer **toutes** les migrations avant d’utiliser ce backend. Elles ajoutent les versions de sessions, les confirmations de rattachement et les notifications. Elles ne créent aucun compte de démonstration.

## Préparer la montée en charge

Le nombre de comptes inscrits ne dimensionne pas le serveur : il faut préciser le nombre de requêtes par seconde, la proportion de requêtes authentifiées et le temps de réponse attendu pendant un pic. « 10 000 utilisateurs simultanés » ne constitue pas à lui seul une capacité garantie.

- Le backend est sans état applicatif entre requêtes et peut tourner derrière un répartiteur de charge sur plusieurs instances. Chaque instance doit utiliser la même base PostgreSQL et les mêmes secrets JWT. Les migrations doivent être appliquées une fois avant d’ajouter les instances.
- Configure `DATABASE_POOL_SIZE` et `DATABASE_POOL_TIMEOUT_SECONDS` sur chaque instance. Le total des connexions Prisma vaut approximativement `nombre d’instances × DATABASE_POOL_SIZE`; garde-le sous la limite PostgreSQL en réservant des connexions aux migrations et à l’administration. Utilise l’URL poolée de Neon en runtime et une capacité de base adaptée.
- Le limiteur NestJS actuel garde ses compteurs en mémoire du processus. En multi-instance, une même adresse peut donc recevoir le quota de chaque instance. Pour un quota cohérent, configure un stockage partagé Redis pour `ThrottlerModule` avant le déploiement multi-instance. Le proxy doit aussi être réglé via `TRUST_PROXY_HOPS` afin que l’IP cliente soit correctement identifiée.
- Les endpoints d’authentification font du hachage Argon2 ; dimensionne le CPU avec les pics de connexion, séparément du trafic de navigation.
- Avant de promettre 10 000 utilisateurs, exécute un test de charge progressif contre un environnement de préproduction représentatif : parcours anonymes et authentifiés, pics de connexion, lecture et écriture. Observe p95/p99, taux d’erreur, CPU/mémoire des instances, connexions et latence PostgreSQL, puis augmente les instances et le pool par étapes.

Cette configuration permet d’ajuster le pool sans modifier le code. Elle n’active pas Redis et ne garantit aucune capacité sans test mesuré sur le plan d’hébergement et la base de production.

Le démarrage exécute `scripts/migrate-deploy.cjs`. Il utilise `DIRECT_URL`, puis `DATABASE_URL_UNPOOLED`, sinon `DATABASE_URL`. Sur Neon, il retire le suffixe `-pooler` pour les migrations uniquement. Le runtime garde sa connexion poolée. Les échecs de verrou consultatif sont réessayés au maximum trois fois ; les autres erreurs arrêtent le démarrage. Aucune migration n’est réinitialisée ou marquée comme résolue automatiquement.

Le script `npm run admin:configure` configure exclusivement le super administrateur depuis `SEED_ADMIN_EMAIL` et `SEED_ADMIN_PASSWORD`. Il refuse de promouvoir un compte client existant et refuse de choisir arbitrairement entre plusieurs administrateurs. Les vraies valeurs restent dans les variables privées. `npm run prisma:seed` sert aux démonstrations, pas aux données de production.

Le workflow `render-ping.yml` appelle l’endpoint de liveness toutes les 15 minutes. Une planification externe ne garantit pas une disponibilité permanente.

## Références techniques

- [Configuration ESLint / TypeScript](https://typescript-eslint.io/getting-started/)
- [Filtres d’exception NestJS](https://docs.nestjs.com/exception-filters)
- [Tests NestJS et HTTP](https://docs.nestjs.com/fundamentals/testing)
