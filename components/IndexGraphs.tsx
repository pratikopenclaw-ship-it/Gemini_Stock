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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell
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
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y' | 'LIVE'>('LIVE');

  useEffect(() => {
    // Generate mock index data based on timeframe
    const generateHistory = (base: number, tf: string) => {
      const history = [];
      let last = base;
      const points = tf === '1D' ? 24 : tf === '1W' ? 7 : tf === '1M' ? 30 : tf === '1Y' ? 52 : 15;
      
      for (let i = 0; i < points; i++) {
        const volatility = tf === 'LIVE' ? 0.001 : 0.02;
        last += base * volatility * (Math.random() - 0.5);
        
        let label = '';
        if (tf === '1D') label = `${i}:00`;
        else if (tf === '1W') label = `Day ${i + 1}`;
        else if (tf === '1M') label = `Day ${i + 1}`;
        else if (tf === '1Y') label = `Week ${i + 1}`;
        else {
          const date = new Date(Date.now() - (15 - i) * 60000);
          label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        history.push({ time: label, price: parseFloat(last.toFixed(2)) });
      }
      return history;
    };

    const niftyHistory = generateHistory(23500, timeframe);
    const sensexHistory = generateHistory(77000, timeframe);

    const timer = setTimeout(() => {
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

    // Simulate live updates only for LIVE timeframe
    let interval: NodeJS.Timeout | null = null;
    if (timeframe === 'LIVE') {
      interval = setInterval(() => {
        setIndices(prev => prev.map(idx => {
          const lastPrice = idx.history[idx.history.length - 1].price;
          const newPrice = parseFloat((lastPrice + lastPrice * 0.0005 * (Math.random() - 0.5)).toFixed(2));
          const newHistory = [...idx.history.slice(1), { 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
            price: newPrice 
          }];
          
          return {
            ...idx,
            value: newPrice,
            change: parseFloat((newPrice - idx.history[0].price).toFixed(2)),
            changePercent: parseFloat(((newPrice - idx.history[0].price) / idx.history[0].price * 100).toFixed(2)),
            history: newHistory
          };
        }));
      }, 60000); // Update every minute for 15 min window
    }

    return () => {
      clearTimeout(timer);
      if (interval) clearInterval(interval);
    };
  }, [timeframe]);

  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 blur-[100px] pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative z-10 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-neon-blue/20 flex items-center justify-center border border-neon-blue/30">
            <Activity className="w-5 h-5 text-neon-blue" />
          </div>
          <div>
            <h2 className="font-orbitron text-lg font-bold tracking-wider text-white">
              INDEX TERMINAL
            </h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {timeframe === 'LIVE' ? 'Real-time Stream' : `${timeframe} Historical Data`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-1 bg-white/5 rounded-lg border border-white/10">
          {(['1D', '1W', '1M', '1Y', 'LIVE'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-md text-[10px] font-orbitron transition-all ${
                timeframe === tf 
                  ? 'bg-neon-blue text-black font-bold shadow-[0_0_10px_rgba(0,243,255,0.4)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        {indices.map((idx, i) => (
          <div key={i} className="flex flex-col space-y-4">
            <div className="flex items-end justify-between border-b border-white/5 pb-2">
              <div>
                <h3 className="font-orbitron text-[10px] font-bold text-neon-blue/60 uppercase tracking-tighter mb-1">{idx.name}</h3>
                <div className="text-2xl font-mono font-bold text-white tracking-tighter">{formatINR(idx.value)}</div>
              </div>
              <div className={`flex items-center font-mono text-sm ${idx.change >= 0 ? 'text-neon-green' : 'text-red-500'}`}>
                {idx.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {idx.change >= 0 ? '📈 +' : '📉 '}{idx.change} ({idx.changePercent}%)
              </div>
            </div>

            <div className="h-[220px] w-full bg-black/20 rounded-xl border border-glass-border p-2 relative group-hover:border-neon-blue/30 transition-colors">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={idx.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={8} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={8} 
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(val) => `₹${val}`}
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
                    formatter={(value: number) => [formatINR(value), 'Price']}
                  />
                  <Bar 
                    dataKey="price" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1000}
                  >
                    {idx.history.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={idx.change >= 0 ? "#00FF41" : "#FF4444"} 
                        fillOpacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
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
