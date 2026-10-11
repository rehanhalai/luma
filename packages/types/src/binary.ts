import type { Direction } from './socket';

export type BinaryMovementEntry = [
  numericId: number,
  x: number,
  y: number,
  direction: Direction,
];
