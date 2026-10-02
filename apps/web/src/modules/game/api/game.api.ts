import type { Room, Map as GameMap, RoomWithMap } from '@repo/types';

export type { RoomWithMap };

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getRoom(code: string): Promise<Room> {
  const res = await fetch(`${API_BASE_URL}/rooms/${encodeURIComponent(code)}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch room "${code}": ${res.statusText}`);
  }
  return res.json();
}

export async function getMap(id: number): Promise<GameMap> {
  const res = await fetch(`${API_BASE_URL}/maps/${id}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch map ${id}: ${res.statusText}`);
  }
  return res.json();
}
