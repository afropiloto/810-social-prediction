import React, { useState, useEffect } from 'react';
import { Bot, AlertTriangle, CheckCircle, XCircle, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { apiFetch } from '../../lib/api';
// import { auth, db, handleFirestoreError, OperationType } from '../../lib/firebase';
// import { collection, query, where, onSnapshot, setDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface Market {
  id: string;
  status: string;
  question: string;
  platform?: string;
  metric?: string;
  targetUrl?: string;
  deadline?: string;
  createdAt?: string;
  totalVolume?: number;
}

export function PendingMarketsView({ getAccessToken }: { getAccessToken: () => Promise<string> }) {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('crypto');
  const [socialSite, setSocialSite] = useState('twitter');
  const [metric, setMetric] = useState('views');
  const [url, setUrl] = useState('');
  const [timeframe, setTimeframe] = useState('7');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingMarkets, setPendingMarkets] = useState<Market[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/api/markets');
        const j = (await res.json()) as any[];
        setPendingMarkets(
          (Array.isArray(j) ? j : []).map((m) => ({
            id: m.id,
            status: String(m.status || 'active'),
            question: String(m.question || ''),
            platform: m.platform,
            metric: m.metric,
            targetUrl: m.targetUrl,
            deadline: m.deadline,
            createdAt: m.createdAt,
            totalVolume: Number(m.totalVolume || 0),
          }))
        );
      } catch {
        setPendingMarkets([]);
      }
    })();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    try {
      const token = await getAccessToken();
      const draftRes = await apiFetch('/api/admin/markets/auto-draft', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({
          prompt,
          platform: socialSite,
          metric,
          timeframeDays: Number(timeframe || 7),
          targetUrl: url || undefined,
        }),
      });
      const draftJson = await draftRes.json();
      const draft = draftJson?.draft || {};

      await apiFetch('/api/admin/markets', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question: String(draft.question || prompt),
          platform: String(draft.platform || socialSite),
          metric: String(draft.metric || metric),
          targetUrl: draft.targetUrl || url || undefined,
          deadline: String(draft.deadline || `${timeframe}d`),
          currency: 'USDT',
        }),
      });

      const res = await apiFetch('/api/markets');
      const j = (await res.json()) as any[];
      setPendingMarkets(
        (Array.isArray(j) ? j : []).map((m) => ({
          id: m.id,
          status: String(m.status || 'active'),
          question: String(m.question || ''),
          platform: m.platform,
          metric: m.metric,
          targetUrl: m.targetUrl,
          deadline: m.deadline,
          createdAt: m.createdAt,
          totalVolume: Number(m.totalVolume || 0),
        }))
      );
      setPrompt('');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async (id: string, liquidity: number) => {
    console.log('Approve market', id, liquidity);
  };

  const handleReject = async (id: string) => {
    try {
      const token = await getAccessToken();
      await apiFetch(`/api/admin/markets/${id}/pause`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      });
      setPendingMarkets((prev) => prev.filter((m) => m.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-white mb-1 flex items-center gap-3">
            <Bot className="text-[#C8FF00]" />
            The AI Factory
          </h2>
          <p className="font-mono text-zinc-500 text-[10px] md:text-xs uppercase tracking-wide">Automated Market Generation Queue</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-md font-mono text-xs flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
           <span className="text-zinc-500">Queue Depth:</span>
           <span className="text-[#C8FF00]">{pendingMarkets.length} Markets</span>
        </div>
      </div>

      <div className="bg-[#0c0c0c] border border-zinc-800 p-6 rounded-lg shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-4 mb-8">
         <div className="absolute top-0 left-0 w-64 h-64 bg-[#C8FF00]/5 blur-[80px] rounded-full pointer-events-none"></div>
         <div className="flex-1 relative z-10">
           <div className="flex justify-between items-center mb-2">
             <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Manual Market Injection</p>
             <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest">Ops: Tester</p>
           </div>
           <textarea 
             value={prompt}
             onChange={(e) => setPrompt(e.target.value)}
             placeholder="Title of market"
             className="w-full bg-[#111] border border-zinc-800 rounded p-4 text-sm text-zinc-300 focus:outline-none focus:border-[#C8FF00]/50 focus:ring-1 focus:ring-[#C8FF00]/50 min-h-[60px] resize-y font-mono placeholder-zinc-700"
             disabled={isGenerating}
           />
           <div className="grid grid-cols-4 gap-2">
             <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="bg-[#111] border border-zinc-800 rounded p-2 text-sm text-zinc-300 font-mono" />
             <input type="text" value={socialSite} onChange={(e) => setSocialSite(e.target.value)} placeholder="Social Site" className="bg-[#111] border border-zinc-800 rounded p-2 text-sm text-zinc-300 font-mono" />
             <input type="text" value={metric} onChange={(e) => setMetric(e.target.value)} placeholder="Metric" className="bg-[#111] border border-zinc-800 rounded p-2 text-sm text-zinc-300 font-mono" />
             <input type="number" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder="Days" className="bg-[#111] border border-zinc-800 rounded p-2 text-sm text-zinc-300 font-mono" />
             <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (optional)" className="col-span-4 bg-[#111] border border-zinc-800 rounded p-2 text-sm text-zinc-300 font-mono" />
           </div>
         </div>
         <div className="md:w-48 flex items-end relative z-10 mt-2 md:mt-0">
           <button 
             onClick={handleGenerate}
             disabled={!prompt.trim() || isGenerating}
             className="w-full bg-zinc-100 hover:bg-white disabled:opacity-50 disabled:hover:bg-zinc-100 text-black py-4 md:h-[100px] rounded font-bold uppercase tracking-wider text-sm flex flex-col items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
           >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate
                </>
              )}
           </button>
         </div>
      </div>

      <div className="space-y-6">
        {pendingMarkets.map((market) => (
          <div key={market.id} className="bg-[#0c0c0c] border border-zinc-800 p-6 rounded-lg shadow-2xl relative overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8FF00]/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-[#C8FF00]/10 transition-colors"></div>
            
            <div className="flex flex-col lg:flex-row gap-6 relative z-10">
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-mono text-xs text-[#C8FF00] bg-[#C8FF00]/10 px-2 py-0.5 rounded border border-[#C8FF00]/30">{market.id}</span>
                    <span className="font-mono text-xs text-zinc-500">
                      {new Date(market.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 leading-tight">{market.question}</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#111] border border-zinc-900/50 p-3 rounded">
                     <p className="font-mono text-[10px] text-zinc-500 uppercase mb-1">Target Entity</p>
                     <p className="font-mono text-sm text-zinc-300">Generic Entity</p>
                  </div>
                  <div className="bg-[#111] border border-zinc-900/50 p-3 rounded">
                     <p className="font-mono text-[10px] text-zinc-500 uppercase mb-1">Toxicity Score</p>
                     <div className="flex items-center space-x-2">
                       <AlertTriangle className="w-4 h-4 text-amber-500" />
                       <p className="font-mono text-sm font-bold text-amber-500">
                         15/100
                       </p>
                     </div>
                  </div>
                  <div className="bg-[#111] border border-zinc-900/50 p-3 rounded">
                     <p className="font-mono text-[10px] text-zinc-500 uppercase mb-1">Hype Score</p>
                     <p className="font-mono text-sm font-bold text-[#C8FF00]">88/100</p>
                  </div>
                  <div className="bg-[#111] border border-zinc-900/50 p-3 rounded">
                     <p className="font-mono text-[10px] text-zinc-500 uppercase mb-1">Suggested Liq.</p>
                     <p className="font-mono text-sm text-white">$5,000</p>
                  </div>
                </div>

                <div>
                   <p className="font-mono text-[10px] text-zinc-500 uppercase mb-1">Resolution Criteria</p>
                   <p className="text-sm text-zinc-400 bg-[#111] p-3 rounded border border-zinc-900/50 leading-relaxed font-mono">
                     {market.platform || 'social'} / {market.metric || 'metric'} {market.deadline ? `(${market.deadline})` : ''}
                   </p>
                </div>
              </div>

              <div className="lg:w-48 flex flex-col justify-end space-y-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-zinc-800 lg:pl-6">
                <button onClick={() => handleApprove(market.id, 5000)} className="w-full bg-[#C8FF00] hover:bg-[#a6d600] text-black py-4 rounded font-bold uppercase tracking-wider text-sm flex flex-col items-center justify-center gap-1 transition-colors shadow-[0_0_15px_rgba(200,255,0,0.2)] hover:shadow-[0_0_25px_rgba(200,255,0,0.4)]">
                   <CheckCircle className="w-5 h-5 mb-1" />
                   Approve & Deploy
                </button>
                <button onClick={() => handleReject(market.id)} className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white py-3 rounded font-bold uppercase tracking-wider text-xs border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center justify-center gap-2">
                   <XCircle className="w-4 h-4" />
                   Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        {pendingMarkets.length === 0 && (
          <div className="text-center py-12 text-zinc-500 font-mono text-sm uppercase tracking-widest border border-zinc-800 rounded-lg bg-[#0c0c0c]/50">
            No pending markets
          </div>
        )}
      </div>
    </div>
  );
}
