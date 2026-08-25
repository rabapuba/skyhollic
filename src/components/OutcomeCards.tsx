import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface OutcomeCardsProps {
  upPrice: number;
  downPrice: number;
  btcPrice: number;
  strikePrice: number;
}

export const OutcomeCards: React.FC<OutcomeCardsProps> = ({
  upPrice,
  downPrice,
  btcPrice,
  strikePrice
}) => {
  const upPct = Math.round(upPrice * 100);
  const downPct = Math.round(downPrice * 100);
  const isBtcUp = btcPrice >= strikePrice;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 font-sans">
      {/* UP Card */}
      <div className={`p-4 rounded-xl border transition-all ${
        isBtcUp
          ? 'bg-poly-green/10 border-poly-green/40 shadow-lg shadow-poly-green/5'
          : 'bg-dark-card border-dark-border hover:border-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-poly-green/20 text-poly-green flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-slate-100">UP</span>
          </div>
          <span className="font-mono text-2xl font-black text-poly-green">
            {(upPrice * 100).toFixed(1)}¢
          </span>
        </div>

        {/* Probability bar */}
        <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden border border-dark-border mb-2">
          <div
            className="bg-poly-green h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(5, Math.min(95, upPct))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Chance: <strong className="text-slate-200">{upPct}%</strong></span>
          <span>Wins if BTC ≥ ${strikePrice > 0 ? strikePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '---'}</span>
        </div>
      </div>

      {/* DOWN Card */}
      <div className={`p-4 rounded-xl border transition-all ${
        !isBtcUp
          ? 'bg-poly-red/10 border-poly-red/40 shadow-lg shadow-poly-red/5'
          : 'bg-dark-card border-dark-border hover:border-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-poly-red/20 text-poly-red flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-slate-100">DOWN</span>
          </div>
          <span className="font-mono text-2xl font-black text-poly-red">
            {(downPrice * 100).toFixed(1)}¢
          </span>
        </div>

        {/* Probability bar */}
        <div className="w-full bg-dark-bg h-2 rounded-full overflow-hidden border border-dark-border mb-2">
          <div
            className="bg-poly-red h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(5, Math.min(95, downPct))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Chance: <strong className="text-slate-200">{downPct}%</strong></span>
          <span>Wins if BTC &lt; ${strikePrice > 0 ? strikePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '---'}</span>
        </div>
      </div>
    </div>
  );
};
