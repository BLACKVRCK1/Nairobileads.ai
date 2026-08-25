import React from 'react';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  ExternalLink, 
  ShieldCheck, 
  Star, 
  Sparkles, 
  BrainCircuit, 
  ChevronRight,
  Users
} from 'lucide-react';
import { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  onSelectLead: (lead: Lead) => void;
  onVerifyContact: (lead: Lead) => Promise<void>;
  onDeepQualify: (lead: Lead) => Promise<void>;
  isVerifying: boolean;
  isQualifying: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onSelectLead,
  onVerifyContact,
  onDeepQualify,
  isVerifying,
  isQualifying,
}) => {
  const icpScore = lead.deepQualification?.icpScore;

  const getStatusBadge = (status: Lead['status']) => {
    switch (status) {
      case 'qualified':
        return <span className="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm">Qualified</span>;
      case 'verified':
        return <span className="bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm">Verified Contact</span>;
      case 'contacted':
        return <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm">Contacted</span>;
      case 'in_discovery':
        return <span className="bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm">In Discovery</span>;
      case 'won':
        return <span className="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm">Deal Won</span>;
      default:
        return <span className="bg-white/10 text-slate-300 border border-white/10 text-[10px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-sm">Discovered</span>;
    }
  };

  return (
    <div 
      id={`lead-card-${lead.id}`}
      className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/25 rounded-2xl p-5 transition-all duration-200 hover:shadow-2xl hover:shadow-emerald-500/5 flex flex-col justify-between group"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                  {lead.name}
                </h3>
                {getStatusBadge(lead.status)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {lead.subSector || lead.category}
              </p>
            </div>
          </div>

          {/* ICP Score Metric or Rating */}
          <div className="shrink-0 text-right">
            {icpScore !== undefined ? (
              <div className="inline-flex flex-col items-end">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">ICP Fit</span>
                <span className={`text-base font-black ${
                  icpScore >= 85 ? 'text-emerald-400' : icpScore >= 70 ? 'text-cyan-400' : 'text-amber-400'
                }`}>
                  {icpScore}/100
                </span>
              </div>
            ) : lead.rating ? (
              <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-lg text-xs font-semibold backdrop-blur-sm">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{lead.rating.toFixed(1)}</span>
                <span className="text-slate-400 text-[10px]">({lead.reviewCount || 0})</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Location & Estimated Size */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/10 backdrop-blur-sm">
            <MapPin className="w-3 h-3 text-emerald-400" />
            {lead.locationDetail || lead.location}
          </span>
          {lead.estimatedSize && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/5 text-slate-400 border border-white/5">
              <Users className="w-3 h-3 text-slate-400" />
              {lead.estimatedSize}
            </span>
          )}
        </div>

        {/* Summary Description */}
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-4">
          {lead.summary}
        </p>

        {/* Direct Public Contact Box */}
        <div className="bg-slate-950/50 border border-white/10 rounded-xl p-3 mb-4 space-y-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pb-1.5 border-b border-white/10">
            <span className="flex items-center gap-1 text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Public Business Contacts
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              ODPC Verified
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
            {/* Phone */}
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              {lead.publicPhone ? (
                <a 
                  href={`tel:${lead.publicPhone}`} 
                  className="hover:text-cyan-300 font-mono text-[11px] truncate"
                  title="Official Public Business Line"
                >
                  {lead.publicPhone}
                </a>
              ) : (
                <span className="text-slate-500 italic text-[11px]">Unlisted phone</span>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {lead.publicEmail ? (
                <a 
                  href={`mailto:${lead.publicEmail}`} 
                  className="hover:text-indigo-300 text-[11px] truncate"
                  title="Official Public Corporate Email"
                >
                  {lead.publicEmail}
                </a>
              ) : (
                <span className="text-slate-500 italic text-[11px]">Unlisted email</span>
              )}
            </div>
          </div>

          {/* Website */}
          {lead.officialWebsite && (
            <div className="flex items-center gap-2 text-xs pt-1.5 border-t border-white/5 text-slate-300">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <a
                href={lead.officialWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-300 text-[11px] truncate flex items-center gap-1 text-emerald-400"
              >
                <span>{lead.officialWebsite.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}
        </div>

        {/* Source Attribution Badges */}
        <div className="mb-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
            Verified Attribution Sources
          </span>
          <div className="flex flex-wrap gap-1.5">
            {lead.mapsUri && (
              <a
                href={lead.mapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] transition-colors backdrop-blur-sm"
              >
                <MapPin className="w-2.5 h-2.5" />
                <span>Google Maps Place</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            )}
            {(lead.sources || []).filter(s => s.type !== 'maps').slice(0, 2).map((src, idx) => (
              <a
                key={idx}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[10px] max-w-[160px] truncate transition-colors backdrop-blur-sm"
                title={src.title}
              >
                <Globe className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                <span className="truncate">{src.title}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Card Action Controls */}
      <div className="pt-3.5 border-t border-white/10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {!lead.isVerified && (
            <button
              type="button"
              onClick={() => onVerifyContact(lead)}
              disabled={isVerifying}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 transition-all disabled:opacity-50 backdrop-blur-sm"
            >
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>{isVerifying ? 'Verifying...' : 'Verify Web'}</span>
            </button>
          )}

          {!lead.deepQualification && (
            <button
              type="button"
              onClick={() => onDeepQualify(lead)}
              disabled={isQualifying}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all disabled:opacity-50 backdrop-blur-sm"
            >
              <BrainCircuit className="w-3 h-3 text-indigo-400" />
              <span>{isQualifying ? 'Reasoning...' : 'Qualify'}</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSelectLead(lead)}
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 transition-all ml-auto backdrop-blur-md"
        >
          <span>Dossier</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};
