'use client';

import { ArrowLeft, MessageSquare, Send, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as motion from 'motion/react-client';

export default function MarketDetail({ market, onClose }: { market: any; onClose: () => void }) {
  const [comments, setComments] = useState([
    { id: 1, user: "Lee", text: "Looks like a solid bet." },
  ]);
  const [newComment, setNewComment] = useState("");
  const [compound, setCompound] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState(false);
  const [cashedOut, setCashedOut] = useState(false);
  const [userPosition, setUserPosition] = useState<'YES' | 'NO' | null>(null);
  
  const [orderBook, setOrderBook] = useState({
    asks: [
      { price: 0.65, size: 50 },
      { price: 0.64, size: 120 },
      { price: 0.63, size: 300 },
    ],
    bids: [
      { price: 0.62, size: 250 },
      { price: 0.61, size: 400 },
      { price: 0.60, size: 600 },
    ]
  });

  const [chartData, setChartData] = useState([
    { time: '10am', prob: 45 },
    { time: '12pm', prob: 50 },
    { time: '2pm', prob: 48 },
    { time: '4pm', prob: 55 },
    { time: '6pm', prob: 60 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate price/prob update
      setChartData(prev => [...prev.slice(1), { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), prob: Math.max(0, Math.min(100, prev[prev.length - 1].prob + (Math.random() - 0.5) * 10)) }]);
      
      // Simulate order book update
      setOrderBook(prev => ({
        asks: prev.asks.map(a => ({ ...a, size: Math.max(10, a.size + Math.floor((Math.random() - 0.5) * 50)) })),
        bids: prev.bids.map(b => ({ ...b, size: Math.max(10, b.size + Math.floor((Math.random() - 0.5) * 50)) }))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    setComments([...comments, { id: Date.now(), user: "You", text: newComment }]);
    setNewComment("");
  };

  const handleTrade = (outcome: string) => {
    console.log(`Placing trade for ${outcome}. Compound: ${compound}`);
    setUserPosition(outcome as 'YES' | 'NO');
    setPlacedOrder(true);
    setTimeout(() => setPlacedOrder(false), 3000);
  };

  const handleCashout = () => {
    setCashedOut(true);
    setUserPosition(null);
    setTimeout(() => setCashedOut(false), 3000);
  };


  return (
    <div className="space-y-6">
      <button onClick={onClose} className="flex items-center gap-2 text-muted hover:text-ink transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Markets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-panel p-6">
            <h1 className="text-3xl font-extrabold text-ink mb-2">{market.question}</h1>
            <p className="text-muted text-sm">{market.target}</p>
          </div>
          
          {/* Order Book, Chart Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-panel p-6">
               <h3 className="font-bold text-lg mb-4">Order Book</h3>
               <div className="space-y-1">
                 <div className="grid grid-cols-3 text-xs text-muted mb-2 font-medium uppercase tracking-wider"><span>Price</span><span>Size</span><span>Total</span></div>
                 {orderBook.asks.reduce((acc, order, i) => {
                   const cumulative = (acc[i-1]?.cumulative || 0) + order.size;
                   acc.push({ ...order, cumulative });
                   return acc;
                 }, [] as (typeof orderBook.asks[0] & {cumulative: number})[]).map((order, i) => (
                   <div key={`ask-${i}`} className="grid grid-cols-3 text-sm text-danger hover:bg-danger/10 p-1 rounded">
                     <span className="font-mono font-bold">{order.price.toFixed(2)}</span>
                     <span className="text-muted">{order.size}</span>
                     <span className="text-muted font-mono">{order.cumulative}</span>
                   </div>
                 ))}
                 <div className="py-2 text-center font-bold text-ink border-y border-border my-2">0.625</div>
                 {orderBook.bids.reduce((acc, order, i) => {
                   const cumulative = (acc[i-1]?.cumulative || 0) + order.size;
                   acc.push({ ...order, cumulative });
                   return acc;
                 }, [] as (typeof orderBook.bids[0] & {cumulative: number})[]).map((order, i) => (
                   <div key={`bid-${i}`} className="grid grid-cols-3 text-sm text-success hover:bg-success/10 p-1 rounded">
                     <span className="font-mono font-bold">{order.price.toFixed(2)}</span>
                     <span className="text-muted">{order.size}</span>
                     <span className="text-muted font-mono">{order.cumulative}</span>
                   </div>
                 ))}
               </div>
            </div>
            <div className="rounded-2xl border border-border bg-panel p-6">
               <h3 className="font-bold text-lg mb-4">Chart</h3>
               <div className="h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                     <XAxis dataKey="time" fontSize={12} />
                     <YAxis fontSize={12} />
                     <Tooltip />
                     <Line type="monotone" dataKey="prob" stroke="#f59e0b" strokeWidth={2} />
                   </LineChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="rounded-2xl border border-border bg-panel p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Comments</h3>
            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="border-b border-border py-2 text-sm">
                  <span className="font-bold">{c.user}:</span> {c.text}
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <input 
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  className="flex-1 bg-bg border border-border rounded-lg p-2 text-sm"
                  placeholder="Add a comment..."
                />
                <button onClick={handlePostComment} className="bg-accent text-black p-2 rounded-lg"><Send className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Trade */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-border bg-panel p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Trade Market</h2>
            
            {userPosition ? (
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 mb-6 text-center">
                <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Your Position</div>
                <div className="text-white font-black text-xl mb-3">{userPosition === 'YES' ? 'YES' : 'NO'} 🚀</div>
                <button 
                  onClick={() => handleTrade(userPosition === 'YES' ? 'NO' : 'YES')} 
                  className="w-full rounded-xl bg-orange-500 p-3 font-bold text-white hover:bg-orange-400"
                >
                  Swap to {userPosition === 'YES' ? 'NO' : 'YES'}
                </button>
              </div>
            ) : (
              <div className="flex gap-3 mb-6">
                <button 
                  onClick={() => setSelectedOutcome("YES")} 
                  className={`flex-1 rounded-2xl p-5 font-black border-2 transition-all ${selectedOutcome === "YES" ? "bg-emerald-500 text-white border-emerald-600 scale-[1.02]" : "bg-zinc-900 text-emerald-400 border-zinc-700 hover:bg-zinc-800"}`}
                >
                  <div className="text-[10px] tracking-widest uppercase opacity-70">Buy YES</div>
                  <div className="text-3xl">{market.probability + 2}%</div>
                </button>
                <button 
                  onClick={() => setSelectedOutcome("NO")} 
                  className={`flex-1 rounded-2xl p-5 font-black border-2 transition-all ${selectedOutcome === "NO" ? "bg-rose-500 text-white border-rose-600 scale-[1.02]" : "bg-zinc-900 text-rose-400 border-zinc-700 hover:bg-zinc-800"}`}
                >
                  <div className="text-[10px] tracking-widest uppercase opacity-70">Sell NO</div>
                  <div className="text-3xl">{100 - market.probability - 2}%</div>
                </button>
              </div>
            )}
            
            <div className="mb-4 flex items-center gap-2">
              <input type="checkbox" id="compound" checked={compound} onChange={e => setCompound(e.target.checked)} />
              <label htmlFor="compound" className="text-sm">Compound earnings</label>
            </div>
            
            <button onClick={() => handleTrade(selectedOutcome as string)} disabled={!selectedOutcome || placedOrder} className="w-full rounded-2xl bg-amber-400 p-5 font-black text-zinc-950 hover:bg-amber-300 disabled:opacity-50 uppercase tracking-widest text-lg shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              {placedOrder ? "Order Executed! 🚀" : selectedOutcome ? `Confirm ${selectedOutcome}` : "Pick a side"}
            </button>
            
            <button onClick={handleCashout} className="w-full mt-3 rounded-2xl bg-zinc-800 p-4 font-bold text-zinc-300 hover:bg-zinc-700 uppercase tracking-widest text-sm flex items-center justify-center gap-2">
              {cashedOut ? "Cashed Out! 💸" : <><Zap size={16}/> Cash Out Position</>}
            </button>
            
            <div className="mt-6 text-[10px] text-zinc-500 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
              Note: This is a frontend prototype. No real smart contract, fees, or slippage logic implemented.
            </div>

          </div>

          <div className="rounded-2xl border border-border bg-panel p-6">
            <h3 className="font-bold text-lg mb-4">Market & Claim Details</h3>
            <div className="space-y-3 text-sm text-muted">
              <p>This market tracks: <span className="text-ink font-medium">{market.target}</span></p>
              <div className="bg-bg p-3 rounded-lg border border-border">
                <p className="font-bold text-ink mb-1">If the claim resolves YES:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Creators can claim their portion of the locked pool using the "Culture Club Claim" interface.</li>
                  <li>Net attention value generated is unlocked and distributed.</li>
                  <li>Payouts are processed automatically via the audited smart contract.</li>
                </ul>
              </div>
              <p>Trading closes at: <span className="font-mono text-ink">{market.deadline}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

