import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

export async function GET() {
  try {
    // Using Google News RSS feed for Indian Stock Market
    const feed = await parser.parseURL('https://news.google.com/rss/search?q=Indian+Stock+Market&hl=en-IN&gl=IN&ceid=IN:en');
    
    const newsItems = feed.items.map(item => ({
      title: item.title || 'No Title',
      url: item.link || '#',
      time_published: item.pubDate || new Date().toISOString(),
      authors: [item.creator || 'Financial News'],
      summary: item.contentSnippet || item.content || 'No Summary Available',
      banner_image: '',
      source: item.source || 'Market News',
      category_within_source: 'Markets',
      source_domain: 'news.google.com',
      overall_sentiment_score: 0,
      overall_sentiment_label: 'Neutral',
      ticker_sentiment: []
    }));

    return NextResponse.json({ feed: newsItems });
  } catch (error) {
    console.error('RSS Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to fetch news', feed: [] }, { status: 500 });
  }
}
