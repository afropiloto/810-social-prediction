import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Share2, CheckCircle2, TrendingUp } from 'lucide-react';
import { Market } from '../types';
import { CURRENCY } from '../config';

interface ClaimModalProps {
  market: Market | null;
  onClose: () => void;
}

export function ClaimModal({ market, onClose }: ClaimModalProps) {
  if (!market) return null;

  const [creatorPool, setCreatorPool] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/markets/${market.id}/creator-pool`)
      .then((r) => r.ok ? r.json() : null)
      .then((j) => {
        if (cancelled) return;
        const v = Number(j?.creatorPoolAccrued);
        if (Number.isFinite(v)) setCreatorPool(v);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [market.id]);

  const creatorPoolText = (creatorPool ?? (market.volume * 0.05)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.8 }}
          className="w-full max-w-sm relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-zinc-900/90 backdrop-blur-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative z-10 p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-white mb-0.5">Culture Club Claim Pool</h3>
                <p className="text-xs text-zinc-400">Are you @{market.creator.username}?</p>
              </div>
              <button onClick={onClose} className="p-1.5 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-neon/10 border border-neon/20 rounded-2xl p-4 mb-5 text-center">
              <p className="text-zinc-400 text-xs mb-1">Unlock your Creator Pool</p>
                <p className="text-3xl font-black text-neon">{creatorPoolText} {CURRENCY}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold mb-0.5">1. Verify Identity</h4>
                  <p className="text-xs text-zinc-400 leading-snug">Connect your social account to prove you are @{market.creator.username}.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold mb-0.5">2. Join the Pool</h4>
                  <p className="text-xs text-zinc-400 leading-snug">Get exclusive access to the Culture Club Claim Pool.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold mb-0.5">3. Claim & Earn</h4>
                  <p className="text-xs text-zinc-400 leading-snug">Take control of this market, feature it on your profile, and earn fees.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold mb-0.5">4. Donate to Charity</h4>
                  <p className="text-xs text-zinc-400 leading-snug">Optional: Allocate a portion of your earnings to support verified causes.</p>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-black text-base bg-neon hover:bg-[#b3e600] text-black transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(204,255,0,0.3)]"
            >
              <CheckCircle2 className="w-5 h-5" />
              Claim Pool
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
