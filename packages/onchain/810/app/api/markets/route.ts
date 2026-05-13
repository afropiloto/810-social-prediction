import { NextResponse } from 'next/server';
import { db, query } from '@/lib/db';

export async function GET() {
  /*
  // Example of fetching markets from Cloud SQL
  try {
    const result = await query('SELECT * FROM markets ORDER BY created_at DESC LIMIT 50');
    return NextResponse.json({ markets: result.rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch markets' }, { status: 500 });
  }
  */

  // Placeholder for market data fetching
  return NextResponse.json({ markets: [] });
}
