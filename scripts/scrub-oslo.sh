#!/usr/bin/env bash
set -euo pipefail

BRANCH="chore/scrub-oslo-everywhere"

# Ensure branch exists and is checked out
if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

# Collect tracked files (newline-delimited for macOS compatibility)
DOC_REGEX='\.(md|mdx|txt)$'
CODE_REGEX='\.(ts|tsx|js|jsx|mjs|cjs|json|yml|yaml|css|scss|less|html)$'
ALL_REGEX='\.(md|mdx|txt|ts|tsx|js|jsx|mjs|cjs|json|yml|yaml|css|scss|less|html)$'

FILES_ALL=$(git ls-files)
DOCS=$(echo "$FILES_ALL" | grep -E "$DOC_REGEX" || true)
CODE=$(echo "$FILES_ALL" | grep -E "$CODE_REGEX" || true)
ALL_TEXT=$(echo "$FILES_ALL" | grep -E "$ALL_REGEX" || true)

# Targeted documentation adjustments
if [ -f documentation/Playbooks.md ]; then
  perl -0777 -i -pe 's/Oslo\/Dieter tokens/Dieter tokens/g' documentation/Playbooks.md
fi

if [ -f documentation/verceldeployments.md ]; then
  perl -0777 -i -pe 's/Serves:\s*Oslo assets at \/dieter\/\*/Serves: Dieter assets at \/dieter\/*/g' documentation/verceldeployments.md
fi

if [ -f documentation/migrations.md ]; then
  perl -0777 -i -pe 's/Consolidate Dieter into Oslo \(served by c-keen-app\)/Consolidate Dieter assets served by c-keen-app via copy-on-build (ADR-005)./g' documentation/migrations.md || true
  perl -0777 -i -pe 's/Consolidate Dieter into Oslo/Consolidate Dieter assets served by c-keen-app via copy-on-build (ADR-005)./g' documentation/migrations.md || true
fi

if [ -f documentation/Techphases.md ]; then
  perl -0777 -i -pe 's/Usage\s*&\s*Token\s*Service\s*\((?:[“”"\x27])?Oslo(?:[“”"\x27])?\s*tokens\)/Usage & Token Service (Tokens & Usage)/g' documentation/Techphases.md
fi

if [ -f documentation/CONTEXT.md ]; then
  perl -0777 -i -pe 's/^\s*-\s*\*\*Oslo[^\n]*\n//gm' documentation/CONTEXT.md
fi

if [ -f documentation/clickeen-platform-architecture.md ]; then
  perl -0777 -i -pe 's/^\|[^\n]*\*\*Oslo\*\*[^\n]*\n//gm' documentation/clickeen-platform-architecture.md
fi

if [ -f documentation/ADRdecisions.md ]; then
  perl -0777 -i -pe 's/\bOslo\b//g' documentation/ADRdecisions.md
fi

# Global identifier remaps
if [ -n "$ALL_TEXT" ]; then
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    perl -0777 -i -pe 's/@ck\/oslo-([A-Za-z0-9_-]+)/@ck\/dieter-$1/g' "$f"
  done <<< "$ALL_TEXT"
fi

if [ -n "$ALL_TEXT" ]; then
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    perl -0777 -i -pe 's/(^|[^A-Za-z0-9])oslo([\/_-])/\1dieter\2/gi' "$f"
  done <<< "$ALL_TEXT"
fi

# Code and docs word replacements
if [ -n "$CODE" ]; then
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    perl -0777 -i -pe 's/\bOslo\b/Dieter/g' "$f"
    perl -0777 -i -pe 's/\boslo\b/dieter/g' "$f"
  done <<< "$CODE"
fi

if [ -n "$DOCS" ]; then
  while IFS= read -r f; do
    [ -n "$f" ] || continue
    perl -0777 -i -pe 's/\bOslo\b/Dieter/g' "$f"
    perl -0777 -i -pe 's/\boslo\b/Dieter/g' "$f"
  done <<< "$DOCS"
fi

# Verification using git grep, excluding non-source paths and this script
if git grep -n -I -i -e oslo -- . \
  ":(exclude).git/**" \
  ":(exclude)node_modules/**" \
  ":(exclude).github/**" \
  ":(exclude)scripts/scrub-oslo.sh"; then
  echo "ERROR: 'oslo' still present (listed above)." >&2
  exit 1
fi

git add -A
git commit -m "chore: scrub retired codename across repo; map safe identifiers to Dieter; remove historical mentions" || true
git push -u origin "$BRANCH" | cat

if command -v gh >/dev/null 2>&1; then
  gh pr create --fill --title "scrub: remove retired codename everywhere (no CI changes)" --body "Remove every occurrence of the retired codename from docs and code. Map to Dieter where applicable."
  gh pr merge --squash --auto || true
fi

echo DONE


