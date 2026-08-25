import React from 'react';
import { TradeItem } from '../types';
import { ExternalLink } from 'lucide-react';

interface TradesFeedProps {
  trades: TradeItem[];
}

export const TradesFeed: React.FC<TradesFeedProps> = ({ trades }) => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-3 flex flex-col h-full font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-dark-border mb-2 text-slate-400 font-semibold">
        <span>OUTCOME</span>
        <span>SIDE</span>
        <span>PRICE</span>
        <span>SIZE</span>
        <span>TIME</span>
      </div>

      {/* Trades List */}
      <div className="flex flex-col space-y-1 overflow-y-auto max-h-[350px] scrollbar-thin">
        {trades.length === 0 ? (
          <div className="text-center text-slate-500 py-6">No recent trade executions</div>
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
                className="flex items-center justify-between py-1 px-1.5 hover:bg-dark-hover rounded border border-transparent hover:border-dark-border transition-colors text-[11px]"
              >
                {/* Outcome badge */}
                <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                  isUp
                    ? 'bg-poly-green/10 text-poly-green border border-poly-green/20'
                    : 'bg-poly-red/10 text-poly-red border border-poly-red/20'
                }`}>
                  {t.outcome.toUpperCase()}
                </span>

                {/* Side */}
                <span className={`font-semibold ${isBuy ? 'text-poly-green' : 'text-poly-red'}`}>
                  {t.side}
                </span>

                {/* Price */}
                <span className="font-bold text-slate-200">
                  ${t.price.toFixed(3)}
                </span>

                {/* Size */}
                <span className="text-slate-300">
                  {t.size.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </span>

                {/* Time / Tx link */}
                <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
                  <span>{timeStr}</span>
                  {t.transactionHash && (
                    <a
                      href={`https://polygonscan.com/tx/${t.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                      title="View Polygon Transaction"
                    >
                      <ExternalLink className="w-3 h-3" />
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
