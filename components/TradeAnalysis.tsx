'use client';

import React from 'react';
import { TradeItem } from '@/lib/api';
import { motion } from 'motion/react';

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
};

interface TradeAnalysisProps {
  trades: TradeItem[];
  onStockClick: (symbol: string) => void;
}

export function TradeAnalysis({ trades, onStockClick }: TradeAnalysisProps) {
  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-orbitron text-lg font-bold tracking-wider text-cyber-blue">
          BULK & BLOCK TRADES
        </h2>
        <span className="text-[10px] font-bold text-neon-green bg-neon-green/10 px-2 py-1 rounded border border-neon-green/30">
          LIVE NSE/BSE
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-glass-border">
              <th className="py-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">Symbol</th>
              <th className="py-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">Client Name</th>
              <th className="py-3 text-[10px] font-bold text-white/40 uppercase tracking-widest">Qty</th>
              <th className="py-3 text-[10px] font-bold text-white/40 uppercase tracking-widest text-right">Price</th>
              <th className="py-3 text-[10px] font-bold text-white/40 uppercase tracking-widest text-right">Type</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, i) => (
              <motion.tr 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => onStockClick(trade.symbol)}
                className="border-b border-glass-border/50 hover:bg-white/5 transition-colors group cursor-pointer"
              >
                <td className="py-4 font-bold text-xs text-neon-green group-hover:underline">{trade.symbol}</td>
                <td className="py-4 text-xs text-white/80">{trade.clientName}</td>
                <td className="py-4 text-xs font-mono">{trade.quantity.toLocaleString()}</td>
                <td className="py-4 text-xs font-mono text-right">{formatINR(trade.price)}</td>
                <td className="py-4 text-right">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                    trade.type === 'BUY' ? 'text-neon-green bg-neon-green/10' : 'text-red-500 bg-red-500/10'
                  }`}>
                    {trade.type} {trade.type === 'BUY' ? '📈' : '📉'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-auto pt-6 text-center">
        <button className="text-[10px] font-bold text-cyber-blue hover:text-neon-green transition-colors tracking-widest uppercase">
          View All Market Activity →
        </button>
      </div>
    </div>
  );
}
