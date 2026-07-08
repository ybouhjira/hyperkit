#!/usr/bin/env bash
# Fail if z.any() is used without an explicit // z-any-ok: <reason> comment
# Used as a pre-commit check via lint-staged

set -euo pipefail

violations=0

for file in "$@"; do
  # Skip node_modules, dist, test files
  case "$file" in
    */node_modules/*|*/dist/*) continue ;;
  esac

  # Find lines with z.any() that don't have the allowlist comment
  while IFS= read -r match; do
    if [ -n "$match" ]; then
      echo "ERROR: $match"
      violations=$((violations + 1))
    fi
  done < <(grep -n 'z\.any()' "$file" 2>/dev/null | grep -v '// z-any-ok:' || true)
done

if [ "$violations" -gt 0 ]; then
  echo ""
  echo "Found $violations z.any() usage(s) without allowlist comment."
  echo "Either replace with a typed schema or add: // z-any-ok: <reason>"
  exit 1
fi
