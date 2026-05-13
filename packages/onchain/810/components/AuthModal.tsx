'use client';

import { X, Mail, Wallet, Shield, Zap, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-muted hover:bg-panel hover:text-ink transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-black font-bold text-xl">
                8
              </div>
              <h2 className="mb-2 text-2xl font-bold text-ink">Join 810</h2>
              <p className="mb-6 text-sm text-muted">
                Trade on the culture. No crypto experience required.
              </p>

              <div className="space-y-3">
                {/* ERC-4337 Smart Wallet Login */}
                <button
                  onClick={() => {
                    onLogin();
                    onClose();
                  }}
                  className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-black transition-all hover:bg-gray-100"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>

                <button
                  onClick={() => {
                    onLogin();
                    onClose();
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-panel px-4 py-3.5 text-sm font-bold text-ink transition-all hover:border-accent hover:text-accent"
                >
                  <Mail className="h-5 w-5" />
                  Continue with Email
                </button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="mx-4 flex-shrink-0 text-xs text-muted">OR</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                <button
                  onClick={() => {
                    onLogin();
                    onClose();
                  }}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-transparent px-4 py-3.5 text-sm font-bold text-ink transition-all hover:bg-panel"
                >
                  <Wallet className="h-5 w-5" />
                  Connect Web3 Wallet
                </button>
              </div>
            </div>

            {/* ERC-4337 Explanation Footer */}
            <div className="bg-panel p-4 border-t border-border">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-ink">Powered by Smart Accounts</h4>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-muted">
                    Social login creates a secure, non-custodial ERC-4337 Smart Wallet. No seed phrases, gasless trading, and instant fiat on-ramps.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
