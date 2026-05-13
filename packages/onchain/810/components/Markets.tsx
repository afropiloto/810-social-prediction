'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Flame, TrendingUp, BarChart2, Share2, Copy, Check, X, ArrowUpRight, ArrowDownRight, Sparkles, BadgeDollarSign, Link as LinkIcon, Heart, ShieldCheck } from 'lucide-react';
import { useFavourites } from '@/hooks/useFavourites';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { MARKETS as MOCK_MARKETS } from '@/lib/mock-data';
import { placeBet } from '@/lib/api';
import { calculateProbability } from '@/lib/amm';

const CATEGORIES = ["All", "Trending Active", "OnlyFans", "Sports", "Fitness", "F1", "Gaming", "Tech", "Crypto", "Politics", "Music", "Beauty", "Fashion", "Movies", "Business", "Golf", "Tennis", "Food", "K-Pop", "Lifestyle"];

function MarqueeItem({ market, onClick }: { market: typeof MOCK_MARKETS[0], onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="group relative flex h-24 w-24 flex-none flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-bg transition-all hover:scale-105 hover:border-accent hover:shadow-lg"
      title={market.question}
    >
      {market.imageUrl && (
        <Image src={market.imageUrl} alt="" fill sizes="96px" className="object-cover opacity-80 transition-opacity group-hover:opacity-100" referrerPolicy="no-referrer" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      <div className="absolute bottom-2 left-1 right-1 text-center">
        <div className="truncate text-[10px] font-bold text-white mb-0.5 px-1">{market.creatorHandle}</div>
        <span className="font-mono text-[11px] font-bold text-success drop-shadow-md">{market.probability}% YES</span>
      </div>
    </button>
  );
}

export default function Markets({ onSelectMarket }: { onSelectMarket: (market: any) => void }) {
  const { favourites, toggleFavourite } = useFavourites();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  // Re-introducing for TradeModal
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [amplifyMarket, setAmplifyMarket] = useState<any>(null);
  const [cultureClubMarket, setCultureClubMarket] = useState<any>(null);
  const [markets, setMarkets] = useState<any[]>(MOCK_MARKETS);
  const [tickerSpeed] = useState(1); // pixels per frame

  useEffect(() => {
    const container = document.getElementById('marquee-scroll-container');
    if (!container) return;

    let animationFrameId: number;
    const animate = () => {
      if (!(container as any)._isPaused) {
        container.scrollLeft += tickerSpeed;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [tickerSpeed]);

  const filteredMarkets = useMemo(() => {
    let result = [...markets];
    
    if (activeCategory === "Trending Active") {
      result.sort((a, b) => {
        const valA = parseFloat(a.volume.replace(/[^0-9.]/g, "")) * (a.volume.includes('M') ? 1000000 : 1000);
        const valB = parseFloat(b.volume.replace(/[^0-9.]/g, "")) * (b.volume.includes('M') ? 1000000 : 1000);
        return valB - valA;
      });
    } else if (activeCategory !== "All") {
      result = result.filter(m => m.category === activeCategory);
    }

    if (searchQuery) {
      result = result.filter(m => 
        m.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.target && m.target.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return result;
  }, [activeCategory, searchQuery, markets]);

  return (
    <div className="mb-8 space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-black p-8 md:p-12 lg:p-24">
        {/* Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-screen"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-network-connection-background-27898-large.mp4" type="video/mp4" />
        </video>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/20 to-bg"></div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-accent backdrop-blur-md">
            Amplify your attention value
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl">
            Predict the Hype, <br className="hidden md:block" />
            <span className="text-accent">Own the Attention.</span>
          </h1>
          <p className="mb-8 text-lg text-gray-300 md:text-xl max-w-2xl mx-auto">
            The world's first prediction market for social outcomes. Bet on viral moments, creator milestones, and internet culture.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button 
              onClick={() => document.getElementById('markets-grid')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-xl bg-accent px-8 py-4 font-bold text-black transition-all hover:opacity-90 active:scale-95 shadow-[0_0_30px_rgba(223,255,0,0.3)]"
            >
              Start Trading
            </button>
          </div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <div 
        id="marquee-scroll-container"
        className="marquee-container flex overflow-x-auto rounded-xl border border-border bg-panel py-4 thumb-scrollbar touch-pan-x"
        onScroll={(e) => {
          const container = e.currentTarget;
          const halfWidth = container.scrollWidth / 2;
          if (container.scrollLeft >= halfWidth) {
            container.scrollLeft -= halfWidth;
          } else if (container.scrollLeft <= 0) {
            container.scrollLeft += halfWidth;
          }
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as any)._isPaused = true;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as any)._isPaused = false;
        }}
        onTouchStart={(e) => {
          (e.currentTarget as any)._isPaused = true;
        }}
        onTouchEnd={(e) => {
          setTimeout(() => {
            (e.currentTarget as any)._isPaused = false;
          }, 1000);
        }}
      >
        <div className="flex shrink-0 items-center gap-4 pr-4">
          {[...markets, ...markets].map((market, i) => (
            <MarqueeItem key={`m-base-${i}`} market={market} onClick={() => onSelectMarket(market)} />
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-4 pr-4" aria-hidden="true">
          {[...markets, ...markets].map((market, i) => (
            <MarqueeItem key={`m-ref-${i}`} market={market} onClick={() => onSelectMarket(market)} />
          ))}
        </div>
      </div>

      <div id="markets-grid" className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Live Markets</h1>
          <p className="text-muted">Trade on social outcomes with verified data.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-panel pl-9 pr-4 text-sm outline-none focus:border-accent md:w-64"
            />
          </div>
          <button className="relative rounded-lg border border-border bg-panel p-2 hover:bg-border">
            <Flame className="h-5 w-5 text-muted" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent"></span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 thumb-scrollbar touch-pan-x">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-bold transition-all ${
              activeCategory === category
                ? "border-accent bg-accent text-black"
                : "border-border bg-panel text-muted hover:border-muted hover:text-ink"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {filteredMarkets.map(market => (
          <div key={market.id} className="relative h-full">
            <div onClick={() => onSelectMarket(market)} className="cursor-pointer h-full">
              <MarketCard market={market} onCultureClub={setCultureClubMarket} onTrade={() => setSelectedMarket(market)} />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavourite(market.id);
              }}
              className="absolute top-5 right-14 z-10 rounded-full bg-panel p-2 text-muted shadow-sm hover:bg-bg sm:right-16"
            >
              <Heart className={`h-4 w-4 ${favourites.includes(market.id) ? "fill-red-500 text-red-500" : "hover:text-red-500"}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setAmplifyMarket(market);
              }}
              className="absolute top-5 right-4 z-10 rounded-full bg-panel p-2 text-muted shadow-sm hover:bg-bg hover:text-accent sm:right-6"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <AmplifyModal market={amplifyMarket} isOpen={!!amplifyMarket} onClose={() => setAmplifyMarket(null)} />
      <CultureClubModal market={cultureClubMarket} isOpen={!!cultureClubMarket} onClose={() => setCultureClubMarket(null)} />
    </div>
  );
}

function MarketCard({ market, onCultureClub, onTrade }: { market: any, onCultureClub?: (market: any) => void, onTrade: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col gap-4 rounded-xl border border-border bg-panel p-5 transition-all hover:border-muted hover:shadow-lg h-full"
    >
      {market.creatorPool && (
        <div className="absolute -top-3 -right-3 z-20">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onCultureClub?.(market);
            }}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg hover:scale-105 transition-transform"
          >
            <Sparkles className="h-3 w-3" />
            Culture Club Claim {market.creatorPool.toLocaleString()} USDT
          </button>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted">
          {market.isHot && (
            <span className="flex items-center gap-1 text-warning">
              <Flame className="h-3 w-3" /> Hot
            </span>
          )}
          <span>{market.metric}</span>
        </div>
      </div>

      <div className="flex gap-4">
        {market.imageUrl && (
          <div className="relative h-16 w-16 flex-none">
            {market.socialUrl ? (
              <a
                href={market.socialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block h-full w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={market.imageUrl}
                  alt="Market context"
                  fill
                  sizes="64px"
                  className="rounded-lg object-cover border border-border transition-opacity hover:opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-black ring-2 ring-panel">
                  <span className="text-[10px] font-bold">@</span>
                </div>
              </a>
            ) : (
              <div className="relative block h-full w-full">
                <Image
                  src={market.imageUrl}
                  alt="Market context"
                  fill
                  sizes="64px"
                  className="rounded-lg object-cover border border-border"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-black ring-2 ring-panel">
                  <span className="text-[10px] font-bold">@</span>
                </div>
              </div>
            )}
          </div>
        )}
        <div>
          {(market.creatorHandle || market.targetPost) && (
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted">
              {market.creatorHandle && (
                <span className="font-bold text-accent hover:underline">{market.creatorHandle}</span>
              )}
              {market.creatorHandle && market.targetPost && <span>•</span>}
              {market.targetPost && <span>{market.targetPost}</span>}
            </div>
          )}
          <h3 className="text-lg font-medium leading-snug text-ink group-hover:text-accent transition-colors">
            {market.question}
          </h3>
          <p className="mt-1 text-sm text-muted">
            Target: <span className="font-mono text-ink">{market.target}</span>
          </p>
        </div>
      </div>

      {market.socialMetrics && (
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-bg p-3 text-xs">
          <div className="flex flex-col items-center gap-1">
            <span className="text-muted">Velocity</span>
            <span className="font-mono font-bold text-ink">{market.socialMetrics.velocity}/hr</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-l border-border">
            <span className="text-muted">Reposts</span>
            <span className="font-mono font-bold text-ink">{market.socialMetrics.reposts.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-l border-border">
            <span className="text-muted">Sentiment</span>
            <span className={`font-mono font-bold ${market.socialMetrics.sentiment > 50 ? "text-success" : "text-danger"}`}>
              {market.socialMetrics.sentiment}%
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4 mt-auto pt-2">
          {/* Deadline moved here */}
          <div className="font-mono text-xs text-muted text-right">
            {market.deadline}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-accent">Live: {(market.progress?.current || 0).toLocaleString()} {market.progress?.label || "Target"}</span>
              <span className="font-medium text-muted">Target: {(market.progress?.target || 0).toLocaleString()}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full bg-accent" style={{ width: `${Math.min(100, ((market.progress?.current || 0) / (market.progress?.target || 1)) * 100)}%` }}></div>
            </div>
          </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-success">YES</span>
            <span className="font-mono font-bold">{market.probability}%</span>
            <span className="font-medium text-danger">NO</span>
          </div>
          <div className="flex h-2 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full bg-success" style={{ width: `${market.probability}%` }}></div>
            <div className="h-full bg-danger" style={{ width: `${100 - market.probability}%` }}></div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-4 text-xs text-muted">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1" title="Total Trading Volume">
            <BarChart2 className="h-3 w-3" />
            <span className="font-mono">{market.volume}</span>
          </div>
          {market.attentionValue && (
            <div className="flex items-center gap-1 rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-500" title="Attention Value (Market Cap)">
              <Sparkles className="h-3 w-3" />
              <span className="font-mono font-bold">AV: ${market.attentionValue}</span>
            </div>
          )}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onTrade(); }} className="flex items-center gap-1 rounded-md bg-border px-2 py-1 font-medium text-ink transition-colors hover:bg-muted hover:text-white">
          Trade <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}

function TradeModal({ isOpen, onClose, market }: { isOpen: boolean, onClose: () => void, market: any }) {
  const [side, setSide] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState("100");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset state when modal opens/closes
  useMemo(() => {
    if (isOpen) {
      setIsProcessing(false);
      setIsSuccess(false);
      setAmount("100");
      setSide("YES");
    }
  }, [isOpen]);

  const prob = market ? (side === "YES" ? market.probability / 100 : 1 - market.probability / 100) : 0.5;
  const payout = market ? (parseFloat(amount || "0") / prob).toFixed(2) : "0.00";
  const roi = market ? (((parseFloat(payout) - parseFloat(amount || "0")) / parseFloat(amount || "0")) * 100).toFixed(0) : "0";

  const handleTrade = async () => {
    if (!market || !market.id) return;
    setIsProcessing(true);
    try {
      await placeBet(market.id, side, parseFloat(amount));
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      alert("Failed to place bet. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && market && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-panel p-6 shadow-2xl"
          >
            {!isSuccess ? (
              <>
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold leading-tight text-ink">{market.question}</h2>
                    <p className="mt-1 text-sm text-muted">
                      Target: <span className="font-mono text-ink">{market.target}</span>
                    </p>
                  </div>
                  <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-border hover:text-ink">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSide("YES")}
                    className={`relative flex flex-col items-center justify-center gap-1 rounded-xl border p-4 transition-all ${
                      side === "YES"
                        ? "border-success bg-success/10 text-success"
                        : "border-border bg-bg text-muted hover:border-muted"
                    }`}
                  >
                    <span className="text-sm font-bold uppercase tracking-wider">YES</span>
                    <span className="font-mono text-2xl font-bold">{market.probability}%</span>
                    <ArrowUpRight className={`absolute right-2 top-2 h-4 w-4 ${side === "YES" ? "opacity-100" : "opacity-0"}`} />
                  </button>
                  <button
                    onClick={() => setSide("NO")}
                    className={`relative flex flex-col items-center justify-center gap-1 rounded-xl border p-4 transition-all ${
                      side === "NO"
                        ? "border-danger bg-danger/10 text-danger"
                        : "border-border bg-bg text-muted hover:border-muted"
                    }`}
                  >
                    <span className="text-sm font-bold uppercase tracking-wider">NO</span>
                    <span className="font-mono text-2xl font-bold">{100 - market.probability}%</span>
                    <ArrowDownRight className={`absolute right-2 top-2 h-4 w-4 ${side === "NO" ? "opacity-100" : "opacity-0"}`} />
                  </button>
                </div>

                <div className="mb-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Amount</span>
                    <span className="flex items-center gap-1 text-ink">
                      <span className="h-3 w-3 rounded-full bg-accent"></span> 12,450.00 USDT
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-xs font-bold">USDT</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full rounded-xl border border-border bg-bg px-12 py-3 font-mono text-lg font-bold text-ink outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="mb-6 rounded-lg bg-bg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Potential Payout</span>
                    <span className="font-mono font-bold text-success">{payout} USDT</span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="text-muted">Return on Investment</span>
                    <span className="font-mono text-success">+{roi}%</span>
                  </div>
                </div>

                <button
                  onClick={handleTrade}
                  disabled={isProcessing || !amount || parseFloat(amount) <= 0}
                  className={`w-full rounded-xl py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                    side === "YES" ? "bg-success" : "bg-danger"
                  }`}
                >
                  {isProcessing ? "Processing..." : `Place ${side} Order`}
                </button>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="mb-6 flex justify-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                    <Check className="h-10 w-10 text-success" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold tracking-tight mb-4 text-ink">Order Placed!</h2>
                <p className="font-medium text-muted">
                  You bought <span className="text-ink font-bold">{amount} USDT</span> of <span className={side === "YES" ? "text-success font-bold" : "text-danger font-bold"}>{side}</span>.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AmplifyModal({ isOpen, onClose, market }: { isOpen: boolean, onClose: () => void, market: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!market) return;
    navigator.clipboard.writeText(`Check out this market on 810: ${market.question}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && market && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-panel p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold leading-tight text-ink">Amplify Outcome</h2>
                <p className="mt-1 text-sm text-muted">Drive attention to influence the market result.</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-1 text-muted hover:border hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 flex gap-4 rounded-lg border border-border bg-bg p-4">
              {market.imageUrl && (
                <div className="relative h-12 w-12 flex-none">
                  <Image src={market.imageUrl} alt="" fill sizes="48px" className="rounded-md object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              <div>
                <p className="font-medium text-ink line-clamp-2">{market.question}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" /> {market.socialMetrics?.reposts.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3" /> {market.socialMetrics?.likes.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg p-4 transition-all hover:border-accent hover:text-accent">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Share2 className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Share to X</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg p-4 transition-all hover:border-accent hover:text-accent">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <Share2 className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Discuss</span>
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <BadgeDollarSign className="h-4 w-4 text-accent" />
                <h3 className="text-sm font-bold text-accent">Proof of Amplification (PoA)</h3>
              </div>
              <p className="text-xs text-muted mb-3">
                Share your unique affiliate link. Earn <span className="font-bold text-ink">50% of trading fees</span> from users who join and trade via your link.
              </p>
              
              <div className="flex items-center gap-2">
                <a 
                    href={`https://810.app/m/${market.id}?ref=u_8x92f`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-xs font-mono text-muted hover:text-accent hover:border-accent"
                  >
                    <LinkIcon className="h-3 w-3" />
                    <span className="truncate">810.app/m/{market.id}?ref=u_8x92f</span>
                  </a>
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-xs font-bold text-slate-950 hover:opacity-90 transition-opacity"
                >
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CultureClubModal({ isOpen, onClose, market }: { isOpen: boolean, onClose: () => void, market: any }) {
  return (
    <AnimatePresence>
      {isOpen && market && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-panel p-6 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
            
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold leading-tight text-ink flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  Culture Club Claim
                </h2>
                <p className="mt-1 text-sm text-muted">Verify your identity to claim the attention value generated by your content.</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-1 text-muted hover:border hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 rounded-xl border border-orange-500/20 bg-orange-500/5 p-6 text-center">
              <p className="text-sm text-orange-600/80 font-medium mb-1 uppercase tracking-wider">Culture Club Claim Pool</p>
              <div className="text-4xl font-mono font-black text-orange-500">
                {market.creatorPool.toLocaleString()} <span className="text-2xl">USDT</span>
              </div>
              <p className="text-xs text-muted mt-3">
                This market has generated <span className="font-bold text-ink">{market.attentionValue} AV</span> in total attention value. 1% of all trading volume is locked for the creator.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Are you the creator?</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-panel p-3 text-sm font-bold text-ink transition-all hover:border-accent hover:text-accent">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                      <BadgeDollarSign className="h-4 w-4" />
                    </div>
                    Join as Creator
                  </button>
                  <button className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-panel p-3 text-sm font-bold text-ink transition-all hover:border-success hover:text-success">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success">
                      <Heart className="h-4 w-4" />
                    </div>
                    Donate to Charity
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-lg bg-success/5 p-3 border border-success/20">
                <ShieldCheck className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed text-muted">
                  <strong className="text-success">Bank-Grade Security:</strong> Joining requires cryptographic proof of account ownership via OAuth 2.0 combined with a signed Web3 wallet transaction. Funds are secured in an audited, time-locked escrow smart contract to prevent spoofing and unauthorized withdrawals.
                </p>
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-border"></div>
                <span className="mx-4 flex-shrink-0 text-xs text-muted">OR</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Community Action</h3>
                <button 
                  onClick={() => {
                    const text = `Hey, you have ${market.creatorPool.toLocaleString()} USDT waiting to be claimed or donated to charity on @810app! 👇\n\n810.app/m/${market.id}`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-black transition-all hover:opacity-90"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  Tag Creator on X
                </button>
              </div>
            </div>
            
            <p className="mt-4 text-center text-[10px] text-muted">
              By interacting, you agree to the 810 Terms of Service.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
