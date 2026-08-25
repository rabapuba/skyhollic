export interface PolymarketEvent {
  id: string;
  ticker: string;
  slug: string;
  title: string;
  description: string;
  resolutionSource: string;
  startDate: string;
  endDate: string;
  active: boolean;
  closed: boolean;
  liquidity: number;
  volume: number;
  markets: PolymarketMarket[];
}

export interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  resolutionSource: string;
  endDate: string;
  liquidity: string;
  volume: string;
  outcomes: string[]; // ["Up", "Down"]
  outcomePrices: string[]; // ["0.54", "0.46"]
  clobTokenIds: string[]; // ["token_up", "token_down"]
  active: boolean;
  closed: boolean;
}

export interface OrderLevel {
  price: number;
  size: number;
}

export interface OrderBookState {
  bids: OrderLevel[];
  asks: OrderLevel[];
  lastPrice: number;
  bestBid: number;
  bestAsk: number;
  spread: number;
}

export interface TradeItem {
  id: string;
  side: 'BUY' | 'SELL';
  price: number;
  size: number;
  timestamp: number;
  outcome: 'Up' | 'Down';
  transactionHash?: string;
  pseudonym?: string;
}

export interface OHLCData {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeFrame = '1m' | '5m';
export type ChartMode = 'BTC_SPOT' | 'POLY_TOKEN';
