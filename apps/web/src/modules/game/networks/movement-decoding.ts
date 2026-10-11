import type { Direction } from '@repo/types/socket';
import type { BinaryMovementEntry } from '@repo/types/binary';

const REVERSE_DIRECTION_MAP: Direction[] = ['u', 'd', 'l', 'r', 's'];
const ENTRY_BYTE_SIZE = 7;

/**
 * Unpacks an ArrayBuffer or ArrayBufferView (Uint8Array) into an array of movement updates.
 */
export function decodeMovementBatch(
  data: ArrayBuffer | ArrayBufferView,
): BinaryMovementEntry[] {
  const buffer = data instanceof ArrayBuffer ? data : data.buffer;
  const byteOffset = data instanceof ArrayBuffer ? 0 : data.byteOffset;
  const byteLength =
    data instanceof ArrayBuffer ? data.byteLength : data.byteLength;

  const view = new DataView(buffer, byteOffset, byteLength);
  const count = Math.floor(byteLength / ENTRY_BYTE_SIZE);
  const results: BinaryMovementEntry[] = [];

  for (let i = 0; i < count; i++) {
    const offset = i * ENTRY_BYTE_SIZE;
    const numId = view.getUint16(offset, true);
    const x = view.getUint16(offset + 2, true);
    const y = view.getUint16(offset + 4, true);
    const dirCode = view.getUint8(offset + 6);
    const dir = REVERSE_DIRECTION_MAP[dirCode] ?? 's';
    results.push([numId, x, y, dir]);
  }

  return results;
}
