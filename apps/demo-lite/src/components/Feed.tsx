import { useState, useRef, useEffect } from 'react';
import { Market, User, Position } from '../types';
import { Post } from './Post';

interface FeedProps {
  markets: Market[];
  positions: Position[];
  onTradeClick: (market: Market, position: 'YES' | 'NO') => void;
  onAmplify: (market: Market, action: string) => void;
  onSwap: (market: Market) => void;
  onSell: (market: Market) => void;
  onCreatorClick: (creator: User) => void;
  onClaimClick: (market: Market) => void;
}

export function Feed({ markets, positions, onTradeClick, onAmplify, onSwap, onSell, onCreatorClick, onClaimClick }: FeedProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const index = Math.round(container.scrollTop / container.clientHeight);
      setActiveIndex(prev => (index !== prev ? index : prev));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="h-full w-full overflow-y-scroll snap-y snap-mandatory bg-black no-scrollbar"
    >
      {markets.map((market, index) => {
        const userPosition = positions.find(p => p.marketId === market.id)?.position;
        const isActive = index === activeIndex;
        const isVisible = Math.abs(index - activeIndex) <= 10;
        
        return (
          <div key={market.id} className="w-full h-full snap-start bg-black">
            {isVisible && (
              <Post
                market={market}
                isActive={isActive}
                userPosition={userPosition}
                onTradeClick={(position) => onTradeClick(market, position)}
                onAmplify={(action) => onAmplify(market, action)}
                onSwap={() => onSwap(market)}
                onSell={() => onSell(market)}
                onCreatorClick={onCreatorClick}
                onClaimClick={onClaimClick}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
