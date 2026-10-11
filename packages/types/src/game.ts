export interface Player {
  id: string;
  numericId: number;
  name: string;
  avatar: string;
  x: number;
  y: number;
}

export interface RoomStat {
  width: number;
  height: number;
  players: globalThis.Map<string, Player>;
}
