import { PolymarketEvent, OrderBookState, TradeItem, OHLCData } from '../types';

export const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';
export const CLOB_API_BASE = 'https://clob.polymarket.com';
export const DATA_API_BASE = 'https://data-api.polymarket.com';
export const CLOB_WS_URL = 'wss://ws-subscriptions-clob.polymarket.com/ws/market';

/**
 * Calculates the Unix timestamp (seconds) for the 5-minute window floor.
 */
export function get5MinWindowTimestamp(offsetSec: number = 0): number {
  const now = Math.floor(Date.now() / 1000) + offsetSec;
  return Math.floor(now / 300) * 300;
}

/**
 * Fetches Polymarket 5m Event by slug.
 */
export async function fetchEventBySlug(slug: string): Promise<PolymarketEvent | null> {
  try {
    const res = await fetch(`${GAMMA_API_BASE}/events?slug=${slug}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0] as PolymarketEvent;
    }
    return null;
  } catch (err) {
    console.error('Error fetching Polymarket event:', err);
    return null;
  }
}

/**
 * Fetches live CLOB Midpoint price for a token.
 */
export async function fetchClobMidpoint(tokenId: string): Promise<number | null> {
  try {
    const res = await fetch(`${CLOB_API_BASE}/midpoint?token_id=${tokenId}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.mid) {
      const midVal = parseFloat(data.mid);
      if (!isNaN(midVal) && midVal > 0) {
        return midVal;
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Fetches current CLOB order book snapshot.
 */
export async function fetchOrderBook(tokenId: string): Promise<OrderBookState | null> {
  try {
    const res = await fetch(`${CLOB_API_BASE}/book?token_id=${tokenId}`);
    if (!res.ok) return null;
    const data = await res.json();

    const rawBids = Array.isArray(data.bids) ? data.bids : [];
    const rawAsks = Array.isArray(data.asks) ? data.asks : [];

    const bids = rawBids
      .map((b: any) => ({ price: parseFloat(b.price), size: parseFloat(b.size) }))
      .filter((b: any) => b.price >= 0.001 && b.price <= 0.999)
      .sort((a: any, b: any) => b.price - a.price);

    const asks = rawAsks
      .map((a: any) => ({ price: parseFloat(a.price), size: parseFloat(a.size) }))
      .filter((a: any) => a.price >= 0.001 && a.price <= 0.999)
      .sort((a: any, b: any) => a.price - b.price);

    const bestBid = bids[0]?.price || 0.5;
    const bestAsk = asks[0]?.price || 0.5;
    const lastPrice = (bestBid + bestAsk) / 2;
    const spread = Math.abs(bestAsk - bestBid);

    return {
      bids,
      asks,
      lastPrice,
      bestBid,
      bestAsk,
      spread,
    };
  } catch (err) {
    console.error('Error fetching orderbook:', err);
    return null;
  }
}

/**
 * Fetches recent trade history for a conditionId.
 */
export async function fetchTradesHistory(conditionId: string): Promise<TradeItem[]> {
  try {
    const res = await fetch(`${DATA_API_BASE}/trades?market=${conditionId}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((t: any, index: number) => ({
      id: `${t.transactionHash || t.timestamp}-${index}`,
      side: t.side === 'BUY' ? 'BUY' : 'SELL',
      price: parseFloat(t.price),
      size: parseFloat(t.size),
      timestamp: t.timestamp,
      outcome: t.outcome === 'Up' ? 'Up' : 'Down',
      transactionHash: t.transactionHash,
      pseudonym: t.pseudonym || t.name || 'Anonymous',
    }));
  } catch (err) {
    console.error('Error fetching trade history:', err);
    return [];
  }
}

/**
 * Fetches historical prices from CLOB and converts into OHLC candles.
 */
export async function fetchPricesHistory(tokenId: string, startTs: number, endTs: number): Promise<OHLCData[]> {
  try {
    const url = `${CLOB_API_BASE}/prices-history?market=${tokenId}&startTs=${startTs}&endTs=${endTs}&fidelity=1`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const history = data.history || [];

    if (history.length === 0) return [];

    const minuteMap = new Map<number, { prices: number[]; time: number }>();

    for (const item of history) {
      const t = item.t;
      const p = parseFloat(item.p);
      const minuteTime = Math.floor(t / 60) * 60;

      if (!minuteMap.has(minuteTime)) {
        minuteMap.set(minuteTime, { prices: [], time: minuteTime });
      }
      minuteMap.get(minuteTime)!.prices.push(p);
    }

    const candles: OHLCData[] = [];
    const sortedMinutes = Array.from(minuteMap.keys()).sort((a, b) => a - b);

    for (const mTime of sortedMinutes) {
      const bucket = minuteMap.get(mTime)!;
      const ps = bucket.prices;
      candles.push({
        time: mTime,
        open: ps[0],
        high: Math.max(...ps),
        low: Math.min(...ps),
        close: ps[ps.length - 1],
        volume: ps.length * 100,
      });
    }

    return candles;
  } catch (err) {
    console.error('Error fetching prices history:', err);
    return [];
  }
}
