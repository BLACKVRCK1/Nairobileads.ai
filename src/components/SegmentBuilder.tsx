import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Layers, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle, 
  Loader2, 
  SlidersHorizontal,
  ChevronRight,
  Target
} from 'lucide-react';
import { PRESET_SEGMENTS } from '../data/seedLeads';
import { DiscoverySegment } from '../types';

interface SegmentBuilderProps {
  onRunDiscovery: (segment: DiscoverySegment) => Promise<void>;
  isDiscovering: boolean;
  discoveryStatusStep: string;
}

export const NAIROBI_LOCATIONS = [
  { id: 'Westlands', label: 'Westlands (Parklands / Waiyaki Way / Chiromo)', desc: 'Tech HQs, FinTechs, Corporate hubs' },
  { id: 'Ruiru', label: 'Ruiru & Tatu City (Eastern Bypass / Thika Rd)', desc: 'Heavy logistics, FMCG manufacturing, agro-parks' },
  { id: 'Upper Hill', label: 'Upper Hill (Hospital Rd / Mara Rd)', desc: 'Financial district, Tier-1 banks, insurance HQs' },
  { id: 'Kilimani', label: 'Kilimani & Hurlingham (Lenana / Argwings Kodhek)', desc: 'Healthcare, consultancies, boutique agencies' },
  { id: 'Industrial Area', label: 'Industrial Area (Enterprise Rd / Commercial St)', desc: 'Plastics, steel, fabrication, distribution' },
  { id: 'CBD', label: 'Nairobi Central Business District (CBD)', desc: 'Government, commerce, legal, travel & retail' },
  { id: 'Karen', label: 'Karen & Lang\'ata (Watermark / Karen Rd)', desc: 'Regional NGOs, eco-tech, premium facilities' },
  { id: 'Gigiri', label: 'Gigiri & Muthaiga (UN / Diplomatic Hub)', desc: 'Diplomatic missions, international NGOs, security' },
  { id: 'Mombasa Road', label: 'Mombasa Road / Inland Container Depot', desc: 'Freight, clearing & forwarding, inland transport' },
  { id: 'Thika Road', label: 'Thika Road / Garden City / Roysambu', desc: 'Commercial retail, distribution, tech hubs' },
];

export const BUSINESS_CATEGORIES = [
  'Software & Technology Services',
  'Logistics, Warehousing & Agro-Processing',
  'Financial Services & Insurance',
  'Manufacturing & Heavy FMCG',
  'Commercial Healthcare & Pharmaceuticals',
  'Commercial Real Estate & Facilities',
  'Solar & Clean Energy Solutions',
  'Agribusiness & Export Farming',
  'Professional Services (Audit, Legal & Tax)',
  'Telecommunications & Infrastructure',
];

export const SegmentBuilder: React.FC<SegmentBuilderProps> = ({
  onRunDiscovery,
  isDiscovering,
  discoveryStatusStep,
}) => {
  const [selectedLocation, setSelectedLocation] = useState('Westlands');
  const [selectedCategory, setSelectedCategory] = useState('Software & Technology Services');
  const [customCategory, setCustomCategory] = useState('');
  const [additionalKeywords, setAdditionalKeywords] = useState('');
  const [autoVerifyContacts, setAutoVerifyContacts] = useState(true);
  const [activePresetId, setActivePresetId] = useState<string | null>('westlands-tech');

  const handleApplyPreset = (preset: typeof PRESET_SEGMENTS[0]) => {
    setActivePresetId(preset.id);
    setSelectedLocation(preset.location);
    setSelectedCategory(preset.category);
    setCustomCategory('');
    setAdditionalKeywords('');
  };

  const handleStartDiscovery = () => {
    const finalCategory = customCategory.trim() ? customCategory.trim() : selectedCategory;
    onRunDiscovery({
      location: selectedLocation,
      category: finalCategory,
      additionalKeywords,
      minConfidence: 75,
      strictPublicOnly: true,
    });
  };

  return (
    <section id="segment-builder-section" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-7 shadow-2xl mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Compass className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              On-Demand Nairobi Segment Discovery
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Select a target Nairobi territory and commercial sector. The engine discovers places via Google Maps Grounding and independently verifies official public business contacts and attribution links.
          </p>
        </div>

        {/* Legal standard pill */}
        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl self-start md:self-auto backdrop-blur-md">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[11px] text-slate-300 font-medium">
            Strictly Public Corporate Domain Data (ODPC Lawful)
          </span>
        </div>
      </div>

      {/* Preset Fast Selectors */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Nairobi Segment Presets
          </span>
          <span className="text-[11px] text-slate-400 font-normal">Click to prefill segment</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_SEGMENTS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between backdrop-blur-md ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-xs font-bold text-white">{preset.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                      {preset.highlightTag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
                  <span className="flex items-center gap-1 text-slate-300">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {preset.location}
                  </span>
                  <span className="text-emerald-400 font-medium text-[10px] flex items-center gap-0.5">
                    Select <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Segment Controls */}
      <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Target Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Nairobi Territory / Sub-County
          </label>
          <select
            id="select-nairobi-location"
            value={selectedLocation}
            onChange={(e) => {
              setSelectedLocation(e.target.value);
              setActivePresetId(null);
            }}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all backdrop-blur-md"
          >
            {NAIROBI_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-slate-900 text-white">
                {loc.label}
              </option>
            ))}
          </select>
          <p className="text-[10px] text-slate-400 mt-1">
            Pins Google Maps grounding to specific geospatial bounds.
          </p>
        </div>

        {/* 2. Target Business Sector */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Commercial Business Category
          </label>
          <select
            id="select-business-category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setActivePresetId(null);
            }}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all backdrop-blur-md"
          >
            {BUSINESS_CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900 text-white">
                {cat}
              </option>
            ))}
            <option value="CUSTOM" className="bg-slate-900 text-white">+ Custom / Specific Niche...</option>
          </select>

          {selectedCategory === 'CUSTOM' && (
            <input
              type="text"
              placeholder="e.g. Cold storage horticulture exporters, ERP consultants"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="mt-2 w-full bg-slate-900/80 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-md"
            />
          )}
        </div>

        {/* 3. Additional ICP Filters & Execution */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            Qualification Focus Keywords (Optional)
          </label>
          <input
            id="input-additional-keywords"
            type="text"
            placeholder="e.g., Enterprise HQs, High review count, B2B only"
            value={additionalKeywords}
            onChange={(e) => setAdditionalKeywords(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all backdrop-blur-md"
          />
          <div className="mt-2.5 flex items-center gap-2">
            <input
              type="checkbox"
              id="check-auto-verify"
              checked={autoVerifyContacts}
              onChange={(e) => setAutoVerifyContacts(e.target.checked)}
              className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500 bg-slate-900"
            />
            <label htmlFor="check-auto-verify" className="text-[11px] text-slate-300 cursor-pointer">
              Auto-verify public website contacts via Google Search
            </label>
          </div>
        </div>
      </div>

      {/* Discovery Trigger & Live Progress */}
      <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Target:</span>
          <span className="font-semibold text-slate-200">
            {selectedLocation} • {customCategory.trim() || selectedCategory}
          </span>
        </div>

        <button
          id="btn-run-discovery-main"
          type="button"
          onClick={handleStartDiscovery}
          disabled={isDiscovering}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-xl shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-tight"
        >
          {isDiscovering ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Discovering Places in {selectedLocation}...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Run Discovery on Demand</span>
            </>
          )}
        </button>
      </div>

      {/* Live Discovery Progress Step Radar */}
      {isDiscovering && (
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Grounding in progress...
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              gemini-3.7-flash (googleMaps + googleSearch)
            </span>
          </div>
          <p className="text-slate-200 text-xs font-mono bg-white/5 px-3.5 py-2.5 rounded-lg border border-white/10">
            {discoveryStatusStep || `Querying Google Maps place grounding in ${selectedLocation}, Nairobi...`}
          </p>
        </div>
      )}
    </section>
  );
};
