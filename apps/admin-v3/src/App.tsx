/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { AdminLayout } from './components/layout/AdminLayout';
import { PendingMarketsView } from './components/views/PendingMarketsView';
import { LiveMarketsView } from './components/views/LiveMarketsView';
import { TreasuryView } from './components/views/TreasuryView';
import { SystemStatusView } from './components/views/SystemStatusView';
import { Terminal, Shield } from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('pending');
  const { ready, authenticated, user, login, logout, getAccessToken } = usePrivy();

  const renderContent = () => {
    switch (currentRoute) {
      case 'pending':
        return <PendingMarketsView getAccessToken={getAccessToken} />;
      case 'live':
        return <LiveMarketsView getAccessToken={getAccessToken} />;
      case 'treasury':
        return <TreasuryView />;
      case 'status':
        return <SystemStatusView />;
      default:
        return <PendingMarketsView getAccessToken={getAccessToken} />;
    }
  };

  const primaryEmail = useMemo(() => {
    const e = user?.email?.address;
    return e || '';
  }, [user]);

  const primaryWallet = useMemo(() => {
    const acct = user?.linkedAccounts?.find((a: any) => a.type === 'wallet');
    const addr = String((acct as any)?.address || '');
    return addr;
  }, [user]);

  if (!ready) {
    return (
      <div className="h-screen bg-[#080808] flex items-center justify-center text-[#C8FF00] font-mono text-xs uppercase tracking-widest gap-3">
        <Terminal className="w-5 h-5 animate-pulse" />
        <span>Loading Privy...</span>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="h-screen bg-[#080808] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>
        
        <div className="relative z-10 flex flex-col items-center bg-[#0a0a0a] p-10 border border-zinc-900 shadow-2xl rounded-lg max-w-sm w-full mx-4">
           <div className="w-12 h-12 bg-[#C8FF00] rounded-sm flex items-center justify-center text-black shadow-[0_0_20px_rgba(200,255,0,0.3)] mb-6">
             <Shield className="w-6 h-6" />
           </div>
           
           <h1 className="text-xl font-bold text-white tracking-widest uppercase mb-1">810_SYS ADMIN</h1>
           <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest mb-8 text-center">Secure Engine Access Required</p>

           <button 
             onClick={() => login()}
             className="w-full bg-[#C8FF00] hover:bg-[#a6d600] text-black py-4 rounded font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(200,255,0,0.2)] hover:shadow-[0_0_25px_rgba(200,255,0,0.4)] relative overflow-hidden group/btn"
           >
             <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform"></span>
             <span className="relative z-10">AUTHORIZE ACCESS</span>
           </button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      currentRoute={currentRoute}
      onNavigate={setCurrentRoute}
      user={{
        email: primaryEmail || primaryWallet || 'connected',
      }}
      onLogout={logout}
    >
      {renderContent()}
    </AdminLayout>
  );
}
