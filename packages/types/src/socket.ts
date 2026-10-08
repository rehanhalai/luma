import type { Player } from './game';

export type Direction = 'u' | 'd' | 'l' | 'r' | 's';

export type MovementPayload = [x: number, y: number, direction: Direction];

export type PlayerMovedPayload = [
  id: string,
  x: number,
  y: number,
  direction: Direction,
];

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
}

export interface ServerToClientEvents {
  currentPlayers: (players: Player[]) => void;
  playerJoined: (player: Player) => void;
  move: (data: PlayerMovedPayload) => void;
  playerLeft: (player: Player) => void;
  error: (message: string) => void;
  chatMessage: (data: ChatMessage) => void;
}

export interface ClientToServerEvents {
  move: (data: MovementPayload) => void;
  sendMessage: (message: string) => void;
}
