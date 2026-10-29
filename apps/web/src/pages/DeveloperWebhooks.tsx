import React, { useState, useEffect } from 'react';
import { Webhook, CheckCircle2, RotateCw, Copy, Check, Play, Send } from 'lucide-react';
import { WebhookEndpoint } from '../types';
import { fetchWebhooks } from '../services/api';

export const DeveloperWebhooksPage: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([]);
  const [supportedEvents, setSupportedEvents] = useState<Array<{ event: string; description: string }>>([]);
  const [testPayloadResult, setTestPayloadResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetchWebhooks().then(res => {
      setWebhooks(res.endpoints);
      setSupportedEvents(res.supportedEvents);
    });
  }, []);

  const handleSimulateWebhook = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setTestPayloadResult(
        JSON.stringify(
          {
            event: 'batch.settled',
            timestamp: Date.now(),
            data: {
              batchId: 4,
              txCount: 4,
              batchRoot: '0x3e18a2d1f953047a0...',
              settlementTxHash: '0xmock1a185ba83b...',
              chain: 'MST Coral Testnet (91562037)'
            },
            signature: 'sha256=4f2a7e9b01c38d5...'
          },
          null,
          2
        )
      );
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Webhook className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Event Webhooks & Push Notifications
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Real-time push delivery when batches settle, proofs are verified, or mempool transfers confirm
          </p>
        </div>

        <button
          onClick={handleSimulateWebhook}
          disabled={isSimulating}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-gray-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isSimulating ? 'Dispatching...' : 'Dispatch Test Webhook'}</span>
        </button>
      </div>

      {/* Configured Endpoints */}
      <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
          Configured Subscription Endpoints
        </h3>

        {webhooks.map(wh => (
          <div
            key={wh.id}
            className="p-4 rounded-2xl border border-slate-200 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/40 space-y-2 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-mono font-bold text-slate-900 dark:text-white break-all">
                {wh.url}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 self-start sm:self-auto">
                {wh.status} · {wh.successRate}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {wh.events.map(ev => (
                <span
                  key={ev}
                  className="px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                >
                  {ev}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Simulation Result */}
      {testPayloadResult && (
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulated Webhook Dispatch Delivered (HTTP 200 OK)</span>
            </span>
          </div>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
            {testPayloadResult}
          </pre>
        </div>
      )}

      {/* Supported Events Catalog */}
      <div className="rounded-3xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-[#111827] p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white">
          Supported Event Types
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-gray-800 text-xs">
          {supportedEvents.map(se => (
            <div key={se.event} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <code className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {se.event}
              </code>
              <span className="text-slate-500 dark:text-gray-400 text-right">
                {se.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
