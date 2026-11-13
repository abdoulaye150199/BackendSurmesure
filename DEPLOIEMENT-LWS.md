# Déploiement automatique LWS

## Méthode recommandée : LWS récupère les versions validées

Le pare-feu LWS impose une autorisation IP par IP pour le SSH entrant.
Les machines GitHub Actions ayant des IP variables, le mode par défaut est
maintenant une récupération HTTPS depuis LWS : aucun secret SSH LWS dans
GitHub n'est nécessaire pour ce mode.

1. Un commit est poussé sur `main` dans `abdoulaye150199/BackendSurmesure`.
2. GitHub Actions exécute `check` (analyse, formatage, types, compilation,
   tests avec PostgreSQL et couverture), ainsi que les tests du déploiement.
3. Le job `publish-lws` publie les fichiers compilés sur la branche
   `lws-deploy`, seulement si les contrôles réussissent. La branche contient
   `dist`, Prisma, les scripts d'installation et les fichiers npm. Le `.env`
   et `node_modules` locaux n'y sont jamais copiés.
4. Une tâche cron sur LWS récupère cette branche périodiquement. Si la version
   diffère de celle installée, elle installe les dépendances, génère Prisma,
   applique les migrations, remplace `dist` et demande le redémarrage Passenger.
5. Le marqueur `~/backend/.deployed-release` est écrit après réussite du
   contrôle HTTP `/v1/health/ready`. Sans nouvelle version, aucun redémarrage
   ni installation npm n'est effectué.

Le frontend conserve son déploiement Vercel séparé. Sauvegarder un fichier
local ne déploie rien : il faut créer un commit et le pousser.

## Installation initiale

### 1. Publier le workflow

Pousser les modifications de ce dépôt sur `main`, puis ouvrir GitHub →
Actions → **Backend quality**. Attendre que `check` et `publish-lws` passent
au vert et que la branche `lws-deploy` soit créée.

Le workflow demande `contents: write` uniquement pour la publication.
Si une règle du dépôt interdit l'écriture de cette branche par GitHub Actions,
configurer une règle compatible. Ne pas modifier cette branche manuellement :
elle est alimentée par les versions validées.

La variable GitHub `LWS_DEPLOY_MODE` doit être absente ou différente de `ssh`.
Les anciens secrets SSH peuvent rester enregistrés ; ils ne sont pas utilisés.

### 2. Préparer LWS une fois

Le `.env` existant de `~/backend` doit contenir les variables du serveur,
notamment l'URL PostgreSQL LWS. Les variables `DIRECT_URL` et
`DATABASE_URL_UNPOOLED`, si présentes, doivent viser la même base LWS :
elles ont priorité pour les migrations. Garder les permissions du `.env` à 600.
Ne pas envoyer le `.env` de l'ordinateur.

Pour les courriels de bienvenue, créer ou utiliser une boîte dédiée dans cPanel,
ouvrir **Connect Devices** et recopier les paramètres SMTP sécurisés dans
l’environnement Passenger : `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`,
`SMTP_PASSWORD`, `MAIL_FROM` et `APP_PUBLIC_URL`. Le port 465 utilise TLS direct ;
le port 587 utilise STARTTLS. `SMTP_USER` et `MAIL_FROM` doivent correspondre à
la boîte ou à une adresse d’expédition autorisée. Le mot de passe est celui de
la boîte mail, jamais celui de cPanel. Redémarrer Passenger après modification.
Faire un essai avec une adresse contrôlée et vérifier réception, spam et journaux.

Dans le **Terminal cPanel**, cloner la branche compilée dans un dossier séparé :

```bash
git clone --branch lws-deploy --single-branch https://github.com/abdoulaye150199/BackendSurmesure.git "$HOME/surmesure-release"
bash "$HOME/surmesure-release/scripts/pull-deploy-lws.sh"
```

Ne pas cloner dans `~/backend`, qui contient l'application et ses secrets.
Si `surmesure-release` existe déjà, vérifier son contenu avant de le réutiliser.
Le dépôt est actuellement public ; une URL HTTPS suffit. S'il devient privé,
préparer un accès Git en lecture seule depuis LWS avant de créer la tâche cron.

Cette première exécution doit finir par « migrations et contrôle de disponibilité
réussis ». Elle installe réellement la version en production. Sauvegarder la base
avant la première exécution et avant toute migration métier.

### 3. Automatiser dans cPanel

Ouvrir **Avancé → Tâches cron / Cron Jobs**. Si l'offre autorise cet intervalle,
choisir toutes les cinq minutes (`*/5 * * * *`) et saisir comme commande :

```bash
/bin/bash /home/c2900724c/surmesure-release/scripts/pull-deploy-lws.sh >> /home/c2900724c/surmesure-deploy.log 2>&1
```

Ne pas inclure les cinq champs de fréquence dans le champ Commande de cPanel.
L'hébergement doit autoriser Git HTTPS sortant vers GitHub, `flock`, l'environnement
Node 22 existant, npm et les tâches cron. Le premier essai sur LWS validera ces
conditions. Le script a été testé localement avec un dépôt Git temporaire et des
commandes npm/HTTP simulées ; cela ne remplace pas ce premier essai réel.

Après cette configuration, un push validé sera récupéré au prochain passage du
cron. Le temps total dépend des contrôles GitHub et de l'installation sur LWS.

## Option : interface Git Version Control de cPanel

Un clone de la branche **lws-deploy** peut aussi être géré par cPanel.
Le fichier `.cpanel.yml` exécute le même installateur en mode `--local` :
**Update from Remote** puis **Deploy HEAD Commit** installe la version sélectionnée.
Ces boutons seuls restent manuels. Ne pas déployer `main`, qui ne contient pas
le dossier compilé. Notre script cron effectue lui-même la récupération des mises
à jour et l'installation, sans nécessiter de clic dans cette interface.

Référence cPanel :
https://docs.cpanel.net/knowledge-base/web-services/guide-to-git-set-up-deployment-cron-jobs/

## Vérifier et dépanner

- GitHub `check` échoue : consulter l'étape en erreur. Aucune nouvelle version
  n'est publiée. « Ping Render » ne valide pas ce déploiement.
- `publish-lws` réussit : la version est disponible dans GitHub, pas nécessairement
  déjà installée sur LWS. Consulter le journal serveur pour l'installation.
- Branche `lws-deploy` introuvable : terminer le premier workflow avant de cloner.
- Consulter le journal avec `tail -n 80 ~/surmesure-deploy.log` et le commit installé
  avec `cat ~/backend/.deployed-release`. Masquer les données privées avant partage.
- Le script refuse un clone modifié localement ou une branche différente, et utilise
  un verrou pour empêcher deux installations simultanées. Le prochain passage
  réessaie après un échec ; une migration échouée peut nécessiter une intervention.
- Pour relancer les contrôles et la publication : GitHub → Actions → Backend quality
  → **Run workflow**, branche `main`.
- Pour suspendre les déploiements, désactiver la tâche cron dans cPanel.

L'installation met à jour les fichiers en place. Une indisponibilité brève est
possible ; il n'y a pas de restauration automatique des dépendances ni de la base.
Les migrations doivent être compatibles avec le code encore exécuté. Le contrôle
de disponibilité vérifie l'API, pas toutes les fonctionnalités métier.

## Ancien mode SSH (optionnel)

Le job `deploy-lws` est conservé mais désactivé par défaut. Il est activé uniquement
avec la variable GitHub `LWS_DEPLOY_MODE=ssh`, à utiliser si l'IP de la machine de
déploiement est autorisée et l'empreinte serveur vérifiée. Ne pas conserver en même
temps une tâche cron active pour le même backend.

Ce mode nécessite les secrets `LWS_SSH_HOST`, `LWS_SSH_PORT`, `LWS_SSH_USER`,
`LWS_SSH_PRIVATE_KEY` et `LWS_SSH_KNOWN_HOSTS`. L'accès réussi depuis un ordinateur
ne garantit pas l'accès depuis GitHub Actions. Le support LWS n'a pas encore validé
ce parcours avec les IP variables des machines GitHub.
