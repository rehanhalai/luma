import type { Room, Map as GameMap } from '@repo/types';

export type RoomWithMap = Room & { map: GameMap };

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getRoom(code: string): Promise<RoomWithMap> {
  const res = await fetch(`${API_BASE_URL}/rooms/${encodeURIComponent(code)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch room "${code}": ${res.statusText}`);
  }
  return res.json();
}
