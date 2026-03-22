'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart,
  Line,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell
} from 'recharts';

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
};

interface DataPoint {
  time: string;
  price: number;
  volume: number;
}

interface StockAnalysisGraphProps {
  data: DataPoint[];
  isLive?: boolean;
}

export function StockAnalysisGraph({ data, isLive }: StockAnalysisGraphProps) {
  return (
    <div className="h-full w-full bg-[#050505] rounded-2xl border border-white/5 p-4 relative overflow-hidden group">
      {isLive && (
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 bg-neon-green/10 border border-neon-green/30 px-2 py-1 rounded">
          <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-neon-green uppercase tracking-widest">Live</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data}>
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="#39FF14" floodOpacity="0.5" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255,255,255,0.2)" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            yAxisId="price"
            stroke="rgba(255,255,255,0.2)" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
            tickFormatter={(val) => `₹${val}`}
          />
          <YAxis 
            yAxisId="volume"
            orientation="right"
            stroke="rgba(255,255,255,0.1)" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            hide
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length >= 2) {
                return (
                  <div className="glass-card p-3 border border-neon-blue/30 backdrop-blur-xl bg-black/60 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                    <p className="text-[10px] font-bold text-white/40 mb-1 uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-mono font-bold text-neon-green">Price: {formatINR(payload[0].value as number)}</p>
                    <p className="text-[10px] font-mono text-cyber-blue">Vol: {payload[1].value?.toLocaleString()}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            yAxisId="volume"
            dataKey="volume" 
            fill="#00F5FF" 
            opacity={0.3}
            barSize={20}
          />
          <Line 
            yAxisId="price"
            type="monotone" 
            dataKey="price" 
            stroke="#39FF14" 
            strokeWidth={3}
            dot={false}
            filter="url(#glow)"
            animationDuration={1500}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
