#!/usr/bin/env bash
# Run only after quality checks, from the source checkout in GitHub Actions.
set -euo pipefail
: "${GITHUB_SHA:?Commit source requis}"
source_root="$PWD"
latest=$(git ls-remote origin refs/heads/main | cut -f1)
if [[ "$latest" != "$GITHUB_SHA" ]]; then
  echo 'Une version source plus récente existe ; publication ignorée.'
  exit 0
fi
release_dir=$(mktemp -d)
trap 'rm -rf -- "$release_dir"' EXIT
for path in dist prisma scripts package.json package-lock.json Procfile .cpanel.yml; do
  cp -R "$path" "$release_dir/"
done
printf '%s\n' "$GITHUB_SHA" > "$release_dir/SOURCE_COMMIT"
# A separate branch with an append-only history; never rewrite source branches.
git -C "$release_dir" init -q
git -C "$release_dir" config user.name 'github-actions[bot]'
git -C "$release_dir" config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git -C "$release_dir" add .
tree=$(git -C "$release_dir" write-tree)
remote_ref=$(git ls-remote --heads origin refs/heads/lws-deploy)
parent=()
if [[ -n "$remote_ref" ]]; then
  git fetch --no-tags origin refs/heads/lws-deploy
  parent=(-p "$(git rev-parse FETCH_HEAD)")
  # Import the existing history into the staging repository.
  git -C "$release_dir" fetch -q "$source_root" "${parent[1]}"
fi
commit=$(git -C "$release_dir" commit-tree "$tree" "${parent[@]}" -m "Deploy $GITHUB_SHA")
# Use checkout's credentials without copying credentials into the artifact.
git fetch -q "$release_dir" "$commit"
git push origin "$commit:refs/heads/lws-deploy"
