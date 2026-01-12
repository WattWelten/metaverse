#!/usr/bin/env bash
set -euo pipefail
RED=$'\e[31m'
GRN=$'\e[32m'
YLW=$'\e[33m'
RST=$'\e[0m'
pass() {
  echo "${GRN}PASS${RST} $*"
}
fail() {
  echo "${RED}FAIL${RST} $*"
  FAILED=1
}
warn() {
  echo "${YLW}WARN${RST}  $*"
}
FAILED=0
DATE="$(date -u +%F' %T'Z)"
BRANCH_EXPECT="feat/auto-setup-mvp"

echo "🔎 MVP Branch Audit — $DATE"
CUR=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')
[[ "$CUR" == "$BRANCH_EXPECT" ]] && pass "auf Branch $CUR" || warn "Branch ist $CUR (erwartet $BRANCH_EXPECT)"
git fetch -q origin || true
git diff --quiet "origin/$BRANCH_EXPECT"... && pass "Up-to-date mit origin/$BRANCH_EXPECT" || warn "Lokale Commits vs origin"

check_file() {
  [[ -f "$1" ]] && pass "$1" || fail "fehlt: $1"
}

# Struktur
[[ -f pnpm-workspace.yaml ]] && pass "pnpm-workspace.yaml" || fail "pnpm-workspace.yaml fehlt"
grep -q "apps" pnpm-workspace.yaml && pass "apps/* im workspace" || fail "apps/* nicht in workspace"
grep -q "packages" pnpm-workspace.yaml && pass "packages/* im workspace" || fail "packages/* nicht in workspace"

# Integrationen
check_file ".github/workflows/ci.yml"
check_file "docs/ENV.md"
check_file "docs/MVP-Guide.md"

check_file "apps/server/src/routes/rtc.ts"
check_file "apps/rtc-api/package.json"
check_file "apps/rtc-api/src/index.ts"
check_file "packages/rtc-sfu/package.json"
check_file "packages/rtc-sfu/src/index.ts"

check_file "packages/voice/src/zone-engine.ts"
check_file "packages/voice/src/zone-router.ts"

check_file "apps/server/src/routes/yws.ts"
check_file "packages/whiteboard/src/Whiteboard.tsx"
check_file "packages/collab-docs/src/MarkdownEditor.tsx"
check_file "packages/collab-docs/src/index.ts"

check_file "apps/web/src/ui/RemoteController.tsx"

check_file "packages/content/src/strapi.ts"
check_file "packages/content/schemas/scene.schema.json"
check_file "apps/web/src/components/PdfViewer.tsx"

check_file "apps/web/src/moderation/hooks.ts"
check_file "packages/moderation/src/roles.ts"

check_file "apps/web/src/i18n/index.ts"
check_file "apps/web/src/i18n/locales/de.json"
check_file "apps/web/src/i18n/locales/en.json"
check_file "apps/web/src/i18n/LangSwitcher.tsx"

check_file "packages/core/src/schemas/scene.schema.json"

# ENV Hinweise
grep -R "LIVEKIT_URL" -n . >/dev/null && pass "LIVEKIT_* referenziert" || warn "LIVEKIT_* nicht referenziert"
grep -R "livekit-client" -n packages/rtc-sfu/package.json >/dev/null && pass "livekit-client als dep" || fail "livekit-client fehlt"
grep -R "y-websocket" -n apps/server packages/* >/dev/null && pass "y-websocket vorhanden" || fail "y-websocket fehlt"

# Strapi optional
[[ -d strapi ]] && pass "strapi/ vorhanden" || warn "strapi/ nicht gefunden (optional)"

# Ergebnis
mkdir -p .audit
REPORT=".audit/MVP_AUDIT.md"
{
  echo "# MVP Audit — $DATE"
  echo "- Branch: \`$CUR\`"
  echo "## Checks"
  echo "- Workspace & Struktur: OK/NOK (siehe Terminal)"
  echo "- SFU/RTC: rtc-api + rtc-sfu"
  echo "- Voice Zonen: zone-engine"
  echo "- Collab: yws + collab-*"
  echo "- Content: schema + (optional) Strapi"
  echo "- CI & Docs"
} >"$REPORT"

[[ $FAILED -eq 0 ]] && echo "✅ ${GRN}OK${RST} — Report: $REPORT" || (
  echo "🟥 ${RED}ABWEICHUNGEN${RST} — $REPORT"
  exit 1
)
