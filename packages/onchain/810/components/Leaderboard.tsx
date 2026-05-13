'use client';

import { Trophy, User, UserPlus, UserCheck } from 'lucide-react';

const TRADERS = [
  { id: "u1", username: "AlphaSeeker", pnl: "+45,200 USDT", winRate: 82, trades: 145, rank: 1 },
  { id: "u2", username: "SocialOracle", pnl: "+32,100 USDT", winRate: 68, trades: 312, rank: 2 },
  { id: "u3", username: "TrendSpotter", pnl: "+18,500 USDT", winRate: 55, trades: 89, rank: 3 },
  { id: "u4", username: "User_9001", pnl: "+12,400 USDT", winRate: 48, trades: 67, rank: 4 },
  { id: "u5", username: "GemHunter", pnl: "+8,900 USDT", winRate: 62, trades: 45, rank: 5 },
  { id: "u6", username: "YOLO_Trader", pnl: "-2,300 USDT", winRate: 12, trades: 230, rank: 6 }
];

export default function Leaderboard({ following = [], onToggleFollow }: { following?: string[], onToggleFollow: (id: string) => void }) {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Top Traders</h1>
        <p className="text-muted">Follow winning strategies and copy their trades.</p>
      </div>

      <div className="rounded-xl border border-border bg-panel overflow-x-auto thumb-scrollbar px-1 shadow-inner">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-bg text-muted">
            <tr>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Rank</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Trader</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Total P&L</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Win Rate</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Trades</th>
              <th className="px-6 py-4 font-medium uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TRADERS.map(trader => {
              const isFollowing = following.includes(trader.id);
              return (
                <tr key={trader.id} className="group hover:bg-bg transition-colors">
                  <td className="px-6 py-4">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                      trader.rank === 1 ? "bg-accent/10 text-accent" :
                      trader.rank === 2 ? "bg-gray-400/10 text-gray-400" :
                      trader.rank === 3 ? "bg-orange-500/10 text-orange-500" :
                      "text-muted"
                    }`}>
                      {trader.rank <= 3 ? <Trophy className="h-5 w-5" /> : `#${trader.rank}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg border border-border">
                        <User className="h-5 w-5 text-muted" />
                      </div>
                      <span className="font-medium text-ink">{trader.username}</span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 font-mono font-bold ${trader.pnl.startsWith('-') ? 'text-danger' : 'text-success'}`}>{trader.pnl}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-border overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${trader.winRate}%` }}></div>
                      </div>
                      <span className="font-mono text-xs text-muted">{trader.winRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-muted">{trader.trades}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onToggleFollow(trader.id)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        isFollowing
                          ? "bg-bg text-muted border border-border"
                          : "bg-accent text-black hover:opacity-90"
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="h-3 w-3" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3" />
                          Follow
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
