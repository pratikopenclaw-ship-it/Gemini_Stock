'use client';

import React from 'react';
import { GeopoliticalMap } from '@/components/GeopoliticalMap';
import { Shield, Globe, Zap, ArrowLeft, Info, Activity, BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-neon-blue/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors group">
              <ArrowLeft className="w-5 h-5 text-white/40 group-hover:text-neon-blue" />
            </Link>
            <h1 className="font-orbitron text-xl font-black tracking-tighter text-neon-green neon-glow-green">
              CYBER<span className="text-white">STOCK</span> <span className="text-white/20 text-sm ml-2">ADDITIONAL FEATURES</span>
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Quantum Link Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-12">
        {/* Hero Section */}
        <section className="relative py-12 overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-neon-blue/5 to-transparent">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Globe className="w-64 h-64 text-neon-blue" />
          </div>
          <div className="relative z-10 px-8">
            <h2 className="font-orbitron text-4xl font-bold mb-4 tracking-tight">
              GEOPOLITICAL <span className="text-neon-blue">INTELLIGENCE</span>
            </h2>
            <p className="text-white/60 max-w-2xl text-lg leading-relaxed">
              In 2026, market movements are driven as much by global events as by financial data. 
              Our Geopolitical Intelligence suite leverages the GDELT Project to map global risk in real-time.
            </p>
          </div>
        </section>

        {/* The Map Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-neon-blue/20 rounded-lg">
                <Shield className="w-5 h-5 text-neon-blue" />
              </div>
              <h3 className="font-orbitron text-lg font-bold uppercase tracking-wider text-white">Global Risk Heat Map</h3>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <Info className="w-3 h-3" />
                <span>Powered by GDELT GKG API</span>
              </div>
            </div>
          </div>

          <div className="h-[700px] w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,243,255,0.05)]">
            <GeopoliticalMap />
          </div>
        </section>

        {/* Feature Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 border-white/10 hover:border-neon-blue/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-neon-blue/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6 text-neon-blue" />
            </div>
            <h4 className="font-orbitron text-sm font-bold mb-3 uppercase tracking-wider">GDELT Integration</h4>
            <p className="text-xs text-white/40 leading-relaxed">
              Monitors world news in 100+ languages, geocoding events to provide a Global Knowledge Graph of tone and location.
            </p>
          </div>

          <div className="glass-card p-6 border-white/10 hover:border-neon-green/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-neon-green" />
            </div>
            <h4 className="font-orbitron text-sm font-bold mb-3 uppercase tracking-wider">Goldstein Scale</h4>
            <p className="text-xs text-white/40 leading-relaxed">
              Measures the theoretical impact an event will have on a country&apos;s stability, providing a quantitative risk score.
            </p>
          </div>

          <div className="glass-card p-6 border-white/10 hover:border-red-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-red-500" />
            </div>
            <h4 className="font-orbitron text-sm font-bold mb-3 uppercase tracking-wider">Real-time Alerts</h4>
            <p className="text-xs text-white/40 leading-relaxed">
              Automatic detection of &apos;ECON_TRADE&apos; and &apos;REBELLION&apos; themes to warn of potential supply chain or market disruptions.
            </p>
          </div>
        </section>
      </main>

      <footer className="p-12 text-center border-t border-white/5 mt-24">
        <p className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase">
          Cyber-Stock Intelligence Terminal • Geopolitical Data Node v2.0
        </p>
      </footer>
    </div>
  );
}
