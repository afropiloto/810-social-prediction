import { useState } from 'react';
import { User, Position, Market } from '../types';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, Loader2, CheckCircle2, History, BarChart3, Settings, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { CURRENCY } from '../config';

interface PortfolioProps {
  user: User;
  positions: Position[];
  markets: Market[];
  isAuthenticated: boolean;
  onLoginRequest: () => void;
  onBuyUSDT?: () => void;
  onTradeClick?: (market: Market, position: 'YES' | 'NO') => void;
  onEditProfile?: () => void;
  onLogout?: () => void;
  affiliateClaimable?: number;
  onAffiliateClaim?: () => void;
}

export function Portfolio({ 
  user, 
  positions, 
  markets, 
  isAuthenticated, 
  onLoginRequest, 
  onBuyUSDT, 
  onTradeClick,
  onEditProfile,
  onLogout,
  affiliateClaimable = 0,
  onAffiliateClaim
}: PortfolioProps) {
  const [withdrawState, setWithdrawState] = useState<'idle' | 'connecting' | 'success'>('idle');
  const [activeTab, setActiveTab] = useState<'positions' | 'history' | 'stats'>('positions');

  const handleWithdraw = () => {
    if (withdrawState !== 'idle') return;
    
    if (!isAuthenticated) {
      onLoginRequest();
      return;
    }

    setWithdrawState('connecting');
    // Simulate Privy connection and transaction
    setTimeout(() => {
      setWithdrawState('success');
      setTimeout(() => {
        setWithdrawState('idle');
      }, 3000);
    }, 2000);
  };

  const totalValue = positions.reduce((acc, pos) => {
    const market = markets.find(m => m.id === pos.marketId);
    if (!market) return acc;
    const currentPrice = pos.position === 'YES' ? market.yesPrice : market.noPrice;
    return acc + (pos.shares * currentPrice);
  }, 0);

  const totalCost = positions.reduce((acc, pos) => acc + (pos.shares * pos.avgPrice), 0);
  const totalPnL = totalValue - totalCost;
  const pnlPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return (
    <div className="h-[100dvh] bg-black text-white pb-24 pt-12 px-4 overflow-y-auto relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <img src={user.avatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover blur-3xl opacity-10 scale-110" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black tracking-tight tracking-tight">Portfolio</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={onEditProfile}
              className="p-2.5 bg-zinc-900 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
              title="Edit Profile"
            >
              <Settings className="w-4 h-4 text-zinc-400" />
            </button>
            {isAuthenticated && (
              <button 
                onClick={onLogout}
                className="p-2.5 bg-zinc-900 border border-white/10 rounded-full hover:bg-rose-500/20 transition-colors group"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-zinc-400 group-hover:text-rose-400" />
              </button>
            )}
          </div>
        </div>

        {/* User Profile Header */}
        <div className="flex items-center gap-5 mb-10 group cursor-pointer" onClick={onEditProfile}>
          <div className="relative">
            <img src={user.avatar} alt={user.username} referrerPolicy="no-referrer" className="w-20 h-20 rounded-full object-cover border-2 border-neon/30 shadow-[0_0_20px_rgba(204,255,0,0.2)]" />
            <div className="absolute bottom-0 right-0 bg-neon text-black p-1 rounded-full border-2 border-black">
              <Settings className="w-3 h-3" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black tracking-tight">@{user.username}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-zinc-400 text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono border border-white/5">
                {isAuthenticated ? '0x71C...976F' : '0x...'}
              </span>
              <span className="text-neon text-[10px] font-bold bg-neon/10 px-2 py-0.5 rounded uppercase tracking-wider">Creator</span>
            </div>
            {user.bio && <p className="text-zinc-500 text-xs mt-2 line-clamp-1">{user.bio}</p>}
          </div>
        </div>

        {/* Wallet Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-6 shadow-xl">
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-zinc-400 text-xs font-medium mb-1 uppercase tracking-wider">Available to Withdraw</p>
              <h2 className="text-3xl font-black text-white">{(user.balance * 0.8).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-lg text-zinc-500 font-medium">{CURRENCY}</span></h2>
            </div>
            <button 
              className={cn(
                "px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border",
                withdrawState === 'idle' ? "bg-white text-black border-white hover:bg-zinc-200" :
                withdrawState === 'connecting' ? "bg-zinc-800 text-white border-zinc-700 cursor-not-allowed" :
                "bg-neon text-black border-neon"
              )}
              onClick={handleWithdraw}
              disabled={withdrawState !== 'idle'}
            >
              {withdrawState === 'idle' && (
                <>
                  <Wallet className="w-3.5 h-3.5" />
                  {isAuthenticated ? 'Withdraw' : 'Connect to Withdraw'}
                </>
              )}
              {withdrawState === 'connecting' && (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Processing...
                </>
              )}
              {withdrawState === 'success' && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Sent
                </>
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between py-3 border-t border-white/5">
            <span className="text-zinc-500 text-xs font-medium">Pending Credit (2h buffer)</span>
            <span className="font-bold text-amber-400 text-sm">{(user.balance * 0.2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {CURRENCY}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-zinc-500 text-xs font-medium">Total Balance</span>
            <span className="font-bold text-white text-sm">{user.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {CURRENCY}</span>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
            <span className="text-zinc-500 text-xs font-medium">Affiliate claimable</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-neon text-sm">{affiliateClaimable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {CURRENCY}</span>
              <button
                onClick={onAffiliateClaim}
                disabled={affiliateClaimable <= 0}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-colors",
                  affiliateClaimable > 0
                    ? "bg-neon text-black border-neon hover:bg-[#b3e600]"
                    : "bg-zinc-800 text-zinc-500 border-white/10 cursor-not-allowed"
                )}
              >
                Claim
              </button>
            </div>
          </div>
        </div>

        {/* Overview Card */}
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 mb-8 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-zinc-400 text-xs font-medium mb-1 uppercase tracking-wider">Total Portfolio Value</p>
              <h2 className="text-2xl font-black">{(totalValue + user.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm text-zinc-500 font-medium">{CURRENCY}</span></h2>
            </div>
            <button 
              className="bg-neon text-black px-4 py-2 rounded-xl font-bold text-xs hover:bg-[#b3e600] transition-colors shadow-[0_0_10px_rgba(204,255,0,0.2)] flex items-center gap-1.5"
              onClick={onBuyUSDT}
            >
              <Wallet className="w-3.5 h-3.5" />
              Deposit
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold",
              totalPnL >= 0 ? "bg-neon/10 text-neon" : "bg-rose-500/10 text-rose-400"
            )}>
              {totalPnL >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              {Math.abs(totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {CURRENCY} ({Math.abs(pnlPercent).toFixed(2)}%)
            </div>
            <span className="text-zinc-500 text-xs font-medium">All time</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setActiveTab('positions')}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
              activeTab === 'positions' ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <TrendingUp className="w-4 h-4" />
            Positions
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
              activeTab === 'history' ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button 
            onClick={() => setActiveTab('stats')}
            className={cn(
              "flex-1 py-2 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2",
              activeTab === 'stats' ? "bg-white text-black shadow-md" : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <BarChart3 className="w-4 h-4" />
            Stats
          </button>
        </div>

        {activeTab === 'positions' && (
          <div className="space-y-4">
            {positions.map((pos, i) => {
          const market = markets.find(m => m.id === pos.marketId);
          if (!market) return null;

          const currentPrice = pos.position === 'YES' ? market.yesPrice : market.noPrice;
          const currentValue = pos.shares * currentPrice;
          const cost = pos.shares * pos.avgPrice;
          const pnl = currentValue - cost;
          const pnlPct = (pnl / cost) * 100;

          return (
            <div 
              key={i} 
              className="relative overflow-hidden border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-white/20 transition-colors"
              onClick={() => onTradeClick && onTradeClick(market, pos.position)}
            >
              <div className="absolute inset-0">
                <img src={market.imageUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/95" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start gap-3 mb-4">
                  <img src={market.creator.avatar} alt="" referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  <div>
                    <p className="text-sm font-medium line-clamp-2 leading-snug drop-shadow-md">{market.question}</p>
                    <p className="text-xs text-zinc-400 mt-1">Ends in 24h</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      {pos.position === 'YES' ? (
                        <span className="bg-neon/20 text-neon text-[10px] font-bold px-1.5 py-0.5 rounded uppercase backdrop-blur-md border border-neon/20">Yes</span>
                      ) : (
                        <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase backdrop-blur-md border border-rose-500/20">No</span>
                      )}
                      <span className="text-zinc-400 text-xs">{pos.shares.toFixed(0)} shares</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-zinc-500 text-xs">Avg: </span>
                      <span className="font-medium text-white/90">{pos.avgPrice.toFixed(2)}</span>
                      <span className="text-zinc-500 mx-1">→</span>
                      <span className="font-medium text-white">{currentPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-base text-white drop-shadow-md">{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-zinc-400">{CURRENCY}</span></p>
                    <p className={cn(
                      "text-[10px] font-bold drop-shadow-md mt-0.5",
                      pnl >= 0 ? "text-neon" : "text-rose-400"
                    )}>
                      {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {CURRENCY} ({pnlPct.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        </div>
        )}

        {activeTab === 'history' && (
          <div className="text-center py-12 bg-zinc-900/30 rounded-3xl border border-white/5">
            <History className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No History Yet</h3>
            <p className="text-zinc-500 text-sm">Your resolved markets and trades will appear here.</p>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
              <p className="text-zinc-500 text-xs font-medium mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-white">68.4%</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
              <p className="text-zinc-500 text-xs font-medium mb-1">Markets Traded</p>
              <p className="text-2xl font-bold text-white">42</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
              <p className="text-zinc-500 text-xs font-medium mb-1">Total Volume</p>
              <p className="text-2xl font-bold text-white">12,450.00 <span className="text-sm text-zinc-500">{CURRENCY}</span></p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4">
              <p className="text-zinc-500 text-xs font-medium mb-1">Best Trade</p>
              <p className="text-2xl font-bold text-neon">+450.00 <span className="text-sm text-neon/50">{CURRENCY}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
