const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Room {
  id: string;
  name: string;
  code: string;
  description: string | null;
  maxCapacity: number;
}

export async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${API_BASE_URL}/rooms`);
  if (!res.ok) {
    throw new Error(`Failed to fetch rooms: ${res.statusText}`);
  }
  return res.json();
}
