'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Position {
  id: string;
  marketQuestion: string;
  side: "YES" | "NO";
  amount: number;
  value: number;
  timestamp: string;
}

interface PortfolioContextType {
  balance: number;
  positions: Position[];
  addPosition: (pos: Position) => void;
  updateBalance: (delta: number) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(12450.50);
  const [positions, setPositions] = useState<Position[]>([]);

  const addPosition = (pos: Position) => {
    setPositions(prev => [pos, ...prev]);
  };

  const updateBalance = (delta: number) => {
    setBalance(prev => prev + delta);
  };

  return (
    <PortfolioContext.Provider value={{ balance, positions, addPosition, updateBalance }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) throw new Error('usePortfolio must be used within PortfolioProvider');
  return context;
}
