import { PROTOCOL_CONSTANTS, CostAnalytics } from '@proofpack/shared';

/**
 * Calculates EVM calldata gas cost according to EIP-2028:
 * - 4 gas per zero byte
 * - 16 gas per non-zero byte
 */
export function calculateCalldataGas(data: Uint8Array): number {
  let gas = 0;
  for (let i = 0; i < data.length; i++) {
    gas += data[i] === 0 ? PROTOCOL_CONSTANTS.ZERO_BYTE_GAS : PROTOCOL_CONSTANTS.NON_ZERO_BYTE_GAS;
  }
  return gas;
}

/**
 * Compares direct L1 native transaction vs ProofPack compressed batch
 */
export function calculateCostMetrics(
  compressedPayload: Uint8Array,
  uncompressedByteSize: number,
  txCount: number,
  contractVerificationGas: number = 45000 // Gas for batch root update and verification
): CostAnalytics {
  // Baseline Direct L1 execution:
  // Each individual tx on L1 requires 21,000 base gas + signature verification (~3,000 gas) + transfer state update (~5,000 gas) = ~29,000 gas per tx
  const standardL1PerTx = 29000;
  const individualL1Gas = standardL1PerTx * txCount;

  // ProofPack L1 gas cost:
  // Base batch submission (21,000) + calldata gas + contract verification gas
  const calldataGas = calculateCalldataGas(compressedPayload);
  const totalBatchSettlementGas = PROTOCOL_CONSTANTS.BASE_TRANSACTION_GAS + calldataGas + contractVerificationGas;

  const proofPackAmortizedGas = Math.round(totalBatchSettlementGas / (txCount || 1));
  const gasSavingsPercentage = Number(
    (((individualL1Gas - totalBatchSettlementGas) / individualL1Gas) * 100).toFixed(2)
  );

  const compressionRatio = Number(
    ((1 - compressedPayload.length / (uncompressedByteSize || 1)) * 100).toFixed(2)
  );

  return {
    individualL1Gas,
    proofPackAmortizedGas,
    gasSavingsPercentage: Math.max(0, gasSavingsPercentage),
    compressionRatio: Math.max(0, compressionRatio),
    txsCount: txCount
  };
}
