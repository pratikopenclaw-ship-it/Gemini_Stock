'use client';

import React, { useState, useEffect } from 'react';
import { Ticker } from '@/components/Ticker';
import { SearchHeader } from '@/components/SearchHeader';
import { NewsCard } from '@/components/NewsCard';
import { TradeAnalysis } from '@/components/TradeAnalysis';
import { IndexGraphs } from '@/components/IndexGraphs';
import { GeopoliticalMap } from '@/components/GeopoliticalMap';
import { StockModal } from '@/components/StockModal';
import { fetchStockNews, getMockTrades, NewsItem, TradeItem } from '@/lib/api';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [layout, setLayout] = useState(['indices', 'news-feed', 'trade-analysis', 'geopolitical-map']);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const newsData = await fetchStockNews();
      setNews(newsData);
      setTrades(getMockTrades());
      setLoading(false);
    };
    loadData();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLayout((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const filteredNews = news.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.ticker_sentiment.some(t => t.ticker.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderComponent = (id: string) => {
    switch (id) {
      case 'indices':
        return <IndexGraphs />;
      case 'news-feed':
        return (
          <div className="glass-card p-6 h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-orbitron text-lg font-bold tracking-wider text-neon-green">
                MARKET FEED
              </h2>
              <div className="flex space-x-2">
                <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Live Updates</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse border border-white/10"></div>
                ))
              ) : filteredNews.length > 0 ? (
                filteredNews.map((item, i) => (
                  <NewsCard key={i} news={item} />
                ))
              ) : (
                <div className="text-center py-20 text-white/40">
                  <p className="font-orbitron text-xs">NO NEWS FOUND FOR &quot;{searchQuery.toUpperCase()}&quot;</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'trade-analysis':
        return <TradeAnalysis trades={trades} onStockClick={setSelectedStock} />;
      case 'geopolitical-map':
        return <GeopoliticalMap />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Ticker />
      
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
        <SearchHeader onSearch={setSearchQuery} onSelectStock={setSelectedStock} />

        {mounted ? (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <SortableContext items={layout} strategy={verticalListSortingStrategy}>
                {layout.map((id) => (
                  <div 
                    key={id} 
                    className={
                      id === 'indices' ? 'lg:col-span-12' : 
                      id === 'geopolitical-map' ? 'lg:col-span-12' :
                      id === 'news-feed' ? 'lg:col-span-5' : 
                      'lg:col-span-7'
                    }
                  >
                    <SortableItem id={id}>
                      {renderComponent(id)}
                    </SortableItem>
                  </div>
                ))}
              </SortableContext>
            </div>
          </DndContext>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12 h-64 bg-white/5 rounded-xl animate-pulse"></div>
            <div className="lg:col-span-5 h-[600px] bg-white/5 rounded-xl animate-pulse"></div>
            <div className="lg:col-span-7 h-[600px] bg-white/5 rounded-xl animate-pulse"></div>
          </div>
        )}
      </main>

      <StockModal 
        symbol={selectedStock || ''} 
        isOpen={!!selectedStock} 
        onClose={() => setSelectedStock(null)} 
      />

      <footer className="p-4 text-center border-t border-glass-border mt-12">
        <p className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase">
          Cyber-Blue Financial Terminal v1.1.0 • Data provided by Google News RSS & Public Market Feeds
        </p>
      </footer>
    </div>
  );
}
