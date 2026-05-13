import React, { useState } from 'react';
import { 
  Activity, 
  Wallet,
  LogOut,
  Terminal,
  Cpu,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';
// import { User, signOut } from 'firebase/auth'; // Firebase removed
// import { auth } from '../../lib/firebase'; // Firebase removed

export function AdminLayout({ children, currentRoute, onNavigate, user, onLogout }: { 
  children: React.ReactNode; 
  currentRoute: string;
  onNavigate: (route: string) => void;
  user?: { email: string };
  onLogout?: () => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: Cpu, label: 'The AI Factory', id: 'pending' },
    { icon: Activity, label: 'The Trading Floor', id: 'live' },
    { icon: Wallet, label: 'Treasury & LP', id: 'treasury' },
    { icon: UserIcon, label: 'System Status', id: 'status' },
  ];

  const handleSignOut = () => {
    onLogout?.();
  };

  return (
    <div className="h-screen bg-[#080808] text-zinc-300 font-sans flex flex-col md:flex-row overflow-hidden selection:bg-[#C8FF00] selection:text-black">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-zinc-900 flex flex-col shrink-0 transition-transform duration-300 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-transparent to-transparent pointer-events-none"></div>
        <div className="p-6 border-b border-zinc-900 relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-[#C8FF00] rounded-sm flex items-center justify-center text-black shadow-[0_0_15px_rgba(200,255,0,0.2)]">
               <Terminal className="w-5 h-5" />
             </div>
             <span className="text-xl font-bold text-white tracking-widest uppercase">810_SYS</span>
          </div>
          <button 
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 relative z-10">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "flex items-center space-x-3 w-full px-4 py-3 rounded-md transition-all text-left uppercase tracking-wider text-xs font-bold border",
                currentRoute === item.id 
                  ? "bg-[#C8FF00]/10 text-[#C8FF00] border-[#C8FF00]/30 shadow-[0_0_15px_rgba(200,255,0,0.1)]" 
                  : "bg-transparent text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-zinc-900 relative z-10">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-2 h-2 bg-[#C8FF00] rounded-full animate-pulse shadow-[0_0_8px_#C8FF00]"></div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest truncate">
              {user?.email || 'System Online'}
            </div>
          </div>
          <button 
             onClick={handleSignOut}
             className="flex items-center gap-3 w-full px-3 py-2 text-zinc-600 hover:text-zinc-300 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>
        
        {/* Header */}
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-10 bg-[#080808]/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <button 
              className="md:hidden text-zinc-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 font-mono text-xs md:text-sm uppercase tracking-widest shrink-0">
              <span className="text-zinc-600 hidden sm:inline">Root</span>
              <span className="text-zinc-800 hidden sm:inline">/</span>
              <span className="text-[#C8FF00] drop-shadow-[0_0_8px_rgba(200,255,0,0.5)]">
                 {navItems.find(i => i.id === currentRoute)?.label || currentRoute}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="flex items-center font-mono text-[10px] md:text-xs text-zinc-500 shrink-0">
              <span className="hidden lg:inline">{new Date().toISOString().split('T')[0]} <span className="text-zinc-700">|</span> </span>08:25:00 UTC
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-8 space-y-6 flex-1 overflow-auto flex flex-col min-h-0 relative z-10 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          <div className="w-full flex-1 flex flex-col min-h-0 space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
