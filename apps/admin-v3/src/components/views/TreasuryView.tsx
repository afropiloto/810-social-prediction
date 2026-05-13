import React from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Share, Building2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';

const feeData = [
  { day: '01', fees: 1200 }, { day: '05', fees: 1800 },
  { day: '10', fees: 1400 }, { day: '15', fees: 2800 },
  { day: '20', fees: 3400 }, { day: '25', fees: 3100 },
  { day: '30', fees: 4500 }
];

export function TreasuryView() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-widest text-white mb-1 flex items-center gap-3">
            <Building2 className="text-[#C8FF00]" />
            Treasury & LP
          </h2>
          <p className="font-mono text-zinc-500 text-[10px] md:text-xs uppercase tracking-wide">HyperEVM Smart Contracts & Liquidity Routing</p>
        </div>
        <div className="bg-[#C8FF00]/10 border border-[#C8FF00]/30 px-4 py-2 rounded-md font-mono text-xs flex items-center space-x-3 text-[#C8FF00] w-full sm:w-auto justify-center sm:justify-start">
           <Wallet className="w-4 h-4" />
           <span>0x810...A9fC Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Value Locked" value="$14,284,500" trend="+4.2%" isPositive={true} />
        <MetricCard title="24h Volume (USDC)" value="$2,450,100" trend="-1.1%" isPositive={false} />
        <MetricCard title="Deployed AMM Liq." value="$8,950,000" trend="+0.5%" isPositive={true} />
        <MetricCard 
          title="Accrued Fees (Unclaimed)" 
          value="$142,850.50" 
          highlight 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-[#0c0c0c] border border-zinc-800 rounded-lg p-6 flex flex-col shadow-2xl relative overflow-hidden">
           <div className="flex items-center justify-between mb-6 relative z-10">
             <h3 className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Protocol Fee Generation (30D)</h3>
             <span className="font-mono text-xs text-[#C8FF00] bg-[#C8FF00]/10 px-2 py-1 rounded border border-[#C8FF00]/20">Cumulative: $24,500</span>
           </div>
           <div className="flex-1 min-h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feeData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8FF00" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#C8FF00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#27272a" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'monospace' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontFamily: 'monospace' }} tickFormatter={(val: number) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '4px', fontFamily: 'monospace', fontSize: '12px' }}
                  itemStyle={{ color: '#C8FF00' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Fees']}
                  labelStyle={{ color: '#a1a1aa' }}
                />
                <Area type="monotone" dataKey="fees" stroke="#C8FF00" strokeWidth={2} fillOpacity={1} fill="url(#colorFees)" />
              </AreaChart>
            </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-[#0c0c0c] border border-zinc-800 rounded-lg p-6 flex flex-col shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8FF00]/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-[#C8FF00]/10 transition-colors"></div>
           <h3 className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-6 relative z-10">Treasury Operations</h3>
           
           <div className="flex-1 flex flex-col items-center justify-center space-y-6 relative z-10">
              <div className="text-center space-y-2">
                 <p className="font-mono text-xs text-zinc-500 uppercase">Available to Withdraw</p>
                 <p className="text-4xl font-mono text-white tracking-tight">142,850.50 <span className="text-lg text-zinc-500">USDC</span></p>
              </div>
              
              <div className="w-full bg-[#111] p-4 rounded border border-zinc-900 text-center space-y-1">
                 <p className="font-mono text-[10px] text-zinc-500 uppercase">Destination Cold Wallet</p>
                 <p className="font-mono text-xs text-zinc-300 truncate font-bold text-[#C8FF00]">0x98A...b44E2</p>
              </div>

              <button className="w-full mt-auto bg-[#C8FF00] hover:bg-[#a6d600] text-black py-4 rounded font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(200,255,0,0.2)] hover:shadow-[0_0_25px_rgba(200,255,0,0.4)] relative overflow-hidden group/btn">
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform"></span>
                <Share className="w-4 h-4 relative z-10" />
                <span className="relative z-10">WITHDRAW TO COLD WALLET</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, isPositive, highlight }: { title: string, value: string, trend?: string, isPositive?: boolean, highlight?: boolean }) {
  return (
    <div className={cn(
      "p-5 rounded-lg border relative overflow-hidden",
      highlight ? "bg-[#C8FF00]/5 border-[#C8FF00]/30 shadow-[0_0_20px_rgba(200,255,0,0.05)]" : "bg-[#0c0c0c] border-zinc-800"
    )}>
      {highlight && <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8FF00]/10 blur-[40px] rounded-full pointer-events-none"></div>}
      <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-3 relative z-10">{title}</p>
      <div className="flex items-end justify-between relative z-10">
        <p className={cn("text-2xl font-mono font-bold tracking-tight", highlight ? "text-[#C8FF00]" : "text-white")}>{value}</p>
        
        {trend && (
          <div className={cn(
            "flex items-center space-x-1 font-mono text-[10px] px-2 py-0.5 rounded border",
            isPositive ? "text-[#C8FF00] bg-[#C8FF00]/10 border-[#C8FF00]/20" : "text-red-400 bg-red-400/10 border-red-400/20"
          )}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}
