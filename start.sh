#!/usr/bin/env bash
# Build the static site and serve it in the foreground on $PORT (default 3000).
set -euo pipefail
cd "$(dirname "$0")"

PROJECT_DIR="$(pwd)"
PORT="${PORT:-3000}"
export PORT

step() {
  local label="$1"
  shift
  echo "[start] ${label}"
  /usr/bin/time -p "$@"
}

echo "[start] project=${PROJECT_DIR} port=${PORT}"

# No runtime dependencies, but keep the install step explicit and reproducible.
step "install dependencies" npm install --no-package-lock --no-audit --no-fund --ignore-scripts

step "build static site" node build.mjs

step "write deployment metadata" node scripts/write-deployment.mjs

step "verify build output" test -f "${PROJECT_DIR}/dist/index.html"

echo "[start] serving dist/ in the foreground (Ctrl-C to stop)"
step "serve" node server.mjs
