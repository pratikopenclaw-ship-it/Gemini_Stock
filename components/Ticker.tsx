'use client';

import React from 'react';

const INDICES = [
  { name: 'NIFTY 50', value: '₹22,453.20', change: '📈 +124.50', percent: '+0.56%' },
  { name: 'SENSEX', value: '₹73,876.15', change: '📈 +456.20', percent: '+0.62%' },
  { name: 'NIFTY BANK', value: '₹47,234.80', change: '📉 -89.30', percent: '-0.19%' },
  { name: 'NIFTY IT', value: '₹35,120.45', change: '📈 +210.15', percent: '+0.60%' },
  { name: 'NIFTY AUTO', value: '₹21,450.90', change: '📈 +340.20', percent: '+1.61%' },
  { name: 'NIFTY PHARMA', value: '₹18,920.30', change: '📉 -45.60', percent: '-0.24%' },
];

export function Ticker() {
  return (
    <div className="w-full bg-black/80 backdrop-blur-md border-b border-glass-border overflow-hidden py-2 sticky top-0 z-50">
      <div className="flex whitespace-nowrap animate-ticker">
        {[...INDICES, ...INDICES].map((index, i) => (
          <div key={i} className="flex items-center space-x-4 px-8 border-r border-glass-border">
            <span className="font-orbitron font-bold text-xs tracking-wider text-cyber-blue">
              {index.name}
            </span>
            <span className="font-mono text-sm font-bold">
              {index.value}
            </span>
            <span className={`text-xs font-bold ${index.change.startsWith('+') ? 'text-neon-green' : 'text-red-500'}`}>
              {index.change} ({index.percent})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
