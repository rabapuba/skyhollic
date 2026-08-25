import React from 'react';
import { PolymarketEvent, PolymarketMarket } from '../types';
import { ExternalLink, ShieldCheck, DollarSign, BarChart2 } from 'lucide-react';

interface MarketStatsProps {
  eventData: PolymarketEvent | null;
  activeMarket: PolymarketMarket | null;
  slug: string;
}

export const MarketStats: React.FC<MarketStatsProps> = ({ eventData, activeMarket, slug }) => {
  const volumeStr = activeMarket?.volume
    ? `$${parseFloat(activeMarket.volume).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : eventData?.volume
    ? `$${eventData.volume.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : '$0.00';

  const liquidityStr = activeMarket?.liquidity
    ? `$${parseFloat(activeMarket.liquidity).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : eventData?.liquidity
    ? `$${eventData.liquidity.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : '$0.00';

  return (
    <footer className="bg-dark-card border-t border-dark-border px-5 py-3 text-sm text-slate-300 font-mono flex flex-wrap items-center justify-between gap-4 notranslate" translate="no">
      {/* Left stats */}
      <div className="flex flex-wrap items-center space-x-7">
        <div className="flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-slate-400">VOLUME:</span>
          <span className="font-extrabold text-slate-100">{volumeStr}</span>
        </div>

        <div className="flex items-center space-x-2">
          <DollarSign className="w-4 h-4 text-poly-green" />
          <span className="font-bold text-slate-400">LIKUIDITAS:</span>
          <span className="font-extrabold text-slate-100">{liquidityStr}</span>
        </div>

        <div className="hidden md:flex items-center space-x-2 text-slate-300">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span className="font-bold text-slate-400">ORACLE:</span>
          <span className="text-slate-200 font-semibold">Chainlink BTC/USD TWAP</span>
        </div>
      </div>

      {/* Right link */}
      <div className="flex items-center space-x-4">
        <span className="text-xs text-slate-400 hidden sm:inline font-mono">SLUG: {slug}</span>
        <a
          href={`https://polymarket.com/id/event/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/40 transition-colors font-extrabold text-xs"
        >
          <span>Polymarket Event</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </footer>
  );
};
