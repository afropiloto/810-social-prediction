import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Zap, TrendingUp, Users, ArrowUpRight, BarChart3, Target } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

export function CultureClub() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/culture-metrics')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setData(data);
        } else {
          throw new Error('Empty data'); // Trigger catch
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Metrics fetch error, generating mock:', err);
        const mockCultureData = Array.from({ length: 7 }, (_, i) => ({
          day: `Day ${i + 1}`,
          attention: 500 + Math.random() * 1000
        }));
        setData(mockCultureData);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-white p-6">Loading culture metrics...</div>;

  return (
    <div className="w-full h-full bg-zinc-950 p-4 text-white overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-4xl font-black tracking-tighter italic mb-1">Culture Club</h1>
        <p className="text-neon text-sm font-bold uppercase tracking-widest pl-1">Live Analytics & Community</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: Zap, label: 'Attention', value: '1,100', delta: '+290', color: 'text-neon', bg: 'bg-neon/10' },
          { icon: TrendingUp, label: 'Growth', value: '+35.8%', delta: 'Active', color: 'text-white', bg: 'bg-white/5' },
          { icon: Users, label: 'Members', value: '4,281', delta: 'Trending', color: 'text-zinc-400', bg: 'bg-white/5' }
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            whileHover={{ rotate: i % 2 === 0 ? 1 : -1, scale: 1.01 }}
            className="bg-zinc-900 p-5 rounded-2xl border-2 border-white/5 shadow-lg relative"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-full`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-black/50 px-2 py-0.5 rounded-full border border-white/5">
                {stat.delta}
              </span>
            </div>
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <div className="flex items-baseline">
              <span className="text-3xl font-black tracking-tighter italic">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-zinc-900 p-5 rounded-2xl border-2 border-white/10 mb-6"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black italic tracking-tighter">Velocity</h2>
            <p className="text-sm text-zinc-500 font-bold uppercase tracking-wide">Culture spread over time</p>
          </div>
          <div className="bg-neon text-black font-black text-xs px-4 py-2 rounded-full animate-pulse">LIVE</div>
        </div>
        
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorAttention" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ccff00" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ccff00" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#555" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={10}
              />
              <YAxis 
                stroke="#555" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                itemStyle={{ color: '#ccff00', fontWeight: 'bold' }}
              />
              <Area 
                type="step" 
                dataKey="attention" 
                stroke="#ccff00" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorAttention)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
        <div className="bg-zinc-900 p-5 rounded-2xl border-2 border-white/5">
          <h3 className="text-lg font-black italic mb-4">Milestones</h3>
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-xl">
              <div className="flex justify-between mb-2 text-xs">
                <span className="font-black uppercase tracking-widest">Hype Threshold</span>
                <span className="text-neon font-black">73%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-neon w-[73%]" />
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-xl">
              <div className="flex justify-between mb-2 text-xs">
                <span className="font-black uppercase tracking-widest">Club Waitlist</span>
                <span className="text-neon font-black">90%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-neon w-[90%]" />
              </div>
            </div>
          </div>
        </div>
        
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="bg-neon p-6 rounded-2xl flex flex-col justify-between shadow-[0_0_20px_rgba(204,255,0,0.2)]"
        >
          <div>
            <h3 className="text-black font-black text-2xl mb-1 italic">Secure Access</h3>
            <p className="text-black/70 text-xs font-black uppercase tracking-wider">Claim your spot now</p>
          </div>
          <button className="w-full bg-black text-white py-3 rounded-xl font-black text-sm mt-6 hover:bg-zinc-800 transition-all uppercase tracking-widest">
            Claim Spot
          </button>
        </motion.div>
      </div>
    </div>
  );
}
