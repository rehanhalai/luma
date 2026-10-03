import type { Player } from './game';

export interface MovementPayload {
  x: number;
  y: number;
  direction: string;
}

export interface PlayerMovedPayload {
  id: string;
  x: number;
  y: number;
  direction: string;
}

export interface ServerToClientEvents {
  currentPlayers: (players: Player[]) => void;
  playerJoined: (player: Player) => void;
  playerMoved: (data: PlayerMovedPayload) => void;
  playerLeft: (player: Player) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  movement: (data: MovementPayload) => void;
}
