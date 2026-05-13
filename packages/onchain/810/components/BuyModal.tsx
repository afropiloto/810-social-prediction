'use client';

import { useState } from 'react';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

export default function BuyModal({ isOpen, onClose, onSuccess }: BuyModalProps) {
  const [amount, setAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleBuy = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess(parseFloat(amount));
        onClose();
      }, 2000);
    }, 2000);
  };

  const receivedAmount = (parseFloat(amount || '0') * 0.98).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-panel p-8 font-sans text-ink shadow-2xl">
        {!isSuccess ? (
          <>
            <div className="flex justify-between items-start mb-8 border-b border-border pb-4">
              <h2 className="text-xl font-bold tracking-tight">Fund Smart Wallet</h2>
              <button onClick={onClose} className="text-muted hover:text-ink transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted tracking-wider">You Pay USD</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg p-3 text-3xl font-bold focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="text-center font-bold text-muted text-sm uppercase tracking-wider">Conversion Gateway</div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted tracking-wider">You Receive USDT</label>
                <div className="text-3xl font-bold rounded-lg border border-border bg-bg p-3">{receivedAmount}</div>
              </div>

              <div className="rounded-lg bg-bg p-4 text-xs font-bold uppercase tracking-wider space-y-2 border border-border">
                <div className="flex justify-between text-muted">
                  <span>Processing Fee (2%)</span>
                  <span className="text-ink">${(parseFloat(amount || '0') * 0.02).toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleBuy}
                disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                className="w-full rounded-xl bg-accent text-black py-4 font-bold uppercase tracking-wider transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing Payment..." : `Buy ${receivedAmount} USDT`}
              </button>
            </div>

            <div className="mt-8 text-[10px] uppercase font-bold text-muted text-center tracking-wider">
              Secure Payment via Stripe Protocol
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle-2 text-success"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Success!</h2>
            <p className="font-medium text-muted">
              <span className="text-ink font-bold">{receivedAmount} USDT</span> has been added to your wallet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
