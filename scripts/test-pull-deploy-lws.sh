#!/usr/bin/env bash
# Isolated integration test: local Git remote, fake npm/curl, no real database.
set -euo pipefail
root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
fixture=$(mktemp -d)
trap 'rm -rf -- "$fixture"' EXIT
export GIT_AUTHOR_NAME=Test GIT_AUTHOR_EMAIL=test@example.invalid
export GIT_COMMITTER_NAME=Test GIT_COMMITTER_EMAIL=test@example.invalid
export LWS_APP_DIR="$fixture/app" LWS_NODE_ACTIVATE="$fixture/activate"
export DEPLOY_TEST_LOG="$fixture/commands" DEPLOY_TEST_FAIL="$fixture/fail"
mkdir -p "$fixture/source/dist/src" "$fixture/source/prisma" "$fixture/source/scripts" "$LWS_APP_DIR/dist" "$fixture/bin"
git init --bare -q "$fixture/remote"
git init -q -b main "$fixture/source"
cp "$root/scripts/publish-lws-release.sh" "$root/scripts/pull-deploy-lws.sh" "$fixture/source/scripts/"
cp "$root/.cpanel.yml" "$fixture/source/"
printf 'version one\n' > "$fixture/source/dist/src/main.js"
printf 'schema\n' > "$fixture/source/prisma/schema.prisma"
for file in package.json package-lock.json Procfile; do printf '{}\n' > "$fixture/source/$file"; done
printf 'private server value\n' > "$LWS_APP_DIR/.env"
printf 'private source value\n' > "$fixture/source/.env"
printf 'original code\n' > "$LWS_APP_DIR/dist/old.js"
printf 'export PATH=%q:$PATH\n' "$fixture/bin" > "$LWS_NODE_ACTIVATE"
cat > "$fixture/bin/npm" <<'MOCK'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "$DEPLOY_TEST_LOG"
if [[ "$*" == 'run prisma:deploy' && -f "$DEPLOY_TEST_FAIL" ]]; then exit 1; fi
MOCK
cat > "$fixture/bin/curl" <<'MOCK'
#!/usr/bin/env bash
exit 0
MOCK
chmod +x "$fixture/bin/npm" "$fixture/bin/curl"
cd "$fixture/source"
git add .
git commit -qm first
git remote add origin "$fixture/remote"
git push -q origin main
export GITHUB_SHA=$(git rev-parse HEAD)
bash scripts/publish-lws-release.sh > /dev/null
# Forbidden files must never enter the release branch, even if source tracks them.
if git cat-file -e FETCH_HEAD:.env 2>/dev/null; then
  echo 'A source secret entered the release branch' >&2; exit 1
fi
git clone -q --branch lws-deploy "$fixture/remote" "$fixture/clone"
bash "$fixture/clone/scripts/pull-deploy-lws.sh" > /dev/null
[[ $(wc -l < "$DEPLOY_TEST_LOG") == 3 ]]
grep -q 'version one' "$LWS_APP_DIR/dist/src/main.js"
grep -q 'private server value' "$LWS_APP_DIR/.env"
[[ -f "$LWS_APP_DIR/tmp/restart.txt" && -f "$LWS_APP_DIR/.deployed-release" ]]
first=$(cat "$LWS_APP_DIR/.deployed-release")
bash "$fixture/clone/scripts/pull-deploy-lws.sh" > /dev/null
[[ $(wc -l < "$DEPLOY_TEST_LOG") == 3 ]]
# Publish another commit and simulate a migration failure, followed by a retry.
printf 'version two\n' > dist/src/main.js
git add dist
git commit -qm second
git push -q origin main
export GITHUB_SHA=$(git rev-parse HEAD)
bash scripts/publish-lws-release.sh > /dev/null
touch "$DEPLOY_TEST_FAIL"
if bash "$fixture/clone/scripts/pull-deploy-lws.sh" > /dev/null 2>&1; then
  echo 'Migration failure was ignored' >&2; exit 1
fi
[[ $(cat "$LWS_APP_DIR/.deployed-release") == "$first" ]]
grep -q 'version one' "$LWS_APP_DIR/dist/src/main.js"
rm "$DEPLOY_TEST_FAIL"
bash "$fixture/clone/scripts/pull-deploy-lws.sh" > /dev/null
[[ $(cat "$LWS_APP_DIR/.deployed-release") != "$first" ]]
grep -q 'version two' "$LWS_APP_DIR/dist/src/main.js"
[[ -z $(find "$LWS_APP_DIR" -maxdepth 1 -name '.release.*' -print) ]]
# Existing locks prevent overlapping manual/cron runs.
(
  exec 8>"$LWS_APP_DIR/.deploy.lock"
  flock -n 8
  bash "$fixture/clone/scripts/pull-deploy-lws.sh" > /dev/null
)
# Refuse a dirty deployment clone without destroying its edits.
printf 'local edit\n' >> "$fixture/clone/Procfile"
if bash "$fixture/clone/scripts/pull-deploy-lws.sh" > /dev/null 2>&1; then exit 1; fi
grep -q 'local edit' "$fixture/clone/Procfile"
# A delayed workflow for an older source commit must not replace the release.
cd "$fixture/source"
before=$(git ls-remote origin refs/heads/lws-deploy)
export GITHUB_SHA=$(git rev-parse HEAD^)
bash scripts/publish-lws-release.sh > /dev/null
[[ $(git ls-remote origin refs/heads/lws-deploy) == "$before" ]]
echo 'PASS: publication, isolation des secrets, mise à jour, absence de changement, échec/reprise, verrou et clone modifié.'
