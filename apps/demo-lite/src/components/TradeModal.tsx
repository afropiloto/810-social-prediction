import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { Market } from '../types';
import { cn } from '../lib/utils';
import { CURRENCY } from '../config';

interface TradeModalProps {
  market: Market | null;
  initialPosition: 'YES' | 'NO' | null;
  balance: number;
  onClose: () => void;
  onTrade: (marketId: string, position: 'YES' | 'NO', amount: number) => void;
}

export function TradeModal({ market, initialPosition, balance, onClose, onTrade }: TradeModalProps) {
  const [position, setPosition] = useState<'YES' | 'NO'>(initialPosition || 'YES');
  const [amount, setAmount] = useState<string>('10');

  if (!market) return null;

  const amountNum = parseFloat(amount || '0');
  const fee = amountNum * 0.02;
  const amountAfterFee = amountNum - fee;
  const price = position === 'YES' ? market.yesPrice : market.noPrice;
  const shares = amountAfterFee / price;
  const potentialReturn = shares * 1; // payout is $1 per winning share
  const roi = amountNum > 0 ? ((potentialReturn - amountNum) / amountNum) * 100 : 0;
  const isInsufficient = amountNum > balance;

  const handleTrade = () => {
    if (!amount || isNaN(parseFloat(amount)) || amountNum <= 0 || isInsufficient) return;
    onTrade(market.id, position, parseFloat(amount));
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0.5, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: '100%', opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.8 }}
          className="w-full max-w-md relative overflow-hidden rounded-t-3xl sm:rounded-3xl border border-white/10 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img src={market.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-20 blur-xl scale-110" />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          <div className="relative z-10 p-6">
            <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Place Trade</h3>
              <p className="text-sm text-zinc-400 line-clamp-1">{market.question}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-400 mb-2">Amount ({CURRENCY})</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-4 text-3xl font-bold text-white focus:outline-none focus:border-neon/50 transition-colors"
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-between items-center mt-2 px-1">
              <span className="text-xs text-zinc-500">Balance: {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {CURRENCY}</span>
              {isInsufficient && <span className="text-xs text-rose-500 font-medium">Insufficient funds</span>}
            </div>
            <div className="flex gap-2 mt-3">
              {['5', '10', '20', '50', '100', 'Max'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset === 'Max' ? balance.toString() : preset)}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium text-zinc-300 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-black/30 rounded-2xl p-4 mb-3 border border-white/5">
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">Avg Price</span>
              <span className="text-white font-medium">{price.toFixed(2)} {CURRENCY}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">Fee (2%)</span>
              <span className="text-rose-400 font-medium">{fee.toFixed(2)} {CURRENCY}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-zinc-400">Shares</span>
              <span className="text-white font-medium">{shares.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/10">
              <span className="text-zinc-400">Potential Return</span>
              <div className="text-right">
                <span className="text-neon font-bold block">{potentialReturn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {CURRENCY}</span>
                <span className="text-neon/70 text-sm">{roi >= 0 ? '+' : ''}{roi.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="mb-6 text-[11px] text-zinc-400 leading-snug">
            Trades settle after market close. Payouts/claims are held for a <span className="text-white font-semibold">24h dispute window</span> (UMA).
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setPosition('YES')}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all",
                position === 'YES' 
                  ? "bg-neon text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]" 
                  : "bg-neon/10 text-neon hover:bg-neon/20"
              )}
            >
              <TrendingUp className="w-5 h-5" />
              YES
            </button>
            <button
              onClick={() => setPosition('NO')}
              className={cn(
                "flex-1 py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all",
                position === 'NO' 
                  ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]" 
                  : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
              )}
            >
              <TrendingDown className="w-5 h-5" />
              NO
            </button>
          </div>

          <button
            onClick={handleTrade}
            disabled={isInsufficient}
            className={cn(
              "w-full py-4 rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98]",
              isInsufficient ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" :
              position === 'YES' ? "bg-neon hover:bg-[#b3e600] text-black" : "bg-rose-500 hover:bg-rose-400 text-white"
            )}
          >
            {isInsufficient ? 'Insufficient Funds' : 'Confirm Trade'}
          </button>
        </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
