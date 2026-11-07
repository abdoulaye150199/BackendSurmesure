# Déploiement automatique LWS

Le dépôt GitHub `abdoulaye150199/BackendSurmesure` déploie chaque push sur
`main` après réussite du job `check`. Sauvegarder un fichier dans l’IDE ne
déploie rien : il faut créer un commit et le pousser sur GitHub.

## Configuration initiale

1. Vérifier auprès de LWS le nom du serveur et le port **SSH** (le port
   cPanel 2083 n’est pas le port SSH), et que les connexions SSH externes
   par clé sont autorisées pour ce compte.
2. Sur ton ordinateur, créer une clé dédiée :

   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/surmesure_lws -C github-actions-surmesure
   ```

   Pour cet usage automatisé, laisser la phrase secrète vide. Dans cPanel,
   importer puis autoriser uniquement la clé **publique**
   `~/.ssh/surmesure_lws.pub` via « Accès SSH → Gérer les clés SSH ».
   Tester la connexion SSH depuis ton ordinateur avec cette clé avant de continuer.
3. Dans GitHub → dépôt BackendSurmesure → Settings → Secrets and variables
   → Actions, créer ces **Repository secrets** :

   | Secret | Valeur |
   | --- | --- |
   | `LWS_SSH_HOST` | Nom du serveur SSH confirmé par LWS |
   | `LWS_SSH_PORT` | Port SSH confirmé par LWS |
   | `LWS_SSH_USER` | `c2900724c` |
   | `LWS_SSH_PRIVATE_KEY` | Contenu complet de `~/.ssh/surmesure_lws`, clé privée dédiée |
   | `LWS_SSH_KNOWN_HOSTS` | Ligne(s) known_hosts du serveur dont l’empreinte a été vérifiée auprès de LWS |

   Pour préparer les lignes known_hosts, utiliser `ssh-keyscan -p PORT HOTE`
   puis vérifier leur empreinte auprès de LWS avant de les enregistrer.
   Ne jamais publier de clé privée dans le dépôt ou dans une conversation.
4. Sur LWS, créer `/home/c2900724c/backend/.env` avec un éditeur cPanel,
   puis régler ses permissions à `600`. Il doit contenir la `DATABASE_URL`
   PostgreSQL locale validée et les mêmes variables privées que le panneau
   Node.js (secrets JWT, CORS, etc.). Le terminal SSH ne reçoit pas forcément
   les variables du panneau. S’il contient `DIRECT_URL` ou
   `DATABASE_URL_UNPOOLED`, elles doivent aussi pointer vers PostgreSQL LWS :
   elles ont priorité pour les migrations. Ne pas conserver d’URL Neon.

Le `.env` local de ton ordinateur n’est jamais téléversé. Les variables
du panneau Passenger restent utilisées par le processus web ; maintenir
leur cohérence avec le `.env` du serveur.

## Fonctionnement

Le workflow compile sous Node 22, envoie seulement `dist`, `prisma`,
`scripts` et les fichiers npm/Procfile. Sur LWS, il active
`~/nodevenv/backend/22/bin/activate`, installe les dépendances de production,
génère Prisma et applique `prisma migrate deploy`. Il ne lance aucun seed.
Il met à jour `~/backend/tmp/restart.txt`, puis vérifie `/v1/health/ready`.

Le déploiement met à jour l’application en place : une brève indisponibilité
est possible. Il n’y a pas de retour arrière automatique du code ou des
migrations. Sauvegarder la base avant toute migration métier et garder les
migrations compatibles avec le code encore en cours d’exécution.

## Premier lancement

Pousser ces changements sur `main`, puis suivre GitHub → Actions →
« Backend quality ». Le job `deploy-lws` ne démarre que si `check` réussit.
Le premier déploiement permettra de valider l’accès réel au serveur.
Le frontend conserve son propre déploiement et doit utiliser
`https://api.surmesurestyle.com/v1` pour appeler ce backend.
