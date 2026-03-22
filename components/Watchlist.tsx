'use client';

import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  YAxis 
} from 'recharts';
import { motion } from 'motion/react';
import { Star, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface WatchlistItem {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  history: { price: number }[];
}

interface WatchlistProps {
  onSelectStock: (symbol: string) => void;
}

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
};

export function Watchlist({ onSelectStock }: WatchlistProps) {
  const [favorites, setFavorites] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    // Generate mock favorites
    const symbols = ['TCS', 'INFY', 'HDFCBANK', 'RELIANCE', 'SBIN', 'ICICIBANK'];
    const mockFavorites = symbols.map(symbol => {
      const basePrice = Math.random() * 2000 + 100;
      const history = Array(10).fill(0).map(() => ({
        price: basePrice + (Math.random() - 0.5) * 50
      }));
      const lastPrice = history[history.length - 1].price;
      const prevPrice = history[history.length - 2].price;
      const change = lastPrice - prevPrice;
      const changePercent = (change / prevPrice) * 100;

      return {
        symbol,
        price: lastPrice,
        change,
        changePercent,
        history
      };
    });
    setTimeout(() => setFavorites(mockFavorites), 0);

    // Simulate live updates
    const interval = setInterval(() => {
      setFavorites(prev => prev.map(item => {
        const volatility = 0.002;
        const change = item.price * volatility * (Math.random() - 0.5);
        const newPrice = item.price + change;
        const newHistory = [...item.history.slice(1), { price: newPrice }];
        
        return {
          ...item,
          price: newPrice,
          change: newPrice - item.history[item.history.length - 1].price,
          changePercent: ((newPrice - item.history[item.history.length - 1].price) / item.history[item.history.length - 1].price) * 100,
          history: newHistory
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <h2 className="font-orbitron text-lg font-bold tracking-wider text-white">
            FAVORITES TERMINAL
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="w-3 h-3 text-neon-blue animate-pulse" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Watchlist Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((item, i) => (
          <motion.div
            key={item.symbol}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelectStock(item.symbol)}
            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-neon-blue/50 hover:bg-white/10 transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-orbitron text-sm font-bold text-white group-hover:text-neon-blue transition-colors">
                  {item.symbol}
                </h3>
                <p className="text-[10px] text-white/40 font-mono">{formatINR(item.price)}</p>
              </div>
              <div className={`text-right ${item.changePercent >= 0 ? 'text-neon-green' : 'text-red-500'}`}>
                <div className="flex items-center justify-end text-[10px] font-bold">
                  {item.changePercent >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {item.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="h-12 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={item.history}>
                  <YAxis domain={['auto', 'auto']} hide />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke={item.changePercent > 0.05 ? '#39FF14' : item.changePercent < -0.05 ? '#FF3131' : '#00F5FF'} 
                    strokeWidth={2} 
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
