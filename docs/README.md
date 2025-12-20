# WattWelten Metaverse Dokumentation

## Getting Started

Siehe [README.md](../README.md) für die Installation und den Quickstart.

## Inhaltsverzeichnis

- [Templates](./templates.md) - Template-System und Erstellung
- [Audio & Voice](./audio-voice.md) - Spatial Audio und Ambient-Sounds
- [Avatare](./avatars.md) - Ready Player Me Integration
- [AI Integration](./ai-integration.md) - AI-Bridge zu wattos_plattform
- [Content Provider](./content-provider.md) - Local und Strapi Provider

## Architektur

Das Metaverse ist als Monorepo mit folgenden Hauptkomponenten aufgebaut:

- **apps/web**: Vite + Three.js Client
- **apps/server**: Socket.io Multiplayer Server
- **packages/core**: Engine, Template-System, Theme
- **packages/ui**: React UI Components
- **packages/avatars**: Ready Player Me Integration
- **packages/voice**: Spatial Audio, WebRTC
- **packages/audio**: Ambient-Sound-System
- **packages/net**: Multiplayer Client
- **packages/ai**: AI-Bridge
- **packages/content**: Content Provider



