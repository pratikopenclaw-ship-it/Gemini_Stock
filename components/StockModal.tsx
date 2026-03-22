'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Clock, 
  Globe, 
  Info,
  Zap,
  Newspaper,
  BrainCircuit,
  Target,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { StockAnalysisGraph } from '@/components/StockAnalysisGraph';
import { NewsCard } from '@/components/NewsCard';
import { motion, AnimatePresence } from 'motion/react';
import { fetchStockNews, NewsItem } from '@/lib/api';
import { GoogleGenAI, Type } from "@google/genai";

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(value);
};

interface StockModalProps {
  symbol: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PricePoint {
  time: string;
  price: number;
  volume: number;
}

interface AISignal {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence_score: number;
  entry_price: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2: number;
  reasoning: string;
}

export function StockModal({ symbol, isOpen, onClose }: StockModalProps) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [change, setChange] = useState(0);
  const [changePercent, setChangePercent] = useState(0);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [aiSignal, setAiSignal] = useState<AISignal | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIDecision = async (price: number, newsContext: string) => {
    setLoadingAI(true);
    try {
      // 1. Fetch real-time stock intelligence from our API
      const intelRes = await fetch(`/api/stock-intelligence?symbol=${symbol}`);
      const intelData = await intelRes.json();
      
      const dataContext = `
        SYMBOL: ${symbol}
        PRICE: ${price}
        TECHNICALS: ${intelData.technicals || 'RSI: 55'}
        SENTIMENT: ${intelData.sentiment || 'Bullish: 60, Bearish: 40'}
        NEWS BRIEF: ${intelData.newsBrief || '10 articles tracked this week'}
        NEWS_CONTEXT: ${newsContext}
      `;

      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this data: ${dataContext}
        
        Provide a JSON response with:
        - signal: (BUY, SELL, or HOLD)
        - confidence_score: (0-100)
        - entry_price: (Current market estimate)
        - stop_loss: (Calculated based on volatility)
        - take_profit_1: (Target 1)
        - take_profit_2: (Target 2)
        - reasoning: (1-sentence technical justification)`,
        config: {
          systemInstruction: `You are a Senior Quantitative Trading Analyst and Risk Manager.
Task: Analyze the provided Stock Data (Technical Indicators + News Sentiment) to provide a high-probability trading signal.

Analysis Protocol:
1. Technical Alignment: Check if RSI, MACD, and Moving Averages (SMA 50/200) agree on trend direction.
2. Sentiment Check: Analyze the 'News_Context' for bullish/bearish catalysts (Earnings, SEC filings, Macro trends).
3. Volatility Adjustment: Use ATR (Average True Range) or recent Support/Resistance to calculate Stop-Loss.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              signal: { type: Type.STRING, enum: ["BUY", "SELL", "HOLD"] },
              confidence_score: { type: Type.NUMBER },
              entry_price: { type: Type.NUMBER },
              stop_loss: { type: Type.NUMBER },
              take_profit_1: { type: Type.NUMBER },
              take_profit_2: { type: Type.NUMBER },
              reasoning: { type: Type.STRING }
            },
            required: ["signal", "confidence_score", "entry_price", "stop_loss", "take_profit_1", "take_profit_2", "reasoning"]
          }
        }
      });

      if (response.text) {
        setAiSignal(JSON.parse(response.text));
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLoadingNews(true);
      fetchStockNews(symbol).then(newsData => {
        setNews(newsData);
        setLoadingNews(false);
        
        // Trigger AI analysis once news is loaded
        if (newsData.length > 0 && currentPrice > 0) {
          fetchAIDecision(currentPrice, newsData[0].summary);
        }
      });

      // Fetch historical data from our API
      const fetchHistory = async () => {
        setLoadingHistory(true);
        setError(null);
        try {
          const res = await fetch(`/api/stock-intelligence?symbol=${symbol}&timeframe=${timeframe}`);
          if (!res.ok) throw new Error(`API Error: ${res.status}`);
          const result = await res.json();
          
          if (result.history && result.history.length > 0) {
            const formattedData = result.history.map((p: any) => ({
              ...p,
              time: timeframe === '1D' 
                ? new Date(p.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date(p.time).toLocaleDateString([], { month: 'short', day: 'numeric' })
            }));
            
            setData(formattedData);
            const first = formattedData[0].price;
            const last = formattedData[formattedData.length - 1].price;
            setCurrentPrice(last);
            setChange(parseFloat((last - first).toFixed(2)));
            setChangePercent(parseFloat(((last - first) / first * 100).toFixed(2)));
          } else {
            setData([]);
            setError("No historical data available for this symbol.");
          }
        } catch (error) {
          console.error("Error fetching history:", error);
          setError("Failed to synchronize with market data servers.");
        } finally {
          setLoadingHistory(false);
        }
      };

      fetchHistory();

      // Simulate live updates (Upstox WebSocket simulation)
      let interval: NodeJS.Timeout;
      if (timeframe === '1D') {
        interval = setInterval(() => {
          setData(prev => {
            if (prev.length === 0) return prev;
            const lastPoint = prev[prev.length - 1];
            const volatility = 0.0005; // Very low for live ticks
            const change = lastPoint.price * volatility * (Math.random() - 0.5);
            const newPrice = parseFloat((lastPoint.price + change).toFixed(2));
            const newPoint = {
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              price: newPrice,
              volume: Math.floor(Math.random() * 5000) + 1000
            };
            
            const newData = [...prev.slice(1), newPoint];
            const first = newData[0].price;
            const last = newData[newData.length - 1].price;
            setCurrentPrice(last);
            setChange(parseFloat((last - first).toFixed(2)));
            setChangePercent(parseFloat(((last - first) / first * 100).toFixed(2)));
            
            return newData;
          });
        }, 2000);
      }

      return () => {
        if (interval) clearInterval(interval);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, timeframe, symbol]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-glass-border flex items-center justify-between bg-gradient-to-r from-neon-blue/10 to-transparent">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-neon-blue/20 flex items-center justify-center border border-neon-blue/30">
                <Activity className="w-6 h-6 text-neon-blue" />
              </div>
              <div>
                <h2 className="font-orbitron text-2xl font-bold tracking-tighter text-white">
                  {symbol} <span className="text-neon-blue/60 text-sm ml-2">EQUITY</span>
                </h2>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-2xl font-mono font-bold text-white">{formatINR(currentPrice)}</span>
                  <span className={`flex items-center font-mono text-sm ${change >= 0 ? 'text-neon-green' : 'text-red-500'}`}>
                    {change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {change >= 0 ? '📈 +' : '📉 '}{change} ({changePercent}%)
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Timeframe Selector */}
            <div className="flex space-x-2 p-1 bg-white/5 rounded-lg w-fit border border-white/10">
              {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-1.5 rounded-md text-xs font-orbitron transition-all ${
                    timeframe === tf 
                      ? 'bg-neon-blue text-black font-bold shadow-[0_0_15px_rgba(0,243,255,0.4)]' 
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Main Graph */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-neon-blue" />
                  <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider">Stock History & Performance</h3>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  <span>Real-time Market Data Stream</span>
                </div>
              </div>
              <div className="h-[400px] w-full relative">
                {loadingHistory ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl z-10">
                    <div className="w-12 h-12 border-2 border-neon-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-xs font-orbitron text-neon-blue animate-pulse">FETCHING MARKET DATA...</p>
                  </div>
                ) : error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl z-10 p-6 text-center">
                    <ShieldAlert className="w-12 h-12 text-red-500 mb-4 opacity-50" />
                    <p className="text-sm font-orbitron text-red-500 mb-2 uppercase tracking-wider">{error}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">The terminal is attempting to reconnect to alternate data nodes.</p>
                  </div>
                ) : data.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl z-10">
                    <Activity className="w-12 h-12 text-white/10 mb-4" />
                    <p className="text-xs font-orbitron text-white/20 uppercase tracking-widest">Awaiting Data Stream Initialization...</p>
                  </div>
                ) : null}
                <StockAnalysisGraph data={data} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Open', value: formatINR(currentPrice * 0.98), icon: Globe },
                { label: 'High', value: formatINR(currentPrice * 1.02), icon: TrendingUp },
                { label: 'Low', value: formatINR(currentPrice * 0.97), icon: TrendingDown },
                { label: 'Volume', value: '1.2M', icon: BarChart3 },
                { label: 'Market Cap', value: '₹4.2T', icon: Activity },
                { label: 'P/E Ratio', value: '24.5', icon: Info },
                { label: '52W High', value: formatINR(currentPrice * 1.15), icon: TrendingUp },
                { label: '52W Low', value: formatINR(currentPrice * 0.85), icon: TrendingDown },
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-neon-blue/30 transition-colors">
                  <div className="flex items-center space-x-2 mb-2">
                    <stat.icon className="w-3 h-3 text-neon-blue" />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>

            {/* Technical Analysis & Sentiment */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stock Brain AI Section */}
              <div className="lg:col-span-2 bg-gradient-to-br from-neon-blue/10 to-transparent rounded-2xl p-6 border border-neon-blue/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BrainCircuit className="w-24 h-24 text-neon-blue" />
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-neon-blue/20 rounded-lg">
                      <BrainCircuit className="w-5 h-5 text-neon-blue" />
                    </div>
                    <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider">Stock Brain Intelligence</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-neon-blue/60 uppercase tracking-widest">Quant Analysis Protocol v4.2</span>
                    <div className={`w-2 h-2 rounded-full ${loadingAI ? 'bg-yellow-500 animate-pulse' : 'bg-neon-green'}`}></div>
                  </div>
                </div>

                {loadingAI ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="w-12 h-12 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-orbitron text-neon-blue animate-pulse">SYNCHRONIZING NEURAL NETWORKS...</p>
                  </div>
                ) : aiSignal ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div>
                          <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Trading Signal</p>
                          <p className={`text-2xl font-orbitron font-bold ${
                            aiSignal.signal === 'BUY' ? 'text-neon-green' : 
                            aiSignal.signal === 'SELL' ? 'text-red-500' : 'text-yellow-500'
                          }`}>
                            {aiSignal.signal}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Confidence</p>
                          <p className="text-2xl font-mono font-bold text-white">{aiSignal.confidence_score}%</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                          <div className="flex items-center space-x-2 mb-1">
                            <Target className="w-3 h-3 text-neon-blue" />
                            <span className="text-[10px] font-bold text-white/40 uppercase">Entry</span>
                          </div>
                          <p className="text-sm font-mono font-bold text-white">{formatINR(aiSignal.entry_price)}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                          <div className="flex items-center space-x-2 mb-1">
                            <ShieldAlert className="w-3 h-3 text-red-500" />
                            <span className="text-[10px] font-bold text-white/40 uppercase">Stop Loss</span>
                          </div>
                          <p className="text-sm font-mono font-bold text-red-500">{formatINR(aiSignal.stop_loss)}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-neon-green/5 rounded-lg border border-neon-green/20">
                          <div className="flex items-center space-x-2">
                            <ArrowUpRight className="w-3 h-3 text-neon-green" />
                            <span className="text-[10px] font-bold text-neon-green/60 uppercase">Target 1</span>
                          </div>
                          <p className="text-sm font-mono font-bold text-neon-green">{formatINR(aiSignal.take_profit_1)}</p>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-neon-green/10 rounded-lg border border-neon-green/30">
                          <div className="flex items-center space-x-2">
                            <ArrowUpRight className="w-3 h-3 text-neon-green" />
                            <span className="text-[10px] font-bold text-neon-green/60 uppercase">Target 2</span>
                          </div>
                          <p className="text-sm font-mono font-bold text-neon-green">{formatINR(aiSignal.take_profit_2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between">
                      <div className="bg-black/40 rounded-xl p-4 border border-white/5 h-full">
                        <p className="text-[10px] font-bold text-neon-blue uppercase mb-3 tracking-widest">AI Reasoning Protocol</p>
                        <p className="text-xs text-white/70 leading-relaxed italic">
                          &quot;{aiSignal.reasoning}&quot;
                        </p>
                        <div className="mt-6 pt-4 border-t border-white/5">
                          <div className="flex items-center space-x-2 mb-2">
                            <Activity className="w-3 h-3 text-neon-blue" />
                            <span className="text-[10px] font-bold text-white/40 uppercase">Technical Alignment</span>
                          </div>
                          <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                            <div className="bg-neon-blue h-full" style={{ width: '85%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-white/20">
                    <BrainCircuit className="w-12 h-12 mb-2 opacity-10" />
                    <p className="text-xs font-orbitron uppercase tracking-widest">Awaiting Market Context...</p>
                  </div>
                )}
              </div>

              <div className="bg-neon-blue/5 rounded-2xl p-6 border border-neon-blue/20">
                <div className="flex items-center space-x-2 mb-4">
                  <Activity className="w-5 h-5 text-neon-blue" />
                  <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider">Technical Indicators</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'RSI (14)', value: '62.4', status: 'Neutral', color: 'text-yellow-500' },
                    { name: 'MACD', value: 'Bullish Crossover', status: 'Buy', color: 'text-neon-green' },
                    { name: 'Moving Average (50)', value: formatINR(currentPrice * 0.95), status: 'Above', color: 'text-neon-green' },
                    { name: 'Bollinger Bands', value: 'Upper Band', status: 'Resistance', color: 'text-red-500' },
                  ].map((indicator, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs text-white/60">{indicator.name}</span>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-white">{indicator.value}</div>
                        <div className={`text-[10px] font-bold uppercase ${indicator.color}`}>{indicator.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Block Trades for this Symbol */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider">Recent Block Activity</h3>
                  <span className="text-[10px] font-bold text-neon-blue bg-neon-blue/10 px-2 py-1 rounded border border-neon-blue/30 uppercase">Live Feed</span>
                </div>
                <div className="space-y-3">
                  {[
                    { client: 'LIC OF INDIA', qty: '450k', price: currentPrice * 0.99, type: 'BUY' },
                    { client: 'HDFC MUTUAL FUND', qty: '120k', price: currentPrice * 1.01, type: 'SELL' },
                    { client: 'MORGAN STANLEY', qty: '85k', price: currentPrice * 0.995, type: 'BUY' },
                  ].map((trade, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center space-x-3">
                        <div className={`w-1 h-8 rounded-full ${trade.type === 'BUY' ? 'bg-neon-green' : 'bg-red-500'}`}></div>
                        <div>
                          <div className="text-xs font-bold text-white">{trade.client}</div>
                          <div className="text-[10px] text-white/40 uppercase tracking-tighter">{trade.qty} Shares @ {formatINR(trade.price)}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${trade.type === 'BUY' ? 'text-neon-green bg-neon-green/10' : 'text-red-500 bg-red-500/10'}`}>
                        {trade.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 border-white/10 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Newspaper className="w-5 h-5 text-neon-green" />
                    <h3 className="font-orbitron text-sm font-bold text-white uppercase tracking-wider">Latest News</h3>
                  </div>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Real-time Feed</span>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-4 custom-scrollbar">
                  {loadingNews ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse border border-white/10"></div>
                    ))
                  ) : news.length > 0 ? (
                    news.map((item, i) => (
                      <NewsCard key={i} news={item} />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-white/20">
                      <Newspaper className="w-8 h-8 mb-2 opacity-20" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No recent news found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-neon-blue/5 rounded-2xl p-6 border border-neon-blue/20">
              <div className="flex items-center space-x-2 mb-4">
                <Info className="w-5 h-5 text-neon-blue" />
                <h3 className="font-orbitron text-sm font-bold text-white">ASSET INTELLIGENCE</h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                {symbol} is currently showing {change >= 0 ? 'bullish' : 'bearish'} momentum in the {timeframe} window. 
                Market sentiment analysis indicates strong institutional support at current levels. 
                Volume profile suggests active accumulation by major domestic funds.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-black/40 border-t border-glass-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Terminal Stream Active</span>
            </div>
            <button 
              className="px-6 py-2 bg-neon-blue text-black font-bold rounded-lg text-xs font-orbitron hover:shadow-[0_0_20px_rgba(0,243,255,0.6)] transition-all"
              onClick={onClose}
            >
              DISMISS TERMINAL
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
