export interface Player {
  id: string;
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
