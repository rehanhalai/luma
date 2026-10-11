import type { Direction } from '@repo/types/socket';
import type { BinaryMovementEntry } from '@repo/types/binary';

const DIRECTION_MAP: Record<Direction, number> = {
  u: 0,
  d: 1,
  l: 2,
  r: 3,
  s: 4,
};

const ENTRY_BYTE_SIZE = 7;

/**
 * Packs an array of movement updates into a contiguous Little-Endian ArrayBuffer.
 * Each entry occupies 7 bytes:
 *   [uint16 numericId, uint16 x, uint16 y, uint8 direction]
 */
export function encodeMovementBatch(
  updates: BinaryMovementEntry[],
): ArrayBuffer {
  const buffer = new ArrayBuffer(updates.length * ENTRY_BYTE_SIZE);
  const view = new DataView(buffer);
  for (let i = 0; i < updates.length; i++) {
    const offset = i * ENTRY_BYTE_SIZE;
    const [numId, x, y, dir] = updates[i]!;
    view.setUint16(offset, numId, true);
    view.setUint16(offset + 2, x, true);
    view.setUint16(offset + 4, y, true);
    view.setUint8(offset + 6, DIRECTION_MAP[dir] ?? 4);
  }
  return buffer;
}
