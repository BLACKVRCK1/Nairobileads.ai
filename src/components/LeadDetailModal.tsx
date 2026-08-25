import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  Check, 
  BrainCircuit, 
  Sparkles, 
  Zap, 
  FileText, 
  MessageSquare, 
  PhoneCall, 
  Send, 
  Loader2, 
  Layers, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { Lead, LeadStatus } from '../types';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (leadId: string, status: LeadStatus) => void;
  onUpdateNotes: (leadId: string, notes: string) => void;
  onDeepQualify: (lead: Lead, customOffering?: string, persona?: string) => Promise<void>;
  onRunFastAction: (lead: Lead, actionType: string) => Promise<void>;
  isQualifying: boolean;
  isFastActionLoading: boolean;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  onClose,
  onUpdateStatus,
  onUpdateNotes,
  onDeepQualify,
  onRunFastAction,
  isQualifying,
  isFastActionLoading,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customOfferingInput, setCustomOfferingInput] = useState('');
  const [notesInput, setNotesInput] = useState(lead?.notes || '');
  const [activeTab, setActiveTab] = useState<'qualification' | 'contacts' | 'outreach' | 'fast_actions' | 'compliance'>('qualification');

  if (!lead) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveNotes = () => {
    onUpdateNotes(lead.id, notesInput);
  };

  const qual = lead.deepQualification;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        id="lead-dossier-modal"
        className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-start justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">{lead.name}</h2>
                <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  ODPC Compliant Public Lead
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                <span>{lead.category}</span>
                <span>•</span>
                <span className="text-slate-300 font-medium">{lead.subSector}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <MapPin className="w-3 h-3" />
                  {lead.locationDetail || lead.location}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-6 border-b border-white/10 bg-white/5 backdrop-blur-md overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('qualification')}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'qualification'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            Deep Qualification (High Thinking)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contacts')}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Public Contacts & Sources
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('outreach')}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'outreach'
                ? 'border-indigo-400 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Outreach Sequences (Nairobi B2B)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fast_actions')}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'fast_actions'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Fast Actions (Low-Latency)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compliance')}
            className={`py-3 px-3.5 font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'compliance'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            ODPC Audit Trail
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs">
          
          {/* TAB 1: DEEP QUALIFICATION */}
          {activeTab === 'qualification' && (
            <div className="space-y-6">
              {qual ? (
                <>
                  {/* Score Hero Card */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          AI Reasoning ICP Fit Assessment
                        </span>
                        <h3 className="text-lg font-bold text-white mt-0.5">
                          {qual.qualificationSummary}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 border border-white/15 px-4 py-2 rounded-xl shrink-0 backdrop-blur-md">
                        <div className="text-right">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase">Composite Score</span>
                          <div className="text-2xl font-black text-emerald-400 tracking-tight">
                            {qual.icpScore}<span className="text-xs text-slate-500 font-normal">/100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 4 Score Breakdown Bars */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-4">
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Market Presence</span>
                          <span className="text-white font-semibold">{qual.scoreBreakdown.marketPresence}/25</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(qual.scoreBreakdown.marketPresence / 25) * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Commercial Maturity</span>
                          <span className="text-white font-semibold">{qual.scoreBreakdown.commercialMaturity}/25</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(qual.scoreBreakdown.commercialMaturity / 25) * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Operational Scale</span>
                          <span className="text-white font-semibold">{qual.scoreBreakdown.operationalScale}/25</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(qual.scoreBreakdown.operationalScale / 25) * 100}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Contact Quality</span>
                          <span className="text-white font-semibold">{qual.scoreBreakdown.contactQuality}/25</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-500 h-full rounded-full" style={{ width: `${(qual.scoreBreakdown.contactQuality / 25) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pain Points & B2B Angles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
                      <h4 className="font-bold text-white text-xs mb-3 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        Kenya Market Pain Points & Bottlenecks
                      </h4>
                      <ul className="space-y-2">
                        {qual.keyPainPoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
                      <h4 className="font-bold text-white text-xs mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        High-Converting B2B Deal Angles
                      </h4>
                      <ul className="space-y-2">
                        {qual.b2bOpportunityAngles.map((ang, i) => (
                          <li key={i} className="flex items-start gap-2 text-slate-300 text-xs leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                            <span>{ang}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Procurement Dynamics */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl">
                    <h4 className="font-bold text-white text-xs mb-3 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      Procurement & Decision-Making Dynamics
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">Target Buying Personas</span>
                        <div className="font-medium text-slate-200">
                          {qual.procurementProfile.decisionMakers.join(' • ')}
                        </div>
                      </div>
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">Estimated Sales Cycle</span>
                        <div className="font-medium text-slate-200">
                          {qual.procurementProfile.salesCycleEstimate}
                        </div>
                      </div>
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-white/10">
                        <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-1">Budget Tier</span>
                        <div className="font-medium text-slate-200">
                          {qual.procurementProfile.budgetScale}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Run High-Thinking Deep Qualification
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4 leading-relaxed">
                    Leverages Gemini 3.1 Pro with High Thinking Level to analyze Kenya market pain points, B2B procurement dynamics, and generate bespoke outreach messaging.
                  </p>

                  <div className="max-w-md mx-auto space-y-3 text-left mb-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Your Solution / Pitch Offering (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cloud ERP, Cold-chain IoT sensors, Corporate Health Plans"
                        value={customOfferingInput}
                        onChange={(e) => setCustomOfferingInput(e.target.value)}
                        className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeepQualify(lead, customOfferingInput)}
                    disabled={isQualifying}
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50 uppercase tracking-tight"
                  >
                    {isQualifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Analyzing with High Reasoning...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Deep Qualification Dossier</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PUBLIC CONTACTS & SOURCES */}
          {activeTab === 'contacts' && (
            <div className="space-y-5">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Verified Public Business Contacts
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Kenya ODPC Section 28 Compliant
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-0.5">Public Phone Line</span>
                      {lead.publicPhone ? (
                        <a href={`tel:${lead.publicPhone}`} className="text-cyan-300 font-mono text-xs font-semibold hover:underline">
                          {lead.publicPhone}
                        </a>
                      ) : (
                        <span className="text-slate-500 italic text-xs">Not found in public registry</span>
                      )}
                    </div>
                    {lead.publicPhone && (
                      <button
                        type="button"
                        onClick={() => handleCopy(lead.publicPhone!, 'phone')}
                        className="p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white"
                        title="Copy Phone"
                      >
                        {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Email */}
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-0.5">Public Corporate Email</span>
                      {lead.publicEmail ? (
                        <a href={`mailto:${lead.publicEmail}`} className="text-indigo-300 text-xs font-medium hover:underline">
                          {lead.publicEmail}
                        </a>
                      ) : (
                        <span className="text-slate-500 italic text-xs">Not found in public registry</span>
                      )}
                    </div>
                    {lead.publicEmail && (
                      <button
                        type="button"
                        onClick={() => handleCopy(lead.publicEmail!, 'email')}
                        className="p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white"
                        title="Copy Email"
                      >
                        {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  {/* Official Website */}
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-0.5">Official Website URL</span>
                      {lead.officialWebsite ? (
                        <a 
                          href={lead.officialWebsite} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-400 text-xs font-medium hover:underline flex items-center gap-1"
                        >
                          <span>{lead.officialWebsite}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-slate-500 italic text-xs">Not listed</span>
                      )}
                    </div>
                  </div>

                  {/* Physical Address */}
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 font-semibold block mb-0.5">Physical HQ / Office Pin</span>
                      <span className="text-slate-300 text-xs">
                        {lead.officeAddress || lead.locationDetail || lead.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Core Offerings */}
                {lead.coreOfferings && lead.coreOfferings.length > 0 && (
                  <div className="pt-3 border-t border-white/10">
                    <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                      Core Commercial Capabilities & Offerings
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lead.coreOfferings.map((offering, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10 text-xs">
                          {offering}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Source Attributions */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
                <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Independent Public Attribution Sources ({lead.sources?.length || 0})
                </h3>
                <div className="space-y-2">
                  {lead.mapsUri && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/10">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-200">Google Maps Grounding Source</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-sm">{lead.mapsUri}</div>
                        </div>
                      </div>
                      <a
                        href={lead.mapsUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 flex items-center gap-1 transition-colors"
                      >
                        <span>Open Place</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {(lead.sources || []).map((src, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/10">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-200">{src.title}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-sm">{src.uri}</div>
                        </div>
                      </div>
                      <a
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 text-xs rounded-xl bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 flex items-center gap-1 transition-colors"
                      >
                        <span>Verify Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OUTREACH SEQUENCES */}
          {activeTab === 'outreach' && (
            <div className="space-y-5">
              {qual?.outreachSequence ? (
                <>
                  {/* Formal B2B Email */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="font-bold text-white text-xs flex items-center gap-2">
                        <Mail className="w-4 h-4 text-indigo-400" />
                        Touch 1: Formal Executive Email (Nairobi Enterprise Culture)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(
                          `Subject: ${qual.outreachSequence.formalEmail.subject}\n\n${qual.outreachSequence.formalEmail.body}`,
                          'email-sequence'
                        )}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10 transition-colors"
                      >
                        {copiedField === 'email-sequence' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Email</span>
                      </button>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">Subject Line:</span>
                      <p className="text-slate-200 font-medium bg-slate-900/60 p-2.5 rounded-xl border border-white/10 text-xs">
                        {qual.outreachSequence.formalEmail.subject}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block mb-1">Body Text:</span>
                      <p className="text-slate-300 whitespace-pre-line bg-slate-900/60 p-3 rounded-xl border border-white/10 leading-relaxed font-sans text-xs">
                        {qual.outreachSequence.formalEmail.body}
                      </p>
                    </div>
                  </div>

                  {/* WhatsApp Intro */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="font-bold text-white text-xs flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        Touch 2: Direct WhatsApp Business Pitch
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(qual.outreachSequence.whatsAppIntro, 'wa-sequence')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10 transition-colors"
                      >
                        {copiedField === 'wa-sequence' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy WhatsApp</span>
                      </button>
                    </div>
                    <p className="text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-white/10 leading-relaxed font-sans text-xs">
                      {qual.outreachSequence.whatsAppIntro}
                    </p>
                  </div>

                  {/* Discovery Hook */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="font-bold text-white text-xs flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-cyan-400" />
                        Touch 3: 30-Second Discovery Call Opening Hook
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(qual.outreachSequence.discoveryCallHook, 'call-sequence')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10 transition-colors"
                      >
                        {copiedField === 'call-sequence' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Hook</span>
                      </button>
                    </div>
                    <p className="text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-white/10 leading-relaxed font-sans text-xs">
                      {qual.outreachSequence.discoveryCallHook}
                    </p>
                  </div>
                </>
              ) : (
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-xl">
                  <p className="text-slate-400 mb-3">
                    Please run Deep Qualification to generate the tailored multi-touch Nairobi outreach sequence.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('qualification')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 uppercase tracking-tight"
                  >
                    Go to Deep Qualification
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FAST ACTIONS (LOW-LATENCY) */}
          {activeTab === 'fast_actions' && (
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Low-Latency Real-Time Actions
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Powered by gemini-3.1-flash-lite for instant sub-second response times.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => onRunFastAction(lead, 'quick-pitch')}
                    disabled={isFastActionLoading}
                    className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/10 text-left transition-all hover:border-amber-500/40"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400 mb-2" />
                    <div className="font-bold text-slate-200 text-xs">Crisp Value Prop</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">2-sentence elevator pitch</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRunFastAction(lead, 'sms-reminder')}
                    disabled={isFastActionLoading}
                    className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/10 text-left transition-all hover:border-cyan-500/40"
                  >
                    <MessageSquare className="w-4 h-4 text-cyan-400 mb-2" />
                    <div className="font-bold text-slate-200 text-xs">160-Char SMS</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Polite Nairobi business SMS</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRunFastAction(lead, 'icebreakers')}
                    disabled={isFastActionLoading}
                    className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-white/10 text-left transition-all hover:border-emerald-500/40"
                  >
                    <Tag className="w-4 h-4 text-emerald-400 mb-2" />
                    <div className="font-bold text-slate-200 text-xs">Meeting Icebreakers</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">3 topical conversation starters</div>
                  </button>
                </div>

                {/* Display Cached or Generated Fast Action Outputs */}
                {lead.fastActions && (
                  <div className="mt-5 space-y-3 pt-4 border-t border-white/10">
                    {lead.fastActions.quickPitch && (
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">Tailored Crisp Value Pitch</span>
                        <p className="text-slate-200 text-xs">{lead.fastActions.quickPitch}</p>
                      </div>
                    )}

                    {lead.fastActions.smsSnippet && (
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">Kenyan B2B SMS Snippet</span>
                        <p className="text-slate-200 text-xs font-mono">{lead.fastActions.smsSnippet}</p>
                      </div>
                    )}

                    {lead.fastActions.icebreakers && lead.fastActions.icebreakers.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">Executive Meeting Icebreakers</span>
                        <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs">
                          {lead.fastActions.icebreakers.map((ib, idx) => (
                            <li key={idx}>{ib}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: COMPLIANCE & ODPC AUDIT */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Kenya Data Protection Act (ODPC 2019) Legal Assessment
                </h3>
                <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block">Lawful Basis & Corporate Exception</span>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {qual?.complianceMemo?.lawfulBasis || 
                      'This lead dossier contains strictly public-domain business entity records (official company domain, general business desk email, verified commercial phone line, and public Google Maps place listing). Zero private personal data or confidential individual records are captured.'}
                  </p>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-white/10 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-cyan-400 block">Data Sources Audited</span>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {qual?.complianceMemo?.dataAudited || 
                      '1. Google Maps Grounding Verified Coordinates & Place Record\n2. Official Corporate Domain Public /Contact Pages\n3. Kenya ICT Authority / NSE / Registrar Public Directories'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Status & Internal Notes */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                Pipeline Stage
              </label>
              <select
                id="select-lead-pipeline-stage"
                value={lead.status}
                onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md"
              >
                <option value="discovered" className="bg-slate-900 text-white">Discovered</option>
                <option value="verified" className="bg-slate-900 text-white">Verified Contact</option>
                <option value="qualified" className="bg-slate-900 text-white">Qualified</option>
                <option value="contacted" className="bg-slate-900 text-white">Contacted</option>
                <option value="in_discovery" className="bg-slate-900 text-white">In Discovery Meeting</option>
                <option value="won" className="bg-slate-900 text-white">Deal Won</option>
                <option value="archived" className="bg-slate-900 text-white">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex justify-between">
                <span>Internal Research Notes</span>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="text-emerald-400 hover:underline text-[10px] font-normal"
                >
                  Save Notes
                </button>
              </label>
              <input
                type="text"
                placeholder="e.g. Discussed with procurement, follow up on 15th..."
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                onBlur={handleSaveNotes}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 backdrop-blur-md"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Researched on: {new Date(lead.savedAt).toLocaleDateString()}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
