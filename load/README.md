# Montée en charge : 500 utilisateurs simultanés

Le scénario k6 simule des visiteurs de l’API, avec de vraies pauses de
navigation. Ce sont des **utilisateurs virtuels simultanés**, pas 500 requêtes
par seconde, ni 500 comptes nouvellement créés. Le profil normal monte à
500 VU au minimum et tient ce palier cinq minutes.

## Installer et lancer

Installer k6 sur **l’ordinateur générateur de charge**, pas dans cPanel :
https://grafana.com/docs/k6/latest/set-up/install-k6/

Depuis le dossier backend, commencer par un environnement de préproduction
représentatif de LWS : même plan CPU/RAM, PostgreSQL, volume de données,
configuration Passenger et pool de connexions.

```bash
BASE_URL=https://API-DE-PREPRODUCTION npm run test:load:smoke
BASE_URL=https://API-DE-PREPRODUCTION npm run test:load
```

`BASE_URL` est l’origine de l’API **sans `/v1`**. Sans variable, la cible
est `http://127.0.0.1:3001`. Pour mesurer explicitement le serveur LWS réel,
choisir une période creuse :

```bash
BASE_URL=https://api.surmesurestyle.com npm run test:load:smoke
BASE_URL=https://api.surmesurestyle.com npm run test:load
```

Ce dernier test exerce une charge réelle sur le site en production et peut
le ralentir. Aucun test lourd n’est lancé automatiquement par un push ou
par les tests unitaires. Les scripts ne font que des lectures ; ils ne créent
ni compte, commande, rendez-vous ou like. Les requêtes seront visibles dans
les journaux serveur.

## Profil de 13 minutes

| Étape        | Durée     | Utilisateurs à la fin |
| ------------ | --------- | --------------------- |
| Échauffement | 1 minute  | 50                    |
| Montée       | 2 minutes | 100                   |
| Montée       | 2 minutes | 250                   |
| Montée       | 2 minutes | 500                   |
| Maintien     | 5 minutes | 500                   |
| Descente     | 1 minute  | 0                     |

Ajouter jusqu’à 20 secondes de terminaison. `TARGET_VUS=750` permet de
viser davantage (500 à 5000). `test:load:smoke` est volontairement limité
à un VU pendant environ 35 secondes pour vérifier le parcours d’abord.

Un parcours lit `/v1/catalog?limit=13`, `/v1/stylists?limit=100`, puis la
fiche d’un modèle disponible. Les réponses JSON sont vérifiées. La readiness
PostgreSQL est contrôlée avant le début. Une base sans modèle ne permet pas
de mesurer le parcours de détail ; utiliser un jeu représentatif.

## Parcours clients authentifiés optionnels

Par défaut, les 500 visiteurs sont anonymes. Pour ajouter 20 % de lectures
de profils clients et de commandes, fournir **500 jetons d’accès de comptes
clients de test distincts**, valides pour la durée du test (plus de 13 minutes).
Utiliser uniquement des comptes d’une base de préproduction. Le fichier
JSON doit être de la forme `["jeton1", "jeton2", ...]`.

```bash
chmod 600 load/clients.tokens.json
BASE_URL=https://API-DE-PREPRODUCTION AUTH_PERCENT=20 TOKENS_FILE=./clients.tokens.json npm run test:load
```

`TOKENS_FILE` est résolu relativement au script `load/api.k6.js`.
Le fichier et les résultats sont ignorés par Git. Aucun jeton ne doit être
publié ou ajouté aux rapports. Les jetons expirés provoquent volontairement
un échec ; le scénario ne contourne pas l’authentification. Il ne mesure pas
les pics de connexion/Argon2 ni Google OAuth.

## Lire les résultats

`load-results/summary.json` contient le rapport, les seuils et les p95/p99.
Un code de sortie non nul signifie que le test ou un seuil a échoué.

- Moins de 1 % d’échecs HTTP et de réponses invalides.
- p95 inférieur à 1,5 seconde et p99 inférieur à 3 secondes.
- Même contrôle de latence et d’erreurs **sur le seul palier maximal**.
- Moins de 1 % de réponses 429. Une limitation n’est pas comptée comme un succès.
- Arrêt du test si ce seuil de 429 est dépassé après 30 secondes, pour ne
  pas poursuivre une mesure bloquée par le quota d’IP.
- Arrêt anticipé si plus de 5 % de réponses sont des erreurs serveur ou
  réseau, après 30 secondes d’observation.

Les seuils sont des objectifs initiaux à adapter aux exigences métier.
Ne pas conclure « 500 utilisateurs supportés » si le palier n’a pas été
atteint et maintenu, si le générateur est saturé ou si les seuils échouent.
Surveiller en parallèle CPU/RAM/processus dans cPanel, latence PostgreSQL,
connexions disponibles, erreurs Passenger et connexions du pool Prisma.

### Limiteur d’IP

Le backend limite actuellement chaque IP à 100 requêtes par minute.
Un seul ordinateur k6 partage une IP pour ses 500 VU : des réponses 429
sont donc attendues au-delà du quota. Ce résultat mesure le limiteur,
pas nécessairement la capacité de PostgreSQL. Le script ne modifie pas ce
quota et ne falsifie pas `X-Forwarded-For`.

Pour mesurer la capacité au-delà du limiteur, utiliser une préproduction
avec une configuration de limitation prévue pour ce test, ou plusieurs
générateurs avec de vraies IP distinctes. Conserver séparément un test des
limites de production ; ne pas désactiver leur protection en production.

## Validation locale du scénario

```bash
npm run test:load:config
```

Ces tests vérifient le profil 500 VU et ses paramètres. Ils ne prouvent
pas une capacité de l’hébergement. Le rapport de charge réel doit être
obtenu par une exécution contre l’environnement visé.

Référence : https://grafana.com/docs/k6/latest/using-k6/thresholds/
