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
    <header className="bg-dark-card border-b border-dark-border px-4 py-3 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 notranslate" translate="no">
      {/* Left section: Title & BTC Live Price */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
          BTC
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-sm md:text-base font-semibold text-slate-100 tracking-tight">
              {title || 'Bitcoin Up or Down 5m'}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
              5M CLOB
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-400">BTC SPOT:</span>
            <span className="font-bold text-amber-400">
              ${btcPrice > 0 ? btcPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---.--'}
            </span>
            {strikePrice > 0 && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">STRIKE:</span>
                <span className={`font-semibold ${isBtcAboveStrike ? 'text-poly-green' : 'text-poly-red'}`}>
                  ${strikePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Center section: Polymarket Prices & Timer */}
      <div className="flex items-center space-x-4">
        {/* Prices display */}
        <div className="hidden sm:flex items-center space-x-3 bg-dark-bg px-3 py-1.5 rounded-lg border border-dark-border">
          <div className="flex items-center space-x-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-poly-green" />
            <span className="text-xs text-slate-400 font-mono">UP (YES)</span>
            <span className="font-mono text-sm font-bold text-poly-green">
              {(upPrice * 100).toFixed(1)}¢
            </span>
          </div>
          <div className="h-4 w-px bg-dark-border" />
          <div className="flex items-center space-x-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-poly-red" />
            <span className="text-xs text-slate-400 font-mono">DOWN (NO)</span>
            <span className="font-mono text-sm font-bold text-poly-red">
              {(downPrice * 100).toFixed(1)}¢
            </span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold transition-all ${
          isUrgent
            ? 'bg-poly-red/10 border-poly-red/40 text-poly-red animate-pulse'
            : 'bg-dark-bg border-dark-border text-amber-400'
        }`}>
          <Clock className="w-4 h-4" />
          <span className="text-base tracking-widest">{formattedTime}</span>
        </div>
      </div>

      {/* Right section: Prediction Toggle, Mode, Timeframe */}
      <div className="flex items-center space-x-3">
        {/* 30s Prediction Line Toggle */}
        <button
          onClick={() => setShowPrediction(!showPrediction)}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono font-bold border transition-all ${
            showPrediction
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/10'
              : 'bg-dark-bg text-slate-500 border-dark-border hover:text-slate-300'
          }`}
          title="Toggle Garis Proyeksi 30-Detik (Kerlap-Kerlip)"
        >
          <Zap className={`w-3.5 h-3.5 ${showPrediction ? 'text-amber-400 animate-pulse' : ''}`} />
          <span>PROYEKSI 30S: {showPrediction ? 'ON' : 'OFF'}</span>
        </button>

        {/* Mode Switcher */}
        <div className="bg-dark-bg p-1 rounded-lg border border-dark-border flex items-center space-x-1">
          <button
            onClick={() => setChartMode('BTC_SPOT')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
              chartMode === 'BTC_SPOT'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            BTC SPOT ($)
          </button>
          <button
            onClick={() => setChartMode('POLY_TOKEN')}
            className={`px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors ${
              chartMode === 'POLY_TOKEN'
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            KONTRAK (¢)
          </button>
        </div>

        {/* Timeframe Switcher */}
        <div className="bg-dark-bg p-1 rounded-lg border border-dark-border flex items-center space-x-1">
          <button
            onClick={() => setTimeframe('1m')}
            className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-colors ${
              timeframe === '1m'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1 MIN
          </button>
          <button
            onClick={() => setTimeframe('5m')}
            className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-colors ${
              timeframe === '5m'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            5 MIN
          </button>
        </div>

        {/* Connection status */}
        <div className="flex items-center space-x-1.5 text-xs font-mono px-2.5 py-1 rounded bg-dark-bg border border-dark-border">
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-poly-green animate-ping' : 'bg-amber-500'}`} />
          <span className={wsConnected ? 'text-poly-green' : 'text-amber-500'}>
            {wsConnected ? 'LIVE' : isLoading ? 'SYNCING' : 'POLLING'}
          </span>
        </div>
      </div>
    </header>
  );
};
