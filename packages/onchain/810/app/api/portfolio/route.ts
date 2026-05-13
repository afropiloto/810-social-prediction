import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // In a real app, this would fetch the user's wallet balance and active positions from the DB/Blockchain
  
  return NextResponse.json({
    success: true,
    data: {
      balance: 12450.00,
      currency: 'USDC',
      totalPortfolioValue: 15800.50,
      '24hChange': 2.4,
      positions: [
        { 
          id: 'pos_1', 
          marketId: '1',
          marketTitle: 'Will MrBeast reach 300M subscribers before June 2026?', 
          outcome: 'Yes', 
          shares: 500, 
          avgPrice: 0.65, 
          currentPrice: 0.68,
          currentValue: 340 
        },
        { 
          id: 'pos_2', 
          marketId: '3',
          marketTitle: 'Will GTA VI be delayed to 2027?', 
          outcome: 'No', 
          shares: 200, 
          avgPrice: 0.30, 
          currentPrice: 0.55,
          currentValue: 110 
        }
      ],
      recentActivity: [
        { id: 'act_1', type: 'buy', market: 'GTA VI Release', amount: '50 USDC', date: '2026-03-08T10:00:00Z' },
        { id: 'act_2', type: 'deposit', amount: '1000 USDC', date: '2026-03-07T14:30:00Z' }
      ]
    }
  });
}
