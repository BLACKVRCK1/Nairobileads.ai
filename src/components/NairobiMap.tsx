import React, { useState, useMemo, useRef } from 'react';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Sparkles, 
  Phone, 
  Mail, 
  Building2, 
  ShieldCheck, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Compass, 
  Globe, 
  Maximize2, 
  Minimize2, 
  Crosshair, 
  Award, 
  Flame, 
  Eye, 
  EyeOff, 
  Activity, 
  TrendingUp, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { Lead, LeadStatus } from '../types';
import { NAIROBI_HUBS, getLeadCoordinates, coordsToPercent, calculateNeighborhoodDensities, NeighborhoodDensity, GeoPoint } from '../utils/geoUtils';

interface NairobiMapProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenDossier?: (lead: Lead) => void;
  onDeepQualify?: (lead: Lead) => void;
  selectedLeadId?: string | null;
}

const STATUS_PIN_COLORS: Record<LeadStatus, { bg: string; border: string; glow: string; text: string; label: string }> = {
  discovered: { bg: 'bg-slate-400', border: 'border-slate-300', glow: 'shadow-slate-400/50', text: 'text-slate-300', label: 'Discovered' },
  verified: { bg: 'bg-cyan-400', border: 'border-cyan-200', glow: 'shadow-cyan-400/60', text: 'text-cyan-300', label: 'Verified' },
  qualified: { bg: 'bg-indigo-500', border: 'border-indigo-300', glow: 'shadow-indigo-500/60', text: 'text-indigo-300', label: 'Qualified' },
  contacted: { bg: 'bg-amber-400', border: 'border-amber-200', glow: 'shadow-amber-400/60', text: 'text-amber-300', label: 'Contacted' },
  in_discovery: { bg: 'bg-teal-400', border: 'border-teal-200', glow: 'shadow-teal-400/60', text: 'text-teal-300', label: 'In Discovery' },
  won: { bg: 'bg-emerald-400', border: 'border-emerald-200', glow: 'shadow-emerald-400/70', text: 'text-emerald-300', label: 'Won' },
  archived: { bg: 'bg-slate-600', border: 'border-slate-500', glow: 'shadow-slate-600/30', text: 'text-slate-400', label: 'Archived' },
};

export const NairobiMap: React.FC<NairobiMapProps> = ({
  leads,
  onSelectLead,
  onOpenDossier,
  onDeepQualify,
  selectedLeadId,
}) => {
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [activeHubId, setActiveHubId] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [mapMode, setMapMode] = useState<'tactical' | 'satellite'>('tactical');
  const [showHeatMap, setShowHeatMap] = useState<boolean>(true);
  const [showPins, setShowPins] = useState<boolean>(true);
  const [hoveredHub, setHoveredHub] = useState<NeighborhoodDensity | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Map each lead with its exact screen position %
  const pinnedLeads = useMemo(() => {
    return leads.map((lead) => {
      const coords = getLeadCoordinates(lead);
      const pos = coordsToPercent(coords);
      return {
        lead,
        coords,
        pos,
        statusStyle: STATUS_PIN_COLORS[lead.status] || STATUS_PIN_COLORS.discovered,
      };
    });
  }, [leads]);

  // Neighborhood densities computed for current filtered leads dataset
  const neighborhoodDensities = useMemo(() => {
    return calculateNeighborhoodDensities(leads);
  }, [leads]);

  // Total mapped count and top dense neighborhood
  const topHub = useMemo(() => {
    const sorted = [...neighborhoodDensities].sort((a, b) => b.leadCount - a.leadCount);
    return sorted[0]?.leadCount > 0 ? sorted[0] : null;
  }, [neighborhoodDensities]);

  // When external selectedLeadId changes, keep activeLead synced
  React.useEffect(() => {
    if (selectedLeadId) {
      const found = leads.find((l) => l.id === selectedLeadId);
      if (found) {
        setActiveLead(found);
      }
    }
  }, [selectedLeadId, leads]);

  // Handle Hub selection to jump view
  const handleHubSelect = (hubId: string) => {
    setActiveHubId(hubId);
    if (hubId === 'all') {
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      return;
    }

    const hub = NAIROBI_HUBS.find((h) => h.id === hubId);
    if (hub) {
      const targetPercent = coordsToPercent(hub.center);
      // Center on this hub and zoom in 1.8x
      setZoomLevel(1.8);
      // Pan offset calculation: shift so targetPercent is at center (50%)
      const offsetX = (50 - targetPercent.x) * 2.5;
      const offsetY = (50 - targetPercent.y) * 2.5;
      setPanOffset({ x: offsetX, y: offsetY });
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.35, 3.2));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.35, 0.9));
  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setActiveHubId('all');
  };

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking map canvas directly
    if ((e.target as HTMLElement).closest('.map-control-overlay')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div 
      id="nairobi-map-section"
      className={`relative bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl flex flex-col' : 'my-6'
      }`}
    >
      {/* Map Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/10 bg-white/5 backdrop-blur-md z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Nairobi Metro Geospatial Intelligence
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {pinnedLeads.length} Leads Analyzed
              </span>
              {showHeatMap && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400 animate-pulse" />
                  Heat Map Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Interactive neighborhood density heat mapping and precise commercial coordinate pins
            </p>
          </div>
        </div>

        {/* Hub Selector Pills */}
        <div className="flex items-center flex-wrap gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => handleHubSelect('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeHubId === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            All Metro ({leads.length})
          </button>
          {NAIROBI_HUBS.map((hub) => {
            const density = neighborhoodDensities.find((d) => d.hub.id === hub.id);
            const countInHub = density?.leadCount || 0;

            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => handleHubSelect(hub.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeHubId === hub.id
                    ? 'bg-emerald-400 text-slate-950 font-bold shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                <span>{hub.name.split(' ')[0]}</span>
                {countInHub > 0 && (
                  <span className={`text-[10px] px-1 rounded font-bold ${
                    activeHubId === hub.id 
                      ? 'bg-slate-950/20 text-slate-950' 
                      : countInHub >= 2 
                        ? 'bg-orange-500/30 text-orange-200 border border-orange-500/40' 
                        : 'bg-white/10 text-slate-400'
                  }`}>
                    {countInHub}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Map Control Buttons & Heatmap Toggle */}
        <div className="flex items-center space-x-1.5">
          {/* Heat Map Toggle Button */}
          <button
            type="button"
            id="toggle-heatmap-btn"
            onClick={() => setShowHeatMap(!showHeatMap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              showHeatMap
                ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 text-orange-300 border-orange-500/50 shadow-md shadow-orange-500/10'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Density Heat Map Layer"
          >
            <Flame className={`w-3.5 h-3.5 ${showHeatMap ? 'text-orange-400 fill-orange-400' : 'text-slate-400'}`} />
            <span>Heat Map {showHeatMap ? 'ON' : 'OFF'}</span>
          </button>

          {/* Individual Pin Layer Toggle */}
          <button
            type="button"
            id="toggle-pins-btn"
            onClick={() => setShowPins(!showPins)}
            className={`p-2 rounded-xl text-xs flex items-center gap-1 border transition-all ${
              showPins
                ? 'bg-white/10 text-cyan-300 border-cyan-500/30'
                : 'bg-white/5 text-slate-500 border-white/10 hover:text-slate-300'
            }`}
            title={showPins ? 'Hide Pin Markers' : 'Show Pin Markers'}
          >
            {showPins ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">Pins</span>
          </button>

          {/* Map Base Style Switch */}
          <button
            type="button"
            onClick={() => setMapMode(mapMode === 'tactical' ? 'satellite' : 'tactical')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors"
            title="Toggle Tactical / Satellite Mode"
          >
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline font-medium capitalize">{mapMode}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Interactive Map Viewport */}
      <div 
        ref={mapContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing ${
          isFullscreen ? 'flex-1 min-h-[500px]' : 'h-[540px]'
        }`}
        style={{
          background: mapMode === 'tactical' 
            ? 'radial-gradient(ellipse at 50% 40%, #091a28 0%, #030712 100%)' 
            : 'radial-gradient(ellipse at 50% 50%, #061e24 0%, #010609 100%)',
        }}
      >
        {/* Canvas World Transform Container */}
        <div
          className="absolute inset-0 transition-transform duration-100 ease-out origin-center"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          }}
        >
          {/* Stylized Grid & Vector Cartography Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {/* Grid Coordinates Lines */}
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: 'linear-gradient(to right, rgba(6, 182, 212, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.08) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* SVG Cartographic Layers & Heat Map Gradient Radii */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="expresswayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="parkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.02" />
              </linearGradient>
              <radialGradient id="hubRadarGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </radialGradient>

              {/* Dynamic Multi-Stop Heat Map Gradients for High, Medium, and Low Densities */}
              <radialGradient id="heatHotGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                <stop offset="25%" stopColor="#f97316" stopOpacity="0.65" />
                <stop offset="55%" stopColor="#eab308" stopOpacity="0.4" />
                <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="heatMedGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.7" />
                <stop offset="35%" stopColor="#eab308" stopOpacity="0.45" />
                <stop offset="70%" stopColor="#10b981" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="heatLowGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Nairobi National Park Outline (South) */}
            <path
              d="M 10 95 Q 40 85, 70 88 T 95 98 L 95 100 L 10 100 Z"
              fill="url(#parkGrad)"
              stroke="#059669"
              strokeWidth="0.4"
              strokeDasharray="1,1"
              opacity="0.6"
            />
            <text x="35" y="94" fill="#10b981" fontSize="2" opacity="0.5" fontWeight="bold" letterSpacing="0.2">
              NAIROBI NATIONAL PARK PERIMETER
            </text>

            {/* Karura Forest Reserve (North) */}
            <circle cx="48" cy="32" r="6" fill="#10b981" fillOpacity="0.06" stroke="#10b981" strokeWidth="0.3" strokeDasharray="0.8,0.8" />
            <text x="44" y="32" fill="#10b981" fontSize="1.6" opacity="0.5" fontWeight="bold">
              KARURA FOREST
            </text>

            {/* Major Arterial Roads / Expressways */}
            {/* Waiyaki Way & A104 Corridor (NW to SE via CBD) */}
            <path
              d="M 15 25 Q 35 40, 48 50 T 85 85"
              fill="none"
              stroke="url(#expresswayGrad)"
              strokeWidth="0.8"
              opacity="0.75"
            />
            {/* Thika Superhighway (North towards Ruiru & Tatu) */}
            <path
              d="M 48 50 Q 60 30, 80 12"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="0.7"
              strokeDasharray="2,0.8"
              opacity="0.8"
            />
            {/* Mombasa Road (SE to JKIA / EPZ) */}
            <path
              d="M 48 50 Q 65 65, 92 82"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.7"
              opacity="0.7"
            />
            {/* Southern Bypass & Langata Rd (West-South) */}
            <path
              d="M 12 75 Q 35 78, 65 72"
              fill="none"
              stroke="#64748b"
              strokeWidth="0.5"
              strokeDasharray="1.5,1.5"
              opacity="0.6"
            />
            {/* Eastern Bypass (Ruiru / Embakasi) */}
            <path
              d="M 80 12 Q 88 45, 88 80"
              fill="none"
              stroke="#64748b"
              strokeWidth="0.5"
              strokeDasharray="1.5,1.5"
              opacity="0.6"
            />

            {/* Road Label Annotations */}
            <text x="18" y="27" fill="#67e8f9" fontSize="1.6" opacity="0.7">WAIYAKI WAY (A104)</text>
            <text x="68" y="22" fill="#67e8f9" fontSize="1.6" opacity="0.7">THIKA SUPERHIGHWAY</text>
            <text x="74" y="76" fill="#67e8f9" fontSize="1.6" opacity="0.7">MOMBASA ROAD / JKIA</text>
            <text x="56" y="58" fill="#fbbf24" fontSize="1.6" opacity="0.7">ENTERPRISE RD (IND. AREA)</text>

            {/* Base Hub Radar Rings */}
            <circle cx="39.5" cy="42" r="6" fill="url(#hubRadarGrad)" />
            <circle cx="46" cy="54" r="5" fill="url(#hubRadarGrad)" />
            <circle cx="58" cy="62" r="7" fill="url(#hubRadarGrad)" />
            <circle cx="82" cy="18" r="8" fill="url(#hubRadarGrad)" />

            {/* TOGGLEABLE HEAT MAP DENSITY BLOBS */}
            {showHeatMap && neighborhoodDensities.map((density) => {
              if (density.leadCount === 0) return null;

              // Size radius proportional to lead count (range between 8% and 22% of map width)
              const countFactor = Math.min(density.leadCount, 6);
              const radius = 8 + countFactor * 2.2;
              
              // Select gradient based on lead concentration
              const gradId = density.leadCount >= 3 
                ? 'url(#heatHotGrad)' 
                : density.leadCount >= 2 
                  ? 'url(#heatMedGrad)' 
                  : 'url(#heatLowGrad)';

              return (
                <g key={`heat-blob-${density.hub.id}`} className="transition-all duration-300">
                  {/* Concentric Density Heat Core */}
                  <circle
                    cx={density.pos.x}
                    cy={density.pos.y}
                    r={radius}
                    fill={gradId}
                    className="animate-pulse"
                    style={{
                      transformOrigin: `${density.pos.x}% ${density.pos.y}%`,
                      animationDuration: density.leadCount >= 3 ? '2.5s' : '4s',
                    }}
                  />
                  {/* Outer Iso-Density Contour Ring */}
                  <circle
                    cx={density.pos.x}
                    cy={density.pos.y}
                    r={radius * 0.75}
                    fill="none"
                    stroke={density.leadCount >= 3 ? '#f97316' : '#22d3ee'}
                    strokeWidth="0.3"
                    strokeDasharray="1,1"
                    opacity={0.7}
                  />
                </g>
              );
            })}
          </svg>

          {/* Nairobi Business Hub Interactive Anchors & Density Indicators */}
          {neighborhoodDensities.map((density) => {
            const isSelected = activeHubId === density.hub.id;
            const hasLeads = density.leadCount > 0;

            return (
              <div
                key={density.hub.id}
                id={`map-hub-anchor-${density.hub.id}`}
                style={{ left: `${density.pos.x}%`, top: `${density.pos.y}%` }}
                onClick={() => handleHubSelect(density.hub.id)}
                onMouseEnter={() => setHoveredHub(density)}
                onMouseLeave={() => setHoveredHub(null)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 pointer-events-auto ${
                  isSelected ? 'scale-110 z-10' : 'hover:scale-105 opacity-90 hover:opacity-100'
                }`}
              >
                <div className={`px-2 py-1 rounded-xl text-[9px] font-bold tracking-wider uppercase backdrop-blur-md flex items-center gap-1.5 border transition-all ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30'
                    : hasLeads && showHeatMap
                      ? 'bg-slate-900/90 text-orange-200 border-orange-500/40 shadow-lg shadow-orange-500/10'
                      : 'bg-slate-900/80 text-slate-400 border-white/10 hover:border-cyan-500/30 hover:text-slate-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    hasLeads 
                      ? density.leadCount >= 3 
                        ? 'bg-rose-500 animate-ping' 
                        : 'bg-orange-400 animate-ping' 
                      : 'bg-cyan-400'
                  }`} />
                  
                  <span>{density.hub.name}</span>
                  
                  {hasLeads && (
                    <span className={`px-1.5 py-0.2 rounded-md font-mono text-[9px] font-black ${
                      density.leadCount >= 3
                        ? 'bg-rose-500/30 text-rose-200 border border-rose-500/50'
                        : 'bg-orange-500/30 text-orange-200 border border-orange-500/50'
                    }`}>
                      {density.leadCount}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Dynamic Pin Markers for all Filtered Leads (Can be toggled) */}
          {showPins && pinnedLeads.map(({ lead, pos, statusStyle }) => {
            const isSelected = activeLead?.id === lead.id;

            return (
              <div
                key={lead.id}
                id={`map-pin-${lead.id}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveLead(lead);
                  onSelectLead(lead);
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group transition-all duration-200 pointer-events-auto ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-115'
                }`}
              >
                {/* Pulsating Ping Wave for Verified/Won Leads */}
                <div 
                  className={`absolute -inset-2 rounded-full opacity-70 animate-ping pointer-events-none ${
                    isSelected ? 'bg-cyan-400' : statusStyle.bg
                  }`} 
                />

                {/* Pin Container */}
                <div className={`relative flex items-center justify-center p-1.5 rounded-full border-2 shadow-2xl transition-transform ${
                  isSelected 
                    ? 'bg-slate-950 border-cyan-400 ring-4 ring-cyan-400/30 scale-110' 
                    : `${statusStyle.bg} ${statusStyle.border} ${statusStyle.glow}`
                }`}>
                  <Building2 className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-300' : 'text-slate-950'} shrink-0`} />
                  
                  {/* Confidence Badge Pill */}
                  {lead.confidenceScore && (
                    <span className="absolute -top-2 -right-2 bg-slate-950 border border-white/20 text-white font-mono text-[8px] font-bold px-1 rounded-full shadow-md">
                      {lead.confidenceScore}%
                    </span>
                  )}
                </div>

                {/* Company Name Badge on Hover or Active */}
                <div className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none transition-all duration-150 ${
                  isSelected 
                    ? 'opacity-100 scale-100' 
                    : 'opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100'
                }`}>
                  <div className="px-2.5 py-1 rounded-xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-xl shadow-2xl flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-[11px] font-bold text-white tracking-tight">{lead.name}</span>
                    <span className="text-[9px] text-cyan-300 font-medium font-mono">({lead.location})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Zoom & Canvas Controls */}
        <div className="map-control-overlay absolute bottom-4 left-4 z-30 flex flex-col space-y-1 bg-slate-900/90 backdrop-blur-xl border border-white/15 p-1.5 rounded-2xl shadow-2xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Map Center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Heat Map Density Scale & Pipeline Legend Floating Card */}
        <div className="map-control-overlay absolute top-4 right-4 z-30 hidden md:block bg-slate-950/95 backdrop-blur-xl border border-white/15 p-3.5 rounded-3xl shadow-2xl text-xs w-72 max-w-xs space-y-3">
          {/* Heat Map Density Scale */}
          {showHeatMap && (
            <div className="pb-2.5 border-b border-white/10">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-orange-300 font-bold text-[11px] uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Density Heat Scale</span>
                </div>
                {topHub && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-200 font-medium">
                    Top: {topHub.hub.name.split(' ')[0]} ({topHub.leadCount})
                  </span>
                )}
              </div>

              {/* Gradient Bar */}
              <div className="h-2 w-full rounded-full bg-gradient-to-r from-cyan-400 via-yellow-400 via-orange-500 to-rose-600 shadow-inner" />
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
                <span>1 Lead (Low)</span>
                <span>Moderate</span>
                <span>Dense (3+)</span>
              </div>

              {/* Hub Density Breakdown Chips */}
              <div className="mt-2.5 space-y-1">
                {neighborhoodDensities.filter(d => d.leadCount > 0).map((d) => (
                  <div 
                    key={d.hub.id} 
                    onClick={() => handleHubSelect(d.hub.id)}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors text-[11px]"
                  >
                    <span className="text-slate-300 truncate">{d.hub.name}</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-orange-300 font-bold">{d.leadCount}</span>
                      <span className="text-[10px] text-slate-500">({d.percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pipeline Stage Legend */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white text-[11px] uppercase tracking-wider">Pipeline Stage</span>
              <span className="text-[10px] text-slate-400 font-mono">{pinnedLeads.length} leads</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
              {Object.entries(STATUS_PIN_COLORS).slice(0, 4).map(([key, style]) => {
                const count = leads.filter((l) => l.status === key).length;
                return (
                  <div key={key} className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${style.bg} shrink-0`} />
                    <span className="text-slate-300 capitalize">{style.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hovered Neighborhood Density Tooltip (Floating overlay) */}
        {hoveredHub && hoveredHub.leadCount > 0 && !activeLead && (
          <div 
            className="map-control-overlay absolute top-4 left-4 z-40 bg-slate-900/95 backdrop-blur-2xl border border-orange-500/40 rounded-2xl p-3 shadow-2xl animate-in fade-in duration-150 text-white max-w-xs pointer-events-none"
          >
            <div className="flex items-center gap-2 pb-1.5 border-b border-white/10">
              <Flame className="w-4 h-4 text-orange-400 shrink-0" />
              <div>
                <h4 className="font-bold text-xs text-white">{hoveredHub.hub.name}</h4>
                <p className="text-[10px] text-slate-400">{hoveredHub.hub.category}</p>
              </div>
            </div>
            <div className="mt-2 text-xs space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Total Leads in Hub:</span>
                <span className="font-black text-orange-300 font-mono">{hoveredHub.leadCount} ({hoveredHub.percentage.toFixed(0)}% of dataset)</span>
              </div>
              <div className="text-[10px] text-slate-400 pt-1">
                {hoveredHub.leads.map(l => l.name).slice(0, 3).join(', ')}
                {hoveredHub.leads.length > 3 && ` +${hoveredHub.leads.length - 3} more`}
              </div>
            </div>
          </div>
        )}

        {/* Active Selected Lead Card Popover (Right bottom overlay) */}
        {activeLead && (
          <div 
            id="map-selected-lead-card"
            className="map-control-overlay absolute bottom-4 right-4 z-40 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/40 rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200 text-white"
          >
            {/* Card Header */}
            <div className="flex items-start justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white tracking-tight leading-snug">
                    {activeLead.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-slate-400">{activeLead.category}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      {activeLead.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Office Address & Location Detail */}
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-300 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block text-[11px]">Physical Office Location:</span>
                  <span className="text-slate-300 text-[11px] leading-relaxed">
                    {activeLead.officeAddress || activeLead.locationDetail}
                  </span>
                </div>
              </div>

              {/* Contact Pills */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {activeLead.publicPhone && (
                  <a
                    href={`tel:${activeLead.publicPhone}`}
                    className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{activeLead.publicPhone}</span>
                  </a>
                )}
                {activeLead.publicEmail && (
                  <a
                    href={`mailto:${activeLead.publicEmail}`}
                    className="flex items-center gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{activeLead.publicEmail}</span>
                  </a>
                )}
              </div>

              {/* ICP Fit or Score */}
              {activeLead.deepQualification && (
                <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-300">
                    <Award className="w-4 h-4" />
                    <span className="font-bold">ICP Fit Score</span>
                  </div>
                  <span className="font-black text-white text-sm bg-indigo-500/20 px-2 py-0.5 rounded-lg border border-indigo-500/30">
                    {activeLead.deepQualification.icpScore}/100
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
              {onDeepQualify && (
                <button
                  type="button"
                  onClick={() => onDeepQualify(activeLead)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Deep Qualify</span>
                </button>
              )}

              {onOpenDossier && (
                <button
                  type="button"
                  onClick={() => onOpenDossier(activeLead)}
                  className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs transition-colors"
                >
                  Dossier
                </button>
              )}

              {activeLead.mapsUri && (
                <a
                  href={activeLead.mapsUri}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-cyan-300 hover:text-white transition-colors"
                  title="Open in Google Maps"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map Footer Bar: Coordinate & Compliance Verification Indicator */}
      <div className="p-3 sm:px-5 bg-white/5 border-t border-white/10 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center space-x-2 text-slate-300">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>Coordinate Grid: Nairobi Metro (-1.2864° S, 36.8172° E)</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-orange-300">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Dynamic Density Calculations based on Active Filter Segment</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Public Commercial Entity Addresses (ODPC Section 28 Standard)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
