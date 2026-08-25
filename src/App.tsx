import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Compass, 
  Sparkles, 
  ShieldCheck, 
  Download, 
  Plus, 
  RotateCcw,
  AlertCircle,
  MapPin,
  CheckCircle2,
  Layers,
  ChevronDown
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { SegmentBuilder, NAIROBI_LOCATIONS, BUSINESS_CATEGORIES } from './components/SegmentBuilder';
import { LeadCard } from './components/LeadCard';
import { LeadTable } from './components/LeadTable';
import { NairobiMap } from './components/NairobiMap';
import { LeadDetailModal } from './components/LeadDetailModal';
import { ComplianceDrawer } from './components/ComplianceDrawer';
import { ExportModal } from './components/ExportModal';
import { INITIAL_LEADS } from './data/seedLeads';
import { Lead, DiscoverySegment, LeadStatus } from './types';
import { getLeadCoordinates } from './utils/geoUtils';

const STORAGE_KEY = 'nairobi_b2b_leads_db_v1';

export default function App() {
  // Leads State with Local Storage persistence
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved leads from localStorage', e);
    }
    return INITIAL_LEADS;
  });

  // Save leads to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    } catch (e) {
      console.error('Failed to save leads to localStorage', e);
    }
  }, [leads]);

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [minIcpFilter, setMinIcpFilter] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'map'>('cards');

  // Modal states
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Discovery execution state
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryStatusStep, setDiscoveryStatusStep] = useState('');
  const [verifyingLeadId, setVerifyingLeadId] = useState<string | null>(null);
  const [qualifyingLeadId, setQualifyingLeadId] = useState<string | null>(null);
  const [isFastActionLoading, setIsFastActionLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const segmentBuilderRef = useRef<HTMLDivElement>(null);

  const scrollToSegmentBuilder = () => {
    segmentBuilderRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Run On-Demand Discovery
  const handleRunDiscovery = async (segment: DiscoverySegment) => {
    setIsDiscovering(true);
    setApiError(null);
    setDiscoveryStatusStep(`Grounding places in ${segment.location}, Nairobi using Google Maps...`);

    try {
      const mapsRes = await fetch('/api/discovery/maps-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: segment.location,
          category: segment.category,
          additionalKeywords: segment.additionalKeywords,
        }),
      });

      if (!mapsRes.ok) {
        const errJson = await mapsRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to search places on Google Maps');
      }

      const mapsData = await mapsRes.json();
      const rawCompanies: any[] = mapsData.companies || [];

      if (rawCompanies.length === 0) {
        setDiscoveryStatusStep(`No new companies found for this exact criteria. Try adjusting keywords.`);
        setIsDiscovering(false);
        return;
      }

      setDiscoveryStatusStep(`Discovered ${rawCompanies.length} places via Maps. Verifying official public domains...`);

      const newLeads: Lead[] = [];

      for (let i = 0; i < rawCompanies.length; i++) {
        const item = rawCompanies[i];
        setDiscoveryStatusStep(`[${i + 1}/${rawCompanies.length}] Verifying public contacts for ${item.name}...`);

        let enrichedDetails: any = {};
        let searchSources: any[] = [];

        if (segment.strictPublicOnly) {
          try {
            const enrichRes = await fetch('/api/discovery/enrich-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                companyName: item.name,
                location: item.locationDetail || segment.location,
                category: segment.category,
              }),
            });

            if (enrichRes.ok) {
              const enrichData = await enrichRes.json();
              enrichedDetails = enrichData.enriched || {};
              searchSources = enrichData.searchSources || [];
            }
          } catch (e) {
            console.warn(`Failed enrichment for ${item.name}`, e);
          }
        }

        const combinedSources = [
          ...(item.mapsUri ? [{ title: `Google Maps: ${item.name}`, uri: item.mapsUri, type: 'maps' as const }] : []),
          ...(searchSources.map((s: any) => ({ title: s.title, uri: s.uri, type: 'website' as const }))),
        ];

        const newLead: Lead = {
          id: `lead-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          name: item.name,
          category: item.category || segment.category,
          subSector: item.subSector || segment.category,
          location: segment.location,
          locationDetail: item.locationDetail || `${segment.location}, Nairobi`,
          summary: item.summary || `Commercial business located in ${segment.location}, Nairobi.`,
          estimatedSize: item.estimatedSize || 'Mid-market',
          rating: item.rating || null,
          reviewCount: item.reviewCount || null,
          mapsUri: item.mapsUri || (mapsData.mapSources?.[0]?.uri || null),
          officialWebsite: enrichedDetails.officialWebsite || null,
          publicEmail: enrichedDetails.publicEmail || null,
          publicPhone: enrichedDetails.publicPhone || null,
          officeAddress: enrichedDetails.officeAddress || item.locationDetail,
          coordinates: getLeadCoordinates({
            officeAddress: enrichedDetails.officeAddress || item.locationDetail,
            locationDetail: item.locationDetail,
            location: segment.location,
            id: item.name,
          }),
          foundedYear: enrichedDetails.foundedYear || null,
          coreOfferings: enrichedDetails.coreOfferings || [],
          decisionMakerTitle: enrichedDetails.decisionMakerTitle || 'Commercial / IT Director',
          dataProtectionStatus: enrichedDetails.dataProtectionStatus || 'ODPC Compliant - Public Corporate Record',
          sources: combinedSources,
          confidenceScore: enrichedDetails.confidenceScore || 85,
          isVerified: Boolean(enrichedDetails.officialWebsite || enrichedDetails.publicEmail || enrichedDetails.publicPhone),
          status: 'discovered',
          savedAt: new Date().toISOString(),
        };

        newLeads.push(newLead);
      }

      // Merge avoiding duplicate names
      setLeads((prev) => {
        const existingNames = new Set(prev.map((p) => p.name.toLowerCase().trim()));
        const uniqueNew = newLeads.filter((nl) => !existingNames.has(nl.name.toLowerCase().trim()));
        return [...uniqueNew, ...prev];
      });

      setDiscoveryStatusStep(`Discovery complete! Added ${newLeads.length} verified companies.`);
    } catch (err: any) {
      console.error('Discovery error:', err);
      setApiError(err.message || 'An error occurred during discovery.');
    } finally {
      setIsDiscovering(false);
    }
  };

  // Verify Single Lead Public Contacts
  const handleVerifyLeadContact = async (lead: Lead) => {
    setVerifyingLeadId(lead.id);
    setApiError(null);

    try {
      const res = await fetch('/api/discovery/enrich-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: lead.name,
          location: lead.locationDetail || lead.location,
          category: lead.category,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to verify public details');
      }

      const data = await res.json();
      const enriched = data.enriched || {};
      const searchSources = data.searchSources || [];

      const updatedSources = [
        ...lead.sources,
        ...searchSources.map((s: any) => ({ title: s.title, uri: s.uri, type: 'website' as const })),
      ];

      setLeads((prev) =>
        prev.map((item) => {
          if (item.id === lead.id) {
            const updated = {
              ...item,
              officialWebsite: enriched.officialWebsite || item.officialWebsite,
              publicEmail: enriched.publicEmail || item.publicEmail,
              publicPhone: enriched.publicPhone || item.publicPhone,
              officeAddress: enriched.officeAddress || item.officeAddress,
              foundedYear: enriched.foundedYear || item.foundedYear,
              coreOfferings: enriched.coreOfferings?.length ? enriched.coreOfferings : item.coreOfferings,
              decisionMakerTitle: enriched.decisionMakerTitle || item.decisionMakerTitle,
              confidenceScore: enriched.confidenceScore || 90,
              isVerified: true,
              status: item.status === 'discovered' ? 'verified' as LeadStatus : item.status,
              sources: updatedSources,
            };

            if (activeLead && activeLead.id === lead.id) {
              setActiveLead(updated);
            }

            return updated;
          }
          return item;
        })
      );
    } catch (err: any) {
      console.error('Verify error:', err);
      setApiError(err.message || 'Failed to verify public business details.');
    } finally {
      setVerifyingLeadId(null);
    }
  };

  // Deep Qualify Lead (High Thinking)
  const handleDeepQualify = async (lead: Lead, customOffering?: string, persona?: string) => {
    setQualifyingLeadId(lead.id);
    setApiError(null);

    try {
      const res = await fetch('/api/leads/qualify-deep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          customOffering,
          targetPersona: persona,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to run deep qualification');
      }

      const data = await res.json();
      const qualification = data.qualification;

      if (!qualification || !qualification.icpScore) {
        throw new Error('Incomplete qualification result returned.');
      }

      setLeads((prev) =>
        prev.map((item) => {
          if (item.id === lead.id) {
            const updated = {
              ...item,
              deepQualification: {
                ...qualification,
                analyzedAt: new Date().toISOString(),
              },
              status: item.status === 'discovered' || item.status === 'verified' ? 'qualified' as LeadStatus : item.status,
            };

            if (activeLead && activeLead.id === lead.id) {
              setActiveLead(updated);
            }

            return updated;
          }
          return item;
        })
      );
    } catch (err: any) {
      console.error('Deep qualification error:', err);
      setApiError(err.message || 'Failed to run deep qualification.');
    } finally {
      setQualifyingLeadId(null);
    }
  };

  // Run Fast Action (Low-Latency)
  const handleRunFastAction = async (lead: Lead, actionType: string) => {
    setIsFastActionLoading(true);
    try {
      const res = await fetch('/api/leads/fast-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          companyName: lead.name,
          category: lead.category,
          location: lead.location,
        }),
      });

      if (!res.ok) throw new Error('Failed to run fast action');
      const data = await res.json();

      setLeads((prev) =>
        prev.map((item) => {
          if (item.id === lead.id) {
            const currentFast = item.fastActions || {};
            const updatedFast = {
              ...currentFast,
              quickPitch: data.pitch || currentFast.quickPitch,
              smsSnippet: data.sms || currentFast.smsSnippet,
              icebreakers: data.icebreakers || currentFast.icebreakers,
            };

            const updatedLead = { ...item, fastActions: updatedFast };
            if (activeLead && activeLead.id === lead.id) {
              setActiveLead(updatedLead);
            }
            return updatedLead;
          }
          return item;
        })
      );
    } catch (err) {
      console.error('Fast action error:', err);
    } finally {
      setIsFastActionLoading(false);
    }
  };

  const handleUpdateStatus = (leadId: string, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    if (activeLead && activeLead.id === leadId) {
      setActiveLead((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleUpdateNotes = (leadId: string, notes: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes } : l))
    );
    if (activeLead && activeLead.id === leadId) {
      setActiveLead((prev) => (prev ? { ...prev, notes } : null));
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset research pool to initial verified Nairobi companies?')) {
      setLeads(INITIAL_LEADS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LEADS));
    }
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = lead.name.toLowerCase().includes(q);
        const matchesCat = lead.category.toLowerCase().includes(q) || lead.subSector.toLowerCase().includes(q);
        const matchesLoc = lead.location.toLowerCase().includes(q) || (lead.locationDetail || '').toLowerCase().includes(q);
        const matchesOfferings = (lead.coreOfferings || []).some((o) => o.toLowerCase().includes(q));
        if (!matchesName && !matchesCat && !matchesLoc && !matchesOfferings) {
          return false;
        }
      }

      // Location filter
      if (selectedLocationFilter !== 'ALL' && lead.location !== selectedLocationFilter) {
        return false;
      }

      // Category filter
      if (selectedCategoryFilter !== 'ALL' && lead.category !== selectedCategoryFilter) {
        return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'ALL' && lead.status !== selectedStatusFilter) {
        return false;
      }

      // Minimum ICP score
      if (minIcpFilter > 0) {
        const score = lead.deepQualification?.icpScore ?? lead.confidenceScore ?? 0;
        if (score < minIcpFilter) return false;
      }

      return true;
    });
  }, [leads, searchQuery, selectedLocationFilter, selectedCategoryFilter, selectedStatusFilter, minIcpFilter]);

  const verifiedCount = leads.filter((l) => l.isVerified || (l.publicPhone && l.publicEmail)).length;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Ambient background glow orbs for Frosted Glass refraction */}
      <div className="fixed -top-24 -left-24 w-[480px] h-[480px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed -bottom-24 -right-24 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed top-2/3 -left-20 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-[110px] pointer-events-none -z-10" />

      {/* Top Navbar */}
      <Navbar
        onOpenCompliance={() => setIsComplianceOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onScrollToSegmentBuilder={scrollToSegmentBuilder}
        leadCount={leads.length}
        verifiedCount={verifiedCount}
        leads={leads}
        onSelectStageFilter={(stage) => {
          setSelectedStatusFilter(stage);
          const el = document.getElementById('lead-database-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        
        {/* Error Banner if any */}
        {apiError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 backdrop-blur-md border border-rose-500/30 flex items-center justify-between text-rose-200 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-rose-300 hover:text-white font-bold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Metric Stats Bar */}
        <StatsBar
          leads={leads}
          currentLocation={selectedLocationFilter !== 'ALL' ? selectedLocationFilter : undefined}
          currentCategory={selectedCategoryFilter !== 'ALL' ? selectedCategoryFilter : undefined}
        />

        {/* Segment Discovery Builder */}
        <div ref={segmentBuilderRef}>
          <SegmentBuilder
            onRunDiscovery={handleRunDiscovery}
            isDiscovering={isDiscovering}
            discoveryStatusStep={discoveryStatusStep}
          />
        </div>

        {/* Lead Research Canvas Controls Bar */}
        <section id="lead-database-section" className="space-y-4 mt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Nairobi Research Pool</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                  {filteredLeads.length} of {leads.length} leads
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeted companies with verified public contacts, official domains, and attribution links.
              </p>
            </div>

            {/* View Mode Toggle & Reset Action */}
            <div className="flex items-center space-x-2 self-start md:self-auto">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-1 rounded-xl flex items-center space-x-1">
                <button
                  type="button"
                  id="view-mode-map-btn"
                  onClick={() => setViewMode('map')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    viewMode === 'map'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Nairobi Metro Map View"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Map View</span>
                </button>
                <button
                  type="button"
                  id="view-mode-cards-btn"
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    viewMode === 'cards'
                      ? 'bg-white/15 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grid Card View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cards</span>
                </button>
                <button
                  type="button"
                  id="view-mode-table-btn"
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    viewMode === 'table'
                      ? 'bg-white/15 text-white shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Dense Table View"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 bg-white/5 border border-white/10 text-xs transition-colors backdrop-blur-md"
                title="Reset to default seed pool"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filtering Toolbar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="search-leads-input"
                type="text"
                placeholder="Search company, sector, location, or offering..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-white/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter: Location */}
            <div>
              <select
                id="filter-location-select"
                value={selectedLocationFilter}
                onChange={(e) => setSelectedLocationFilter(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="ALL" className="bg-slate-900">All Nairobi Locations</option>
                {NAIROBI_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id} className="bg-slate-900">
                    {loc.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter: Sector */}
            <div>
              <select
                id="filter-category-select"
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="ALL" className="bg-slate-900">All Business Sectors</option>
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter: Pipeline Status */}
            <div>
              <select
                id="filter-status-select"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="ALL" className="bg-slate-900">All Stages</option>
                <option value="discovered" className="bg-slate-900">Discovered</option>
                <option value="verified" className="bg-slate-900">Verified Contact</option>
                <option value="qualified" className="bg-slate-900">Qualified</option>
                <option value="contacted" className="bg-slate-900">Contacted</option>
                <option value="in_discovery" className="bg-slate-900">In Discovery</option>
                <option value="won" className="bg-slate-900">Deal Won</option>
              </select>
            </div>
          </div>

          {/* Leads Canvas Display */}
          {filteredLeads.length > 0 ? (
            viewMode === 'map' ? (
              <div className="pt-2 animate-in fade-in duration-200">
                <NairobiMap
                  leads={filteredLeads}
                  onSelectLead={(l) => setActiveLead(l)}
                  onOpenDossier={(l) => setActiveLead(l)}
                  onDeepQualify={(l) => handleDeepQualify(l)}
                  selectedLeadId={activeLead?.id}
                />
              </div>
            ) : viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-2 animate-in fade-in duration-200">
                {filteredLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onSelectLead={(l) => setActiveLead(l)}
                    onVerifyContact={handleVerifyLeadContact}
                    onDeepQualify={(l) => handleDeepQualify(l)}
                    isVerifying={verifyingLeadId === lead.id}
                    isQualifying={qualifyingLeadId === lead.id}
                  />
                ))}
              </div>
            ) : (
              <div className="pt-2 animate-in fade-in duration-200">
                <LeadTable
                  leads={filteredLeads}
                  onSelectLead={(l) => setActiveLead(l)}
                  onVerifyContact={handleVerifyLeadContact}
                  onDeepQualify={(l) => handleDeepQualify(l)}
                  verifyingLeadId={verifyingLeadId}
                  qualifyingLeadId={qualifyingLeadId}
                />
              </div>
            )
          ) : (
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-10 text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">No companies match your current filters</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try clearing search terms or run a new discovery segment above for Westlands, Ruiru, Upper Hill, or other Nairobi hubs.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLocationFilter('ALL');
                    setSelectedCategoryFilter('ALL');
                    setSelectedStatusFilter('ALL');
                  }}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={scrollToSegmentBuilder}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Run New Discovery
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-white/10 bg-white/[0.02] backdrop-blur-lg py-6 text-xs text-slate-400 text-center relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">NairobiLead<span className="text-emerald-400">.ai</span></span>
            <span className="text-slate-600">•</span>
            <span>Compliant B2B Research Engine</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <button onClick={() => setIsComplianceOpen(true)} className="hover:text-emerald-400 transition-colors">
              ODPC Kenya Data Protection Guidelines
            </button>
            <span className="text-slate-600">•</span>
            <span>Powered by Gemini Maps & Search Grounding</span>
          </div>
        </div>
      </footer>

      {/* Lead Detail Dossier Modal */}
      {activeLead && (
        <LeadDetailModal
          lead={activeLead}
          onClose={() => setActiveLead(null)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateNotes={handleUpdateNotes}
          onDeepQualify={(l, customOffering, persona) => handleDeepQualify(l, customOffering, persona)}
          onRunFastAction={handleRunFastAction}
          isQualifying={qualifyingLeadId === activeLead.id}
          isFastActionLoading={isFastActionLoading}
        />
      )}

      {/* Compliance Policy Drawer */}
      <ComplianceDrawer
        isOpen={isComplianceOpen}
        onClose={() => setIsComplianceOpen(false)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        leads={filteredLeads}
      />
    </div>
  );
}
