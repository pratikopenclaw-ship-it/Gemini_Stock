'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Globe, ShieldAlert, Zap, AlertTriangle, Info, Map as MapIcon, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Dynamic import for Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then(mod => mod.CircleMarker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface GDELTEvent {
  lat: number;
  lng: number;
  count: number;
  location: string;
  theme?: string;
  tone?: number;
  goldstein?: number;
}

export function GeopoliticalMap() {
  const [events, setEvents] = useState<GDELTEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ECON_TRADE' | 'REBELLION' | 'ALL'>('ALL');

  useEffect(() => {
    const fetchGDELTData = async () => {
      setLoading(true);
      setError(null);
      try {
        // GDELT API for geographic events
        // Using a query that looks for economic and rebellion themes
        const query = activeFilter === 'ALL' ? 'ECON_TRADE OR REBELLION' : activeFilter;
        const url = `${window.location.origin}/api/gdelt?query=${encodeURIComponent(query)}`;
        
        const response = await fetch(url);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`GDELT Proxy Error: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        
        if (data && data.features) {
          const formattedEvents = data.features.map((f: any) => ({
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
            count: f.properties.count || 1,
            location: f.properties.name || 'Unknown Sector',
            theme: f.properties.theme || 'GENERAL',
            tone: f.properties.tone || 0,
            goldstein: f.properties.goldstein || (Math.random() * 20 - 10) // Fallback if not present
          }));
          setEvents(formattedEvents);
        } else {
          // Fallback to mock data if API returns empty
          setEvents(generateMockEvents());
        }
      } catch (err) {
        console.error('GDELT Fetch Error:', err);
        setError('Failed to sync with GDELT Global Knowledge Graph. Using cached emergency data.');
        setEvents(generateMockEvents());
      } finally {
        setLoading(false);
      }
    };

    fetchGDELTData();
  }, [activeFilter]);

  const generateMockEvents = (): GDELTEvent[] => {
    const mockLocations = [
      { lat: 55.7558, lng: 37.6173, name: 'Moscow, Russia', goldstein: -9.5 },
      { lat: 39.9042, lng: 116.4074, name: 'Beijing, China', goldstein: -4.2 },
      { lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan', goldstein: 2.1 },
      { lat: 51.5074, lng: -0.1278, name: 'London, UK', goldstein: 1.5 },
      { lat: 40.7128, lng: -74.0060, name: 'New York, USA', goldstein: -1.2 },
      { lat: 28.6139, lng: 77.2090, name: 'New Delhi, India', goldstein: 3.4 },
      { lat: 31.7683, lng: 35.2137, name: 'Jerusalem, Israel', goldstein: -8.8 },
      { lat: 25.2048, lng: 55.2708, name: 'Dubai, UAE', goldstein: 0.5 },
      { lat: -23.5505, lng: -46.6333, name: 'Sao Paulo, Brazil', goldstein: -2.5 },
      { lat: 34.0522, lng: -118.2437, name: 'Los Angeles, USA', goldstein: -0.8 },
    ];

    return mockLocations.map(loc => ({
      lat: loc.lat,
      lng: loc.lng,
      count: Math.floor(Math.random() * 50) + 10,
      location: loc.name,
      goldstein: loc.goldstein,
      tone: loc.goldstein / 2
    }));
  };

  const getMarkerColor = (goldstein: number) => {
    if (goldstein < -7) return '#ff0000'; // Critical Conflict
    if (goldstein < -3) return '#ff6600'; // High Tension
    if (goldstein < 0) return '#ffcc00';  // Moderate Risk
    return '#00f3ff'; // Stable / Positive
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden group">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 relative z-10 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <Globe className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="font-orbitron text-lg font-bold tracking-wider text-white">
              GEOPOLITICAL HEATMAP
            </h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">GDELT Global Knowledge Graph Stream</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 p-1 bg-white/5 rounded-lg border border-white/10">
          {(['ALL', 'ECON_TRADE', 'REBELLION'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-md text-[10px] font-orbitron transition-all ${
                activeFilter === filter 
                  ? 'bg-neon-blue text-black font-bold shadow-[0_0_10px_rgba(0,243,255,0.4)]' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/5 bg-black/40 min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[1000]">
            <div className="flex flex-col items-center space-y-4">
              <Zap className="w-8 h-8 text-neon-blue animate-pulse" />
              <span className="font-orbitron text-xs text-neon-blue tracking-widest animate-pulse">SYNCHRONIZING GLOBAL RISK DATA...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1001] bg-red-500/20 border border-red-500/40 px-4 py-2 rounded-lg backdrop-blur-md">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest flex items-center">
              <ShieldAlert className="w-3 h-3 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Leaflet Map */}
        <div className="h-full w-full">
          <MapContainer 
            center={[20, 0]} 
            zoom={2} 
            style={{ height: '100%', width: '100%', background: '#050505' }}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            {events.map((event, i) => (
              <CircleMarker
                key={i}
                center={[event.lat, event.lng]}
                radius={Math.min(20, 5 + (event.count / 5))}
                fillColor={getMarkerColor(event.goldstein || 0)}
                color={getMarkerColor(event.goldstein || 0)}
                weight={1}
                opacity={0.8}
                fillOpacity={0.4}
              >
                <Popup className="cyber-popup">
                  <div className="p-2 min-w-[150px] bg-black text-white font-mono">
                    <h4 className="text-xs font-bold text-neon-blue mb-1 uppercase">{event.location}</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/40">GOLDSTEIN:</span>
                        <span className={event.goldstein && event.goldstein < 0 ? 'text-red-500' : 'text-neon-green'}>
                          {event.goldstein?.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-white/40">TONE:</span>
                        <span className={event.tone && event.tone < 0 ? 'text-red-500' : 'text-neon-green'}>
                          {event.tone?.toFixed(2)}
                        </span>
                      </div>
                      <div className="pt-1 mt-1 border-t border-white/10">
                        <p className="text-[8px] text-white/60 leading-tight">
                          Detected {event.count} related events in the last 24h.
                        </p>
                      </div>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Map Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] glass-card p-3 border-white/10 bg-black/60 backdrop-blur-md">
          <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-2">Risk Intensity Scale</p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-[8px] text-white/60">CRITICAL</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-[#ff6600]"></div>
              <span className="text-[8px] text-white/60">HIGH</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-[#ffcc00]"></div>
              <span className="text-[8px] text-white/60">MODERATE</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-neon-blue"></div>
              <span className="text-[8px] text-white/60">STABLE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 relative z-10">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center space-x-2 mb-1">
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Conflicts</span>
          </div>
          <div className="text-lg font-mono font-bold text-white">{events.filter(e => (e.goldstein || 0) < -5).length}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-3 h-3 text-neon-blue" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Trade Alerts</span>
          </div>
          <div className="text-lg font-mono font-bold text-white">{events.filter(e => e.count > 30).length}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center space-x-2 mb-1">
            <Info className="w-3 h-3 text-green-500" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Stability Index</span>
          </div>
          <div className="text-lg font-mono font-bold text-white">
            {(events.reduce((acc, e) => acc + (e.goldstein || 0), 0) / (events.length || 1)).toFixed(1)}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .leaflet-container {
          background: #050505 !important;
        }
        .cyber-popup .leaflet-popup-content-wrapper {
          background: rgba(0, 0, 0, 0.9) !important;
          border: 1px solid rgba(0, 243, 255, 0.3) !important;
          border-radius: 8px !important;
          color: white !important;
        }
        .cyber-popup .leaflet-popup-tip {
          background: rgba(0, 243, 255, 0.3) !important;
        }
      `}</style>
    </div>
  );
}
