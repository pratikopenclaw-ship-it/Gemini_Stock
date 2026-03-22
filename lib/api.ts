import { formatDistanceToNow } from 'date-fns';

export interface NewsItem {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  banner_image: string;
  source: string;
  category_within_source: string;
  source_domain: string;
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment: {
    ticker: string;
    relevance_score: string;
    ticker_sentiment_score: string;
    ticker_sentiment_label: string;
  }[];
}

export interface TradeItem {
  symbol: string;
  clientName: string;
  quantity: number;
  price: number;
  type: 'BUY' | 'SELL';
  time: string;
}

// Simple sentiment analysis based on keywords
function analyzeSentiment(text: string): { score: number; label: string } {
  const bullishKeywords = ['gain', 'profit', 'rise', 'up', 'bullish', 'buy', 'secure', 'growth', 'beat', 'positive', 'high', 'jump', 'surge', 'rally'];
  const bearishKeywords = ['loss', 'fall', 'down', 'bearish', 'sell', 'decline', 'miss', 'negative', 'low', 'drop', 'slump', 'crash', 'contraction'];
  
  const lowerText = text.toLowerCase();
  let score = 0;
  
  bullishKeywords.forEach(word => {
    if (lowerText.includes(word)) score += 0.2;
  });
  
  bearishKeywords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.2;
  });
  
  // Clamp score between -1 and 1
  score = Math.max(-1, Math.min(1, score));
  
  let label = 'Neutral';
  if (score > 0.1) label = 'Bullish';
  if (score < -0.1) label = 'Bearish';
  
  return { score, label };
}

export async function fetchStockNews(ticker?: string): Promise<NewsItem[]> {
  try {
    const response = await fetch('/api/news');
    const data = await response.json();
    
    if (!data.feed || data.feed.length === 0) {
      return getMockNews();
    }

    // Apply sentiment analysis and filter by ticker if provided
    let news = data.feed.map((item: any) => {
      const sentiment = analyzeSentiment(item.title + ' ' + item.summary);
      
      // Extract potential tickers from title (simple regex for uppercase words)
      const potentialTickers = item.title.match(/[A-Z]{3,}/g) || [];
      const ticker_sentiment = potentialTickers.map((t: string) => ({
        ticker: t,
        relevance_score: "0.8",
        ticker_sentiment_score: sentiment.score.toString(),
        ticker_sentiment_label: sentiment.label
      }));

      return {
        ...item,
        overall_sentiment_score: sentiment.score,
        overall_sentiment_label: sentiment.label,
        ticker_sentiment
      };
    });

    if (ticker) {
      news = news.filter((item: NewsItem) => 
        item.title.toLowerCase().includes(ticker.toLowerCase()) ||
        item.ticker_sentiment.some(t => t.ticker.toLowerCase().includes(ticker.toLowerCase()))
      );
    }

    return news;
  } catch (error) {
    console.error('Error fetching news:', error);
    return getMockNews();
  }
}

// Mock data for demonstration
function getMockNews(): NewsItem[] {
  return [
    {
      title: "Mazagon Dock Shipbuilders Secures Major Order from Indian Navy",
      url: "#",
      time_published: new Date().toISOString(),
      authors: ["Market Watch"],
      summary: "The state-owned shipbuilder has bagged a significant contract for next-generation vessels, boosting its order book to record highs.",
      banner_image: "",
      source: "Economic Times",
      category_within_source: "Top News",
      source_domain: "economictimes.indiatimes.com",
      overall_sentiment_score: 0.8,
      overall_sentiment_label: "Bullish",
      ticker_sentiment: [{ ticker: "MAZDOCK", relevance_score: "0.9", ticker_sentiment_score: "0.8", ticker_sentiment_label: "Bullish" }]
    },
    {
      title: "SBI Reports 15% Growth in Quarterly Net Profit",
      url: "#",
      time_published: new Date(Date.now() - 3600000).toISOString(),
      authors: ["Financial Express"],
      summary: "State Bank of India's asset quality improved as gross NPAs declined, beating analyst estimates for the third consecutive quarter.",
      banner_image: "",
      source: "Financial Express",
      category_within_source: "Banking",
      source_domain: "financialexpress.com",
      overall_sentiment_score: 0.6,
      overall_sentiment_label: "Bullish",
      ticker_sentiment: [{ ticker: "SBIN", relevance_score: "0.9", ticker_sentiment_score: "0.6", ticker_sentiment_label: "Bullish" }]
    },
    {
      title: "Reliance Industries Faces Headwinds in O2C Segment",
      url: "#",
      time_published: new Date(Date.now() - 7200000).toISOString(),
      authors: ["Reuters"],
      summary: "Global refining margins contraction might impact RIL's petrochemical margins in the upcoming quarter, analysts warn.",
      banner_image: "",
      source: "Reuters",
      category_within_source: "Energy",
      source_domain: "reuters.com",
      overall_sentiment_score: -0.4,
      overall_sentiment_label: "Bearish",
      ticker_sentiment: [{ ticker: "RELIANCE", relevance_score: "0.9", ticker_sentiment_score: "-0.4", ticker_sentiment_label: "Bearish" }]
    }
  ];
}

export function getMockTrades(): TradeItem[] {
  const symbols = ['MAZDOCK', 'SBIN', 'RELIANCE', 'TATASTEEL', 'INFY', 'HDFCBANK', 'ICICIBANK', 'TCS', 'WIPRO', 'ADANIENT'];
  const clients = ['LIC OF INDIA', 'HDFC MUTUAL FUND', 'BLACKROCK', 'VANGUARD GROUP', 'MORGAN STANLEY', 'GOLDMAN SACHS', 'SBI MUTUAL FUND', 'RELIANCE CAPITAL', 'JPMORGAN CHASE', 'NORGES BANK'];
  
  return Array(10).fill(0).map((_, i) => {
    const type: 'BUY' | 'SELL' = Math.random() > 0.4 ? 'BUY' : 'SELL';
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const client = clients[Math.floor(Math.random() * clients.length)];
    const qty = (Math.floor(Math.random() * 500) + 100) * 1000;
    const price = parseFloat((Math.random() * 3000 + 100).toFixed(2));
    const time = new Date(Date.now() - Math.random() * 3600000 * 4).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return {
      symbol,
      clientName: client,
      quantity: qty,
      price: price,
      type,
      time
    };
  }).sort((a, b) => b.time.localeCompare(a.time));
}
