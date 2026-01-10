#!/usr/bin/env bash
# scripts/setup-github.sh
# GitHub Labels, Project & Issues Setup (GH-CLI)

set -euo pipefail

echo "📋 Erstelle GitHub Labels..."

# Labels
gh label create "epic" -c "#7f3bff" --force
gh label create "prio-high" -c "#d73a4a" --force
gh label create "prio-med" -c "#fbca04" --force
gh label create "bug" -c "#d73a4a" --force
gh label create "infra" -c "#0e8a16" --force
gh label create "docs" -c "#0366d6" --force
gh label create "ux" -c "#5319e7" --force
gh label create "good-first-task" -c "#7057ff" --force

echo "📊 Erstelle GitHub Project..."
gh project create --title "MVP Metaverse" --format=classic || echo "Project existiert bereits"

echo "📝 Erstelle EPIC Issues..."

# EPIC: SFU-Integration
gh issue create \
  -t "EPIC: SFU-Integration (LiveKit Cloud)" \
  -b "Ziel: Stabile Audio/Video für 5–10 TN pro Space.

- Token-API in apps/server (POST /api/rtc/token)
- Client-Wrapper (packages/rtc-sfu)
- Screenshare + PTT
- Device-Panel (Mic/Speaker)

Akzeptanz: 10 TN stabil; Latenz < 400ms; Screenshare 1080p/30 OK." \
  -l epic,prio-high

# EPIC: Audio-Zonen
gh issue create \
  -t "EPIC: Audio-Zonen & Stage/Breakouts" \
  -b "Ziel: Private Gespräche & Stage in einem Room.

- Scene-JSON Zonen (circle/polygon)
- Zone-Membership & Volume-Policy (packages/voice/src/zone-engine.ts)
- HUD: Raise hand, Spotlight, Move to Zone

Akzeptanz: Gruppen hören sich nicht; Stage-Modus funktioniert." \
  -l epic,prio-high,ux

# EPIC: Lightweight Collaboration
gh issue create \
  -t "EPIC: Lightweight Collaboration (Yjs)" \
  -b "Ziel: Whiteboard + Markdown-Docs.

- y-websocket in apps/server integriert (kein separater Service)
- Excalidraw Whiteboard erweitern (packages/whiteboard)
- Markdown-Editor mit Yjs (packages/collab-docs)

Akzeptanz: 5 gleichz. Editoren <200ms Sync." \
  -l epic,prio-high

# EPIC: Companion-Phone
gh issue create \
  -t "EPIC: Companion-Phone (PWA /remote)" \
  -b "Ziel: Zweitgerät für PTT/Controller/Camera.

- PWA Route /remote mit QR-Pairing
- PTT Button, Joystick/Emotes, Camera-Track

Akzeptanz: Pairing <5s; PTT <300ms." \
  -l epic,prio-med,ux

# EPIC: No-Code Scenes
gh issue create \
  -t "EPIC: No-Code Scenes (Strapi + JSON-Schema)" \
  -b "Ziel: Szenen ohne Code pflegen.

- scene.schema.json (packages/core/src/schemas)
- packages/content: Fetch/Validate/Cache
- Template-Switcher + Teleport-Hub (UI)

Akzeptanz: Szene publiziert → live im Client." \
  -l epic,prio-high

# EPIC: Moderation & Auth
gh issue create \
  -t "EPIC: Moderation & Standard-Auth (NextAuth.js)" \
  -b "Ziel: Host/Mod/Speaker/Guest; Mute/Kick/Spotlight/Lock.

- NextAuth.js Integration (apps/web/src/auth)
- Rollenmodell + UI Controls
- Consent vor Recording/Screenshare

Akzeptanz: Rollen steuern Token & UI." \
  -l epic,prio-med

# EPIC: CI/CD & Performance
gh issue create \
  -t "EPIC: CI/CD & Performance-Basics" \
  -b "Ziel: Reproduzierbare Builds & Basistelemetrie.

- CI Workflow (.github/workflows/ci.yml)
- Sentry minimal (web/server)
- DRACO/KTX2 Pipeline, LOD

Akzeptanz: Join p90 <6s; Desktop p90 ≥50 FPS (Demo)." \
  -l epic,infra,prio-med

# Start-Tasks
gh issue create \
  -t "Task: Sentry init (web/server) + ENV-Doks" \
  -b "Sentry DSN env + Init Hooks, docs/ENV.md aktualisieren." \
  -l infra,docs,good-first-task

gh issue create \
  -t "Task: E2E Smoke (Playwright) — 3 Browser + 1 Phone" \
  -b "Join, sprechen, Zone-Isolation, Whiteboard-Sync, Screenshare." \
  -l prio-med

echo "✅ GitHub Setup abgeschlossen!"
