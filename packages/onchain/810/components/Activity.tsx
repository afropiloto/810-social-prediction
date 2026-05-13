'use client';

import { Activity as ActivityIcon, CheckCircle2, UserPlus, DollarSign, ArrowRightLeft } from 'lucide-react';

export default function Activity({ following }: { following?: string[] }) {
  return (
    <div className="space-y-4 mt-6">
      <ActivityItem 
        icon={<ArrowRightLeft className="h-5 w-5 text-accent" />}
        iconBg="bg-accent/10"
        content={<>Your bet on <span className="font-bold text-ink">Will Bitcoin hit $100k by EOY?</span> was matched.</>}
        time="2m ago"
        unread={true}
      />
      <ActivityItem 
        icon={<CheckCircle2 className="h-5 w-5 text-success" />}
        iconBg="bg-success/10"
        content={<>Market <span className="font-bold text-ink">Will ETH flip BTC in 2024?</span> resolved to <span className="font-bold text-success">YES</span>.</>}
        time="1h ago"
        unread={true}
      />
      <ActivityItem 
        icon={<UserPlus className="h-5 w-5 text-ink" />}
        iconBg="bg-border"
        content={<><span className="font-bold text-ink">@cryptowhale</span> started following you.</>}
        time="3h ago"
        unread={false}
      />
      <ActivityItem 
        icon={<DollarSign className="h-5 w-5 text-success" />}
        iconBg="bg-success/10"
        content={<>You earned <span className="font-bold text-success">50 USDT</span> from market fees.</>}
        time="1d ago"
        unread={false}
      />
    </div>
  );
}

function ActivityItem({ icon, iconBg, content, time, unread }: any) {
  return (
    <div className={`flex items-start gap-4 rounded-xl p-4 transition-colors ${unread ? 'bg-panel border border-border' : 'bg-transparent'}`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 pt-1">
        <p className="text-sm text-muted leading-relaxed">{content}</p>
        <p className="text-xs text-muted mt-1 font-mono">{time}</p>
      </div>
      {unread && (
        <div className="h-2 w-2 shrink-0 rounded-full bg-accent mt-2" />
      )}
    </div>
  );
}
