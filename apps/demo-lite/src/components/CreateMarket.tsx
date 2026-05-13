import { useState } from 'react';
import { Upload, Link as LinkIcon, Calendar, Target, DollarSign, ShieldCheck, Video, CheckCircle2, ChevronLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { CURRENCY } from '../config';
import { Market } from '../types';

interface CreateMarketProps {
  onClose: () => void;
  onCreateMarket: (market: Partial<Market>) => void;
}

export function CreateMarket({ onClose, onCreateMarket }: CreateMarketProps) {
  const [promoSourceType, setPromoSourceType] = useState<'same' | 'upload'>('same');
  const [contentUrl, setContentUrl] = useState('');
  const [metricLabel, setMetricLabel] = useState('Views');
  const [targetValue, setTargetValue] = useState('');
  const [liquidity, setLiquidity] = useState('');

  const isValid = contentUrl.trim() !== '' && parseInt(targetValue) > 0 && parseInt(liquidity) > 0;

  const handleLaunch = () => {
    if (!isValid) return;
    onCreateMarket({
      contentUrl,
      metricLabel,
      targetValue: parseInt(targetValue) || 1000000,
      liquidity: parseInt(liquidity) || 1000,
      question: `Will this hit ${targetValue || '1,000,000'} ${metricLabel}?`
    });
  };

  return (
    <div className="h-[100dvh] bg-black text-white pb-24 pt-6 px-4 overflow-y-auto relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img src="https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80" alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover blur-3xl opacity-20 scale-110" />
      </div>
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight">Create Market</h1>
              <p className="text-zinc-400 text-xs mt-1">The gold standard of attention.</p>
            </div>
            <div className="bg-neon/10 border border-neon/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(204,255,0,0.15)]">
              <ShieldCheck className="w-4 h-4 text-neon" />
              <span className="text-neon text-[10px] font-bold uppercase tracking-wider">High AV Verified</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto pb-10 no-scrollbar">
          
          {/* Step 1: Target Content */}
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-neon/20 text-neon flex items-center justify-center font-bold text-xs">1</div>
              <h2 className="font-bold text-base">Target Content URL</h2>
            </div>
            <p className="text-zinc-400 text-xs mb-3">The external link to the content being measured (TikTok, YouTube, Spotify, etc.).</p>

            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://tiktok.com/@creator/video/..."
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50"
              />
            </div>
          </div>

          {/* Step 2: Promotional Video (Market Source) */}
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-neon/20 text-neon flex items-center justify-center font-bold text-xs">2</div>
              <h2 className="font-bold text-base">Market Source Video</h2>
            </div>
            <p className="text-zinc-400 text-xs mb-3">The video shown on the feed. Upload a custom challenge video, or just use the target content.</p>

            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setPromoSourceType('same')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-[10px] font-medium flex flex-col items-center justify-center gap-1 transition-colors",
                  promoSourceType === 'same' ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5"
                )}
              >
                <CheckCircle2 className="w-4 h-4" /> Use Target Content
              </button>
              <button
                onClick={() => setPromoSourceType('upload')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-[10px] font-medium flex flex-col items-center justify-center gap-1 transition-colors",
                  promoSourceType === 'upload' ? "bg-white/10 text-white" : "text-zinc-500 hover:bg-white/5"
                )}
              >
                <Video className="w-4 h-4" /> Upload Challenge
              </button>
            </div>

            <AnimatePresence mode="wait">
              {promoSourceType === 'upload' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-2 border-dashed border-neon/30 rounded-xl p-4 flex flex-col items-center justify-center text-neon/70 bg-neon/5 mt-2"
                >
                  <Upload className="w-6 h-6 mb-1" />
                  <p className="text-xs">Upload your promotional challenge video</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step 3: Prediction Details */}
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-neon/20 text-neon flex items-center justify-center font-bold text-xs">3</div>
              <h2 className="font-bold text-base">Market Details</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-zinc-400 mb-1 ml-1">Target Metric</label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <select 
                    value={metricLabel}
                    onChange={(e) => setMetricLabel(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50 appearance-none"
                  >
                    <option>Views</option>
                    <option>Likes</option>
                    <option>Streams</option>
                    <option>Followers</option>
                    <option>Sales</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1 ml-1">Threshold</label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    placeholder="1,000,000"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-zinc-400 mb-1 ml-1">Time Window</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <select className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50 appearance-none">
                      <option>24 Hours</option>
                      <option>48 Hours</option>
                      <option>7 Days</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: Liquidity */}
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-neon/20 text-neon flex items-center justify-center font-bold text-xs">4</div>
              <h2 className="font-bold text-base">Initial Liquidity</h2>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-zinc-400 mb-1 ml-1">Amount to seed ({CURRENCY})</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="number"
                  value={liquidity}
                  onChange={(e) => setLiquidity(e.target.value)}
                  placeholder="100"
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-neon/50"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-2 ml-1">Higher liquidity attracts more traders and increases your affiliate cut.</p>
            </div>
          </div>

          <button 
            onClick={handleLaunch}
            disabled={!isValid}
            className={cn(
              "w-full font-black text-lg py-4 rounded-2xl transition-all mt-4",
              isValid 
                ? "bg-neon hover:bg-[#b3e600] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]" 
                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            )}
          >
            Launch Market
          </button>
        </div>
      </div>
    </div>
  );
}
