import React from 'react';
import { OrderBookState } from '../types';

interface OrderBookProps {
  orderBook: OrderBookState;
}

export const OrderBook: React.FC<OrderBookProps> = ({ orderBook }) => {
  const { bids, asks, lastPrice, spread } = orderBook;

  const displayAsks = asks.slice(0, 8).reverse();
  const displayBids = bids.slice(0, 8);

  const maxAskSize = Math.max(...displayAsks.map((a) => a.size), 100);
  const maxBidSize = Math.max(...displayBids.map((b) => b.size), 100);
  const maxSize = Math.max(maxAskSize, maxBidSize);

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-3.5 flex flex-col h-full font-mono text-sm notranslate" translate="no">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-dark-border mb-2 text-slate-300 font-extrabold text-xs">
        <span>HARGA (USD)</span>
        <span>JUMLAH (SHARES)</span>
        <span>TOTAL</span>
      </div>

      {/* Asks (Sell Orders) */}
      <div className="flex flex-col space-y-1 overflow-y-auto max-h-[170px] scrollbar-thin">
        {displayAsks.length === 0 ? (
          <div className="text-center text-slate-500 py-2">Tidak ada order jual</div>
        ) : (
          displayAsks.map((ask, idx) => {
            const depthPct = Math.min(100, (ask.size / maxSize) * 100);
            return (
              <div
                key={`ask-${idx}`}
                className="relative flex items-center justify-between py-1 px-1.5 hover:bg-dark-hover rounded group cursor-pointer text-xs"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-poly-red/20 rounded-r"
                  style={{ width: `${depthPct}%` }}
                />
                <span className="relative z-10 text-poly-red font-extrabold">
                  ${ask.price.toFixed(3)}
                </span>
                <span className="relative z-10 text-slate-200 font-semibold">
                  {ask.size.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </span>
                <span className="relative z-10 text-slate-300">
                  ${(ask.price * ask.size).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Mid Price & Spread Bar */}
      <div className="my-2 py-2 px-3 bg-dark-bg border border-dark-border rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-xs font-bold">MID:</span>
          <span className="font-extrabold text-base text-slate-100">${lastPrice.toFixed(3)}</span>
        </div>
        <div className="text-xs text-slate-400 font-bold">
          SPREAD: <span className="text-amber-400 font-black">${spread.toFixed(3)}</span>
        </div>
      </div>

      {/* Bids (Buy Orders) */}
      <div className="flex flex-col space-y-1 overflow-y-auto max-h-[170px] scrollbar-thin">
        {displayBids.length === 0 ? (
          <div className="text-center text-slate-500 py-2">Tidak ada order beli</div>
        ) : (
          displayBids.map((bid, idx) => {
            const depthPct = Math.min(100, (bid.size / maxSize) * 100);
            return (
              <div
                key={`bid-${idx}`}
                className="relative flex items-center justify-between py-1 px-1.5 hover:bg-dark-hover rounded group cursor-pointer text-xs"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-poly-green/20 rounded-r"
                  style={{ width: `${depthPct}%` }}
                />
                <span className="relative z-10 text-poly-green font-extrabold">
                  ${bid.price.toFixed(3)}
                </span>
                <span className="relative z-10 text-slate-200 font-semibold">
                  {bid.size.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </span>
                <span className="relative z-10 text-slate-300">
                  ${(bid.price * bid.size).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
