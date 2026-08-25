import React from 'react';
import { TimeFrame, ChartMode } from '../types';
import { Clock, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface HeaderTimerProps {
  slug: string;
  title: string;
  secondsLeft: number;
  btcPrice: number;
  strikePrice: number;
  upPrice: number;
  downPrice: number;
  timeframe: TimeFrame;
  setTimeframe: (tf: TimeFrame) => void;
  chartMode: ChartMode;
  setChartMode: (cm: ChartMode) => void;
  showPrediction: boolean;
  setShowPrediction: (sp: boolean) => void;
  wsConnected: boolean;
  isLoading: boolean;
}

export const HeaderTimer: React.FC<HeaderTimerProps> = ({
  title,
  secondsLeft,
  btcPrice,
  strikePrice,
  upPrice,
  downPrice,
  timeframe,
  setTimeframe,
  chartMode,
  setChartMode,
  showPrediction,
  setShowPrediction,
  wsConnected,
  isLoading
}) => {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = secondsLeft <= 60;
  const isBtcAboveStrike = btcPrice >= strikePrice;

  return (
    <header className="bg-dark-card border-b border-dark-border px-5 py-3.5 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 notranslate" translate="no">
      {/* Left section: Title & BTC Live Price (ENLARGED FONT) */}
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
          BTC
        </div>
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-base md:text-lg font-bold text-slate-100 tracking-tight">
              {title || 'Bitcoin Up or Down 5m'}
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 font-extrabold">
              5M CLOB
            </span>
          </div>
          <div className="flex items-center space-x-2.5 text-sm font-mono mt-0.5">
            <span className="text-slate-400 font-semibold">BTC SPOT:</span>
            <span className="font-extrabold text-amber-400 text-base">
              ${btcPrice > 0 ? btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---.--'}
            </span>
            {strikePrice > 0 && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-400 font-semibold">STRIKE:</span>
                <span className={`font-bold text-base ${isBtcAboveStrike ? 'text-poly-green' : 'text-poly-red'}`}>
                  ${strikePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center section: Polymarket Prices & Timer (ENLARGED FONT) */}
      <div className="flex items-center space-x-5">
        {/* Prices display */}
        <div className="hidden sm:flex items-center space-x-4 bg-dark-bg px-4 py-2 rounded-xl border border-dark-border">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-poly-green" />
            <span className="text-xs text-slate-300 font-mono font-bold">UP (YES)</span>
            <span className="font-mono text-base font-black text-poly-green">
              {(upPrice * 100).toFixed(1)}¢
            </span>
          </div>
          <div className="h-5 w-px bg-dark-border" />
          <div className="flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-poly-red" />
            <span className="text-xs text-slate-300 font-mono font-bold">DOWN (NO)</span>
            <span className="font-mono text-base font-black text-poly-red">
              {(downPrice * 100).toFixed(1)}¢
            </span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl border font-mono font-black transition-all ${
          isUrgent
            ? 'bg-poly-red/10 border-poly-red/40 text-poly-red animate-pulse'
            : 'bg-dark-bg border-dark-border text-amber-400'
        }`}>
          <Clock className="w-5 h-5" />
          <span className="text-lg tracking-widest">{formattedTime}</span>
        </div>
      </div>

      {/* Right section: Prediction Toggle, Mode, Timeframe */}
      <div className="flex items-center space-x-3">
        {/* 30s Prediction Line Toggle */}
        <button
          onClick={() => setShowPrediction(!showPrediction)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-extrabold border transition-all ${
            showPrediction
              ? 'bg-amber-500/20 text-yellow-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
              : 'bg-dark-bg text-slate-400 border-dark-border hover:text-slate-200'
          }`}
          title="Toggle Garis Proyeksi 30-Detik (Warna Kuning)"
        >
          <Zap className={`w-4 h-4 ${showPrediction ? 'text-yellow-400 animate-pulse' : ''}`} />
          <span>PROYEKSI 30S: {showPrediction ? 'ON' : 'OFF'}</span>
        </button>

        {/* Mode Switcher */}
        <div className="bg-dark-bg p-1 rounded-xl border border-dark-border flex items-center space-x-1">
          <button
            onClick={() => setChartMode('BTC_SPOT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-extrabold transition-colors ${
              chartMode === 'BTC_SPOT'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            BTC SPOT ($)
          </button>
          <button
            onClick={() => setChartMode('POLY_TOKEN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-extrabold transition-colors ${
              chartMode === 'POLY_TOKEN'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            KONTRAK (¢)
          </button>
        </div>

        {/* Timeframe Switcher */}
        <div className="bg-dark-bg p-1 rounded-xl border border-dark-border flex items-center space-x-1">
          <button
            onClick={() => setTimeframe('1m')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-extrabold transition-colors ${
              timeframe === '1m'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1 MIN
          </button>
          <button
            onClick={() => setTimeframe('5m')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-extrabold transition-colors ${
              timeframe === '5m'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            5 MIN
          </button>
        </div>

        {/* Connection status */}
        <div className="flex items-center space-x-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-dark-bg border border-dark-border">
          <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-poly-green animate-ping' : 'bg-amber-500'}`} />
          <span className={wsConnected ? 'text-poly-green' : 'text-amber-500'}>
            {wsConnected ? 'LIVE' : isLoading ? 'SYNCING' : 'POLLING'}
          </span>
        </div>
      </div>
    </header>
  );
};
