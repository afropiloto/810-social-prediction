'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePortfolio } from '@/context/PortfolioContext';
import Activity from '@/components/Activity';

export default function Portfolio() {
  const { balance, positions } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'positions' | 'activity'>('positions');
  const netWorth = balance + positions.reduce((acc, pos) => acc + pos.value, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Portfolio</h1>
          <p className="text-muted">Manage your active positions and performance.</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-muted">Net Worth</span>
            <span className="font-mono font-bold text-ink">${netWorth.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
          <div className="h-8 w-px bg-border"></div>
          <div className="flex flex-col">
            <span className="text-muted">Available Cash</span>
            <span className="font-mono font-bold text-ink">${balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-panel p-6"
        >
          <div className="text-sm text-muted mb-2">Total Positions</div>
          <div className="text-3xl font-bold tracking-tight text-ink">{positions.length}</div>
        </motion.div>
        {/* ... */}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('positions')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors relative ${
            activeTab === 'positions' ? 'text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          Active Positions
          {activeTab === 'positions' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors relative ${
            activeTab === 'activity' ? 'text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          Activity
          {activeTab === 'activity' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'positions' ? (
        <div>
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {positions.map(pos => (
                  <motion.div
                  key={pos.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  >
                  <PositionRow 
                      market={pos.marketQuestion}
                      side={pos.side}
                      amount={`$${pos.amount.toFixed(2)}`}
                      value={`$${pos.value.toFixed(2)}`}
                      profit={`$${(pos.value - pos.amount).toFixed(2)}`}
                  />
                  </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <Activity following={[]} />
      )}
    </div>
  );
}

function PositionRow({ market, side, amount, value, profit }: any) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-panel p-4 transition-all hover:border-muted md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className={`flex h-8 w-12 items-center justify-center rounded-md text-xs font-bold tracking-wider ${side === "YES" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
          {side}
        </div>
        <div className="font-medium text-ink line-clamp-1">{market}</div>
      </div>
      <div className="flex items-center justify-between md:justify-end gap-8 text-sm">
        <div className="flex flex-col items-start md:items-end">
          <span className="text-muted text-xs">Cost</span>
          <span className="font-mono font-medium text-ink">{amount}</span>
        </div>
        <div className="flex flex-col items-start md:items-end">
          <span className="text-muted text-xs">Value</span>
          <span className="font-mono font-medium text-ink">{value}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-muted text-xs">Profit</span>
          <span className={`font-mono font-bold ${profit.startsWith('+') ? "text-success" : "text-danger"}`}>{profit}</span>
        </div>
      </div>
    </div>
  );
}
