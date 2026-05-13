'use client';

import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import Markets from '@/components/Markets';

export default function LandingPage() {
  const { scrollY } = useScroll();
  
  // Fade out and scale down the hero section as user scrolls
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const heroPointerEvents = useTransform(scrollY, [0, 100], ['auto', 'none']);

  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-accent selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md bg-bg/80 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-ink text-bg font-bold">8</div>
          <span className="font-mono text-xl font-bold tracking-tight">810</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          <a href="#markets" className="hover:text-ink transition-colors">Markets</a>
          <span className="text-muted/50 cursor-not-allowed">Creator Dashboard (Phase 2)</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link 
            href="/trading"
            className="rounded-full bg-accent px-6 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* Sticky Hero Section - Top 30% */}
      <div className="h-[40vh] md:h-[50vh] w-full">
        <motion.section 
          style={{ 
            opacity: heroOpacity, 
            scale: heroScale,
            pointerEvents: heroPointerEvents as any
          }}
          className="fixed top-0 left-0 right-0 h-[40vh] md:h-[50vh] pt-20 px-6 flex flex-col items-center justify-center text-center origin-top z-0"
        >
          <div className="max-w-4xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase mb-6"
            >
              Trade the <span className="text-accent">Culture</span>.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl md:text-3xl text-muted font-medium mb-10"
            >
              Borrow USDC against your conviction.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <Link 
                href="/trading"
                className="group flex items-center justify-center gap-2 rounded-full bg-ink px-10 py-5 text-xl font-bold text-bg hover:bg-accent hover:text-white transition-all shadow-xl"
              >
                Launch App <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </div>

      {/* Terminal Section - Bottom 70% */}
      <motion.section 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        className="relative z-10 bg-bg min-h-screen pt-8 pb-24"
      >
        <div className="px-4 md:px-6 max-w-7xl mx-auto">
            <div className="bg-panel rounded-2xl border border-border shadow-xl p-4 md:p-8">
              <Markets onSelectMarket={() => {}} />
            </div>
        </div>
      </motion.section>
    </div>
  );
}
