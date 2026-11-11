#!/usr/bin/env bash
# Run from a clone of lws-deploy on LWS, manually or from cPanel Cron Jobs.
set -euo pipefail
umask 077
deploy_stage=''
trap 'if [[ -n "$deploy_stage" ]]; then rm -rf -- "$deploy_stage"; fi' EXIT

main() {
  local repo app revision previous stage mode
  repo=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
  app="${LWS_APP_DIR:-$HOME/backend}"
  mode="${1:---pull}"
  [[ "$mode" == '--pull' || "$mode" == '--local' ]] || { echo 'Option inconnue.' >&2; return 1; }
  [[ -d "$app" && -f "$app/.env" ]] || { echo 'Le dossier backend et son .env serveur sont requis.' >&2; return 1; }
  [[ "$repo" != "$(cd "$app" && pwd)" ]] || { echo 'Le clone Git doit être séparé du dossier backend.' >&2; return 1; }
  # A single lock protects fetch, migrations and restart, including manual runs.
  exec 9>"$app/.deploy.lock"
  flock -n 9 || return 0
  cd "$repo"
  [[ "$(git branch --show-current)" == 'lws-deploy' ]] || { echo 'Sélectionner la branche lws-deploy.' >&2; return 1; }
  [[ -z "$(git status --porcelain)" ]] || { echo 'Le clone de déploiement contient des modifications locales.' >&2; return 1; }
  if [[ "$mode" == '--pull' ]]; then
    GIT_TERMINAL_PROMPT=0 git fetch --quiet --no-tags origin refs/heads/lws-deploy
    git merge --ff-only --quiet FETCH_HEAD
  fi
  revision=$(git rev-parse HEAD)
  previous=$(cat "$app/.deployed-release" 2>/dev/null || true)
  [[ "$revision" != "$previous" ]] || return 0
  [[ -f dist/src/main.js && -f prisma/schema.prisma && -f SOURCE_COMMIT ]] || { echo 'Version compilée incomplète.' >&2; return 1; }
  stage=$(mktemp -d "$app/.release.XXXXXX")
  deploy_stage="$stage"
  git archive HEAD | tar -x -C "$stage"
  # The server .env and node_modules are never taken from the Git repository.
  source "${LWS_NODE_ACTIVATE:-$HOME/nodevenv/backend/22/bin/activate}"
  cp "$stage/package.json" "$stage/package-lock.json" "$stage/Procfile" "$app/"
  mkdir -p "$app/prisma" "$app/scripts"
  cp -R "$stage/prisma/." "$app/prisma/"
  cp -R "$stage/scripts/." "$app/scripts/"
  cd "$app"
  npm ci --omit=dev
  npm run prisma:generate
  npm run prisma:deploy
  # Switch the compiled code only after migrations succeed.
  if [[ -d dist ]]; then mv dist "$stage/previous-dist"; fi
  if ! mv "$stage/dist" dist; then
    if [[ -d "$stage/previous-dist" ]]; then mv "$stage/previous-dist" dist; fi
    return 1
  fi
  mkdir -p tmp
  touch tmp/restart.txt
  curl --fail --silent --show-error --retry 6 --retry-all-errors --retry-delay 5 --max-time 20 \
    -H 'Cache-Control: no-cache' "${LWS_HEALTH_URL:-https://api.surmesurestyle.com/v1/health/ready}" > /dev/null
  printf '%s\n' "$revision" > .deployed-release
  echo "Version $revision installée ; migrations et contrôle de disponibilité réussis."
  rm -rf -- "$stage"
  deploy_stage=''
}
main "$@"
