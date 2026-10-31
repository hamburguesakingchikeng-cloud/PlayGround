#!/usr/bin/env bash
# Capture desktop + mobile screenshots of an already-running preview.
# Exit 75 for temporary browser/navigation failures, 1 for script or rendering defects.
set -uo pipefail
cd "$(dirname "$0")"

: "${CAPTURE_URL:?Set CAPTURE_URL to the preview URL}"
: "${CAPTURE_DIR:?Set CAPTURE_DIR for the screenshot output}"

step() {
  local label="$1"
  shift
  echo "[capture] ${label}"
  /usr/bin/time -p "$@"
}

step "prepare capture directory" mkdir -p "${CAPTURE_DIR}"
step "capture desktop and mobile" node capture.mjs
status=$?

echo "[capture] finished with exit ${status}"
exit "${status}"
