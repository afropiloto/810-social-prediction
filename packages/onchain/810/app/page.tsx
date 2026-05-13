'use client';

import { useState } from 'react';
import { Menu, X, LayoutGrid, PieChart, Activity as ActivityIcon, Trophy, User, LogOut, Wallet } from 'lucide-react';
import Markets from '@/components/Markets';
import Portfolio from '@/components/Portfolio';
import Activity from '@/components/Activity';
import Leaderboard from '@/components/Leaderboard';
import Profile from '@/components/Profile';
import MarketDetail from '@/components/MarketDetail';
import LoginModal from '@/components/LoginModal';
import ThemeToggle from '@/components/ThemeToggle';

export default function App() {
  const [activeTab, setActiveTab] = useState("markets");
  const [activeMarket, setActiveMarket] = useState<any>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [following, setFollowing] = useState<string[]>([]);

  // Reset market when changing tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setActiveMarket(null);
  };

  const toggleWallet = () => {
    if (walletConnected) {
      setWalletConnected(false);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const toggleFollow = (id: string) => {
    setFollowing(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b border-border bg-bg/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2 lg:gap-8">
          <button onClick={() => { handleTabChange("markets"); }} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-accent text-black font-bold">8</div>
            <span className="font-mono font-bold tracking-tight hidden sm:inline-block">810</span>
          </button>
          
          {/* Desktop Nav */}
          <nav className="flex items-center gap-1">
            <NavItem icon={<PieChart />} label="Portfolio" active={activeTab === "portfolio"} onClick={() => handleTabChange("portfolio")} />
            <NavItem icon={<Trophy />} label="Leaderboard" active={activeTab === "leaderboard"} onClick={() => handleTabChange("leaderboard")} />
            <NavItem icon={<User />} label="Profile" active={activeTab === "profile"} onClick={() => handleTabChange("profile")} />
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {/* Wallet */}
          <div>
            {walletConnected ? (
              <div className="flex items-center gap-3">
                <div className="flex items-baseline gap-1 px-3 py-1.5 rounded-lg bg-panel border border-border">
                  <span className="text-sm font-mono font-bold">12,450.00 USDT</span>
                  <span className="text-[10px] text-success">+2.4%</span>
                </div>
                <button onClick={toggleWallet} className="p-2 rounded-lg text-muted hover:bg-danger/10 hover:text-danger transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button onClick={toggleWallet} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all bg-accent text-black hover:opacity-90">
                <Wallet className="h-4 w-4" /> Connect
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 lg:p-8 mt-16">
        {activeMarket ? (
          <MarketDetail market={activeMarket} onClose={() => setActiveMarket(null)} />
        ) : (
          <>
            {activeTab === "markets" && <Markets onSelectMarket={setActiveMarket} />}
            {activeTab === "portfolio" && <Portfolio />}
            {activeTab === "leaderboard" && <Leaderboard following={following} onToggleFollow={toggleFollow} />}
            {activeTab === "profile" && <Profile />}
          </>
        )}
      </main>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onConnect={() => {
          setWalletConnected(true);
          setIsLoginModalOpen(false);
        }} 
      />
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full lg:w-auto ${
        active ? "bg-panel text-ink" : "text-muted hover:bg-panel hover:text-ink"
      }`}
    >
      <span className="[&>svg]:h-5 [&>svg]:w-5 lg:[&>svg]:h-4 lg:[&>svg]:w-4">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
