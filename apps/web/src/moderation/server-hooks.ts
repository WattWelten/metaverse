/**
 * Server-side moderation hooks (example implementation)
 *
 * These events are already implemented in apps/server/src/server.ts:
 * - ui:raiseHand
 * - ui:lowerHand
 * - mod:muteAll
 * - mod:spotlight
 * - mod:lockRoom
 *
 * This file serves as documentation/reference for the event structure.
 */

import type { Server, Socket } from 'socket.io';

/**
 * Example: Setup moderation events on Socket.io server
 *
 * Note: This is already implemented in apps/server/src/server.ts
 * This is just for reference/documentation.
 */
export function setupModerationHooks(io: Server): void {
  io.on('connection', (socket: Socket) => {
    // Raise hand
    socket.on('ui:raiseHand', () => {
      // Emit to room: mod:queue:add
      // Implementation in apps/server/src/server.ts:495
    });

    // Lower hand
    socket.on('ui:lowerHand', () => {
      // Emit to room: mod:queue:remove
      // Implementation in apps/server/src/server.ts:508
    });

    // Mute all
    socket.on('mod:muteAll', () => {
      // Emit to room: audio:force-mute
      // Implementation in apps/server/src/server.ts:515
    });

    // Spotlight user
    socket.on('mod:spotlight', (data: { userId: string }) => {
      // Emit to room: stage:spotlight
      // Implementation in apps/server/src/server.ts:522
    });

    // Lock room
    socket.on('mod:lockRoom', (data: { locked: boolean }) => {
      // Emit to room: room:locked
      // Implementation in apps/server/src/server.ts:529
    });
  });
}
