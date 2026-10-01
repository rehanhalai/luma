import type { Room, Avatar } from '@repo/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export async function getRooms(): Promise<Room[]> {
  const res = await fetch(`${API_BASE_URL}/rooms`);
  if (!res.ok) {
    throw new Error(`Failed to fetch rooms: ${res.statusText}`);
  }
  return res.json();
}

export async function getAvatars(category?: string): Promise<Avatar[]> {
  const url =
    category && category !== 'All'
      ? `${API_BASE_URL}/avatars?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/avatars`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch avatars: ${res.statusText}`);
  }
  return res.json();
}

export async function getAvatarCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/avatars/categories`);
  if (!res.ok) {
    throw new Error(`Failed to fetch avatar categories: ${res.statusText}`);
  }
  return res.json();
}
