'use client';

import React from 'react';
import { Search, Filter, Bell, User } from 'lucide-react';

interface SearchHeaderProps {
  onSearch: (query: string) => void;
}

export function SearchHeader({ onSearch }: SearchHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 glass-card rounded-none border-x-0 border-t-0 mb-6">
      <div className="flex items-center space-x-4">
        <h1 className="font-orbitron text-xl font-black tracking-tighter text-neon-green neon-glow-green">
          CYBER<span className="text-white">STOCK</span>
        </h1>
      </div>

      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-blue group-focus-within:text-neon-green transition-colors" />
          <input
            type="text"
            placeholder="SEARCH SYMBOL (E.G. SBI, RELIANCE, MAZDOCK)..."
            className="w-full bg-black/40 border border-glass-border rounded-lg py-2 pl-10 pr-4 text-xs font-mono focus:outline-none focus:border-neon-green transition-all"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
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
