import React from 'react';
import { TradeItem } from '../types';
import { ExternalLink } from 'lucide-react';

interface TradesFeedProps {
  trades: TradeItem[];
}

export const TradesFeed: React.FC<TradesFeedProps> = ({ trades }) => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-3.5 flex flex-col h-full font-mono text-sm notranslate" translate="no">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-dark-border mb-2 text-slate-300 font-extrabold text-xs">
        <span>PASAR</span>
        <span>SIDE</span>
        <span>HARGA</span>
        <span>JUMLAH</span>
        <span>WAKTU</span>
      </div>

      {/* Trades List */}
      <div className="flex flex-col space-y-1 overflow-y-auto max-h-[360px] scrollbar-thin">
        {trades.length === 0 ? (
          <div className="text-center text-slate-500 py-6">Belum ada eksekusi transaksi</div>
        ) : (
          trades.slice(0, 30).map((t) => {
            const isBuy = t.side === 'BUY';
            const isUp = t.outcome === 'Up';
            const timeStr = new Date(t.timestamp * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            });

            return (
              <div
                key={t.id}
                className="flex items-center justify-between py-1.5 px-2 hover:bg-dark-hover rounded-lg border border-transparent hover:border-dark-border transition-colors text-xs font-semibold"
              >
                {/* Outcome badge */}
                <span className={`px-2 py-0.5 rounded font-black text-xs ${
                  isUp
                    ? 'bg-poly-green/15 text-poly-green border border-poly-green/30'
                    : 'bg-poly-red/15 text-poly-red border border-poly-red/30'
                }`}>
                  {t.outcome.toUpperCase()}
                </span>

                {/* Side */}
                <span className={`font-black ${isBuy ? 'text-poly-green' : 'text-poly-red'}`}>
                  {t.side}
                </span>

                {/* Price */}
                <span className="font-extrabold text-slate-100">
                  ${t.price.toFixed(3)}
                </span>

                {/* Size */}
                <span className="text-slate-200">
                  {t.size.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </span>

                {/* Time / Tx link */}
                <div className="flex items-center space-x-1.5 text-slate-400 text-xs">
                  <span>{timeStr}</span>
                  {t.transactionHash && (
                    <a
                      href={`https://polygonscan.com/tx/${t.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                      title="Lihat Transaksi Polygonscan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
