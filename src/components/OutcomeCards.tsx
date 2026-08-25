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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 font-sans notranslate" translate="no">
      {/* UP Card */}
      <div className={`p-4 rounded-xl border transition-all ${
        isBtcUp
          ? 'bg-poly-green/10 border-poly-green/50 shadow-xl shadow-poly-green/10'
          : 'bg-dark-card border-dark-border hover:border-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-poly-green/20 text-poly-green flex items-center justify-center font-black">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-slate-100">UP (NAIK)</span>
          </div>
          <span className="font-mono text-3xl font-black text-poly-green">
            {(upPrice * 100).toFixed(1)}¢
          </span>
        </div>

        {/* Probability bar */}
        <div className="w-full bg-dark-bg h-2.5 rounded-full overflow-hidden border border-dark-border mb-2.5">
          <div
            className="bg-poly-green h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(5, Math.min(95, upPct))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm font-mono text-slate-300">
          <span>Peluang: <strong className="text-white text-base font-extrabold">{upPct}%</strong></span>
          <span>Syarat: BTC ≥ ${strikePrice > 0 ? strikePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '---'}</span>
        </div>
      </div>

      {/* DOWN Card */}
      <div className={`p-4 rounded-xl border transition-all ${
        !isBtcUp
          ? 'bg-poly-red/10 border-poly-red/50 shadow-xl shadow-poly-red/10'
          : 'bg-dark-card border-dark-border hover:border-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-poly-red/20 text-poly-red flex items-center justify-center font-black">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-slate-100">DOWN (TURUN)</span>
          </div>
          <span className="font-mono text-3xl font-black text-poly-red">
            {(downPrice * 100).toFixed(1)}¢
          </span>
        </div>

        {/* Probability bar */}
        <div className="w-full bg-dark-bg h-2.5 rounded-full overflow-hidden border border-dark-border mb-2.5">
          <div
            className="bg-poly-red h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(5, Math.min(95, downPct))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm font-mono text-slate-300">
          <span>Peluang: <strong className="text-white text-base font-extrabold">{downPct}%</strong></span>
          <span>Syarat: BTC &lt; ${strikePrice > 0 ? strikePrice.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '---'}</span>
        </div>
      </div>
    </div>
  );
};
