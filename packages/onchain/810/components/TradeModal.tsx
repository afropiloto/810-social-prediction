'use client';

import { useState, useEffect } from 'react';
import { X, Delete, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePortfolio } from '@/context/PortfolioContext';

export default function TradeModal({ isOpen, onClose, market }: { isOpen: boolean, onClose: () => void, market: any }) {
  const { balance, addPosition, updateBalance } = usePortfolio();
  const [currentAmount, setCurrentAmount] = useState("1000");
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentAmount("1000");
      setSide("YES");
      setIsProcessing(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const odds = market ? (side === "YES" ? 100 / market.probability : 100 / (100 - market.probability)) : 2.4;
  const numValue = parseFloat(currentAmount) || 0;
  const payout = numValue * odds;
  const profit = payout - numValue;

  const updateAmount = (digit: string) => {
    if (currentAmount === "0" && digit !== ".") {
      setCurrentAmount(digit);
    } else {
      if (digit === "." && currentAmount.includes(".")) return;
      if (currentAmount.length >= 8) return;
      setCurrentAmount(prev => prev + digit);
    }
  };

  const deleteLast = () => {
    if (currentAmount.length <= 1) {
      setCurrentAmount("0");
    } else {
      setCurrentAmount(prev => prev.slice(0, -1));
    }
  };

  const handleTrade = () => {
    if (numValue > balance) {
        alert("Insufficient balance");
        return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      addPosition({
        id: Math.random().toString(),
        marketQuestion: market.question,
        side,
        amount: numValue,
        value: payout,
        timestamp: new Date().toISOString()
      });
      updateBalance(-numValue);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && market && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md h-[90vh] flex flex-col bg-bg rounded-t-3xl border-x border-t border-border shadow-2xl overflow-hidden"
          >
            {!isSuccess ? (
              <>
                {/* Header */}
                <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-bg">
                  <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 -ml-2 hover:bg-panel rounded-full transition-colors">
                      <X className="h-6 w-6 text-ink" />
                    </button>
                    <h1 className="text-xl font-bold text-ink">Place Bet</h1>
                  </div>
                  <div className="text-xs font-medium text-muted">
                    BAL: <span className="text-ink">{balance.toLocaleString()} USDT</span>
                  </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-bg">
                  {/* Market Card */}
                  <div className="bg-panel p-4 rounded-xl border border-border">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] uppercase tracking-widest text-accent font-bold">Prediction Market</span>
                      <span className="text-[10px] text-muted">{market.deadline}</span>
                    </div>
                    <h2 className="text-lg font-semibold leading-tight mb-4 text-ink">{market.question}</h2>
                    <div className="flex items-center gap-2">
                      <div className="flex bg-bg rounded-full p-1 border border-border">
                        <button 
                          onClick={() => setSide("YES")}
                          className={`px-4 py-1 rounded-full text-sm font-bold uppercase transition-colors ${side === "YES" ? "bg-accent text-black" : "text-muted hover:text-ink"}`}
                        >
                          Yes
                        </button>
                        <button 
                          onClick={() => setSide("NO")}
                          className={`px-4 py-1 rounded-full text-sm font-bold uppercase transition-colors ${side === "NO" ? "bg-accent text-black" : "text-muted hover:text-ink"}`}
                        >
                          No
                        </button>
                      </div>
                      <div className="text-muted text-sm italic ml-auto">Odds: {odds.toFixed(2)}x</div>
                    </div>
                  </div>

                  {/* Bet Input Display */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase text-muted font-bold ml-1">Your Bet Amount</label>
                    <div className="bg-panel border-2 border-accent p-6 rounded-xl flex flex-col items-center justify-center">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold tracking-tighter text-ink">
                          {numValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xl text-accent font-bold">USDT</span>
                      </div>
                    </div>
                  </div>

                  {/* Potential Return */}
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <p className="text-xs text-muted uppercase font-bold">Potential Payout</p>
                      <p className="text-2xl font-bold text-ink">
                        {payout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase font-bold text-accent">Profit</p>
                      <p className="text-lg font-bold text-accent">
                        +{profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                      </p>
                    </div>
                  </div>
                </main>

                {/* Number Pad Section */}
                <section className="bg-panel border-t border-border pb-safe">
                  <div className="grid grid-cols-3 gap-px bg-border">
                    {/* Row 1 */}
                    <button className="bg-bg py-6 text-2xl font-bold text-ink hover:bg-panel active:bg-accent active:text-black transition-colors" onClick={() => updateAmount('1')}>1</button>
                    <button className="bg-bg py-6 text-2xl font-bold text-ink hover:bg-panel active:bg-accent active:text-black transition-colors" onClick={() => updateAmount('2')}>2</button>
                    <button className="bg-bg py-6 text-2xl font-bold text-ink hover:bg-panel active:bg-accent active:text-black transition-colors" onClick={() => updateAmount('3')}>3</button>
                    {/* Row 2 */}
                    <button className="bg-bg py-6 text-2xl font-bold text-ink hover:bg-panel active:bg-accent active:text-black transition-colors" onClick={() => updateAmount('4')}>4</button>
                    <button className="bg-bg py-6 text-2xl font-bold text-ink hover:bg-panel active:bg-accent active:text-black transition-colors" onClick={() => updateAmount('5')}>5</button>
                    <button className="bg-bg py-6 text-2xl font-bold text-ink hover:bg-panel active:bg-accent active:text-black transition-colors" onClick={() => updateAmount('6')}>6</button>
                    {/* Row 3 */}
                    <button className="bg-bg py-6 text-2xl font-bold text-ink hover:bg-panel active:bg-accent active:text-black transition-colors" onClick={() => updateAmount('7')}>7</button>
                    <button className="bg-bg py-6 text-2xl font-bold text-ink hover:bg-panel active:bg-accent active:text-black transition-colors" onClick={() => updateAmount('8')}>8</button>
                    <button className="bg-bg py-6 text-2xl font-bold text-ink hover:bg-panel active:bg-accent active:text-black transition-colors" onClick={() => updateAmount('9')}>9</button>
                    {/* Row 4 */}
                    <button className="bg-bg py-6 text-xl font-bold text-ink hover:bg-panel active:bg-accent active:text-black transition-colors" onClick={() => updateAmount('.')}>.</button>
                    <button className="bg-bg py-6 text-2xl font-bold text-ink hover:bg-panel active:bg-accent active:text-black transition-colors" onClick={() => updateAmount('0')}>0</button>
                    <button className="bg-bg py-6 flex items-center justify-center text-ink hover:bg-panel active:bg-accent active:text-black transition-colors" onClick={deleteLast}>
                      <Delete className="h-6 w-6" />
                    </button>
                  </div>
                  
                  {/* Action Area */}
                  <div className="p-6 bg-bg">
                    <button 
                      onClick={handleTrade}
                      disabled={isProcessing || numValue <= 0}
                      className="w-full bg-accent hover:brightness-110 active:scale-[0.98] transition-all text-black font-black py-5 rounded-xl text-xl uppercase tracking-wider shadow-[0_0_20px_rgba(223,255,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? "Processing..." : "Confirm Bet"}
                    </button>
                  </div>
                </section>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-bg">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent/20">
                  <Check className="h-12 w-12 text-accent" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4 text-ink">Order Placed!</h2>
                <p className="font-medium text-muted mb-8">
                  You bought <span className="text-ink font-bold">{numValue.toLocaleString()} USDT</span> of <span className="text-accent font-bold">{side}</span>.
                </p>
                <div className="w-full space-y-3">
                  <button 
                    onClick={() => {
                        alert("Market order shared to socials!");
                    }}
                    className="w-full bg-accent hover:brightness-110 transition-colors text-black font-bold py-4 rounded-xl text-lg uppercase tracking-wider"
                  >
                    Amplify on Socials
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full bg-panel hover:bg-border transition-colors text-ink font-bold py-4 rounded-xl text-lg"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
