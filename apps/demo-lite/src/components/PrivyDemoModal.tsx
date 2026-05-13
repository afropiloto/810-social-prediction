import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

interface PrivyDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function PrivyDemoModal({ isOpen, onClose, onLoginSuccess }: PrivyDemoModalProps) {
  const { login, authenticated } = usePrivy();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-zinc-900 border border-white/10 rounded-3xl p-6 z-[201] shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>

            <div className="text-center mb-8 mt-2">
              <div className="w-16 h-16 bg-neon rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.3)]">
                <span className="text-black font-black italic text-4xl leading-none mt-1">8</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Log in or sign up</h2>
              <p className="text-zinc-400 text-sm">Welcome to 810.ONE</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={async () => {
                  await login();
                  if (authenticated) onLoginSuccess();
                  onClose();
                }}
                className="w-full bg-white text-black font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors disabled:opacity-70"
              >
                Continue
              </button>
            </div>

            <p className="text-zinc-500 text-xs text-center mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
