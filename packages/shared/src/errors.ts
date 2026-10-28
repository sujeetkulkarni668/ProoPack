export enum ErrorCode {
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  INVALID_NONCE = 'INVALID_NONCE',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  BATCH_FULL = 'BATCH_FULL',
  BATCH_TIMEOUT = 'BATCH_TIMEOUT',
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  DUPLICATE_TRANSACTION = 'DUPLICATE_TRANSACTION',
  UNAUTHORIZED_OPERATOR = 'UNAUTHORIZED_OPERATOR',
  SETTLEMENT_FAILED = 'SETTLEMENT_FAILED',
  PROOF_GENERATION_FAILED = 'PROOF_GENERATION_FAILED',
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  NETWORK_MISMATCH = 'NETWORK_MISMATCH',
  USER_REJECTED = 'USER_REJECTED'
}

export class ProofPackError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'ProofPackError';
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ProofPackError.prototype);
  }
}
