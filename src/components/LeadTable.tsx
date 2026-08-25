import React from 'react';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  ExternalLink, 
  ShieldCheck, 
  BrainCircuit, 
  Star, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Lead } from '../types';

interface LeadTableProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onVerifyContact: (lead: Lead) => Promise<void>;
  onDeepQualify: (lead: Lead) => Promise<void>;
  verifyingLeadId: string | null;
  qualifyingLeadId: string | null;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  onSelectLead,
  onVerifyContact,
  onDeepQualify,
  verifyingLeadId,
  qualifyingLeadId,
}) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-white/10">
            <tr>
              <th className="py-4 px-4">Company & Sector</th>
              <th className="py-4 px-4">Nairobi Hub</th>
              <th className="py-4 px-4">Verified Public Contacts</th>
              <th className="py-4 px-4">Source Attribution</th>
              <th className="py-4 px-4">ICP / Fit</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.map((lead) => {
              const icp = lead.deepQualification?.icpScore;
              const isVerifyingThis = verifyingLeadId === lead.id;
              const isQualifyingThis = qualifyingLeadId === lead.id;

              return (
                <tr 
                  key={lead.id} 
                  className="hover:bg-white/10 transition-colors group cursor-pointer"
                  onClick={() => onSelectLead(lead)}
                >
                  {/* Company Name & Sector */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {lead.subSector || lead.category}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Location Hub */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-slate-200">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {lead.location}
                    </span>
                    <div className="text-[10px] text-slate-400 max-w-[150px] truncate">
                      {lead.locationDetail || lead.officeAddress}
                    </div>
                  </td>

                  {/* Verified Public Contacts */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      {lead.publicPhone && (
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300">
                          <Phone className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span>{lead.publicPhone}</span>
                        </div>
                      )}
                      {lead.publicEmail && (
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-300">
                          <Mail className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{lead.publicEmail}</span>
                        </div>
                      )}
                      {lead.officialWebsite && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                          <Globe className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{lead.officialWebsite.replace(/^https?:\/\//, '')}</span>
                        </div>
                      )}
                      {!lead.publicPhone && !lead.publicEmail && !lead.officialWebsite && (
                        <span className="text-slate-500 italic text-[11px]">Unverified</span>
                      )}
                    </div>
                  </td>

                  {/* Source Attribution */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1 max-w-[160px]">
                      {lead.mapsUri && (
                        <a
                          href={lead.mapsUri}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] text-emerald-400 hover:underline truncate"
                        >
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span>Google Maps</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                        </a>
                      )}
                      {lead.sources?.find(s => s.type !== 'maps') && (
                        <a
                          href={lead.sources.find(s => s.type !== 'maps')?.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 hover:underline truncate"
                        >
                          <Globe className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                          <span className="truncate">{lead.sources.find(s => s.type !== 'maps')?.title}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* ICP / Fit */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {icp !== undefined ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-sm ${
                        icp >= 85 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        icp >= 70 ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' :
                        'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}>
                        {icp}/100 ICP
                      </span>
                    ) : lead.confidenceScore ? (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {lead.confidenceScore}% conf
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm ${
                      lead.status === 'qualified' ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30' :
                      lead.status === 'verified' ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' :
                      lead.status === 'contacted' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' :
                      lead.status === 'won' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' :
                      'bg-white/10 text-slate-300 border border-white/10'
                    }`}>
                      {lead.status}
                    </span>
                  </td>

                  {/* Row Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      {!lead.isVerified && (
                        <button
                          type="button"
                          onClick={() => onVerifyContact(lead)}
                          disabled={isVerifyingThis}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all disabled:opacity-50 backdrop-blur-sm"
                          title="Verify Public Contact Details via Google Search"
                        >
                          {isVerifyingThis ? 'Verifying...' : 'Verify'}
                        </button>
                      )}

                      {!lead.deepQualification && (
                        <button
                          type="button"
                          onClick={() => onDeepQualify(lead)}
                          disabled={isQualifyingThis}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all disabled:opacity-50 backdrop-blur-sm"
                          title="Run Deep Reasoning Qualification (gemini-3.1-pro-preview)"
                        >
                          {isQualifyingThis ? 'Thinking...' : 'Qualify'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectLead(lead)}
                        className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
