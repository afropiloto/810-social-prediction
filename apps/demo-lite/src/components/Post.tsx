import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'motion/react';
import { Share2, MessageSquare, Bookmark, TrendingUp, TrendingDown, Clock, Activity, Repeat, Music, ThumbsUp, UserPlus, Link, Zap } from 'lucide-react';
import { Market, User } from '../types';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { CURRENCY } from '../config';
import { CommentsModal } from './CommentsModal';

interface PostProps {
  key?: string | number;

  market: Market;
  isActive: boolean;
  userPosition?: 'YES' | 'NO';
  onTradeClick: (position: 'YES' | 'NO') => void;
  onAmplify: (action: string) => void;
  onSwap: () => void;
  onSell?: () => void;
  onCreatorClick: (creator: User) => void;
  onClaimClick: (market: Market) => void;
}

export function Post({ market, isActive, userPosition, onTradeClick, onAmplify, onSwap, onSell, onCreatorClick, onClaimClick }: PostProps) {
  const [showAmplifyMenu, setShowAmplifyMenu] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showSwapConfirm, setShowSwapConfirm] = useState(false);
  const [showAmplifyEffect, setShowAmplifyEffect] = useState(false);
  const [liveVolume, setLiveVolume] = useState(market.volume);
  const [liveLiquidity, setLiveLiquidity] = useState(market.liquidity);
  const [tradeIndex, setTradeIndex] = useState(0);

  // Mock live trades for the ticker
  const mockTrades = [
    { user: '0x71...9F', action: 'bought 500 YES', time: 'Just now' },
    { user: '0x2A...4B', action: 'bought 120 NO', time: '2s ago' },
    { user: '0x9F...11', action: 'amplified this market', time: '5s ago' },
    { user: '0x44...8C', action: 'bought 1000 YES', time: '12s ago' },
    { user: '0x1B...22', action: 'bought 50 NO', time: '15s ago' }
  ];

  // Simulate live market activity
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setLiveVolume(v => v + Math.floor(Math.random() * 50));
      if (Math.random() > 0.7) {
        setLiveLiquidity(l => l + Math.floor(Math.random() * 20) - 10);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Cycle through live trades
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setTradeIndex(i => (i + 1) % mockTrades.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [isActive]);

  const handleAmplifyAction = (label: string) => {
    onAmplify(label);
    setShowAmplifyMenu(false);
    setShowAmplifyEffect(true);
    setTimeout(() => setShowAmplifyEffect(false), 2000);
  };

  // Swipe logic
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-8, 8]);
  const opacityYes = useTransform(x, [0, 50], [0, 1]);
  const opacityNo = useTransform(x, [0, -50], [0, 1]);
  const stampScaleYes = useTransform(x, [0, 50], [0.5, 1]);
  const stampScaleNo = useTransform(x, [0, -50], [0.5, 1]);
  const scale = useTransform(x, [-150, 0, 150], [0.98, 1, 0.98]);

  const handleDragEnd = (e: any, info: PanInfo) => {
    if (info.offset.x > 75) {
      onTradeClick('YES');
    } else if (info.offset.x < -75) {
      onTradeClick('NO');
    }
  };

  const progress = (market.currentValue / market.targetValue) * 100;
  const targetLink = market.contentUrl || (market as any).targetUrl || '';

  return (
    <div className="relative w-full h-full bg-black snap-start overflow-hidden">
      {/* Media Background - Draggable */}
      <motion.div 
        style={{ x, scale, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 cursor-grab active:cursor-grabbing will-change-transform" 
      >
        {/* Main Content Layer */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none aspect-[9/16]">
          <img src={market.imageUrl} alt="" referrerPolicy="no-referrer" loading="eager" className="w-full h-full object-cover" />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90 pointer-events-none" />

        {/* Swipe Overlays */}
        <motion.div style={{ opacity: opacityYes }} className="absolute inset-0 bg-neon/20 z-50 flex items-center justify-center pointer-events-none will-change-opacity">
          <motion.span style={{ scale: stampScaleYes }} className="text-6xl font-black text-neon rotate-12 border-8 border-neon p-6 rounded-3xl shadow-2xl bg-black/80 tracking-widest will-change-transform">YES</motion.span>
        </motion.div>
        <motion.div style={{ opacity: opacityNo }} className="absolute inset-0 bg-rose-500/20 z-50 flex items-center justify-center pointer-events-none will-change-opacity">
          <motion.span style={{ scale: stampScaleNo }} className="text-6xl font-black text-rose-500 -rotate-12 border-8 border-rose-500 p-6 rounded-3xl shadow-2xl bg-black/80 tracking-widest will-change-transform">NO</motion.span>
        </motion.div>
      </motion.div>

      {/* Amplify Visual Effect */}
      <AnimatePresence>
        {showAmplifyEffect && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1.5, 2, 1], opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none"
          >
            <div className="relative">
              <Zap className="w-32 h-32 text-neon fill-neon drop-shadow-[0_0_50px_rgba(204,255,0,0.8)]" />
              <motion.div 
                animate={{ scale: [1, 2], opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-4 border-neon"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creator Claim Pool Button */}
      <div className="absolute top-20 left-0 right-0 flex justify-center z-20 pointer-events-none">
        <button 
          onClick={(e) => { e.stopPropagation(); onClaimClick(market); }}
          className="bg-black/60 backdrop-blur-md border border-neon/50 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-black/80 transition-colors shadow-[0_0_15px_rgba(204,255,0,0.3)] pointer-events-auto group"
        >
          <span className="text-white text-xs font-medium">Are you @{market.creator.username}?</span>
          <span className="text-neon text-xs font-black tracking-wider group-hover:scale-110 group-hover:text-white transition-all duration-300">Culture Club Claim</span>
        </button>
      </div>

      {/* Right Side Actions (TikTok style) */}
      <div className="absolute right-2 bottom-32 flex flex-col items-center gap-6 z-30 pointer-events-auto pb-safe">
        <div className="relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); onCreatorClick(market.creator); }}>
          <img src={market.creator.avatar} alt="" referrerPolicy="no-referrer" className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-6 bg-neon rounded-full flex items-center justify-center border-2 border-black group-hover:scale-110 transition-transform">
            <UserPlus className="w-3.5 h-3.5 text-black" />
          </div>
        </div>

        <button className="flex flex-col items-center gap-1 group" onClick={(e) => e.stopPropagation()}>
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <Bookmark className="w-6 h-6 text-white group-hover:fill-neon group-hover:text-neon transition-colors" />
          </div>
          <span className="text-white/80 text-[10px] font-bold">12.4k</span>
        </button>

        <button className="flex flex-col items-center gap-1 group" onClick={(e) => { e.stopPropagation(); setShowCommentsModal(true); }}>
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <MessageSquare className="w-6 h-6 text-white group-hover:text-neon transition-colors" />
          </div>
          <span className="text-white/80 text-[10px] font-bold">4,192</span>
        </button>

        <button className="flex flex-col items-center gap-1 group" onClick={(e) => { e.stopPropagation(); setShowAmplifyMenu(true); }}>
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-black/60 transition-colors">
            <Share2 className="w-6 h-6 text-white group-hover:text-neon transition-colors" />
          </div>
          <span className="text-white/80 text-[10px] font-bold">Share</span>
        </button>

        {targetLink && (
          <a
            href={targetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 group"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center group-hover:bg-black/60 transition-colors">
              <Link className="w-6 h-6 text-white group-hover:text-neon transition-colors" />
            </div>
            <span className="text-white/80 text-[10px] font-bold">Open</span>
          </a>
        )}
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-20 left-0 right-16 p-4 z-20 pb-safe pointer-events-none">
        <div className="mb-4 pointer-events-auto">
          <p className="text-white font-black text-xl leading-tight drop-shadow-lg line-clamp-3">
            {market.question}
          </p>
        </div>

        {/* Live Trades Ticker */}
        <div className="mb-3 h-6 overflow-hidden relative pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={tradeIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
              <span className="text-white/70 font-mono">{mockTrades[tradeIndex].user}</span>
              <span className={mockTrades[tradeIndex].action.includes('YES') ? 'text-neon' : mockTrades[tradeIndex].action.includes('NO') ? 'text-rose-400' : 'text-white'}>
                {mockTrades[tradeIndex].action}
              </span>
              <span className="text-white/40 ml-auto">{mockTrades[tradeIndex].time}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Market Stats Card */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-auto">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-medium text-white/70 mb-1.5">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {market.currentValue.toLocaleString()} / {market.targetValue.toLocaleString()} {market.metricLabel}
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(market.endTime))} left
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-neon to-[#a3cc00] rounded-full"
              />
            </div>
          </div>

          {/* Trading Buttons */}
          <div className="flex gap-3">
            {!userPosition ? (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onTradeClick('NO'); }}
                  className="flex-1 bg-rose-500 hover:bg-rose-400 text-white py-4 rounded-xl font-black text-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                >
                  <TrendingDown className="w-5 h-5" /> NO
                </button>
                
                <button
                  onClick={(e) => { e.stopPropagation(); onTradeClick('YES'); }}
                  className="flex-1 bg-neon hover:bg-[#b3e600] text-black py-4 rounded-xl font-black text-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                >
                  <TrendingUp className="w-5 h-5" /> YES
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (showSwapConfirm) {
                      onSwap();
                      setShowSwapConfirm(false);
                    } else {
                      setShowSwapConfirm(true);
                      setTimeout(() => setShowSwapConfirm(false), 3000);
                    }
                  }}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold flex flex-col items-center justify-center transition-colors border",
                    showSwapConfirm
                      ? (userPosition === 'YES' 
                          ? "bg-rose-500 hover:bg-rose-400 text-white border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]" 
                          : "bg-neon hover:bg-[#b3e600] text-black border-neon shadow-[0_0_15px_rgba(204,255,0,0.3)]")
                      : (userPosition === 'YES'
                          ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/30"
                          : "bg-neon/10 hover:bg-neon/20 text-neon border-neon/30")
                  )}
                >
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                    <Repeat className="w-3 h-3 sm:w-4 sm:h-4" /> {showSwapConfirm ? `Swap to ${userPosition === 'YES' ? 'NO' : 'YES'}` : 'Swap Position'}
                  </div>
                </button>

                <button
                  onClick={(e) => { e.stopPropagation(); onSell?.(); }}
                  className="flex-1 py-3 rounded-xl font-bold flex flex-col items-center justify-center transition-colors border bg-zinc-800/80 hover:bg-zinc-700/80 text-white border-white/10"
                >
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-rose-400">
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4" /> Sell
                  </div>
                </button>
                
                <button
                  onClick={(e) => { e.stopPropagation(); setShowAmplifyMenu(true); }}
                  className="flex-1 bg-neon hover:bg-[#b3e600] text-black py-3 rounded-xl font-bold flex flex-col items-center justify-center transition-colors shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                >
                  <div className="flex items-center gap-1 text-[10px] sm:text-xs">
                    <Share2 className="w-3 h-3 sm:w-4 sm:h-4" /> Amplify
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Market Info */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10 text-[10px] text-white/50 font-medium uppercase tracking-wider">
            <motion.span 
              key={liveVolume}
              initial={{ color: '#ccff00' }}
              animate={{ color: 'rgba(255,255,255,0.5)' }}
              transition={{ duration: 1 }}
            >
              Vol: {(liveVolume / 1000).toFixed(1)}k {CURRENCY}
            </motion.span>
            <motion.span 
              key={liveLiquidity}
              initial={{ color: '#ccff00' }}
              animate={{ color: 'rgba(255,255,255,0.5)' }}
              transition={{ duration: 1 }}
            >
              Liq: {(liveLiquidity / 1000).toFixed(1)}k {CURRENCY}
            </motion.span>
            <span className="text-neon flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Amplify Modal */}
      <AnimatePresence>
        {showAmplifyMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={(e) => { e.stopPropagation(); setShowAmplifyMenu(false); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full bg-zinc-900 rounded-t-3xl p-6 border-t border-white/10 pb-safe"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Amplify Market</h3>
                <p className="text-sm text-zinc-400">Grow attention and earn affiliate rewards</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { id: 'listen', icon: Music, label: 'Listen' },
                  { id: 'like', icon: ThumbsUp, label: 'Like' },
                  { id: 'post', icon: MessageSquare, label: 'Post' },
                  { id: 'repost', icon: Repeat, label: 'Repost' },
                  { id: 'subscribe', icon: UserPlus, label: 'Subscribe' },
                  { id: 'share', icon: Link, label: 'Share' },
                ].map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleAmplifyAction(action.label)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-zinc-800/50 hover:bg-neon/20 hover:text-neon transition-colors border border-white/5 hover:border-neon/50 text-white"
                  >
                    <action.icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAmplifyMenu(false)}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-bold text-sm transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CommentsModal
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        marketId={market.id}
      />
    </div>
  );
}
