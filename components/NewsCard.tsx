'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { NewsItem } from '@/lib/api';
import { motion } from 'motion/react';

interface NewsCardProps {
  news: NewsItem;
}

export function NewsCard({ news }: NewsCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getSentimentColor = (label: string) => {
    switch (label.toLowerCase()) {
      case 'bullish': return 'text-neon-green border-neon-green/30 bg-neon-green/5';
      case 'bearish': return 'text-red-500 border-red-500/30 bg-red-500/5';
      default: return 'text-cyber-blue border-cyber-blue/30 bg-cyber-blue/5';
    }
  };

  const getSentimentIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'bullish': return <TrendingUp className="w-3 h-3" />;
      case 'bearish': return <TrendingDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`glass-card p-4 mb-4 neon-border-blue group hover:neon-border-green transition-all cursor-pointer ${isExpanded ? 'ring-1 ring-neon-green shadow-[0_0_20px_rgba(0,255,65,0.2)]' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-cyber-blue uppercase tracking-widest">
          {news.source} • {formatDistanceToNow(new Date(news.time_published), { addSuffix: true })}
        </span>
        <div className={`flex items-center space-x-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getSentimentColor(news.overall_sentiment_label)}`}>
          {getSentimentIcon(news.overall_sentiment_label)}
          <span>{news.overall_sentiment_label}</span>
        </div>
      </div>
      
      <h3 className="font-orbitron text-sm font-bold leading-tight mb-2 group-hover:text-neon-green transition-colors">
        {news.title}
      </h3>
      
      <p className={`text-xs text-white/60 mb-3 leading-relaxed transition-all ${isExpanded ? '' : 'line-clamp-2'}`}>
        {news.summary}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {news.ticker_sentiment.slice(0, 3).map((t, i) => (
            <span key={i} className="text-[10px] bg-black/40 border border-glass-border px-1.5 py-0.5 rounded text-neon-green font-bold">
              ${t.ticker}
            </span>
          ))}
        </div>
        <div className="flex items-center space-x-3">
          {isExpanded && (
            <span className="text-[10px] font-bold text-neon-green animate-pulse uppercase tracking-widest">Expanded View</span>
          )}
          <a 
            href={news.url} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-cyber-blue hover:text-neon-green transition-colors flex items-center space-x-1"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest">Full Feed</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
