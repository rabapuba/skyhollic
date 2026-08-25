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
    <footer className="bg-dark-card border-t border-dark-border px-4 py-2.5 text-xs text-slate-400 font-mono flex flex-wrap items-center justify-between gap-4">
      {/* Left stats */}
      <div className="flex flex-wrap items-center space-x-6">
        <div className="flex items-center space-x-1.5">
          <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
          <span>VOLUME:</span>
          <span className="font-bold text-slate-200">{volumeStr}</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <DollarSign className="w-3.5 h-3.5 text-poly-green" />
          <span>LIQUIDITY:</span>
          <span className="font-bold text-slate-200">{liquidityStr}</span>
        </div>

        <div className="hidden md:flex items-center space-x-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>ORACLE:</span>
          <span className="text-slate-300">Chainlink BTC/USD TWAP</span>
        </div>
      </div>

      {/* Right link */}
      <div className="flex items-center space-x-3">
        <span className="text-[11px] text-slate-400 hidden sm:inline">SLUG: {slug}</span>
        <a
          href={`https://polymarket.com/id/event/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-1 px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 transition-colors font-semibold"
        >
          <span>Polymarket Event</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </footer>
  );
};
