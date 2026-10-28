import { PROTOCOL_CONSTANTS, L2Transaction, ProofPackError, ErrorCode } from '@proofpack/shared';
import { encodeVarint, decodeVarint } from './varint';
import { Hex, getAddress } from 'viem';

export interface DecodedBatch {
  version: number;
  batchId: number;
  transactions: Array<{
    sender: string;
    to: string;
    amount: string;
    fee: string;
    nonce: number;
    validUntil: number;
    signature: string;
  }>;
}

export function serializeBatch(
  batchId: number,
  transactions: Array<{
    sender: string;
    to: string;
    amount: string;
    fee: string;
    nonce: number;
    validUntil: number;
    signature: string;
  }>
): Uint8Array {
  if (transactions.length > PROTOCOL_CONSTANTS.MAX_BATCH_SIZE_UPPER_BOUND) {
    throw new ProofPackError(
      ErrorCode.BATCH_FULL,
      `Batch exceeds maximum allowed size of ${PROTOCOL_CONSTANTS.MAX_BATCH_SIZE_UPPER_BOUND}`
    );
  }

  // 1. Build deduplicated address dictionary
  const addressList: string[] = [];
  const addressToIndex = new Map<string, number>();

  const getOrAddAddress = (rawAddr: string): number => {
    const normalized = getAddress(rawAddr).toLowerCase();
    let idx = addressToIndex.get(normalized);
    if (idx === undefined) {
      idx = addressList.length;
      addressToIndex.set(normalized, idx);
      addressList.push(normalized);
    }
    return idx;
  };

  // Pre-collect indices
  const txData = transactions.map(tx => ({
    senderIdx: getOrAddAddress(tx.sender),
    toIdx: getOrAddAddress(tx.to),
    nonce: BigInt(tx.nonce),
    amount: BigInt(tx.amount),
    fee: BigInt(tx.fee),
    validUntil: BigInt(tx.validUntil),
    signature: tx.signature.startsWith('0x') ? tx.signature.slice(2) : tx.signature
  }));

  if (addressList.length > 65535) {
    throw new Error('Dictionary exceeds 16-bit address limit');
  }

  // 2. Encode Header (11 bytes)
  // [0..1] Magic (0x5050)
  // [2]    Version (1)
  // [3..6] Batch ID (uint32 BE)
  // [7..8] Tx Count (uint16 BE)
  // [9..10] Dictionary Count (uint16 BE)
  const header = new Uint8Array(11);
  const view = new DataView(header.buffer);
  view.setUint16(0, PROTOCOL_CONSTANTS.MAGIC_BYTES, false);
  view.setUint8(2, PROTOCOL_CONSTANTS.VERSION);
  view.setUint32(3, batchId, false);
  view.setUint16(7, transactions.length, false);
  view.setUint16(9, addressList.length, false);

  // 3. Encode Dictionary (addressList.length * 20 bytes)
  const dictBytes = new Uint8Array(addressList.length * 20);
  for (let i = 0; i < addressList.length; i++) {
    const cleanHex = addressList[i].replace(/^0x/, '');
    for (let b = 0; b < 20; b++) {
      dictBytes[i * 20 + b] = parseInt(cleanHex.substring(b * 2, b * 2 + 2), 16);
    }
  }

  // 4. Encode Transactions
  const txByteChunks: Uint8Array[] = [];
  for (const tx of txData) {
    const indices = new Uint8Array(4);
    const dv = new DataView(indices.buffer);
    dv.setUint16(0, tx.senderIdx, false);
    dv.setUint16(2, tx.toIdx, false);
    txByteChunks.push(indices);

    txByteChunks.push(encodeVarint(tx.nonce));
    txByteChunks.push(encodeVarint(tx.amount));
    txByteChunks.push(encodeVarint(tx.fee));
    txByteChunks.push(encodeVarint(tx.validUntil));

    // Signature (65 bytes)
    const sigBytes = new Uint8Array(65);
    const sigHex = tx.signature.padEnd(130, '0').slice(0, 130);
    for (let b = 0; b < 65; b++) {
      sigBytes[b] = parseInt(sigHex.substring(b * 2, b * 2 + 2), 16) || 0;
    }
    txByteChunks.push(sigBytes);
  }

  // Concatenate all buffers
  const totalLength =
    header.length +
    dictBytes.length +
    txByteChunks.reduce((acc, chunk) => acc + chunk.length, 0);

  const result = new Uint8Array(totalLength);
  let pos = 0;

  result.set(header, pos);
  pos += header.length;

  result.set(dictBytes, pos);
  pos += dictBytes.length;

  for (const chunk of txByteChunks) {
    result.set(chunk, pos);
    pos += chunk.length;
  }

  return result;
}

export function deserializeBatch(buffer: Uint8Array): DecodedBatch {
  if (buffer.length < 11) {
    throw new ProofPackError(ErrorCode.INVALID_PAYLOAD, 'Payload too short for batch header');
  }

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const magic = view.getUint16(0, false);
  if (magic !== PROTOCOL_CONSTANTS.MAGIC_BYTES) {
    throw new ProofPackError(ErrorCode.INVALID_PAYLOAD, `Invalid magic bytes: 0x${magic.toString(16)}`);
  }

  const version = view.getUint8(2);
  const batchId = view.getUint32(3, false);
  const txCount = view.getUint16(7, false);
  const dictCount = view.getUint16(9, false);

  let offset = 11;

  // Read dictionary
  const expectedDictLen = dictCount * 20;
  if (buffer.length < offset + expectedDictLen) {
    throw new ProofPackError(ErrorCode.INVALID_PAYLOAD, 'Truncated address dictionary');
  }

  const addresses: string[] = [];
  for (let i = 0; i < dictCount; i++) {
    const bytes = buffer.slice(offset, offset + 20);
    const hex = '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    addresses.push(getAddress(hex));
    offset += 20;
  }

  // Read transactions
  const transactions: DecodedBatch['transactions'] = [];
  for (let i = 0; i < txCount; i++) {
    if (offset + 4 > buffer.length) {
      throw new ProofPackError(ErrorCode.INVALID_PAYLOAD, `Truncated tx indices at index ${i}`);
    }

    const senderIdx = view.getUint16(offset, false);
    const toIdx = view.getUint16(offset + 2, false);
    offset += 4;

    if (senderIdx >= addresses.length || toIdx >= addresses.length) {
      throw new ProofPackError(ErrorCode.INVALID_PAYLOAD, 'Address index out of dictionary bounds');
    }

    const nonceRes = decodeVarint(buffer, offset);
    offset += nonceRes.bytesRead;

    const amountRes = decodeVarint(buffer, offset);
    offset += amountRes.bytesRead;

    const feeRes = decodeVarint(buffer, offset);
    offset += feeRes.bytesRead;

    const validUntilRes = decodeVarint(buffer, offset);
    offset += validUntilRes.bytesRead;

    if (offset + 65 > buffer.length) {
      throw new ProofPackError(ErrorCode.INVALID_PAYLOAD, `Truncated signature at tx index ${i}`);
    }

    const sigSlice = buffer.slice(offset, offset + 65);
    const sigHex = '0x' + Array.from(sigSlice).map(b => b.toString(16).padStart(2, '0')).join('');
    offset += 65;

    transactions.push({
      sender: addresses[senderIdx],
      to: addresses[toIdx],
      amount: amountRes.value.toString(),
      fee: feeRes.value.toString(),
      nonce: Number(nonceRes.value),
      validUntil: Number(validUntilRes.value),
      signature: sigHex
    });
  }

  return {
    version,
    batchId,
    transactions
  };
}

export function bufferToHex(buffer: Uint8Array): Hex {
  return ('0x' + Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('')) as Hex;
}

export function hexToBuffer(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const len = clean.length / 2;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    u8[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return u8;
}
