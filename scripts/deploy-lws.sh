#!/usr/bin/env bash
set -euo pipefail

# Executed over SSH by GitHub Actions. cPanel owns the Node environment.
archive="$HOME/surmesure-deploy.tar.gz"
app="$HOME/backend"
test -f "$app/.env" || { echo 'Créer backend/.env sur LWS pour les migrations avant le déploiement.' >&2; exit 1; }
# CloudLinux activation reads optional environment variables without defaults.
set +u
source "$HOME/nodevenv/backend/22/bin/activate"
set -u
cd "$app"
tar -xzf "$archive" --no-same-owner
npm ci --omit=dev
npm run prisma:generate
npm run prisma:deploy
mkdir -p tmp
touch tmp/restart.txt
echo 'Backend installé ; redémarrage Passenger demandé.'
