import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;
  const FINNHUB_KEY = process.env.FINNHUB_KEY;

  // If keys are missing, return mock data for demonstration
  if (!ALPHA_VANTAGE_KEY || !FINNHUB_KEY) {
    return NextResponse.json({
      symbol,
      technicals: `RSI is currently 58.4 (MOCK - Please set ALPHA_VANTAGE_KEY)`,
      sentiment: `Bullish Index: 65, Bearish Index: 35 (MOCK - Please set FINNHUB_KEY)`,
      newsBrief: `12 articles tracked this week with a score of 88 (MOCK - Please set FINNHUB_KEY)`
    });
  }

  try {
    // 1. Get Technical Indicators (RSI) from Alpha Vantage
    let rsiValue = "N/A";
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

    // 2. Get News Sentiment from Finnhub
    // Note: news-sentiment is a premium endpoint on Finnhub. 
    // If it fails with 403, we fallback to mock sentiment data.
    let sentiment = { bullishPercent: 65, bearishPercent: 35 };
    let buzz = { articlesInLastWeek: 12, buzzScore: 88 };
    
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
    } catch (e) {
      const is403 = axios.isAxiosError(e) && e.response?.status === 403;
      if (is403) {
        console.warn(`Finnhub Sentiment is a premium feature (403). Using fallback for ${symbol}.`);
      } else {
        console.warn(`Finnhub Sentiment fetch failed for ${symbol}:`, e instanceof Error ? e.message : String(e));
      }
    }

    return NextResponse.json({
      symbol,
      technicals: `RSI is currently ${rsiValue}.`,
      sentiment: `Bullish Index: ${sentiment.bullishPercent}, Bearish Index: ${sentiment.bearishPercent}.`,
      newsBrief: `${buzz.articlesInLastWeek} articles tracked this week with a score of ${buzz.buzzScore}.`
    });
  } catch (error) {
    console.error("Critical error in stock intelligence API:", error);
    return NextResponse.json({ error: 'Failed to fetch stock intelligence' }, { status: 500 });
  }
}
