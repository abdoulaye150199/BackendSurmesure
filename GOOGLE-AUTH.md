# Inscription et connexion Google

## Comportement

`POST /v1/auth/google/register` vérifie le jeton Google puis crée un compte
client ou styliste avec les coordonnées du formulaire. L’adresse e-mail
provient uniquement du jeton vérifié, jamais d’un champ envoyé par le client.
Le compte conserve le `sub` Google dans `User.googleSubject`, avec un index
unique. Aucun mot de passe utilisable n’est créé.

`POST /v1/auth/google/login` vérifie la signature, l’émetteur, l’audience et
l’expiration avec `google-auth-library`, et exige un e-mail vérifié. Il
retrouve exclusivement le compte par `googleSubject`. Un compte inconnu,
désactivé, administrateur ou employé est refusé. La connexion ne crée pas
de compte et ne rattache pas un compte classique de même adresse e-mail.
Les comptes Google ne peuvent pas utiliser la connexion par mot de passe.
Les comptes classiques continuent à fonctionner avec leur mot de passe.

## Activation Google Cloud

1. Créer/sélectionner un projet dans Google Cloud Console, puis ouvrir
   **Google Auth Platform** et configurer le nom, l’adresse de support,
   l’audience et les informations de marque.
2. Créer un client OAuth de type **Application Web**. Dans les origines
   JavaScript autorisées, déclarer exactement :

   ```text
   https://surmesurestyle.com
   https://www.surmesurestyle.com
   https://surmesure.liggeypro.com
   http://localhost
   http://localhost:4200
   ```

   Ne garder que les domaines réellement utilisés. En mode Test, ajouter les
   comptes Google de test autorisés ; publier l’application Google avant
   l’ouverture au public selon les exigences affichées par Google.
3. Copier le **Client ID** se terminant par `.apps.googleusercontent.com`.
   Cette intégration utilise un callback JavaScript, sans URI de redirection
   backend et sans secret client Google.
4. Dans cPanel → Setup Node.js App → variables, ajouter
   `GOOGLE_CLIENT_ID` avec ce Client ID. En développement, ajouter la même
   variable dans le `.env` backend. Le frontend récupère ce paramètre public
   depuis `/v1/auth/google/config` : aucune variable Vercel n’est nécessaire.

## Déploiement

1. Sauvegarder la base LWS puis déployer le backend avec son package-lock,
   les scripts et la nouvelle migration `20261107221000_google_identity`.
2. Installer les dépendances, générer Prisma, puis appliquer les migrations :

   ```bash
   npm ci --omit=dev
   npm run prisma:generate
   npm run prisma:deploy
   ```

   Avant `prisma:deploy`, le `.env` **du serveur** ou l’environnement SSH doit
   contenir l’URL PostgreSQL LWS ; vérifier aussi `DIRECT_URL` et
   `DATABASE_URL_UNPOOLED` qui ont priorité. Ne pas utiliser une ancienne URL
   Neon. Les variables du panneau cPanel ne sont pas automatiquement reprises
   par un terminal déjà ouvert.
3. Redémarrer Passenger après configuration de `GOOGLE_CLIENT_ID`, puis
   déployer le frontend sur Vercel. Sans Client ID, Google reste indisponible
   et l’authentification classique reste accessible.
4. Tester : connexion Google avant inscription (refus), inscription Google
   avec coordonnées, déconnexion puis connexion Google (succès), adresse
   d’un compte classique (aucun rattachement), compte désactivé (refus).

Le test OAuth réel requiert le Client ID et un compte Google autorisé. Les
tests unitaires simulent la vérification Google et ne remplacent pas ce test.

Références :
- https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid
- https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
