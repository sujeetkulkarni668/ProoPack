/**
 * Variable-Length Quantity (VLQ / Unsigned LEB128) encoding for BigInt
 */

export function encodeVarint(value: bigint): Uint8Array {
  if (value < 0n) {
    throw new Error('Varint does not support negative numbers');
  }

  const bytes: number[] = [];
  let remaining = value;

  while (remaining >= 0x80n) {
    bytes.push(Number((remaining & 0x7fn) | 0x80n));
    remaining >>= 7n;
  }
  bytes.push(Number(remaining & 0x7fn));

  return new Uint8Array(bytes);
}

export function decodeVarint(
  buffer: Uint8Array,
  offset: number = 0
): { value: bigint; bytesRead: number } {
  let result = 0n;
  let shift = 0n;
  let bytesRead = 0;

  while (offset + bytesRead < buffer.length) {
    const byte = buffer[offset + bytesRead];
    bytesRead++;
    result |= BigInt(byte & 0x7f) << shift;

    if ((byte & 0x80) === 0) {
      return { value: result, bytesRead };
    }

    shift += 7n;
    if (shift > 256n) {
      throw new Error('Varint overflow: exceeded 256 bits');
    }
  }

  throw new Error('Unexpected EOF while decoding varint');
}
