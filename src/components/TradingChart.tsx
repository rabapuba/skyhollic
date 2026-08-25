import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, AreaData, IPriceLine } from 'lightweight-charts';
import { OHLCData, TimeFrame, ChartMode } from '../types';
import { LineChart, BarChart2 } from 'lucide-react';

interface TradingChartProps {
  data: OHLCData[];
  timeframe: TimeFrame;
  chartMode: ChartMode;
  lastPrice: number;
  strikePrice?: number;
  predictedPrice?: number;
  showPrediction?: boolean;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  data,
  timeframe,
  chartMode,
  lastPrice,
  strikePrice,
  predictedPrice,
  showPrediction = true
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Area'> | null>(null);
  const strikeLineRef = useRef<IPriceLine | null>(null);
  const predictionLineRef = useRef<IPriceLine | null>(null);

  const [displayStyle, setDisplayStyle] = useState<'area' | 'candles'>('area');

  const prevModeRef = useRef<ChartMode>(chartMode);
  const prevTimeframeRef = useRef<TimeFrame>(timeframe);
  const prevStyleRef = useRef<'area' | 'candles'>(displayStyle);
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isBtcMode = chartMode === 'BTC_SPOT';

    // Create chart with LARGE, HIGH-CONTRAST READABLE FONT (fontSize: 14)
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 450,
      layout: {
        background: { color: '#0a0d14' },
        textColor: '#cbd5e1', // Slate 300 for high readability
        fontSize: 14, // ENLARGED FONT SIZE
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: '#161e2e' },
        horzLines: { color: '#161e2e' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#38bdf8', width: 1, style: 3 },
        horzLine: { color: '#38bdf8', width: 1, style: 3 },
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      rightPriceScale: {
        borderColor: '#334155',
        autoScale: true,
        borderVisible: true,
        scaleMargins: { top: 0.18, bottom: 0.18 },
        alignLabels: true,
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
        secondsVisible: true,
        borderVisible: true,
        rightOffset: 14,
        barSpacing: 9,
        minBarSpacing: 1,
        fixLeftEdge: false,
        fixRightEdge: false,
      },
    });

    let series: ISeriesApi<'Candlestick'> | ISeriesApi<'Area'>;

    if (displayStyle === 'area') {
      series = chart.addAreaSeries({
        topColor: isBtcMode ? 'rgba(56, 189, 248, 0.4)' : 'rgba(0, 229, 255, 0.4)',
        bottomColor: isBtcMode ? 'rgba(56, 189, 248, 0.0)' : 'rgba(0, 229, 255, 0.0)',
        lineColor: isBtcMode ? '#38bdf8' : '#00e5ff',
        lineWidth: 2,
        priceFormat: isBtcMode
          ? { type: 'price', precision: 2, minMove: 0.01 }
          : { type: 'price', precision: 3, minMove: 0.001 },
      });
    } else {
      series = chart.addCandlestickSeries({
        upColor: '#00d26a',
        downColor: '#ff3b69',
        borderUpColor: '#00d26a',
        borderDownColor: '#ff3b69',
        wickUpColor: '#00d26a',
        wickDownColor: '#ff3b69',
        priceFormat: isBtcMode
          ? { type: 'price', precision: 2, minMove: 0.01 }
          : { type: 'price', precision: 3, minMove: 0.001 },
      });
    }

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      strikeLineRef.current = null;
      predictionLineRef.current = null;
      isInitializedRef.current = false;
    };
  }, [chartMode, displayStyle]);

  useEffect(() => {
    if (!seriesRef.current || !data) return;

    const modeChanged = prevModeRef.current !== chartMode;
    const timeframeChanged = prevTimeframeRef.current !== timeframe;
    const styleChanged = prevStyleRef.current !== displayStyle;

    prevModeRef.current = chartMode;
    prevTimeframeRef.current = timeframe;
    prevStyleRef.current = displayStyle;

    if (displayStyle === 'area') {
      const areaData: AreaData[] = data.map((d) => ({
        time: d.time as any,
        value: d.close,
      }));

      if (!isInitializedRef.current || modeChanged || timeframeChanged || styleChanged) {
        (seriesRef.current as ISeriesApi<'Area'>).setData(areaData);
        if (data.length > 0 && chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
        isInitializedRef.current = true;
      } else if (areaData.length > 0) {
        (seriesRef.current as ISeriesApi<'Area'>).update(areaData[areaData.length - 1]);
      }
    } else {
      const formattedCandles: CandlestickData[] = data.map((d) => ({
        time: d.time as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      if (!isInitializedRef.current || modeChanged || timeframeChanged || styleChanged) {
        (seriesRef.current as ISeriesApi<'Candlestick'>).setData(formattedCandles);
        if (data.length > 0 && chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }
        isInitializedRef.current = true;
      } else if (formattedCandles.length > 0) {
        (seriesRef.current as ISeriesApi<'Candlestick'>).update(formattedCandles[formattedCandles.length - 1]);
      }
    }

    // DISTINCT COLOR 1: STRIKE PRICE LINE = ELECTRIC CYAN (#00e5ff)
    if (chartMode === 'BTC_SPOT' && strikePrice && strikePrice > 0 && seriesRef.current) {
      if (strikeLineRef.current) {
        seriesRef.current.removePriceLine(strikeLineRef.current);
      }
      strikeLineRef.current = seriesRef.current.createPriceLine({
        price: strikePrice,
        color: '#00e5ff', // ELECTRIC CYAN - High contrast, distinct from prediction & price
        lineWidth: 2,
        lineStyle: 3, // Dotted line
        axisLabelVisible: true,
        title: `STRIKE: $${strikePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      });
    }

    // DISTINCT COLOR 2: 30S PROJECTION LINE = NEON GOLD YELLOW (#ffea00)
    if (showPrediction && predictedPrice && predictedPrice > 0 && seriesRef.current) {
      if (predictionLineRef.current) {
        seriesRef.current.removePriceLine(predictionLineRef.current);
      }

      const isBtcMode = chartMode === 'BTC_SPOT';
      const titleText = isBtcMode
        ? `PROYEKSI 30S: $${predictedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `PROYEKSI 30S: ${(predictedPrice * 100).toFixed(1)}¢`;

      predictionLineRef.current = seriesRef.current.createPriceLine({
        price: predictedPrice,
        color: '#ffea00', // NEON GOLD YELLOW - Instant visual distinction
        lineWidth: 2,
        lineStyle: 2, // Dashed line
        axisLabelVisible: true,
        title: titleText,
      });
    } else if (!showPrediction && predictionLineRef.current && seriesRef.current) {
      seriesRef.current.removePriceLine(predictionLineRef.current);
      predictionLineRef.current = null;
    }
  }, [data, chartMode, timeframe, displayStyle, strikePrice, lastPrice, predictedPrice, showPrediction]);

  const tfLabel = timeframe === '1m' ? '1 MENIT' : '5 MENIT';

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-bg notranslate" translate="no">
      {/* Floating Control Header - ENLARGED HIGH-CONTRAST FONT */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-3 bg-dark-card/95 backdrop-blur px-4 py-2 rounded-xl border border-dark-border shadow-xl">
        <span className="text-sm font-mono font-bold text-slate-100">
          {chartMode === 'BTC_SPOT' ? 'BTC/USD SPOT' : 'HARGA KONTRAK (¢)'} ({tfLabel})
        </span>
        <span className={`text-base font-mono font-black ${
          chartMode === 'BTC_SPOT' ? 'text-amber-400' : 'text-poly-green'
        }`}>
          {chartMode === 'BTC_SPOT'
            ? `$${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `${(lastPrice * 100).toFixed(1)}¢`}
        </span>

        <div className="ml-3 pl-3 border-l border-dark-border flex items-center space-x-1.5">
          <button
            onClick={() => setDisplayStyle('area')}
            className={`p-1.5 rounded-lg transition-colors ${
              displayStyle === 'area' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Grafik Garis Mulus (Smooth Line Area)"
          >
            <LineChart className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDisplayStyle('candles')}
            className={`p-1.5 rounded-lg transition-colors ${
              displayStyle === 'candles' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Grafik Candlestick OHLC"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full h-full min-h-[420px]" />
    </div>
  );
};
