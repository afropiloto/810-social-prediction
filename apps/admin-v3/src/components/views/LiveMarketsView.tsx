import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Power, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import { apiFetch } from '../../lib/api';
// import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
// import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

interface Market {
  id: string;
  title: string;
  status: string;
  volume: number;
  liquidity: number;
  yesPrice: number;
  noPrice: number;
}

export function LiveMarketsView({ getAccessToken }: { getAccessToken: () => Promise<string> }) {
  const [liveMarkets, setLiveMarkets] = useState<Market[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/markets');
        const j = (await res.json()) as any[];
        const mapped = (Array.isArray(j) ? j : []).map((m) => ({
          id: String(m.id),
          title: String(m.question || m.title || ''),
          status: String(m.status || 'live') === 'active' ? 'live' : String(m.status || 'halted'),
          volume: Number(m.totalVolume || 0),
          liquidity: Number(m.liquidity || 0),
          yesPrice: Number(m.yesPrice || 50),
          noPrice: Number(m.noPrice || 50),
        }));
        setLiveMarkets(mapped);
      } catch {
        setLiveMarkets([]);
      }
    })();
  }, []);

  const handleToggleHalt = async (market: Market) => {
    const token = await getAccessToken();
    await apiFetch(`/api/admin/markets/${market.id}/pause`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
    });
    setLiveMarkets((prev) =>
      prev.map((m) => (m.id === market.id ? { ...m, status: 'halted' } : m))
    );
  };

  const handleResolve = async (id: string, outcome: 'yes' | 'no') => {
    const token = await getAccessToken();
    await apiFetch(`/api/admin/markets/${id}/uma/assert`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ proposedOutcomeYes: outcome === 'yes', livenessSec: 86400 }),
    });
  };

  const activeCount = useMemo(() => liveMarkets.filter(m => m.status === 'live').length, [liveMarkets]);
  const haltedCount = useMemo(() => liveMarkets.filter(m => m.status === 'halted').length, [liveMarkets]);

  return (
    <div className="space-y-6 flex-1 flex flex-col h-full w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-white mb-1 flex items-center gap-3">
            <Activity className="text-[#C8FF00]" />
            The Trading Floor
          </h2>
          <p className="font-mono text-zinc-500 text-[10px] md:text-xs uppercase tracking-wide">Hyperliquid CLOB (HIP4) & Oracle UMA v3 Link</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-md font-mono text-xs flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-start shrink-0">
           <div className="flex items-center space-x-2">
             <div className="w-1.5 h-1.5 rounded-full bg-[#C8FF00] animate-pulse"></div>
             <span className="text-zinc-400">Total Active: <span className="text-white">{activeCount}</span></span>
           </div>
           <div className="flex items-center space-x-2">
             <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
             <span className="text-zinc-400">Halted: <span className="text-white">{haltedCount}</span></span>
           </div>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-zinc-800 rounded-lg flex-1 overflow-hidden flex flex-col shadow-2xl relative">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#111] border-b border-zinc-800 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Market ID</th>
                <th className="px-6 py-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Descriptor</th>
                <th className="px-6 py-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-right">24h Volume</th>
                <th className="px-6 py-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-right">LP Size</th>
                <th className="px-6 py-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-center">Odds Matrix</th>
                <th className="px-6 py-4 font-mono text-[10px] text-zinc-500 uppercase tracking-widest text-right">Overrides</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {liveMarkets.map((market) => (
                <tr key={market.id} className="hover:bg-zinc-900/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-[#C8FF00]">{market.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-200 text-sm max-w-[300px] truncate" title={market.title}>{market.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded border",
                      market.status === 'live' 
                        ? "text-[#C8FF00] border-[#C8FF00]/20 bg-[#C8FF00]/5" 
                        : "text-red-500 border-red-500/20 bg-red-500/5"
                    )}>
                      {market.status === 'live' ? 'Active' : 'Halted'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm text-zinc-300">${market.volume.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm text-zinc-400">${market.liquidity.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-2">
                       <span className="font-mono text-xs font-bold text-[#C8FF00] w-8 text-right">{market.yesPrice}%</span>
                       <div className="w-24 h-1.5 bg-rose-500/20 rounded-full overflow-hidden flex">
                          <div className="h-full bg-[#C8FF00]" style={{ width: `${market.yesPrice}%`}}></div>
                          <div className="h-full bg-rose-500" style={{ width: `${market.noPrice}%`}}></div>
                       </div>
                       <span className="font-mono text-xs font-bold text-rose-500 w-8">{market.noPrice}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-60 group-hover:opacity-100 transition-opacity">
                      {market.status === 'live' ? (
                        <button onClick={() => handleToggleHalt(market)} className="p-2 md:p-1.5 rounded hover:bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/30 transition-colors group/btn relative" title="Halt Market">
                          <Power className="w-4 h-4" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-zinc-800 text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-zinc-300 font-mono hidden md:block">Halt</span>
                        </button>
                      ) : (
                        <button onClick={() => handleToggleHalt(market)} className="p-2 md:p-1.5 rounded hover:bg-amber-500/10 text-amber-500 border border-transparent hover:border-amber-500/30 transition-colors group/btn relative" title="Resume Market">
                          <ShieldAlert className="w-4 h-4" />
                          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-zinc-800 text-xs px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-zinc-300 font-mono hidden md:block">Resume</span>
                        </button>
                      )}
                      <div className="w-px h-4 bg-zinc-800 mx-1 hidden sm:block"></div>
                      <button onClick={() => handleResolve(market.id, 'yes')} className="font-mono text-[10px] uppercase font-bold tracking-wider px-3 py-2 md:py-1.5 rounded border border-zinc-800 sm:border-transparent text-[#C8FF00] sm:hover:bg-[#C8FF00]/10 sm:hover:border-[#C8FF00]/30 transition-colors">
                        Res Yes
                      </button>
                      <button onClick={() => handleResolve(market.id, 'no')} className="font-mono text-[10px] uppercase font-bold tracking-wider px-3 py-2 md:py-1.5 rounded border border-zinc-800 sm:border-transparent text-rose-500 sm:hover:bg-rose-500/10 sm:hover:border-rose-500/30 transition-colors">
                        Res No
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {liveMarkets.length === 0 && (
            <div className="text-center py-12 text-zinc-500 font-mono text-sm uppercase tracking-widest">
              No active markets on the trading floor
            </div>
          )}
        </div>
        <div className="p-4 border-t border-zinc-900 bg-[#0a0a0a] flex justify-between items-center font-mono text-[10px] text-zinc-500">
          <div>Row Limit: <span className="text-zinc-300">100</span> / Page 1 of 5</div>
          <div className="flex gap-2 text-zinc-400">
             <button className="hover:text-white">&lt; Prev</button>
             <button className="hover:text-white">Next &gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
