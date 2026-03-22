'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Clock, 
  Globe, 
  Info 
} from 'lucide-react';
import { StockAnalysisGraph } from '@/components/StockAnalysisGraph';
import { motion, AnimatePresence } from 'motion/react';

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
};

interface StockModalProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PricePoint {
  time: string;
  price: number;
  volume: number;
}

export function StockModal({ symbol, isOpen, onClose }: StockModalProps) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [change, setChange] = useState(0);
  const [changePercent, setChangePercent] = useState(0);

  useEffect(() => {
    if (isOpen) {
      // Generate mock historical data
      const points = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 52;
      const basePrice = Math.random() * 2000 + 100;
      const mockData: PricePoint[] = [];
      let lastPrice = basePrice;

      for (let i = 0; i < points; i++) {
        const volatility = 0.02;
        const change = lastPrice * volatility * (Math.random() - 0.5);
        lastPrice += change;
        mockData.push({
          time: timeframe === '1D' ? `${i}:00` : `Day ${i + 1}`,
          price: parseFloat(lastPrice.toFixed(2)),
          volume: Math.floor(Math.random() * 1000000) + 100000
        });
      }

      setTimeout(() => {
        setData(mockData);
        const first = mockData[0].price;
        const last = mockData[mockData.length - 1].price;
        setCurrentPrice(last);
        setChange(parseFloat((last - first).toFixed(2)));
        setChangePercent(parseFloat(((last - first) / first * 100).toFixed(2)));
      }, 0);

      // Simulate live updates
      const interval = setInterval(() => {
        setData(prev => {
          if (prev.length === 0) return prev;
          const lastPoint = prev[prev.length - 1];
          const volatility = 0.005;
          const change = lastPoint.price * volatility * (Math.random() - 0.5);
          const newPrice = parseFloat((lastPoint.price + change).toFixed(2));
          const newPoint = {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            price: newPrice,
            volume: Math.floor(Math.random() * 50000) + 10000
          };
          
          const newData = [...prev.slice(1), newPoint];
          const first = newData[0].price;
          const last = newData[newData.length - 1].price;
          setCurrentPrice(last);
          setChange(parseFloat((last - first).toFixed(2)));
          setChangePercent(parseFloat(((last - first) / first * 100).toFixed(2)));
          
          return newData;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isOpen, timeframe, symbol]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-glass-border flex items-center justify-between bg-gradient-to-r from-neon-blue/10 to-transparent">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-neon-blue/20 flex items-center justify-center border border-neon-blue/30">
                <Activity className="w-6 h-6 text-neon-blue" />
              </div>
              <div>
                <h2 className="font-orbitron text-2xl font-bold tracking-tighter text-white">
                  {symbol} <span className="text-neon-blue/60 text-sm ml-2">EQUITY</span>
                </h2>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-2xl font-mono font-bold text-white">{formatINR(currentPrice)}</span>
                  <span className={`flex items-center font-mono text-sm ${change >= 0 ? 'text-neon-green' : 'text-red-500'}`}>
                    {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {change >= 0 ? '📈 +' : '📉 '}{change} ({changePercent}%)
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Timeframe Selector */}
            <div className="flex space-x-2 p-1 bg-white/5 rounded-lg w-fit border border-white/10">
              {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-1.5 rounded-md text-xs font-orbitron transition-all ${
                    timeframe === tf 
                      ? 'bg-neon-blue text-black font-bold shadow-[0_0_15px_rgba(0,243,255,0.4)]' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Main Graph */}
            <div className="h-[400px] w-full relative">
              <div className="absolute top-4 left-4 z-10">
                <div className="flex items-center space-x-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  <span>Real-time Market Data Stream</span>
                </div>
              </div>
              <StockAnalysisGraph data={data} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Open', value: formatINR(currentPrice * 0.98), icon: Globe },
                { label: 'High', value: formatINR(currentPrice * 1.02), icon: TrendingUp },
                { label: 'Low', value: formatINR(currentPrice * 0.97), icon: TrendingDown },
                { label: 'Volume', value: '1.2M', icon: BarChart3 },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-neon-blue/30 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <stat.icon className="w-3 h-3 text-neon-blue" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* About Section */}
            <div className="bg-neon-blue/5 rounded-2xl p-6 border border-neon-blue/20">
              <div className="flex items-center space-x-2 mb-4">
                <Info className="w-5 h-5 text-neon-blue" />
                <h3 className="font-orbitron text-sm font-bold text-white">ASSET INTELLIGENCE</h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                {symbol} is currently showing {change >= 0 ? 'bullish' : 'bearish'} momentum in the {timeframe} window. 
                Market sentiment analysis indicates strong institutional support at current levels. 
                Volume profile suggests active accumulation by major domestic funds.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-black/40 border-t border-glass-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Terminal Stream Active</span>
            </div>
            <button 
              className="px-6 py-2 bg-neon-blue text-black font-bold rounded-lg text-xs font-orbitron hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] transition-all"
              onClick={onClose}
            >
              DISMISS TERMINAL
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
