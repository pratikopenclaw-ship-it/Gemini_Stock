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
    const techRes = await axios.get(`https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${ALPHA_VANTAGE_KEY}`);
    
    let rsiValue = "N/A";
    if (techRes.data['Technical Analysis: RSI']) {
      const latestDate = Object.keys(techRes.data['Technical Analysis: RSI'])[0];
      rsiValue = techRes.data['Technical Analysis: RSI'][latestDate]['RSI'];
    }

    // 2. Get News Sentiment from Finnhub
    const newsRes = await axios.get(`https://finnhub.io/api/v1/news-sentiment?symbol=${symbol}&token=${FINNHUB_KEY}`);
    const sentiment = newsRes.data.sentiment || { bullishPercent: 50, bearishPercent: 50 };
    const buzz = newsRes.data.buzz || { articlesInLastWeek: 0, buzzScore: 0 };

    return NextResponse.json({
      symbol,
      technicals: `RSI is currently ${rsiValue}.`,
      sentiment: `Bullish Index: ${sentiment.bullishPercent}, Bearish Index: ${sentiment.bearishPercent}.`,
      newsBrief: `${buzz.articlesInLastWeek} articles tracked this week with a score of ${buzz.buzzScore}.`
    });
  } catch (error) {
    console.error("Error fetching brain data:", error);
    return NextResponse.json({ error: 'Failed to fetch stock intelligence' }, { status: 500 });
  }
}
