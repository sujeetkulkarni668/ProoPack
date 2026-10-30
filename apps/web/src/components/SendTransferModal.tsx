import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { submitTransaction } from '../services/api';
import { isAddress, parseUnits } from 'viem';

interface SendTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderAddress: string | null;
  chainId: number | null;
  onSignTransfer: (
    payload: {
      sender: string;
      to: string;
      amount: string;
      fee: string;
      nonce: number;
      validUntil: number;
    },
    chainId: number,
    verifyingContract: string
  ) => Promise<string>;
  onSuccess: () => void;
}

export const SendTransferModal: React.FC<SendTransferModalProps> = ({
  isOpen,
  onClose,
  senderAddress,
  chainId,
  onSignTransfer,
  onSuccess
}) => {
  const [to, setTo] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  const [amount, setAmount] = useState('0.1');
  const [fee, setFee] = useState('0.0001');
  const [nonce, setNonce] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultTxId, setResultTxId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderAddress) {
      setError('Please connect your BridgeKey or Web3 wallet first');
      return;
    }
    if (!isAddress(to)) {
      setError('Destination address is invalid');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setResultTxId(null);

      const targetChainId = chainId || 54635;
      const verifyingContract = '0x1111111111111111111111111111111111111111';

      // Amount in Wei (18 decimals)
      const amountWei = parseUnits(amount, 18).toString();
      const feeWei = parseUnits(fee, 18).toString();
      const validUntil = Math.floor(Date.now() / 1000) + 86400; // 24 hours valid

      const payload = {
        sender: senderAddress,
        to,
        amount: amountWei,
        fee: feeWei,
        nonce,
        validUntil
      };

      // 1. Request signature from BridgeKey / Injected wallet
      const signature = await onSignTransfer(payload, targetChainId, verifyingContract);

      // 2. Submit to ProofPack L2 Mempool
      const res = await submitTransaction({
        ...payload,
        signature
      });

      setResultTxId(res.transaction.txId);
      setNonce(prev => prev + 1);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0e1424] border border-slate-200 dark:border-mst-border rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-white transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-mst-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600 dark:text-brand-400" />
              <span>Submit ProofPack L2 Transfer</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
              Gasless off-chain authorization signed via BridgeKey
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resultTxId && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Transaction Queued in Mempool!</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-gray-400">
                Assigned deterministic TxID. Awaiting batch assembly and compression:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-black/40 font-mono text-[11px] break-all text-emerald-600 dark:text-emerald-400">
                {resultTxId}
              </div>
            </div>
          )}

          {/* Sender */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
              Sender Address (BridgeKey Wallet)
            </label>
            <input
              type="text"
              readOnly
              value={senderAddress || 'Not connected'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-xs font-mono text-slate-700 dark:text-gray-300 cursor-not-allowed"
            />
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
              Recipient Address (MST EVM)
            </label>
            <input
              type="text"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="0x..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Amount & Fee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
                Amount (MSTC)
              </label>
              <input
                type="text"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
                L2 Batch Fee (MSTC)
              </label>
              <input
                type="text"
                value={fee}
                onChange={e => setFee(e.target.value)}
                placeholder="0.0001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Nonce */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-gray-300 mb-1">
              Sequence Nonce
            </label>
            <input
              type="number"
              value={nonce}
              onChange={e => setNonce(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-brand-500"
            />
            <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1">
              Strict monotonically increasing counter to prevent replay attacks
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !senderAddress}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 disabled:opacity-50 text-gray-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing via BridgeKey...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Sign & Enqueue to L2 Mempool (0 L1 Gas)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendTransferModal;
