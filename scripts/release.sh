#!/usr/bin/env bash
# Cut a release: promote CHANGELOG, regenerate changelog data, commit, tag.
# Does NOT push — prints the push command for the user to run.
#
# Releases are CHANGELOG + git-tag only (this app isn't published to npm, so
# package.json's version is left alone). Draft entries under `## [Unreleased]`
# first; this script promotes them to a dated version.
#
# Usage: pnpm release X.Y.Z

set -euo pipefail

# ---------- 1. Validate args ----------
if [ $# -ne 1 ]; then
  echo "Usage: pnpm release X.Y.Z" >&2
  exit 1
fi

VERSION="$1"
if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "ERROR: '$VERSION' is not semver (expected X.Y.Z)" >&2
  exit 1
fi

TAG="v$VERSION"
DATE="$(date +%F)"
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

CHANGELOG="CHANGELOG.md"
CHANGELOG_DATA="src/data/changelog.ts"

# ---------- 2. Pre-flight git checks ----------
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "main" ]; then
  echo "ERROR: must run on 'main' (currently on '$BRANCH')" >&2
  exit 1
fi

# Allow the changelog files to be dirty (entries you just drafted go into this
# release commit). Anything else dirty → stop, so unrelated work isn't swept in.
OTHER_DIRTY="$(git status --porcelain | grep -vE "^.. (CHANGELOG\.md|src/data/changelog\.ts)$" || true)"
if [ -n "$OTHER_DIRTY" ]; then
  echo "ERROR: working tree has changes outside the changelog — commit or stash them first:" >&2
  echo "$OTHER_DIRTY" >&2
  exit 1
fi

echo "Fetching origin..."
git fetch origin main --tags

LOCAL="$(git rev-parse HEAD)"
REMOTE="$(git rev-parse origin/main)"
if [ "$LOCAL" != "$REMOTE" ]; then
  echo "ERROR: local main ($LOCAL) is not in sync with origin/main ($REMOTE) — pull or push first." >&2
  exit 1
fi

if git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "ERROR: tag $TAG already exists locally" >&2
  exit 1
fi
if git ls-remote --tags origin "refs/tags/$TAG" | grep -q "$TAG"; then
  echo "ERROR: tag $TAG already exists on origin" >&2
  exit 1
fi

# ---------- 3. Guard: ## [Unreleased] must have entries ----------
if [ ! -f "$CHANGELOG" ]; then
  echo "ERROR: $CHANGELOG not found" >&2
  exit 1
fi
if ! awk '
  /^## \[Unreleased\]/ { inu = 1; next }
  inu && /^---/        { inu = 0 }
  inu && NF            { found = 1 }
  END                  { exit(found ? 0 : 1) }
' "$CHANGELOG"; then
  echo "ERROR: '## [Unreleased]' has no entries — add user-facing changelog entries first." >&2
  exit 1
fi

# ---------- 4. Run pnpm check (typecheck + lint + test + build) ----------
echo ""
echo "Running pnpm check..."
if ! pnpm check; then
  echo "ERROR: pnpm check failed — fix before releasing" >&2
  exit 1
fi

# ---------- 5. Promote ## [Unreleased] -> ## [X.Y.Z] - DATE (+ fresh Unreleased) ----------
echo ""
echo "Promoting CHANGELOG '## [Unreleased]' to '## [$VERSION] - $DATE'..."
awk -v v="$VERSION" -v d="$DATE" '
  !done && /^## \[Unreleased\][[:space:]]*$/ {
    print "## [Unreleased]\n\n---\n\n## [" v "] - " d
    done = 1
    next
  }
  { print }
' "$CHANGELOG" > "$CHANGELOG.tmp"
mv "$CHANGELOG.tmp" "$CHANGELOG"

# ---------- 6. Regenerate the changelog data module ----------
echo "Regenerating $CHANGELOG_DATA..."
pnpm generate:changelog

# ---------- 7. Commit ----------
echo ""
echo "Committing as 'release: $TAG'..."
git add "$CHANGELOG" "$CHANGELOG_DATA"
git commit -m "release: $TAG"

# ---------- 8. Tag ----------
echo "Tagging $TAG..."
git tag "$TAG"

# ---------- 9. Done — print push command, do NOT auto-push ----------
echo ""
echo "----------------------------------------"
echo "Release $VERSION prepared."
echo ""
echo "Review:"
echo "  git show HEAD"
echo "  git show $TAG"
echo ""
echo "Push with:"
echo "  git push origin main $TAG"
echo "----------------------------------------"
