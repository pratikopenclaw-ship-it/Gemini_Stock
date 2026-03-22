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
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setIsExpanded(!isExpanded)}
      className={`glass-card p-5 mb-4 transition-all duration-300 cursor-pointer relative overflow-hidden ${
        isExpanded 
          ? 'bg-black/80 border-neon-green/50 shadow-[0_0_30px_rgba(0,255,65,0.15)] scale-[1.02] z-10' 
          : 'bg-white/5 border-glass-border hover:border-neon-blue/30'
      }`}
    >
      {isExpanded && (
        <div className="absolute top-0 left-0 w-1 h-full bg-neon-green shadow-[0_0_10px_rgba(0,255,65,0.5)]" />
      )}
      
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-bold text-cyber-blue uppercase tracking-widest opacity-80">
          {news.source} • {formatDistanceToNow(new Date(news.time_published), { addSuffix: true })}
        </span>
        <div className={`flex items-center space-x-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${getSentimentColor(news.overall_sentiment_label)}`}>
          {getSentimentIcon(news.overall_sentiment_label)}
          <span>{news.overall_sentiment_label}</span>
        </div>
      </div>
      
      <h3 className={`font-orbitron font-bold leading-tight mb-3 transition-all ${isExpanded ? 'text-lg text-white' : 'text-sm text-white/90'}`}>
        {news.title}
      </h3>
      
      <motion.div 
        initial={false}
        animate={{ height: isExpanded ? 'auto' : '3em' }}
        className="overflow-hidden"
      >
        <p className={`text-xs text-white/70 leading-relaxed mb-4 ${isExpanded ? '' : 'line-clamp-2'}`}>
          {news.summary}
        </p>
      </motion.div>
      
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex space-x-2">
          {news.ticker_sentiment.slice(0, 3).map((t, i) => (
            <span key={i} className="text-[10px] bg-black/40 border border-glass-border px-2 py-0.5 rounded text-neon-green font-bold tracking-tighter">
              ${t.ticker}
            </span>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] font-bold text-neon-green uppercase tracking-widest flex items-center"
            >
              <span className="w-1.5 h-1.5 bg-neon-green rounded-full mr-2 animate-pulse" />
              Expanded View
            </motion.span>
          )}
          <a 
            href={news.url} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-cyber-blue hover:text-neon-green transition-all flex items-center space-x-2 group/link"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest group-hover/link:underline">Full Feed</span>
            <ExternalLink className="w-3 h-3 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
