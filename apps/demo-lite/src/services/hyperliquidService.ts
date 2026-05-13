// Hyperliquid CLOB API integration
// Uses their standard REST/WebSocket API structure

const API_BASE_URL = 'https://api.hyperliquid.xyz';

export async function fetchL2Book(coin: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'l2Book', coin }),
    });
    
    if (!response.ok) {
      throw new Error(`Hyperliquid Info API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching L2 book from Hyperliquid:', error);
    throw error;
  }
}

// Scaffold for setting up a WebSocket connection to the CLOB
export function setupClobWebSocket(onMessage: (data: any) => void) {
  const ws = new WebSocket('wss://api.hyperliquid.xyz/ws');
  
  ws.onopen = () => {
    console.log('Connected to Hyperliquid WebSockets');
    // Example: Subscribe to l2Book or trades
    ws.send(JSON.stringify({
      method: 'subscribe',
      subscription: { type: 'l2Book', coin: 'HYPE' }
    }));
  };
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  
  ws.onerror = (error) => console.error('Hyperliquid WS error:', error);
  
  return ws;
}
