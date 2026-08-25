import React, { useState } from 'react';
import { usePolymarketMarket } from './hooks/usePolymarketMarket';
import { HeaderTimer } from './components/HeaderTimer';
import { OutcomeCards } from './components/OutcomeCards';
import { TradingChart } from './components/TradingChart';
import { OrderBook } from './components/OrderBook';
import { TradesFeed } from './components/TradesFeed';
import { MarketStats } from './components/MarketStats';
import { RefreshCw, BookOpen, Activity } from 'lucide-react';

export function App() {
  const {
    currentWindowTs,
    secondsLeft,
    eventData,
    activeMarket,
    orderBook,
    trades,
    upPrice,
    downPrice,
    btcPrice,
    strikePrice,
    predictedPrice,
    btcCandles1m,
    btcCandles5m,
    polyCandles1m,
    polyCandles5m,
    timeframe,
    setTimeframe,
    chartMode,
    setChartMode,
    showPrediction,
    setShowPrediction,
    isLoading,
    wsConnected
  } = usePolymarketMarket();

  const [activeTab, setActiveTab] = useState<'book' | 'trades'>('book');

  const activeCandles = chartMode === 'BTC_SPOT'
    ? (timeframe === '1m' ? btcCandles1m : btcCandles5m)
    : (timeframe === '1m' ? polyCandles1m : polyCandles5m);

  const activePrice = chartMode === 'BTC_SPOT' ? btcPrice : upPrice;
  const currentSlug = `btc-updown-5m-${currentWindowTs}`;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans notranslate" translate="no">
      {/* Top Header & Timer Bar */}
      <HeaderTimer
        slug={currentSlug}
        title={activeMarket?.question || eventData?.title || 'Bitcoin Up or Down 5m'}
        secondsLeft={secondsLeft}
        btcPrice={btcPrice}
        strikePrice={strikePrice}
        upPrice={upPrice}
        downPrice={downPrice}
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        chartMode={chartMode}
        setChartMode={setChartMode}
        showPrediction={showPrediction}
        setShowPrediction={setShowPrediction}
        wsConnected={wsConnected}
        isLoading={isLoading}
      />

      {/* Main Trading Terminal Dashboard */}
      <main className="flex-1 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 max-w-[1800px] w-full mx-auto">
        {/* Left / Main Section: Outcome Cards + Candlestick Chart (8 Cols on Desktop) */}
        <section className="lg:col-span-8 flex flex-col space-y-3">
          {/* Polymarket Style UP / DOWN Cards */}
          <OutcomeCards
            upPrice={upPrice}
            downPrice={downPrice}
            btcPrice={btcPrice}
            strikePrice={strikePrice}
          />

          {/* Chart Container */}
          <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden flex-1 flex flex-col min-h-[460px]">
            {isLoading && activeCandles.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-slate-400 font-mono">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm">Connecting to Live Polymarket Feeds...</p>
              </div>
            ) : (
              <TradingChart
                data={activeCandles}
                timeframe={timeframe}
                chartMode={chartMode}
                lastPrice={activePrice}
                strikePrice={strikePrice}
                predictedPrice={predictedPrice}
                showPrediction={showPrediction}
              />
            )}
          </div>
        </section>

        {/* Right Section: Order Book & Trades Feed (4 Cols on Desktop) */}
        <section className="lg:col-span-4 flex flex-col space-y-3">
          {/* Mobile Tab Switcher */}
          <div className="lg:hidden flex bg-dark-card border border-dark-border rounded-lg p-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('book')}
              className={`flex-1 py-1.5 rounded flex items-center justify-center space-x-1.5 font-semibold transition-colors ${
                activeTab === 'book'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ORDER BOOK</span>
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`flex-1 py-1.5 rounded flex items-center justify-center space-x-1.5 font-semibold transition-colors ${
                activeTab === 'trades'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>LIVE TRADES</span>
            </button>
          </div>

          {/* Desktop Dual Column View / Mobile Tabbed View */}
          <div className="hidden lg:grid lg:grid-rows-2 gap-3 flex-1 min-h-[460px]">
            <OrderBook orderBook={orderBook} />
            <TradesFeed trades={trades} />
          </div>

          {/* Mobile single view */}
          <div className="lg:hidden flex-1 min-h-[380px]">
            {activeTab === 'book' ? (
              <OrderBook orderBook={orderBook} />
            ) : (
              <TradesFeed trades={trades} />
            )}
          </div>
        </section>
      </main>

      {/* Bottom Market Stats Footer */}
      <MarketStats
        eventData={eventData}
        activeMarket={activeMarket}
        slug={currentSlug}
      />
    </div>
  );
}
export default App;
