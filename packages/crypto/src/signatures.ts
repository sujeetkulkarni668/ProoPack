import {
  keccak256,
  encodePacked,
  recoverTypedDataAddress,
  Hex,
  Address,
  getAddress
} from 'viem';
import { EIP712_DOMAIN_NAME, EIP712_DOMAIN_VERSION, TransferPayload } from '@proofpack/shared';

export const TRANSFER_TYPES = {
  Transfer: [
    { name: 'sender', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'fee', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'validUntil', type: 'uint256' }
  ]
} as const;

export function getEIP712Domain(chainId: number, verifyingContract: Address) {
  return {
    name: EIP712_DOMAIN_NAME,
    version: EIP712_DOMAIN_VERSION,
    chainId,
    verifyingContract
  };
}

export function computeTransactionHash(
  payload: TransferPayload,
  chainId: number
): Hex {
  return keccak256(
    encodePacked(
      ['uint256', 'address', 'address', 'uint256', 'uint256', 'uint256', 'uint256'],
      [
        BigInt(chainId),
        getAddress(payload.sender),
        getAddress(payload.to),
        BigInt(payload.amount),
        BigInt(payload.fee),
        BigInt(payload.nonce),
        BigInt(payload.validUntil)
      ]
    )
  );
}

export function computeLeafHash(
  txHash: Hex,
  sender: Address,
  to: Address,
  amount: bigint,
  nonce: bigint
): Hex {
  return keccak256(
    encodePacked(
      ['bytes32', 'address', 'address', 'uint256', 'uint256'],
      [txHash, getAddress(sender), getAddress(to), amount, nonce]
    )
  );
}

export async function verifyTransferSignature(
  payload: TransferPayload,
  signature: Hex,
  chainId: number,
  verifyingContract: Address
): Promise<boolean> {
  try {
    const domain = getEIP712Domain(chainId, verifyingContract);
    const recovered = await recoverTypedDataAddress({
      domain,
      types: TRANSFER_TYPES,
      primaryType: 'Transfer',
      message: {
        sender: getAddress(payload.sender),
        to: getAddress(payload.to),
        amount: BigInt(payload.amount),
        fee: BigInt(payload.fee),
        nonce: BigInt(payload.nonce),
        validUntil: BigInt(payload.validUntil)
      },
      signature
    });

    return recovered.toLowerCase() === payload.sender.toLowerCase();
  } catch {
    return false;
  }
}
