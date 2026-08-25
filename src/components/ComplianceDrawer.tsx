import React from 'react';
import { X, ShieldCheck, CheckCircle2, FileText, AlertTriangle, Scale, ExternalLink } from 'lucide-react';

interface ComplianceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComplianceDrawer: React.FC<ComplianceDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/75 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
      <div 
        id="compliance-policy-drawer"
        className="w-full max-w-xl bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-white/10">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">Compliance & Data Protection Policy</h2>
                <p className="text-[11px] text-slate-400">Kenya Data Protection Act 2019 & ODPC Guidelines</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="mt-6 space-y-6 text-xs text-slate-300 leading-relaxed">
            
            {/* Core Principle */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Strict Public Commercial Domain Standard</span>
              </div>
              <p className="text-slate-200 text-xs">
                This dashboard exclusively captures and qualifies independently verified public business contact information (corporate web domains, official general contact emails like info@ or sales@, verified office switchboards, and Google Maps public place profiles).
              </p>
            </div>

            {/* Legal Pillars */}
            <div className="space-y-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                Key Compliance Pillars
              </h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Section 28 Lawful Collection Basis</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Under the Kenya Data Protection Act 2019 (Section 28(2)), information that is deliberately made public by the commercial entity or drawn from public registries is lawful for legitimate B2B commercial discovery.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Mandatory Source Attribution</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Every data point retains traceable citation URLs back to the origin source (e.g. Google Maps Place listing, official corporate website, or certified industry registry).
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3 backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">Zero Private PII Scraping</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Personal mobile phone numbers, residential addresses, unlisted personal emails, and non-commercial social profiles are strictly prohibited and filtered out by our intelligence grounding engine.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* B2B Outreach Best Practice in Nairobi */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 backdrop-blur-sm">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Ethical Kenyan B2B Outreach Guidelines
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-slate-400 text-[11px]">
                <li>Always provide a clear, one-click opt-out option in every B2B email communication.</li>
                <li>State clearly why you are contacting the company and how your solution relates to their public commercial mandate.</li>
                <li>Ensure WhatsApp business introductions are concise, respectful, and directed only to public business lines.</li>
              </ul>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors uppercase tracking-tight"
          >
            I Understand & Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
