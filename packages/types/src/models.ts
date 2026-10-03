import type { Room, Map as DbMap, Avatar } from '@repo/database';

export type { Room, Avatar };
export type { DbMap as Map };
export type RoomWithMap = Room & { map: DbMap };
