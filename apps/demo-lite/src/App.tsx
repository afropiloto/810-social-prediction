import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';
import { BottomNav } from './components/BottomNav';
import { Feed } from './components/Feed';
import { TradeModal } from './components/TradeModal';
import { ClaimModal } from './components/ClaimModal';
import { CultureClub } from './components/CultureClub';
import { Portfolio } from './components/Portfolio';
import { PrivyDemoModal } from './components/PrivyDemoModal';
import { EditProfileModal } from './components/EditProfileModal';
import { mockMarkets, currentUser, mockPositions } from './data/mock';
import { Market, Position, User } from './types';
import { cn } from './lib/utils';
import { CURRENCY } from './config';

function getOrCreateGuestId() {
  const key = '810_guest_id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = `guest_${Math.random().toString(16).slice(2)}_${Date.now()}`;
  localStorage.setItem(key, id);
  return id;
}

function getStoredReferral() {
  return localStorage.getItem('810_ref') || '';
}

function storeReferral(ref: string) {
  if (!ref) return;
  localStorage.setItem('810_ref', ref.toLowerCase());
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.focus();
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function App() {
  const { authenticated, login, logout, getAccessToken } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [selectedClaimMarket, setSelectedClaimMarket] = useState<Market | null>(null);
  const [initialPosition, setInitialPosition] = useState<'YES' | 'NO' | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [positions, setPositions] = useState<Position[]>(mockPositions);
  const [user, setUser] = useState(currentUser);
  const [viewingCreator, setViewingCreator] = useState<User | null>(null);
  const [exploreCategory, setExploreCategory] = useState('All');
  const [toast, setToast] = useState<{ message: string, type: 'default' | 'red' } | null>(null);
  const [affiliate, setAffiliate] = useState<{ code: string; claimable: number } | null>(null);
  
  useEffect(() => {
    fetch('/api/markets')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          if (data.length > 0) {
            setMarkets(data);
          } else {
            console.warn('API returned empty array. Falling back to mock markets.');
            setMarkets(mockMarkets);
          }
        } else {
          console.warn('API returned non-array data. Falling back to mock markets.');
          setMarkets(mockMarkets);
        }
      })
      .catch(err => {
        console.error("Failed to fetch markets, falling back to mock data:", err);
        setMarkets(mockMarkets);
      });
  }, []);
  const [isPrivyModalOpen, setIsPrivyModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  useEffect(() => {
    // Simulate loading time for splash screen - extended for content loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get('ref');
    if (ref) storeReferral(ref);
  }, []);

  const showToast = (msg: string, type: 'default' | 'red' = 'default') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const refreshAffiliate = async () => {
    const token = authenticated ? await getAccessToken() : null;
    const guestId = getOrCreateGuestId();
    const resp = await fetch('/api/affiliate/me', {
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        'x-guest-id': guestId,
      },
    });
    if (!resp.ok) return;
    const j = await resp.json();
    setAffiliate({ code: String(j?.code || ''), claimable: Number(j?.claimable || 0) });
  };

  const handleDeposit = () => {
    if (!authenticated) setIsPrivyModalOpen(true);
    else {
      showToast('Wallet funded successfully! (Demo)');
    }
  };

  useEffect(() => {
    if (authenticated) showToast('Logged in with Privy');
  }, [authenticated]);

  useEffect(() => {
    refreshAffiliate().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  useEffect(() => {
    (async () => {
      if (!authenticated) return;
      try {
        const token = await getAccessToken();
        // In MVP we don't strictly need wallet address; using Privy session id is fine.
        // But we keep a stable local "code" so share links work immediately after login.
        localStorage.setItem('810_wallet_code', `privy_${token.slice(0, 12)}`);
      } catch {
        // ignore
      }
    })();
  }, [authenticated, getAccessToken]);

  const claimAffiliate = async () => {
    const claimable = affiliate?.claimable || 0;
    if (claimable <= 0) return;
    const token = authenticated ? await getAccessToken() : null;
    const guestId = getOrCreateGuestId();
    const resp = await fetch('/api/affiliate/me/claim', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        'x-guest-id': guestId,
      },
      body: JSON.stringify({ amount: claimable }),
    });
    if (!resp.ok) {
      const j = await resp.json().catch(() => ({}));
      throw new Error(j?.error || 'Claim failed');
    }
    await refreshAffiliate();
  };

  const handleProfileUpdate = (updatedUser: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
    showToast('Profile updated!');
  };

  const filteredExploreMarkets = markets.filter(market => {
    if (exploreCategory === 'All') return true;
    return market.category === exploreCategory;
  });

  const handleTradeClick = (market: Market, position: 'YES' | 'NO') => {
    setSelectedMarket(market);
    setInitialPosition(position);
  };

  const handleTrade = async (marketId: string, position: 'YES' | 'NO', amount: number) => {
    const market = markets.find(m => m.id === marketId);
    if (!market) return;

    const fee = amount * 0.02;
    const amountAfterFee = amount - fee;
    const price = position === 'YES' ? market.yesPrice : market.noPrice;
    const shares = amountAfterFee / price;

    try {
      const token = authenticated ? await getAccessToken() : null;
      const guestId = getOrCreateGuestId();
      const referral = getStoredReferral();
      const resp = await fetch('/api/trade', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
          'x-guest-id': guestId,
          ...(referral ? { 'x-ref': referral } : {}),
        },
        body: JSON.stringify({
          marketId,
          side: position,
          amount,
          price,
          shares,
          currency: CURRENCY,
          clientTs: Date.now(),
        }),
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.error || 'Trade failed');
      }
    } catch (e: any) {
      showToast(e?.message || 'Trade failed', 'red');
      return;
    }

    setPositions(prev => {
      const existingPosIndex = prev.findIndex(p => p.marketId === marketId && p.position === position);
      
      if (existingPosIndex >= 0) {
        const existing = prev[existingPosIndex];
        const totalShares = existing.shares + shares;
        const totalCost = (existing.shares * existing.avgPrice) + (shares * price);
        const newAvgPrice = totalCost / totalShares;
        
        const newPositions = [...prev];
        newPositions[existingPosIndex] = {
          ...existing,
          shares: totalShares,
          avgPrice: newAvgPrice
        };
        return newPositions;
      }
      
      return [
        ...prev,
        { marketId, position, shares, avgPrice: price }
      ];
    });

    setUser(prev => ({
      ...prev,
      balance: prev.balance - amount
    }));
    
    showToast(`Successfully bought ${shares.toFixed(2)} shares of ${position} (Fee: ${fee.toFixed(2)} ${CURRENCY})`);
    refreshAffiliate().catch(() => {});
  };

  const handleAmplify = (market: Market, action: string) => {
    const guestId = getOrCreateGuestId();
    const myCode = authenticated ? (localStorage.getItem('810_wallet_code') || '') : guestId;
    const url = new URL(window.location.href);
    url.searchParams.set('ref', (myCode || guestId).toLowerCase());
    url.searchParams.set('m', market.id);
    const shareLink = url.toString();
    copyToClipboard(shareLink).then((ok) => {
      showToast(ok ? `${action} — link copied` : `${action} — copy failed`, ok ? 'default' : 'red');
    });
  };

  const handleSell = (market: Market) => {
    const pIndex = positions.findIndex(pos => pos.marketId === market.id);
    if (pIndex === -1) return;
    
    const p = positions[pIndex];
    const currentPrice = p.position === 'YES' ? market.yesPrice : market.noPrice;
    const positionValue = p.shares * currentPrice;
    const fee = positionValue * 0.02;

    let valueAfterFee = positionValue;
    let deductedFromBalance = false;

    if (user.balance >= fee) {
      deductedFromBalance = true;
    } else {
      valueAfterFee = positionValue - fee;
    }

    setUser(prev => ({ ...prev, balance: prev.balance + valueAfterFee - (deductedFromBalance ? fee : 0) }));
    setPositions(prev => prev.filter((_, idx) => idx !== pIndex));

    showToast(`Sold position for ${valueAfterFee.toFixed(2)} ${CURRENCY}! Fee: ${fee.toFixed(2)} ${CURRENCY}`, 'default');
  };

  const handleSwap = (market: Market) => {
    // Find the primary position to swap (prefer YES if both exist, or just the first one)
    const pIndex = positions.findIndex(pos => pos.marketId === market.id);
    if (pIndex === -1) return;
    
    const p = positions[pIndex];

    const currentPrice = p.position === 'YES' ? market.yesPrice : market.noPrice;
    const positionValue = p.shares * currentPrice;
    const fee = positionValue * 0.02;
    
    let deductedFromBalance = false;
    let valueAfterFee = positionValue;

    if (user.balance >= fee) {
      setUser(prev => ({ ...prev, balance: prev.balance - fee }));
      deductedFromBalance = true;
    } else {
      valueAfterFee = positionValue - fee;
    }

    const newPosition = p.position === 'YES' ? 'NO' : 'YES';
    const newPrice = newPosition === 'YES' ? market.yesPrice : market.noPrice;
    const finalNewShares = valueAfterFee / newPrice;

    setPositions(prev => {
      const newPositions = [...prev];
      newPositions[pIndex] = {
        ...p,
        position: newPosition,
        shares: finalNewShares,
        avgPrice: newPrice
      };
      
      // If there's already a position of the new type, we should ideally merge them,
      // but for simplicity we'll just update this one. 
      // Let's do a quick merge if the other position exists.
      const existingOtherIndex = newPositions.findIndex((pos, idx) => idx !== pIndex && pos.marketId === market.id && pos.position === newPosition);
      if (existingOtherIndex >= 0) {
        const other = newPositions[existingOtherIndex];
        const totalShares = other.shares + finalNewShares;
        const totalCost = (other.shares * other.avgPrice) + (finalNewShares * newPrice);
        newPositions[existingOtherIndex] = {
          ...other,
          shares: totalShares,
          avgPrice: totalCost / totalShares
        };
        // Remove the old swapped position
        newPositions.splice(pIndex, 1);
      }
      
      return newPositions;
    });

    showToast(`Panic Swapped! Fee: ${fee.toFixed(2)} ${CURRENCY} ${deductedFromBalance ? '(from balance)' : '(from order)'}`, newPosition === 'NO' ? 'red' : 'default');
  };

  const handleLogout = () => {
    logout();
    setUser(currentUser); // Reset to initial mock user
    setPositions(mockPositions);
    showToast('Logged out successfully');
  };

  const handleCreatorClick = (creator: User) => {
    setViewingCreator(creator);
  };

  const handleCreateMarket = (newMarket: Partial<Market>) => {
    const market: Market = {
      id: `m${markets.length + 1}`,
      creator: {
        id: 'c_custom',
        username: newMarket.creator?.username || 'custom_creator',
        avatar: `https://unavatar.io/tiktok/${newMarket.creator?.username || 'custom_creator'}?fallback=https://picsum.photos/seed/custom/400/400`,
        balance: 0
      },
      marketCreator: user,
      contentUrl: newMarket.contentUrl || '',
      imageUrl: `https://picsum.photos/seed/${Math.random()}/800/1200`,
      contentType: 'video',
      question: newMarket.question || 'Will this happen?',
      metricLabel: newMarket.metricLabel || 'Views',
      currentValue: 0,
      targetValue: newMarket.targetValue || 1000000,
      endTime: newMarket.endTime || new Date().toISOString(),
      yesPrice: 0.5,
      noPrice: 0.5,
      volume: 0,
      liquidity: newMarket.liquidity || 1000,
      category: 'Lifestyle',
      whales: []
    };
    
    setMarkets(prev => [market, ...prev]);
    showToast('Market created successfully!');
    setActiveTab('home');
  };

  const closeCreatorProfile = () => {
    setViewingCreator(null);
  };

  return (
    <div className="fixed inset-0 bg-black text-white font-sans overflow-hidden selection:bg-neon/30">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80" alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-20 scale-110 blur-xl" />
            </div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="w-24 h-24 bg-neon rounded-2xl border-4 border-black shadow-[0_0_50px_rgba(204,255,0,0.5)] flex items-center justify-center mb-6">
                <span className="text-black font-black italic text-6xl leading-none mt-2">8</span>
              </div>
              <h1 className="text-4xl font-black tracking-widest text-white mb-2">810.ONE</h1>
              <p className="text-neon font-bold tracking-widest text-sm uppercase">Loading Culture...</p>
            </motion.div>
            
            <motion.div 
              className="absolute bottom-12 w-48 h-1 bg-white/10 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div 
                className="h-full bg-neon"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={cn(
              "fixed top-16 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-full font-bold text-sm whitespace-nowrap max-w-[90vw] overflow-hidden text-ellipsis text-center",
              toast.type === 'red' 
                ? "bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]" 
                : "bg-neon text-black shadow-[0_0_20px_rgba(204,255,0,0.4)]"
            )}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="absolute inset-0">
          {activeTab === 'home' && (
            <>
              <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-center pointer-events-none">
                <a href="https://810.one" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 pointer-events-auto hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-neon rounded-md border-2 border-black shadow-[1px_1px_0px_rgba(255,255,255,0.5)] flex items-center justify-center">
                    <span className="text-black font-black italic text-lg leading-none mt-0.5">8</span>
                  </div>
                  <span className="text-white font-black text-xl tracking-wider drop-shadow-md">810.ONE</span>
                </a>
                <div className="bg-black/50 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-auto">
                  <span className="text-zinc-400 text-xs font-medium">Balance</span>
                  <span className="text-neon font-bold">{user.balance.toFixed(2)} {CURRENCY}</span>
                </div>
              </div>
              <Feed 
                markets={markets} 
                positions={positions}
                onTradeClick={handleTradeClick} 
                onAmplify={handleAmplify} 
                onSwap={handleSwap}
                onSell={handleSell}
                onCreatorClick={handleCreatorClick}
                onClaimClick={(market) => setSelectedClaimMarket(market)}
              />
            </>
          )}
          
          {activeTab === 'markets' && (
            <div className="h-[100dvh] bg-black text-white pb-24 pt-12 px-4 overflow-y-auto">
              <h1 className="text-2xl font-bold mb-6">Explore Markets</h1>
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                {['All', 'Lifestyle', 'Music', 'Gaming', 'Sports', 'Entertainment'].map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => setExploreCategory(tag)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                      exploreCategory === tag ? "bg-neon text-black font-bold" : "bg-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                {filteredExploreMarkets.map(market => (
                  <div key={market.id} className="relative overflow-hidden rounded-2xl p-4 flex gap-4 border border-white/10 cursor-pointer group" onClick={() => handleTradeClick(market, 'YES')}>
                    <div className="absolute inset-0 aspect-[9/16]">
                      <img src={market.imageUrl} alt="" referrerPolicy="no-referrer" loading="eager" className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
                    </div>
                    <div className="relative z-10 flex gap-4 w-full items-center">
                      <img src={market.creator.avatar} alt="" referrerPolicy="no-referrer" loading="eager" className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-lg" />
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2 mb-2 text-white drop-shadow-md">{market.question}</p>
                        <div className="flex gap-2">
                          <div className="text-neon text-xs font-bold bg-neon/20 px-2 py-1 rounded backdrop-blur-md border border-neon/20">YES {market.yesPrice.toFixed(2)} {CURRENCY}</div>
                          <div className="text-rose-400 text-xs font-bold bg-rose-500/20 px-2 py-1 rounded backdrop-blur-md border border-rose-500/20">NO {market.noPrice.toFixed(2)} {CURRENCY}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'culture' && (
            <CultureClub />
          )}

          {activeTab === 'leaderboard' && (
            <div className="h-[100dvh] bg-black text-white pb-24 pt-12 px-4 overflow-y-auto">
              <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>
              <div className="space-y-4">
                {/* Mock Leaderboard Data */}
                {[
                   { rank: 1, name: 'CryptoKing', wlt: '80% W', amount: 54320 },
                   { rank: 2, name: 'WhaleSniper', wlt: '75% W', amount: 41200 },
                   { rank: 3, name: 'DegenTrader', wlt: '60% W', amount: 38900 },
                   { rank: 4, name: 'AlphaSeeker', wlt: '55% W', amount: 21500 },
                   { rank: 5, name: 'JustHodl', wlt: '50% W', amount: 15400 }
                ].map((lb) => (
                  <div key={lb.rank} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                      lb.rank === 1 ? "bg-[#FFD700] text-black" : 
                      lb.rank === 2 ? "bg-[#C0C0C0] text-black" : 
                      lb.rank === 3 ? "bg-[#CD7F32] text-black" : 
                      "bg-white/10 text-white"
                    )}>
                      {lb.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">{lb.name}</div>
                      <div className="text-xs text-zinc-400">{lb.wlt}</div>
                    </div>
                    <div className="font-bold text-neon">{lb.amount.toLocaleString()} {CURRENCY}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <Portfolio 
              user={user} 
              positions={positions} 
              markets={markets} 
              isAuthenticated={authenticated}
              onLoginRequest={() => login()}
              onBuyUSDT={handleDeposit} 
              onTradeClick={handleTradeClick}
              onEditProfile={() => setIsEditProfileModalOpen(true)}
              onLogout={handleLogout}
              affiliateClaimable={affiliate?.claimable || 0}
              onAffiliateClaim={async () => {
                try {
                  await claimAffiliate();
                  showToast('Affiliate claim queued');
                } catch (e: any) {
                  showToast(e?.message || 'Claim failed', 'red');
                }
              }}
            />
          )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      {/* Creator Profile Overlay */}
      <AnimatePresence>
        {viewingCreator && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[60] bg-black text-white overflow-y-auto pb-24"
          >
            {/* Blurred Creator Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img src={viewingCreator.avatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover blur-3xl opacity-20 scale-110" />
            </div>
            
            <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md p-4 flex items-center gap-4 border-b border-white/10">
              <button onClick={closeCreatorProfile} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-bold">Creator Profile</h2>
            </div>
            
            <div className="relative z-10 flex flex-col items-center mt-8 mb-8 px-4">
              <img src={viewingCreator.avatar} alt="" referrerPolicy="no-referrer" className="w-24 h-24 rounded-full border-4 border-zinc-800 mb-4" />
              <h1 className="text-2xl font-bold">@{viewingCreator.username}</h1>
              <p className="text-zinc-400 text-sm mt-1">{(viewingCreator as any).followers?.toLocaleString() || '1.2M'} Followers</p>
              
              <div className="flex gap-3 mt-4">
                <a 
                  href={`https://tiktok.com/@${viewingCreator.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-2 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors flex items-center justify-center"
                >
                  View Social
                </a>
                <button 
                  onClick={handleDeposit}
                  className="px-8 py-2 bg-neon text-black font-bold rounded-full hover:bg-[#b3e600] transition-colors shadow-[0_0_15px_rgba(204,255,0,0.3)]"
                >
                  Deposit
                </button>
              </div>
            </div>

            <div className="relative z-10 px-4 mb-8">
              <h3 className="font-bold mb-4 text-lg">Featured Challenge</h3>
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-white/10">
                <img 
                  referrerPolicy="no-referrer"
                  src={markets.find(m => m.creator.id === viewingCreator.id)?.imageUrl || viewingCreator.avatar} 
                  alt="Featured post" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-bold text-lg drop-shadow-md line-clamp-2">
                    {markets.find(m => m.creator.id === viewingCreator.id)?.question || 'New challenge coming soon!'}
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 px-4">
              <h3 className="font-bold mb-4 text-lg">Active Markets</h3>
              <div className="space-y-4">
                {markets.filter(m => m.creator.id === viewingCreator.id).map(market => (
                  <div key={market.id} className="relative overflow-hidden rounded-2xl p-4 flex gap-4 border border-white/10 cursor-pointer group" onClick={() => handleTradeClick(market, 'YES')}>
                    <div className="absolute inset-0">
                      <img src={market.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
                    </div>
                    <div className="relative z-10 flex gap-4 w-full items-center">
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-2 mb-2 text-white drop-shadow-md">{market.question}</p>
                        <div className="flex gap-2">
                          <div className="text-neon text-xs font-bold bg-neon/20 px-2 py-1 rounded backdrop-blur-md border border-neon/20">YES {market.yesPrice.toFixed(2)} {CURRENCY}</div>
                          <div className="text-rose-400 text-xs font-bold bg-rose-500/20 px-2 py-1 rounded backdrop-blur-md border border-rose-500/20">NO {market.noPrice.toFixed(2)} {CURRENCY}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trade Modal Overlay */}
      {selectedMarket && (
        <TradeModal
          market={selectedMarket}
          initialPosition={initialPosition}
          balance={user.balance}
          onClose={() => {
            setSelectedMarket(null);
            setInitialPosition(null);
          }}
          onTrade={handleTrade}
        />
      )}

      {/* Claim Modal Overlay */}
      {selectedClaimMarket && (
        <ClaimModal
          market={selectedClaimMarket}
          onClose={() => setSelectedClaimMarket(null)}
        />
      )}

      {/* Privy Demo Modal */}
      <PrivyDemoModal 
        isOpen={isPrivyModalOpen}
        onClose={() => setIsPrivyModalOpen(false)}
        onLoginSuccess={() => {}}
      />

      {/* Edit Profile Modal */}
      {isEditProfileModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditProfileModalOpen(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}
