export interface Market {
  id: string;
  question: string;
  creatorHandle: string;
  targetPost: string;
  metric: string;
  category: string;
  target: string;
  deadline: string;
  probability: number;
  volume: string;
  liquidity: string;
  imageUrl: string;
  creatorPool: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const fetchMarkets = async (): Promise<Market[]> => {
  try {
    const response = await fetch(`${API_URL}/list-markets`);
    if (!response.ok) throw new Error('Network response was not ok');
    const markets = await response.json();
    return markets;
  } catch (error) {
    console.error("Error fetching markets:", error);
    return [];
  }
};

export const createMarket = async (market: any) => {
  try {
    const response = await fetch(`${API_URL}/create-market`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(market),
    });
    if (!response.ok) throw new Error('Failed to create market');
    return await response.json();
  } catch (error) {
    console.error("Error creating market:", error);
    return { id: Math.random().toString(36).substr(2, 9) };
  }
};

export const placeBet = async (marketId: string, side: string, amount: number) => {
  try {
    const response = await fetch(`${API_URL}/place-bet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ marketId, side, amount }),
    });
    if (!response.ok) throw new Error('Failed to place bet');
    return await response.json();
  } catch (error) {
    console.error("Error placing bet:", { marketId, side, amount, error });
    return { success: false };
  }
};

export const subscribeToMarkets = (callback: (markets: any[]) => void) => {
  // Use long polling or WebSockets instead of Firebase if needed.
  // For now, doing a one-off fetch as a placeholder for a subscription.
  console.log("Subscribing to markets (polling fallback)");
  let isSubscribed = true;
  
  const poll = async () => {
    if (!isSubscribed) return;
    const markets = await fetchMarkets();
    if (isSubscribed) {
      callback(markets);
      setTimeout(poll, 10000); // Polling every 10 seconds
    }
  };
  
  poll();
  
  return () => {
    isSubscribed = false;
    console.log("Unsubscribing from markets");
  };
};
