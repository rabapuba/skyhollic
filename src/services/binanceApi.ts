import { OHLCData } from '../types';

export const BINANCE_REST_BASE = 'https://api.binance.com/api/v3';
export const BINANCE_WS_URL = 'wss://stream.binance.com:9443/ws/btcusdt@kline_1m';

/**
 * Fetches historical BTC/USD OHLC candles from Binance REST API.
 * @param interval '1m' | '5m'
 * @param limit number of candles (default 100)
 */
export async function fetchBtcKlines(interval: '1m' | '5m' = '1m', limit: number = 120): Promise<OHLCData[]> {
  try {
    const res = await fetch(`${BINANCE_REST_BASE}/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => ({
      time: Math.floor(item[0] / 1000), // Open time in seconds
      open: parseFloat(item[1]),
      high: parseFloat(item[2]),
      low: parseFloat(item[3]),
      close: parseFloat(item[4]),
      volume: parseFloat(item[5]),
    }));
  } catch (err) {
    console.error('Error fetching Binance BTC klines:', err);
    return [];
  }
}
