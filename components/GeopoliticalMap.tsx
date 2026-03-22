'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Globe, ShieldAlert, Zap, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface GeopoliticalIssue {
  country: string;
  intensity: number; // 0 to 1
  issue: string;
  impact: 'High' | 'Medium' | 'Low';
}

const MOCK_ISSUES: GeopoliticalIssue[] = [
  { country: 'Russia', intensity: 0.9, issue: 'Sanctions & Conflict', impact: 'High' },
  { country: 'Ukraine', intensity: 0.95, issue: 'Direct Conflict', impact: 'High' },
  { country: 'China', intensity: 0.7, issue: 'Trade Tensions', impact: 'Medium' },
  { country: 'USA', intensity: 0.4, issue: 'Policy Shifts', impact: 'Medium' },
  { country: 'Israel', intensity: 0.85, issue: 'Regional Conflict', impact: 'High' },
  { country: 'Iran', intensity: 0.75, issue: 'Geopolitical Friction', impact: 'High' },
  { country: 'India', intensity: 0.2, issue: 'Border Stability', impact: 'Low' },
  { country: 'Taiwan', intensity: 0.8, issue: 'Sovereignty Disputes', impact: 'High' },
];

export function GeopoliticalMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedIssue, setSelectedIssue] = useState<GeopoliticalIssue | null>(null);
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
            setSelectedIssue({ country: d.properties.name, intensity: 0, issue: 'No major issues detected', impact: 'Low' });
          }
        })
        .on('mouseleave', function() {
          d3.select(this).attr('stroke', 'rgba(0, 243, 255, 0.1)').attr('stroke-width', 0.5);
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
        {selectedIssue && (
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
          </motion.div>
        )}
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
