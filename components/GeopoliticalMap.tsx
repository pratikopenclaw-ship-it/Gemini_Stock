'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Globe, ShieldAlert, Zap, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GeopoliticalIssue {
  country: string;
  intensity: number; // 0 to 1
  issue: string;
  impact: 'High' | 'Medium' | 'Low';
  details: string;
}

const MOCK_ISSUES: GeopoliticalIssue[] = [
  { 
    country: 'Russia', 
    intensity: 0.9, 
    issue: 'Sanctions & Conflict', 
    impact: 'High',
    details: 'Ongoing conflict in Ukraine has led to unprecedented sanctions, disrupting global energy markets and supply chains. Market volatility remains high as geopolitical tensions escalate.'
  },
  { 
    country: 'Ukraine', 
    intensity: 0.95, 
    issue: 'Direct Conflict', 
    impact: 'High',
    details: 'Active military operations continue to impact agricultural exports and regional stability. Global grain prices are sensitive to developments in this region.'
  },
  { 
    country: 'China', 
    intensity: 0.7, 
    issue: 'Trade Tensions', 
    impact: 'Medium',
    details: 'Strategic competition with the West over technology and trade routes. Recent export controls on critical minerals have impacted the semiconductor industry.'
  },
  { 
    country: 'USA', 
    intensity: 0.4, 
    issue: 'Policy Shifts', 
    impact: 'Medium',
    details: 'Upcoming elections and shifts in monetary policy are creating uncertainty in global markets. Trade policy adjustments are being closely monitored.'
  },
  { 
    country: 'Israel', 
    intensity: 0.85, 
    issue: 'Regional Conflict', 
    impact: 'High',
    details: 'Escalating regional tensions are impacting oil transit routes and maritime security in the Red Sea. Shipping costs have surged due to rerouting.'
  },
  { 
    country: 'Iran', 
    intensity: 0.75, 
    issue: 'Geopolitical Friction', 
    impact: 'High',
    details: 'Tensions over nuclear programs and regional influence continue to pose risks to energy security. Potential for disruption in the Strait of Hormuz.'
  },
  { 
    country: 'India', 
    intensity: 0.2, 
    issue: 'Border Stability', 
    impact: 'Low',
    details: 'Localized border friction but overall stable economic outlook. Increasing role as a global manufacturing hub is attracting foreign investment.'
  },
  { 
    country: 'Taiwan', 
    intensity: 0.8, 
    issue: 'Sovereignty Disputes', 
    impact: 'High',
    details: 'Strategic importance in the global semiconductor supply chain makes any tension here a critical risk for the tech sector worldwide.'
  },
];

export function GeopoliticalMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedIssue, setSelectedIssue] = useState<GeopoliticalIssue | null>(null);
  const [clickedIssue, setClickedIssue] = useState<GeopoliticalIssue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 450;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const projection = d3.geoNaturalEarth1()
      .scale(150)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Fetch world map data
    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then((data: any) => {
      setLoading(false);
      const countries = topojson.feature(data, data.objects.countries) as any;

      // Draw countries
      svg.append('g')
        .selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('d', (d: any) => path(d))
        .attr('fill', (d: any) => {
          const issue = MOCK_ISSUES.find(i => i.country === d.properties.name);
          if (issue) {
            return d3.interpolateReds(issue.intensity);
          }
          return 'rgba(255, 255, 255, 0.05)';
        })
        .attr('stroke', 'rgba(0, 243, 255, 0.1)')
        .attr('stroke-width', 0.5)
        .attr('class', 'country-path transition-all duration-300 cursor-pointer hover:fill-neon-blue/40')
        .on('mouseenter', function(event, d: any) {
          const issue = MOCK_ISSUES.find(i => i.country === d.properties.name);
          if (issue) {
            setSelectedIssue(issue);
            d3.select(this).attr('stroke', 'rgba(0, 243, 255, 0.8)').attr('stroke-width', 1.5);
          } else {
            setSelectedIssue({ country: d.properties.name, intensity: 0, issue: 'No major issues detected', impact: 'Low', details: '' });
          }
        })
        .on('mouseleave', function() {
          d3.select(this).attr('stroke', 'rgba(0, 243, 255, 0.1)').attr('stroke-width', 0.5);
        })
        .on('click', function(event, d: any) {
          const issue = MOCK_ISSUES.find(i => i.country === d.properties.name);
          if (issue) {
            setClickedIssue(issue);
          }
        });

      // Add glow effect
      svg.append('defs')
        .append('filter')
        .attr('id', 'glow')
        .append('feGaussianBlur')
        .attr('stdDeviation', '2')
        .attr('result', 'coloredBlur');
    });

  }, []);

  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden group">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center border border-red-500/30">
            <Globe className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="font-orbitron text-lg font-bold tracking-wider text-white">
              GEOPOLITICAL HEATMAP
            </h2>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Risk Assessment Stream</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-1 bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
            <ShieldAlert className="w-3 h-3 text-red-500" />
            <span className="text-[10px] font-bold text-red-500 uppercase">High Risk</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center min-h-[400px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center space-y-4">
              <Zap className="w-8 h-8 text-neon-blue animate-pulse" />
              <span className="font-orbitron text-xs text-neon-blue tracking-widest animate-pulse">INITIALIZING GLOBAL MESH...</span>
            </div>
          </div>
        )}
        <svg 
          ref={svgRef} 
          viewBox="0 0 800 450" 
          className="w-full h-auto max-h-[500px] drop-shadow-[0_0_20px_rgba(0,243,255,0.1)]"
        />
        
        {/* Floating Info Card */}
        {selectedIssue && !clickedIssue && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 right-4 glass-card p-4 w-64 border-neon-blue/30 bg-black/80 backdrop-blur-md z-30"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-orbitron text-xs font-bold text-neon-blue">{selectedIssue.country.toUpperCase()}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                selectedIssue.impact === 'High' ? 'bg-red-500/20 text-red-500' : 
                selectedIssue.impact === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 
                'bg-green-500/20 text-green-500'
              }`}>
                {selectedIssue.impact} IMPACT
              </span>
            </div>
            <p className="text-xs text-white/80 mb-3">{selectedIssue.issue}</p>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${selectedIssue.intensity * 100}%` }}
                className={`h-full ${selectedIssue.intensity > 0.7 ? 'bg-red-500' : 'bg-neon-blue'}`}
              />
            </div>
            <p className="text-[8px] text-white/40 mt-2 uppercase tracking-widest">Click for deep analysis</p>
          </motion.div>
        )}

        {/* Detailed Modal for Clicked Issue */}
        <AnimatePresence>
          {clickedIssue && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-card p-6 max-w-md border-neon-blue/50 bg-black/90 relative"
              >
                <button 
                  onClick={() => setClickedIssue(null)}
                  className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                  <Zap className="w-4 h-4 rotate-45" />
                </button>
                
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                    clickedIssue.impact === 'High' ? 'bg-red-500/20 border-red-500/30 text-red-500' : 
                    'bg-neon-blue/20 border-neon-blue/30 text-neon-blue'
                  }`}>
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-orbitron text-lg font-bold text-white">{clickedIssue.country}</h3>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{clickedIssue.issue}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Risk Intensity</span>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${clickedIssue.intensity > 0.7 ? 'bg-red-500' : 'bg-neon-blue'}`}
                        style={{ width: `${clickedIssue.intensity * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Market Impact Analysis</span>
                    <p className="text-xs text-white/80 leading-relaxed italic">
                      &quot;{clickedIssue.details}&quot;
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Status: Monitoring</span>
                    <button 
                      onClick={() => setClickedIssue(null)}
                      className="text-[10px] font-bold text-neon-blue uppercase tracking-widest hover:underline"
                    >
                      Close Analysis
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 relative z-10">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center space-x-2 mb-1">
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Conflicts</span>
          </div>
          <div className="text-lg font-mono font-bold text-white">12</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-3 h-3 text-neon-blue" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Trade Alerts</span>
          </div>
          <div className="text-lg font-mono font-bold text-white">08</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="flex items-center space-x-2 mb-1">
            <Info className="w-3 h-3 text-green-500" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Stability Index</span>
          </div>
          <div className="text-lg font-mono font-bold text-white">64.2</div>
        </div>
      </div>
    </div>
  );
}
