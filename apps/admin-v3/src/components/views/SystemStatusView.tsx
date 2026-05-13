import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { cn } from '../../lib/utils';

export function SystemStatusView() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/status');
      const j = await res.json();
      setData(j);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-white mb-1 flex items-center gap-3">
            <Shield className="text-[#C8FF00]" />
            System Status
          </h2>
          <p className="font-mono text-zinc-500 text-[10px] md:text-xs uppercase tracking-wide">
            Backend connectivity, fee config, oracle reachability
          </p>
        </div>
        <button
          onClick={load}
          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-200 px-4 py-2 rounded-md font-mono text-xs uppercase tracking-widest flex items-center gap-2"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-[#0c0c0c] border border-red-500/30 rounded-lg p-4 font-mono text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatusCard title="Privy" ok={!!data?.privy?.configured} details={data?.privy?.configured ? 'configured' : 'missing keys'} />
        <StatusCard
          title="Firestore"
          ok={!!data?.firestore?.ok}
          details={
            data?.firestore?.ok
              ? `ok (${data?.firestore?.projectId || 'project'})`
              : data?.firestore?.configured
                ? 'configured but failing'
                : 'not configured'
          }
        />
        <StatusCard title="UMA/Optimism RPC" ok={!!data?.optimism?.ok} details={data?.optimism?.rpc || ''} />
        <StatusCard
          title="Hyperliquid Backbone"
          ok={!!data?.hyperliquid?.ok}
          details={`${data?.hyperliquid?.apiUrl || ''} ${data?.hyperliquid?.enabled ? '(enabled)' : '(disabled)'}`}
        />
        <div className="bg-[#0c0c0c] border border-zinc-800 rounded-lg p-5">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Fee config (bps)</p>
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <Row k="trade" v={data?.feesBps?.trade} />
            <Row k="protocol" v={data?.feesBps?.protocol} />
            <Row k="creator" v={data?.feesBps?.creator} />
            <Row k="clob/mm" v={data?.feesBps?.clobMm} />
            <Row k="affiliate" v={data?.feesBps?.affiliate} />
            <Row k="buffer" v={data?.feesBps?.bufferPool} />
          </div>
          <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mt-4">mode: {data?.env?.liquidityMode || '-'}</p>
        </div>
        <div className="bg-[#0c0c0c] border border-zinc-800 rounded-lg p-5">
          <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3">Wallet wiring</p>
          <div className="grid grid-cols-1 gap-2 font-mono text-xs">
            <Row k="order execution" v={data?.wallets?.orderExecutionWallet || '-'} />
            <Row k="payout wallet" v={data?.wallets?.payoutWallet || '-'} />
            <Row k="treasury wallet" v={data?.wallets?.treasuryWallet || '-'} />
            <Row k="admin allowlist" v={data?.wallets?.adminAllowlistCount} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({ title, ok, details }: { title: string; ok: boolean; details: string }) {
  return (
    <div className="bg-[#0c0c0c] border border-zinc-800 rounded-lg p-5 flex items-start gap-4">
      <div className={cn('mt-0.5', ok ? 'text-[#C8FF00]' : 'text-red-400')}>
        {ok ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold uppercase tracking-widest text-xs mb-1">{title}</p>
        <p className="font-mono text-[10px] text-zinc-500 break-all">{details}</p>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex items-center justify-between border border-zinc-800 bg-[#111] rounded px-3 py-2">
      <span className="text-zinc-400">{k}</span>
      <span className="text-white font-bold">{Number.isFinite(Number(v)) ? Number(v) : '-'}</span>
    </div>
  );
}

