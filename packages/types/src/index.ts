// Re-export DB models safely for frontend and backend
export type { Room, Map, Avatar } from '@repo/database';

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
  players: Map<string, Player>;
}

// Socket.IO event payloads
export interface PlayerMovedPayload {
  id: string;
  x: number;
  y: number;
  direction?: string;
}
