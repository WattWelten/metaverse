#!/usr/bin/env bash
# scripts/generate-scaffold.sh
# Generiert Grundgerüst für Packages/Services/Docs/CI

set -euo pipefail

# Helper
ensure_dir() { mkdir -p "$1"; echo "✓ dir: $1"; }
write() {
  local f="$1"; shift
  ensure_dir "$(dirname "$f")"
  printf "%s\n" "$*" > "$f"
  echo "✓ file: $f"
}

echo "🚀 Generiere MVP-Grundgerüst..."

# --- 0) ENV & Docs & CI -------------------------------------------------------
ensure_dir docs
write .env.example \
'# LiveKit Cloud
LIVEKIT_URL=wss://<your>.livekit.cloud
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# Y-WebSocket (integriert in apps/server)
YWS_ENABLED=true

# Sentry
SENTRY_DSN=

# NextAuth
NEXTAUTH_URL=http://localhost:5173
NEXTAUTH_SECRET=

# Strapi
STRAPI_URL=https://...
STRAPI_TOKEN='

write docs/ENV.md \
'# Umgebungsvariablen

## LiveKit Cloud
- `LIVEKIT_URL`: WebSocket-URL des LiveKit-Servers
- `LIVEKIT_API_KEY`: API-Key für Token-Generierung
- `LIVEKIT_API_SECRET`: API-Secret für Token-Generierung

## Y-WebSocket
- `YWS_ENABLED`: Aktiviert Y-WebSocket-Endpoint in apps/server (default: true)

## Sentry
- `SENTRY_DSN`: Optional - DSN für Fehlertelemetrie

## NextAuth
- `NEXTAUTH_URL`: Base-URL der Anwendung
- `NEXTAUTH_SECRET`: Secret für Session-Verschlüsselung

## Strapi
- `STRAPI_URL`: Base-URL des Strapi-CMS
- `STRAPI_TOKEN`: API-Token für Strapi-Zugriff'

write docs/MVP-Guide.md \
'# MVP Guide

## Quick Start

1. `pnpm i`
2. `pnpm -w build`
3. `cp .env.example .env.local` und Werte ausfüllen
4. `pnpm -w dev`
5. Öffne `/demo/plaza` (web) & Smartphone `/remote` (QR scannen)

## Demos

- **Plaza**: Stage + 2 Breakouts + Audio-Beacons
- **Meeting**: Whiteboard, Markdown, Screenshare

## Szenen bauen (No-Code)

1. Strapi öffnen → Scene Collection
2. Neue Scene anlegen (Name, Assets, Spawn, Zones)
3. Publish → automatisch im Client verfügbar

## Host-Flow (Moderation)

1. Als Host einloggen (NextAuth)
2. Raum erstellen → Token mit Host-Rolle
3. Moderation-Panel öffnen → Mute-All, Kick, Spotlight, Raise-Hand

## Companion-Phone

1. Desktop: QR-Code im HUD anzeigen
2. Phone: `/remote` öffnen → QR scannen
3. Pairing < 5s → PTT, Controller, Camera verfügbar'

ensure_dir .github/workflows
write .github/workflows/ci.yml \
'name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm i --frozen-lockfile
      - run: pnpm -w build
      - run: pnpm -w lint --if-present
      - run: pnpm -w typecheck --if-present
      - run: pnpm -w test --if-present
      - run: pnpm -w e2e --if-present
'

# --- 1) RTC-SFU Package ------------------------------------------------------
ensure_dir packages/rtc-sfu/src
write packages/rtc-sfu/package.json \
'{
  "name": "@metaverse/rtc-sfu",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "tsc --watch",
    "build": "tsc",
    "lint": "eslint src --fix",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "livekit-client": "^2.5.0"
  },
  "devDependencies": {
    "@metaverse/eslint-config": "workspace:*",
    "@metaverse/tsconfig": "workspace:*",
    "typescript": "^5.9.3"
  }
}'

write packages/rtc-sfu/src/index.ts \
'import {
  Room,
  RoomEvent,
  createLocalAudioTrack,
  LocalAudioTrack,
  RemoteTrackPublication,
  Track,
} from "livekit-client";

export type ConnectOptions = {
  tokenEndpoint: string;
  roomId: string;
  userId: string;
  displayName: string;
  role?: "host" | "moderator" | "speaker" | "guest";
};

export type TrackSubscribedCallback = (
  track: MediaStreamTrack,
  publication: RemoteTrackPublication
) => void;

export class RTCClient {
  private room = new Room();
  private localAudio: LocalAudioTrack | null = null;
  private onTrackSubscribedCb?: TrackSubscribedCallback;
  private onTrackUnsubscribedCb?: TrackSubscribedCallback;

  async connect(opts: ConnectOptions): Promise<void> {
    const response = await fetch(opts.tokenEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        roomId: opts.roomId,
        userId: opts.userId,
        displayName: opts.displayName,
        role: opts.role ?? "guest",
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.statusText}`);
    }

    const { url, token } = await response.json();
    await this.room.connect(url, token);

    this.room.on(RoomEvent.TrackSubscribed, (track, publication) => {
      this.onTrackSubscribedCb?.(track.mediaStreamTrack, publication);
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track, publication) => {
      this.onTrackUnsubscribedCb?.(track.mediaStreamTrack, publication);
    });
  }

  async publishMic(deviceId?: string): Promise<void> {
    const track = await createLocalAudioTrack({
      deviceId,
    });
    this.localAudio = track;
    await this.room.localParticipant.publishTrack(track);
  }

  stopMic(): void {
    this.localAudio?.stop();
    this.room.localParticipant.audioTrackPublications.forEach((pub) => {
      pub.unpublish();
    });
    this.localAudio = null;
  }

  onTrackAdded(cb: TrackSubscribedCallback): void {
    this.onTrackSubscribedCb = cb;
  }

  onTrackRemoved(cb: TrackSubscribedCallback): void {
    this.onTrackUnsubscribedCb = cb;
  }

  setListenerPosition(pos: { x: number; y: number; z: number }): void {
    // Spatial-Audio wird clientseitig mit GainNodes implementiert
    // Position wird an Zone-Engine übergeben
  }

  async startScreenshare(): Promise<MediaStream | null> {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        await this.room.localParticipant.publishTrack(videoTrack, {
          source: Track.Source.ScreenShare,
        });
        return stream;
      }
      return null;
    } catch (error) {
      console.error("Failed to start screen share:", error);
      return null;
    }
  }

  async stopScreenshare(): Promise<void> {
    this.room.localParticipant.videoTrackPublications.forEach((pub) => {
      if (pub.source === Track.Source.ScreenShare) {
        pub.unpublish();
      }
    });
  }

  disconnect(): void {
    this.room.disconnect();
  }
}
'

# --- 2) Zone-Engine (packages/voice) ------------------------------------------
write packages/voice/src/zone-engine.ts \
'export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

export type Zone = {
  id: string;
  shape: "circle" | "polygon";
  center?: Vec2;
  radius?: number;
  points?: Vec2[];
  isStage?: boolean;
  maxParticipants?: number;
};

export function pointInZone(p: Vec2, z: Zone): boolean {
  if (z.shape === "circle" && z.center && z.radius !== undefined) {
    const dx = p[0] - z.center[0];
    const dy = p[1] - z.center[1];
    return dx * dx + dy * dy <= z.radius * z.radius;
  }
  if (z.shape === "polygon" && z.points) {
    // Ray casting algorithm
    let inside = false;
    for (let i = 0, j = z.points.length - 1; i < z.points.length; j = i++) {
      const xi = z.points[i][0];
      const yi = z.points[i][1];
      const xj = z.points[j][0];
      const yj = z.points[j][1];
      const intersect =
        yi > p[1] !== yj > p[1] &&
        p[0] < ((xj - xi) * (p[1] - yi)) / ((yj - yi) || 1e-9) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
  return false;
}

export function updateZoneMembership(
  position: Vec3,
  zones: Zone[]
): string | null {
  const pos2d: Vec2 = [position[0], position[2]]; // x, z
  return zoneMembership(pos2d, zones);
}

export function zoneMembership(pos: Vec2, zones: Zone[]): string | null {
  for (const z of zones) {
    if (pointInZone(pos, z)) {
      return z.id;
    }
  }
  return null;
}

export function volumeFor(
  senderPos: Vec2,
  receiverPos: Vec2,
  senderZone: string | null,
  receiverZone: string | null,
  maxDistance = 12,
  rolloff = 1.2
): number {
  // Cross-zone: hard mute
  if (senderZone && receiverZone && senderZone !== receiverZone) {
    return -120; // Hard mute
  }

  // Same zone or no zones: distance-based attenuation
  const dx = senderPos[0] - receiverPos[0];
  const dy = senderPos[1] - receiverPos[1];
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d <= 1) return 0; // Close: no attenuation
  if (d >= maxDistance) return -80; // Far: max attenuation

  const norm = d / maxDistance;
  const att = -(20 * Math.log10(1 + rolloff * norm));
  return Math.max(-80, att);
}

export function isStage(zones: Zone[], zoneId: string | null): boolean {
  if (!zoneId) return false;
  const zone = zones.find((z) => z.id === zoneId);
  return zone?.isStage ?? false;
}
'

# --- 3) Y-WebSocket in apps/server -------------------------------------------
write apps/server/src/routes/yws.ts \
'import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils.js";
import type { Server } from "http";

export function setupYWebSocket(server: Server): void {
  const wss = new WebSocketServer({ server, path: "/yws" });

  wss.on("connection", (conn, req) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    const roomId = url.searchParams.get("room") || "default";
    setupWSConnection(conn, req, { docName: `room-${roomId}` });
  });

  console.log("[yws] WebSocket-Server gestartet auf /yws");
}
'

# --- 4) Collab-Docs Package ---------------------------------------------------
ensure_dir packages/collab-docs/src
write packages/collab-docs/package.json \
'{
  "name": "@metaverse/collab-docs",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "scripts": {
    "dev": "tsc --watch",
    "build": "tsc",
    "lint": "eslint src --fix",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@tiptap/react": "^2.6.6",
    "@tiptap/starter-kit": "^2.6.6",
    "@tiptap/extension-placeholder": "^2.6.6",
    "yjs": "^13.6.0",
    "y-websocket": "^2.0.0"
  },
  "devDependencies": {
    "@metaverse/eslint-config": "workspace:*",
    "@metaverse/tsconfig": "workspace:*",
    "@types/react": "^18.3.12",
    "typescript": "^5.9.3"
  }
}'

write packages/collab-docs/src/MarkdownEditor.tsx \
'import React, { useEffect, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

interface MarkdownEditorProps {
  roomId: string;
  ywsUrl?: string;
}

export function MarkdownEditor({ roomId, ywsUrl }: MarkdownEditorProps) {
  const doc = useMemo(() => new Y.Doc(), []);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Schreib mit Markdown..." }),
    ],
    content: "## Gemeinsame Notizen\n\n",
  });

  useEffect(() => {
    if (!editor) return;

    const ytext = doc.getText("content");
    const wsUrl =
      ywsUrl ||
      `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}:${location.port}/yws?room=${roomId}`;

    const provider = new WebsocketProvider(wsUrl, `md-${roomId}`, doc);

    // Sync editor -> yjs
    const updateYjs = () => {
      const content = editor.getHTML();
      ytext.delete(0, ytext.length);
      ytext.insert(0, content);
    };

    editor.on("update", updateYjs);

    // Sync yjs -> editor
    ytext.observe(() => {
      const content = ytext.toString();
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content);
      }
    });

    return () => {
      editor.off("update", updateYjs);
      provider.destroy();
    };
  }, [doc, editor, roomId, ywsUrl]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <EditorContent editor={editor} />
    </div>
  );
}
'

write packages/collab-docs/src/index.ts \
'export { MarkdownEditor } from "./MarkdownEditor.js";
'

# --- 5) Scene Schema ----------------------------------------------------------
ensure_dir packages/core/src/schemas
write packages/core/src/schemas/scene.schema.json \
'{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Scene",
  "type": "object",
  "required": ["name", "assets", "spawn"],
  "properties": {
    "name": { "type": "string" },
    "assets": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "src"],
        "properties": {
          "id": { "type": "string" },
          "src": { "type": "string" },
          "draco": { "type": "boolean" },
          "ktx2": { "type": "boolean" }
        }
      }
    },
    "spawn": {
      "type": "object",
      "properties": {
        "x": { "type": "number" },
        "y": { "type": "number" },
        "z": { "type": "number" }
      }
    },
    "portals": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "to": { "type": "string" },
          "position": {
            "type": "array",
            "items": { "type": "number" },
            "minItems": 3,
            "maxItems": 3
          }
        }
      }
    },
    "audioBeacons": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "pos": {
            "type": "array",
            "items": { "type": "number" },
            "minItems": 3,
            "maxItems": 3
          },
          "url": { "type": "string" },
          "radius": { "type": "number" }
        }
      }
    },
    "zones": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "shape"],
        "properties": {
          "id": { "type": "string" },
          "shape": { "type": "string", "enum": ["circle", "polygon"] },
          "center": {
            "type": "array",
            "items": { "type": "number" },
            "minItems": 2,
            "maxItems": 2
          },
          "radius": { "type": "number" },
          "points": {
            "type": "array",
            "items": {
              "type": "array",
              "items": { "type": "number" },
              "minItems": 2,
              "maxItems": 2
            }
          },
          "isStage": { "type": "boolean" },
          "maxParticipants": { "type": "number" }
        }
      }
    },
    "lighting": {
      "type": "object",
      "properties": {
        "env": { "type": "string" }
      }
    },
    "ui": {
      "type": "object",
      "properties": {
        "showMinimap": { "type": "boolean" }
      }
    }
  }
}
'

echo "✅ Grundgerüst generiert!"
echo ""
echo "Nächste Schritte:"
echo "1. pnpm i"
echo "2. Prüfe pnpm-workspace.yaml (apps/* und packages/* sollten enthalten sein)"
echo "3. apps/server/src/server.ts erweitern: setupYWebSocket(server) aufrufen"
echo "4. Token-Endpoint in apps/server/src/routes/rtc.ts implementieren"
