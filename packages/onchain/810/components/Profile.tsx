'use client';

import { useState } from 'react';
import { Settings, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'positions' | 'messages'>('positions');

  return (
    <div className="mx-auto max-w-2xl pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 overflow-hidden rounded-full border border-border">
            <Image
              src="https://picsum.photos/seed/user123/200/200"
              alt="Profile"
              fill
              sizes="64px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink">Alex Trader</h1>
            <p className="text-sm text-muted">@alextrader</p>
          </div>
        </div>
        <button className="rounded-full p-2 text-muted hover:bg-panel hover:text-ink transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl border border-border bg-panel p-6 mb-8">
        <div className="mb-6 text-center">
          <p className="text-sm font-medium text-muted uppercase tracking-wider mb-1">Total Balance</p>
          <div className="text-4xl font-mono font-bold text-ink">
            0.00 <span className="text-2xl text-muted">USDT</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-accent-fg hover:opacity-90 transition-opacity">
            <ArrowDownRight className="h-4 w-4" /> Deposit
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl border border-border bg-bg py-3 text-sm font-bold text-ink hover:bg-panel transition-colors">
            <ArrowUpRight className="h-4 w-4" /> Withdraw
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-border bg-panel p-4 text-center">
          <div className="text-xl font-mono font-bold text-ink">68%</div>
          <div className="text-xs font-medium text-muted uppercase tracking-wider mt-1">Win Rate</div>
        </div>
        <div className="rounded-2xl border border-border bg-panel p-4 text-center">
          <div className="text-xl font-mono font-bold text-ink">$12.4k</div>
          <div className="text-xs font-medium text-muted uppercase tracking-wider mt-1">Volume</div>
        </div>
        <div className="rounded-2xl border border-border bg-panel p-4 text-center">
          <div className="text-xl font-mono font-bold text-ink">3</div>
          <div className="text-xs font-medium text-muted uppercase tracking-wider mt-1">Created</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('positions')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors relative ${
            activeTab === 'positions' ? 'text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          Positions
          {activeTab === 'positions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors relative ${
            activeTab === 'messages' ? 'text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          Messages
          {activeTab === 'messages' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'positions' ? (
        <div className="space-y-4">
          <PositionCard 
            market="Will Bitcoin hit $100k by EOY?"
            side="YES"
            amount="500 USDT"
            pnl="+12.5%"
            isPositive={true}
          />
          <PositionCard 
            market="Will Lakers win the championship?"
            side="NO"
            amount="1,200 USDT"
            pnl="-5.2%"
            isPositive={false}
          />
          <PositionCard 
            market="Will TikTok be banned in the US?"
            side="YES"
            amount="250 USDT"
            pnl="+45.0%"
            isPositive={true}
          />
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg border border-border">
            <TrendingUp className="h-8 w-8 text-muted" />
          </div>
          <h3 className="text-lg font-bold text-ink">No Messages</h3>
          <p className="text-muted mt-1">You have no messages yet.</p>
        </div>
      )}
    </div>
  );
}

function PositionCard({ market, side, amount, pnl, isPositive }: any) {
  return (
    <div className="rounded-2xl border border-border bg-panel p-4 transition-colors hover:border-muted">
      <h3 className="font-bold text-ink mb-3 line-clamp-2">{market}</h3>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider ${
            side === 'YES' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}>
            {side}
          </div>
          <div className="font-mono text-sm font-bold text-ink">{amount}</div>
        </div>
        <div className={`font-mono text-sm font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
          {pnl}
        </div>
      </div>
    </div>
  );
}
