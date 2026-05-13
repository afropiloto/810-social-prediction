import { Home, TrendingUp, Briefcase, Zap, Trophy, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: string;
  onChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Feed' },
    { id: 'markets', icon: Search, label: 'Markets' },
    { id: 'culture', icon: Zap, label: 'Culture Club' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaders' },
    { id: 'portfolio', icon: Briefcase, label: 'Portfolio' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-lg border-t border-white/10 flex items-center justify-around px-2 z-50 pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center w-14 h-full transition-colors",
              isActive ? "text-neon" : "text-white/50 hover:text-white/80"
            )}
          >
            <Icon className={cn("w-6 h-6 mb-1", isActive && "animate-pulse")} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
