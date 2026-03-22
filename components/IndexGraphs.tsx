'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  Zap, 
  BarChart3 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { motion } from 'motion/react';

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
};

interface IndexData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  history: { time: string; price: number }[];
}

export function IndexGraphs() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate mock live index data
    const generateHistory = (base: number) => {
      const history = [];
      let last = base;
      for (let i = 0; i < 30; i++) {
        last += base * 0.002 * (Math.random() - 0.5);
        history.push({ time: `${i}:00`, price: parseFloat(last.toFixed(2)) });
      }
      return history;
    };

    const niftyHistory = generateHistory(23500);
    const sensexHistory = generateHistory(77000);

    setTimeout(() => {
      setIndices([
        {
          name: 'NIFTY 50',
          value: niftyHistory[niftyHistory.length - 1].price,
          change: parseFloat((niftyHistory[niftyHistory.length - 1].price - niftyHistory[0].price).toFixed(2)),
          changePercent: parseFloat(((niftyHistory[niftyHistory.length - 1].price - niftyHistory[0].price) / niftyHistory[0].price * 100).toFixed(2)),
          history: niftyHistory
        },
        {
          name: 'SENSEX',
          value: sensexHistory[sensexHistory.length - 1].price,
          change: parseFloat((sensexHistory[sensexHistory.length - 1].price - sensexHistory[0].price).toFixed(2)),
          changePercent: parseFloat(((sensexHistory[sensexHistory.length - 1].price - sensexHistory[0].price) / sensexHistory[0].price * 100).toFixed(2)),
          history: sensexHistory
        }
      ]);
      setLoading(false);
    }, 0);

    // Simulate live updates
    const interval = setInterval(() => {
      setIndices(prev => prev.map(idx => {
        const lastPrice = idx.history[idx.history.length - 1].price;
        const newPrice = parseFloat((lastPrice + lastPrice * 0.0005 * (Math.random() - 0.5)).toFixed(2));
        const newHistory = [...idx.history.slice(1), { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), price: newPrice }];
        
        return {
          ...idx,
          value: newPrice,
          change: parseFloat((newPrice - idx.history[0].price).toFixed(2)),
          changePercent: parseFloat(((newPrice - idx.history[0].price) / idx.history[0].price * 100).toFixed(2)),
          history: newHistory
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 blur-[100px] pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-neon-blue/20 flex items-center justify-center border border-neon-blue/30">
            <Activity className="w-5 h-5 text-neon-blue" />
          </div>
          <div>
            <h2 className="font-orbitron text-lg font-bold tracking-wider text-white">
              INDEX TERMINAL
            </h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">30-Min Real-time Stream</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-1 bg-neon-green/10 px-2 py-1 rounded border border-neon-green/20">
            <Zap className="w-3 h-3 text-neon-green" />
            <span className="text-[10px] font-bold text-neon-green uppercase">Live Sync</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        {indices.map((idx, i) => (
          <div key={i} className="flex flex-col space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="font-orbitron text-sm font-bold text-white/60 mb-1">{idx.name}</h3>
                <div className="text-2xl font-mono font-bold text-white">{formatINR(idx.value)}</div>
              </div>
              <div className={`flex items-center font-mono text-sm ${idx.change >= 0 ? 'text-neon-green' : 'text-red-500'}`}>
                {idx.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {idx.change >= 0 ? '📈 +' : '📉 '}{idx.change} ({idx.changePercent}%)
              </div>
            </div>

            <div className="h-[180px] w-full bg-black/20 rounded-xl border border-glass-border p-2 relative group-hover:border-neon-blue/30 transition-colors">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={idx.history}>
                  <defs>
                    <linearGradient id={`color${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={idx.change >= 0 ? "#00FF41" : "#FF4444"} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={idx.change >= 0 ? "#00FF41" : "#FF4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={idx.change >= 0 ? "#00FF41" : "#FF4444"} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill={`url(#color${i})`} 
                    animationDuration={1000}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(10, 15, 30, 0.9)', 
                      border: '1px solid rgba(0, 243, 255, 0.3)',
                      borderRadius: '8px',
                      fontSize: '10px',
                      color: '#fff'
                    }}
                    itemStyle={{ color: '#00f3ff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-glass-border grid grid-cols-2 gap-4 relative z-10">
        <div className="flex items-center space-x-3">
          <Clock className="w-4 h-4 text-white/20" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Last Update: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center justify-end space-x-3">
          <BarChart3 className="w-4 h-4 text-white/20" />
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Market Volatility: Low</span>
        </div>
      </div>
    </div>
  );
}
