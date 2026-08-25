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
}

export const TradingChart: React.FC<TradingChartProps> = ({
  data,
  timeframe,
  chartMode,
  lastPrice,
  strikePrice
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Area'> | null>(null);
  const strikeLineRef = useRef<IPriceLine | null>(null);

  const [displayStyle, setDisplayStyle] = useState<'area' | 'candles'>('area');

  const prevModeRef = useRef<ChartMode>(chartMode);
  const prevTimeframeRef = useRef<TimeFrame>(timeframe);
  const prevStyleRef = useRef<'area' | 'candles'>(displayStyle);
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const isBtcMode = chartMode === 'BTC_SPOT';

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 420,
      layout: {
        background: { color: '#0a0d14' },
        textColor: '#64748b',
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: '#131926' },
        horzLines: { color: '#131926' },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: '#3b82f6', width: 1, style: 3 },
        horzLine: { color: '#3b82f6', width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: '#1e2638',
        autoScale: true,
        borderVisible: true,
        scaleMargins: { top: 0.15, bottom: 0.15 },
      },
      timeScale: {
        borderColor: '#1e2638',
        timeVisible: true,
        secondsVisible: false,
        borderVisible: true,
      },
    });

    let series: ISeriesApi<'Candlestick'> | ISeriesApi<'Area'>;

    if (displayStyle === 'area') {
      series = chart.addAreaSeries({
        topColor: isBtcMode ? 'rgba(245, 158, 11, 0.35)' : 'rgba(0, 210, 106, 0.35)',
        bottomColor: isBtcMode ? 'rgba(245, 158, 11, 0.0)' : 'rgba(0, 210, 106, 0.0)',
        lineColor: isBtcMode ? '#f59e0b' : '#00d26a',
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

    if (chartMode === 'BTC_SPOT' && strikePrice && strikePrice > 0 && seriesRef.current) {
      if (strikeLineRef.current) {
        seriesRef.current.removePriceLine(strikeLineRef.current);
      }
      const isUp = lastPrice >= strikePrice;
      strikeLineRef.current = seriesRef.current.createPriceLine({
        price: strikePrice,
        color: isUp ? 'rgba(0, 210, 106, 0.6)' : 'rgba(255, 59, 105, 0.6)',
        lineWidth: 1,
        lineStyle: 3,
        axisLabelVisible: true,
        title: `STRIKE $${strikePrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      });
    }
  }, [data, chartMode, timeframe, displayStyle, strikePrice, lastPrice]);

  const tfLabel = timeframe === '1m' ? '1 MENIT' : '5 MENIT';

  return (
    <div className="relative w-full h-full flex flex-col bg-dark-bg notranslate" translate="no">
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-2 bg-dark-card/90 backdrop-blur px-3 py-1.5 rounded-lg border border-dark-border shadow-lg">
        <span className="text-xs font-mono font-semibold text-slate-200">
          {chartMode === 'BTC_SPOT' ? 'BTC/USD SPOT' : 'HARGA KONTRAK (¢)'} ({tfLabel})
        </span>
        <span className={`text-xs font-mono font-bold ${
          chartMode === 'BTC_SPOT' ? 'text-amber-400' : 'text-poly-green'
        }`}>
          {chartMode === 'BTC_SPOT'
            ? `$${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : `${(lastPrice * 100).toFixed(1)}¢`}
        </span>

        <div className="ml-2 pl-2 border-l border-dark-border flex items-center space-x-1">
          <button
            onClick={() => setDisplayStyle('area')}
            className={`p-1 rounded transition-colors ${
              displayStyle === 'area' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Grafik Garis Mulus (Smooth Line Area)"
          >
            <LineChart className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDisplayStyle('candles')}
            className={`p-1 rounded transition-colors ${
              displayStyle === 'candles' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Grafik Candlestick OHLC"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div ref={chartContainerRef} className="w-full h-full min-h-[400px]" />
    </div>
  );
};
