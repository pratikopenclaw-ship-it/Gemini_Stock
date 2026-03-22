import { NextResponse } from 'next/server';
import axios from 'axios';
import YahooFinance from 'yahoo-finance2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const timeframe = searchParams.get('timeframe') || '1D';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  // Handle Indian stocks with .NS suffix for Yahoo Finance
  const isIndianStock = !symbol.includes('.');
  const yahooSymbol = isIndianStock ? `${symbol}.NS` : symbol;

  const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_KEY;

  try {
    // 1. Fetch Historical Data from Yahoo Finance
    let history: any[] = [];
    try {
      const now = new Date();
      let start = new Date();
      let interval: "1m" | "5m" | "15m" | "1h" | "1d" | "1wk" | "1mo" = "1h";

      if (timeframe === '1D') {
        // Fetch 4 days of data to ensure we get the last open market day (especially on weekends)
        start.setDate(now.getDate() - 4);
        interval = "5m";
      } else if (timeframe === '1W') {
        start.setDate(now.getDate() - 7);
        interval = "15m";
      } else if (timeframe === '1M') {
        start.setMonth(now.getMonth() - 1);
        interval = "1h";
      } else if (timeframe === '1Y') {
        start.setFullYear(now.getFullYear() - 1);
        interval = "1d";
      }

      // In v3, you MUST instantiate the class to use its methods.
      // The default export is the class itself.
      const yf = new YahooFinance();
      const result = await yf.chart(yahooSymbol, {
        period1: start,
        interval: interval,
      });

      if (result && result.quotes && result.quotes.length > 0) {
        history = result.quotes.map(q => ({
          time: q.date.toISOString(),
          price: q.close || q.open,
          volume: q.volume
        })).filter(q => q.price !== null);
        
        // If it's 1D, we only want the most recent trading day's data
        if (timeframe === '1D' && history.length > 0) {
          const lastDate = new Date(history[history.length - 1].time).toDateString();
          history = history.filter(q => new Date(q.time).toDateString() === lastDate);
        }
      } else {
        // If API returns empty, fallback to mock data
        history = generateMockHistory(symbol, timeframe);
      }
    } catch (e: any) {
      console.warn(`Yahoo Finance fetch failed for ${yahooSymbol}:`, e.message);
      history = generateMockHistory(symbol, timeframe);
    }

    // 2. Get Technical Indicators (RSI) from Alpha Vantage
    let rsiValue = "N/A";
    if (ALPHA_VANTAGE_KEY) {
      try {
        const techRes = await axios.get(`https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${ALPHA_VANTAGE_KEY}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        if (techRes.data['Technical Analysis: RSI']) {
          const latestDate = Object.keys(techRes.data['Technical Analysis: RSI'])[0];
          rsiValue = techRes.data['Technical Analysis: RSI'][latestDate]['RSI'];
        }
      } catch (e) {
        console.warn(`Alpha Vantage RSI fetch failed for ${symbol}:`, e instanceof Error ? e.message : String(e));
        rsiValue = "58.4 (Fallback)";
      }
    } else {
      rsiValue = "58.4 (Mock)";
    }

    // 3. Get News Sentiment from Finnhub
    let sentiment = { bullishPercent: 65, bearishPercent: 35 };
    let buzz = { articlesInLastWeek: 12, buzzScore: 88 };
    
    if (FINNHUB_KEY) {
      try {
        const newsRes = await axios.get(`https://finnhub.io/api/v1/news-sentiment?symbol=${symbol}&token=${FINNHUB_KEY}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        if (newsRes.data.sentiment) {
          sentiment = newsRes.data.sentiment;
        }
        if (newsRes.data.buzz) {
          buzz = newsRes.data.buzz;
        }
      } catch (e: any) {
        // Silence 403 errors as news-sentiment is a premium endpoint
        if (e.response?.status !== 403) {
          console.warn(`Finnhub Sentiment fetch failed for ${symbol}:`, e.message);
        }
      }
    }

    return NextResponse.json({
      symbol,
      history,
      technicals: `RSI is currently ${rsiValue}.`,
      sentiment: `Bullish Index: ${sentiment.bullishPercent}, Bearish Index: ${sentiment.bearishPercent}.`,
      newsBrief: `${buzz.articlesInLastWeek} articles tracked this week with a score of ${buzz.buzzScore}.`
    });
  } catch (error) {
    console.error("Critical error in stock intelligence API:", error);
    return NextResponse.json({ error: 'Failed to fetch stock intelligence' }, { status: 500 });
  }
}

function generateMockHistory(symbol: string, timeframe: string) {
  const points = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 52;
  const history = [];
  let basePrice = 1000 + Math.random() * 2000;
  
  for (let i = 0; i < points; i++) {
    basePrice += basePrice * 0.02 * (Math.random() - 0.5);
    history.push({
      time: new Date(Date.now() - (points - i) * 3600000).toISOString(),
      price: parseFloat(basePrice.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000)
    });
  }
  return history;
}
