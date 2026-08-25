import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PolymarketEvent,
  PolymarketMarket,
  OrderBookState,
  TradeItem,
  OHLCData,
  TimeFrame,
  ChartMode
} from '../types';
import {
  get5MinWindowTimestamp,
  fetchEventBySlug,
  fetchClobMidpoint,
  fetchOrderBook,
  fetchTradesHistory,
  fetchPricesHistory,
  CLOB_WS_URL
} from '../services/polymarketApi';
import { fetchBtcKlines } from '../services/binanceApi';

export function usePolymarketMarket() {
  const [currentWindowTs, setCurrentWindowTs] = useState<number>(() => get5MinWindowTimestamp());
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [eventData, setEventData] = useState<PolymarketEvent | null>(null);
  const [activeMarket, setActiveMarket] = useState<PolymarketMarket | null>(null);
  const [upTokenId, setUpTokenId] = useState<string | null>(null);
  const [downTokenId, setDownTokenId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [timeframe, setTimeframe] = useState<TimeFrame>('1m');
  const [chartMode, setChartMode] = useState<ChartMode>('BTC_SPOT');

  // Live Contract YES / NO Prices
  const [upPrice, setUpPrice] = useState<number>(0.5);
  const [downPrice, setDownPrice] = useState<number>(0.5);

  // BTC Spot Data
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [strikePrice, setStrikePrice] = useState<number>(0);
  const [btcCandles1m, setBtcCandles1m] = useState<OHLCData[]>([]);
  const [btcCandles5m, setBtcCandles5m] = useState<OHLCData[]>([]);

  // Polymarket Token Data
  const [orderBook, setOrderBook] = useState<OrderBookState>({
    bids: [],
    asks: [],
    lastPrice: 0.5,
    bestBid: 0.49,
    bestAsk: 0.51,
    spread: 0.02
  });

  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [polyCandles1m, setPolyCandles1m] = useState<OHLCData[]>([]);
  const [polyCandles5m, setPolyCandles5m] = useState<OHLCData[]>([]);

  // 1. Timer ticker & auto window detector
  useEffect(() => {
    const updateTimer = () => {
      const nowSec = Math.floor(Date.now() / 1000);
      const currentFloor = Math.floor(nowSec / 300) * 300;
      const nextPeriod = currentFloor + 300;
      const remaining = Math.max(0, nextPeriod - nowSec);

      setSecondsLeft(remaining);

      if (currentFloor !== currentWindowTs) {
        console.log(`[Auto-Rollover] Moving from window ${currentWindowTs} -> ${currentFloor}`);
        setCurrentWindowTs(currentFloor);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [currentWindowTs]);

  // 2. Fetch BTC Spot Historical Candles & Live Binance WebSocket Stream
  useEffect(() => {
    let isCancelled = false;

    async function loadBtcData() {
      const [k1m, k5m] = await Promise.all([
        fetchBtcKlines('1m', 120),
        fetchBtcKlines('5m', 60)
      ]);

      if (isCancelled) return;

      if (k1m.length > 0) {
        setBtcCandles1m(k1m);
        const last = k1m[k1m.length - 1];
        setBtcPrice(last.close);

        const strikeCandle = k1m.find((c) => c.time === currentWindowTs) || k1m[k1m.length - 1];
        setStrikePrice(strikeCandle.open || strikeCandle.close);
      }

      if (k5m.length > 0) {
        setBtcCandles5m(k5m);
      }
    }

    loadBtcData();

    const binanceWs = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');

    binanceWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.k) {
          const k = data.k;
          const timeSec = Math.floor(k.t / 1000);
          const closePrice = parseFloat(k.c);
          const openPrice = parseFloat(k.o);
          const highPrice = parseFloat(k.h);
          const lowPrice = parseFloat(k.l);
          const vol = parseFloat(k.v);

          setBtcPrice(closePrice);

          if (timeSec >= currentWindowTs && strikePrice === 0) {
            setStrikePrice(openPrice);
          }

          const m1 = Math.floor(timeSec / 60) * 60;
          setBtcCandles1m((prev) => {
            if (prev.length === 0) return prev;
            const copy = [...prev];
            const lastIdx = copy.length - 1;
            if (copy[lastIdx].time === m1) {
              copy[lastIdx] = { time: m1, open: openPrice, high: highPrice, low: lowPrice, close: closePrice, volume: vol };
            } else {
              copy.push({ time: m1, open: openPrice, high: highPrice, low: lowPrice, close: closePrice, volume: vol });
            }
            return copy.slice(-120);
          });
        }
      } catch (e) {
        console.error('Binance WS err:', e);
      }
    };

    return () => {
      isCancelled = true;
      binanceWs.close();
    };
  }, [currentWindowTs, strikePrice]);

  // Helper to aggregate live option token tick into OHLC candles & update prices
  const processOptionTick = useCallback((price: number, size: number, timestampSec: number) => {
    if (price > 0 && price < 1) {
      setUpPrice(price);
      setDownPrice(parseFloat((1 - price).toFixed(3)));
    }

    const m1 = Math.floor(timestampSec / 60) * 60;
    setPolyCandles1m((prev) => {
      const copy = [...prev];
      const lastIndex = copy.length - 1;
      if (lastIndex >= 0 && copy[lastIndex].time === m1) {
        const c = copy[lastIndex];
        copy[lastIndex] = {
          ...c,
          high: Math.max(c.high, price),
          low: Math.min(c.low, price),
          close: price,
          volume: c.volume + size
        };
      } else {
        copy.push({ time: m1, open: price, high: price, low: price, close: price, volume: size });
      }
      return copy.slice(-120);
    });

    const m5 = Math.floor(timestampSec / 300) * 300;
    setPolyCandles5m((prev) => {
      const copy = [...prev];
      const lastIndex = copy.length - 1;
      if (lastIndex >= 0 && copy[lastIndex].time === m5) {
        const c = copy[lastIndex];
        copy[lastIndex] = {
          ...c,
          high: Math.max(c.high, price),
          low: Math.min(c.low, price),
          close: price,
          volume: c.volume + size
        };
      } else {
        copy.push({ time: m5, open: price, high: price, low: price, close: price, volume: size });
      }
      return copy.slice(-60);
    });
  }, []);

  // 3. Initial Market Load
  useEffect(() => {
    let isCancelled = false;

    async function init() {
      setIsLoading(true);
      const slug = `btc-updown-5m-${currentWindowTs}`;
      const evt = await fetchEventBySlug(slug);

      if (isCancelled) return;

      if (!evt || !evt.markets || evt.markets.length === 0) {
        setIsLoading(false);
        return;
      }

      setEventData(evt);
      const m = evt.markets[0];
      setActiveMarket(m);

      let tokenUp = '';
      let tokenDown = '';

      try {
        const tokens = typeof m.clobTokenIds === 'string'
          ? JSON.parse(m.clobTokenIds)
          : m.clobTokenIds;

        if (Array.isArray(tokens) && tokens.length >= 2) {
          tokenUp = tokens[0];
          tokenDown = tokens[1];
        }
      } catch (e) {
        console.error('Failed to parse clobTokenIds:', e);
      }

      setUpTokenId(tokenUp);
      setDownTokenId(tokenDown);

      if (tokenUp) {
        const mid = await fetchClobMidpoint(tokenUp);
        if (mid !== null && !isCancelled) {
          setUpPrice(mid);
          setDownPrice(parseFloat((1 - mid).toFixed(3)));
        } else if (m.outcomePrices) {
          try {
            const prices = typeof m.outcomePrices === 'string'
              ? JSON.parse(m.outcomePrices)
              : m.outcomePrices;

            if (Array.isArray(prices) && prices.length >= 2) {
              const pUp = parseFloat(prices[0]);
              const pDown = parseFloat(prices[1]);
              setUpPrice(pUp);
              setDownPrice(pDown);
            }
          } catch (e) {}
        }

        const book = await fetchOrderBook(tokenUp);
        if (book && !isCancelled) setOrderBook(book);

        const startTs = currentWindowTs - 7200;
        const endTs = currentWindowTs + 300;
        const hist = await fetchPricesHistory(tokenUp, startTs, endTs);

        if (hist.length > 0 && !isCancelled) {
          setPolyCandles1m(hist);
          const map5m = new Map<number, OHLCData>();
          for (const c of hist) {
            const t5 = Math.floor(c.time / 300) * 300;
            if (!map5m.has(t5)) {
              map5m.set(t5, { ...c, time: t5 });
            } else {
              const existing = map5m.get(t5)!;
              existing.high = Math.max(existing.high, c.high);
              existing.low = Math.min(existing.low, c.low);
              existing.close = c.close;
              existing.volume += c.volume;
            }
          }
          setPolyCandles5m(Array.from(map5m.values()));
        }
      }

      if (m.conditionId) {
        const initialTrades = await fetchTradesHistory(m.conditionId);
        if (!isCancelled) setTrades(initialTrades);
      }

      setIsLoading(false);
    }

    init();

    return () => {
      isCancelled = true;
    };
  }, [currentWindowTs]);

  // 4. High-Frequency 1-Second Continuous Live Price Synchronization
  useEffect(() => {
    if (!upTokenId) return;

    const syncPrices = async () => {
      // 1. Fetch live CLOB Midpoint
      const mid = await fetchClobMidpoint(upTokenId);
      if (mid !== null) {
        setUpPrice(mid);
        setDownPrice(parseFloat((1 - mid).toFixed(3)));
        setOrderBook((prev) => ({ ...prev, lastPrice: mid }));
      } else {
        // Fallback to Gamma API outcomePrices
        const slug = `btc-updown-5m-${currentWindowTs}`;
        const evt = await fetchEventBySlug(slug);
        if (evt && evt.markets && evt.markets.length > 0) {
          const m = evt.markets[0];
          if (m.outcomePrices) {
            try {
              const prices = typeof m.outcomePrices === 'string'
                ? JSON.parse(m.outcomePrices)
                : m.outcomePrices;

              if (Array.isArray(prices) && prices.length >= 2) {
                const pUp = parseFloat(prices[0]);
                const pDown = parseFloat(prices[1]);
                setUpPrice(pUp);
                setDownPrice(pDown);
                setOrderBook((prev) => ({ ...prev, lastPrice: pUp }));
              }
            } catch (e) {}
          }
        }
      }

      // Sync recent trades if active
      if (activeMarket?.conditionId) {
        const latestTrades = await fetchTradesHistory(activeMarket.conditionId);
        if (latestTrades.length > 0) {
          setTrades(latestTrades);
        }
      }
    };

    syncPrices();
    const interval = setInterval(syncPrices, 1000);

    return () => clearInterval(interval);
  }, [upTokenId, currentWindowTs, activeMarket?.conditionId]);

  // 5. Polymarket CLOB WebSocket for Immediate Instant Tick Updates
  useEffect(() => {
    if (!upTokenId) return;

    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWS = () => {
      try {
        ws = new WebSocket(CLOB_WS_URL);

        ws.onopen = () => {
          setWsConnected(true);
          const assetsToSub = [upTokenId];
          if (downTokenId) assetsToSub.push(downTokenId);

          ws?.send(JSON.stringify({
            type: 'market',
            assets_ids: assetsToSub
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const nowSec = Math.floor(Date.now() / 1000);
            const item = Array.isArray(data) ? data[0] : data;

            if (item && item.asset_id === upTokenId) {
              if (item.bids || item.asks) {
                const bids = (item.bids || []).map((b: any) => ({
                  price: parseFloat(b.price),
                  size: parseFloat(b.size)
                })).sort((a: any, b: any) => b.price - a.price);

                const asks = (item.asks || []).map((a: any) => ({
                  price: parseFloat(a.price),
                  size: parseFloat(a.size)
                })).sort((a: any, b: any) => a.price - b.price);

                if (bids.length > 0 || asks.length > 0) {
                  const bestBid = bids[0]?.price;
                  const bestAsk = asks[0]?.price;
                  if (bestBid && bestAsk) {
                    const mid = (bestBid + bestAsk) / 2;
                    processOptionTick(mid, 50, nowSec);
                  }

                  setOrderBook((prev) => ({
                    ...prev,
                    bids,
                    asks,
                    spread: Math.abs((asks[0]?.price || 0.5) - (bids[0]?.price || 0.5))
                  }));
                }
              }

              if (item.price_changes) {
                for (const pc of item.price_changes) {
                  if (pc.asset_id === upTokenId) {
                    const price = parseFloat(pc.price);
                    const size = parseFloat(pc.size);
                    const side = pc.side === 'BUY' ? 'BUY' : 'SELL';

                    processOptionTick(price, size, nowSec);

                    const newTrade: TradeItem = {
                      id: `ws-${nowSec}-${Math.random().toString(36).substr(2, 5)}`,
                      side,
                      price,
                      size,
                      timestamp: nowSec,
                      outcome: 'Up',
                      pseudonym: 'CLOB Stream'
                    };

                    setTrades((prev) => [newTrade, ...prev.slice(0, 49)]);
                  }
                }
              }
            }
          } catch (err) {
            console.error('[CLOB WS] Parse error:', err);
          }
        };

        ws.onerror = () => setWsConnected(false);
        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWS, 3000);
        };
      } catch (e) {
        reconnectTimeout = setTimeout(connectWS, 3000);
      }
    };

    connectWS();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, [upTokenId, downTokenId, processOptionTick]);

  return {
    currentWindowTs,
    secondsLeft,
    eventData,
    activeMarket,
    upTokenId,
    downTokenId,
    orderBook,
    trades,
    upPrice,
    downPrice,
    btcPrice,
    strikePrice,
    btcCandles1m,
    btcCandles5m,
    polyCandles1m,
    polyCandles5m,
    timeframe,
    setTimeframe,
    chartMode,
    setChartMode,
    isLoading,
    wsConnected
  };
}
