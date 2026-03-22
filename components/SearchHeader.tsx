'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Bell, User, TrendingUp, TrendingDown, Globe } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';

const ALL_SYMBOLS = [
  { symbol: 'MAZDOCK', name: 'Mazagon Dock Shipbuilders', price: 2450.50, change: 4.2 },
  { symbol: 'SBIN', name: 'State Bank of India', price: 780.20, change: 1.5 },
  { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2950.00, change: -0.8 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd', price: 155.40, change: 2.1 },
  { symbol: 'INFY', name: 'Infosys Ltd', price: 1620.00, change: -1.2 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', price: 1450.30, change: 0.5 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', price: 1080.15, change: 1.8 },
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120.00, change: -0.4 },
  { symbol: 'WIPRO', name: 'Wipro Ltd', price: 485.60, change: 0.9 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd', price: 3120.40, change: -2.5 },
  { symbol: 'ZOMATO', name: 'Zomato Ltd', price: 185.20, change: 5.4 },
  { symbol: 'PAYTM', name: 'One97 Communications', price: 420.10, change: -3.2 },
];

interface SearchHeaderProps {
  onSearch: (query: string) => void;
  onSelectStock: (symbol: string) => void;
}

export function SearchHeader({ onSearch, onSelectStock }: SearchHeaderProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = query.length > 0 
    ? ALL_SYMBOLS.filter(s => 
        s.symbol.toLowerCase().includes(query.toLowerCase()) || 
        s.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : ALL_SYMBOLS.slice(0, 4); // Show top 4 as "Trending" if empty

  const showDropdown = isFocused && results.length > 0;

  useEffect(() => {
    // Auto-focus on mount for terminal-like experience
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol: string) => {
    onSelectStock(symbol);
    setIsFocused(false);
    setQuery('');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 glass-card rounded-none border-x-0 border-t-0 mb-6 relative z-50">
      <div className="flex items-center space-x-6">
        <h1 className="font-orbitron text-xl font-black tracking-tighter text-neon-green neon-glow-green">
          CYBER<span className="text-white">STOCK</span>
        </h1>
        <Link 
          href="/features" 
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-neon-blue/10 border border-neon-blue/20 hover:bg-neon-blue/20 hover:border-neon-blue/40 transition-all group"
        >
          <Globe className="w-4 h-4 text-neon-blue group-hover:animate-pulse" />
          <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest group-hover:text-neon-blue">Global Intel</span>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl mx-8 relative" ref={dropdownRef}>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-blue group-focus-within:text-neon-green transition-colors" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            placeholder="SEARCH SYMBOL (E.G. SBI, RELIANCE, MAZDOCK)..."
            className="w-full bg-black/40 border border-glass-border rounded-lg py-2 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-neon-green transition-all"
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
        </div>

        <AnimatePresence>
          {showDropdown && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 glass-card bg-black/90 border-neon-blue/30 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              <div className="p-2 border-b border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  {query.length > 0 ? 'Search Results' : 'Trending Stocks'}
                </span>
                {query.length === 0 && (
                  <span className="text-[8px] font-bold text-neon-green uppercase animate-pulse">Live</span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {results.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleSelect(stock.symbol)}
                    className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20 group-hover:border-neon-green transition-colors">
                        <span className="text-[10px] font-bold text-neon-blue group-hover:text-neon-green">{stock.symbol.slice(0, 2)}</span>
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-bold text-white group-hover:text-neon-green transition-colors">{stock.symbol}</div>
                        <div className="text-[10px] text-white/40">{stock.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">₹{stock.price.toLocaleString('en-IN')}</div>
                      <div className={`text-[10px] font-mono flex items-center justify-end ${stock.change >= 0 ? 'text-neon-green' : 'text-red-500'}`}>
                        {stock.change >= 0 ? <TrendingUp className="w-2 h-2 mr-1" /> : <TrendingDown className="w-2 h-2 mr-1" />}
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="p-2 bg-neon-blue/5 text-center">
                <span className="text-[8px] font-bold text-neon-blue uppercase tracking-widest">Press Enter to see all results</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-glass rounded-lg transition-colors text-cyber-blue">
          <Filter className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-glass rounded-lg transition-colors text-cyber-blue relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-neon-green rounded-full shadow-[0_0_5px_#00FF00]"></span>
        </button>
        <div className="w-8 h-8 rounded-full border border-neon-green p-0.5">
          <div className="w-full h-full bg-cyber-blue/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-neon-green" />
          </div>
        </div>
      </div>
    </header>
  );
}
