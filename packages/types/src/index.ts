import type { Room, Map as DbMap, Avatar } from '@repo/database';

// Re-export DB models safely for frontend and backend
export type { Room, Avatar };
export type { DbMap as Map };
export type RoomWithMap = Room & { map: DbMap };

// In-memory & WebSocket player types
export interface Player {
  id: string;
  name: string;
  avatar: string;
  x: number;
  y: number;
}

// In-memory room state
export interface RoomStat {
  width: number;
  height: number;
  players: globalThis.Map<string, Player>;
}

// Socket.IO event payloads
export interface PlayerMovedPayload {
  id: string;
  x: number;
  y: number;
  direction?: string;
}
