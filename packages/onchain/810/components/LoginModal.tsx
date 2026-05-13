'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, ShieldCheck, AlertCircle, Loader2, Download } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export default function LoginModal({ isOpen, onClose, onConnect }: LoginModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    
    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    
    // Use a microtask to avoid synchronous setState in effect lint error
    queueMicrotask(() => {
      setIsIOS(isIOSDevice);
      if (/mobile|android|iphone|ipad|ipod/.test(userAgent) && !isStandalone) {
        setShowInstallPrompt(true);
      }
    });
  }, []);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      onConnect();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-lg font-bold text-ink">Connect to 810</h2>
              <button onClick={onClose} className="rounded-full p-1 text-muted hover:bg-panel hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Google / ERC-4337 Option */}
              <div>
                <button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white p-4 text-sm font-bold text-black transition-all hover:bg-gray-100 disabled:opacity-70"
                >
                  {isConnecting ? (
                    <Loader2 className="h-5 w-5 animate-spin text-black" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  {isConnecting ? 'Connecting...' : 'Continue with Google'}
                </button>
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-success/5 p-3 border border-success/20">
                  <ShieldCheck className="h-4 w-4 flex-shrink-0 text-success mt-0.5" />
                  <p className="text-[10px] leading-relaxed text-muted">
                    <strong className="text-success">Smart Account (ERC-4337):</strong> Creates a secure, gasless Web3 wallet using your Google account. No seed phrases required. Perfect for new users.
                  </p>
                </div>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-border"></div>
                <span className="mx-4 flex-shrink-0 text-xs font-bold uppercase tracking-wider text-muted">Or</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              {/* Web3 Wallet Option */}
              <div>
                <button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary p-4 text-sm font-bold text-ink transition-all hover:opacity-90 disabled:opacity-70"
                >
                  {isConnecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wallet className="h-5 w-5" />}
                  {isConnecting ? 'Connecting...' : 'Connect Web3 Wallet'}
                </button>
                <p className="mt-2 text-center text-[10px] text-muted">
                  For experienced users with MetaMask, Phantom, or WalletConnect.
                </p>
              </div>

              {/* Install App Notice (Mobile Only) */}
              {showInstallPrompt && (
                <div className="mt-6 rounded-lg border border-accent/20 bg-accent/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-accent/20 p-1.5">
                      <Download className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-accent">Install the 810 App</p>
                      <p className="mt-1 text-xs leading-relaxed text-accent/80">
                        For the best trading experience, install 810 directly to your phone.
                      </p>
                      {isIOS ? (
                        <div className="mt-3 rounded bg-ink/5 p-2 text-[10px] text-accent/90">
                          1. Tap the <strong>Share</strong> button at the bottom of Safari.<br/>
                          2. Scroll down and tap <strong>Add to Home Screen</strong>.
                        </div>
                      ) : (
                        <div className="mt-3 rounded bg-ink/5 p-2 text-[10px] text-accent/90">
                          1. Tap the <strong>Menu (⋮)</strong> in Chrome.<br/>
                          2. Tap <strong>Install App</strong> or <strong>Add to Home screen</strong>.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Deposit Notice */}
              <div className="mt-6 rounded-lg border border-orange-500/20 bg-orange-500/10 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-orange-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-orange-500">USDC & USDT Deposits Only</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-orange-500/80">
                      To maintain stable market pricing, 810 exclusively operates on USD-pegged stablecoins. Any other assets sent to your deposit address may be lost.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
