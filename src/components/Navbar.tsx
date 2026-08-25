import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Download, 
  Compass, 
  Sparkles
} from 'lucide-react';
import { Lead } from '../types';
import { PipelineDonutChart } from './PipelineDonutChart';

interface NavbarProps {
  onOpenCompliance: () => void;
  onOpenExport: () => void;
  onScrollToSegmentBuilder: () => void;
  leadCount: number;
  verifiedCount: number;
  leads?: Lead[];
  onSelectStageFilter?: (stage: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCompliance,
  onOpenExport,
  onScrollToSegmentBuilder,
  leadCount,
  verifiedCount,
  leads = [],
  onSelectStageFilter,
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 text-slate-950 font-black">
              <div className="w-4 h-4 border-2 border-slate-950 rounded-sm"></div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  NairobiLead<span className="text-emerald-400">.ai</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  ODPC Compliant
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
                Nairobi B2B Lead Discovery & Public Verification Engine
              </p>
            </div>
          </div>

          {/* Center Navigation Links & Stage Distribution Donut */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-400">
            <button onClick={onScrollToSegmentBuilder} className="text-white hover:text-emerald-400 transition-colors">
              Discovery Engine
            </button>
            <a href="#lead-database-section" className="hover:text-white transition-colors">
              Verified Pipeline ({verifiedCount})
            </a>
            <button onClick={onOpenCompliance} className="hover:text-white transition-colors">
              Compliance Registry
            </button>
          </nav>

          {/* Action CTAs & Pipeline Donut Chart */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Elegant Recharts Pipeline Stage Donut Widget */}
            <PipelineDonutChart
              leads={leads}
              onSelectStageFilter={onSelectStageFilter}
            />

            {/* Compliance Guarantee Indicator */}
            <button
              id="btn-compliance-guide"
              onClick={onOpenCompliance}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl backdrop-blur-md transition-all shadow-sm"
              title="Kenya Data Protection Act 2019 Compliance Framework"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Compliance</span>
            </button>

            {/* Export Leads */}
            <button
              id="btn-export-leads-nav"
              onClick={onOpenExport}
              disabled={leadCount === 0}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl backdrop-blur-md disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export ({leadCount})</span>
            </button>

            {/* New Segment Discovery */}
            <button
              id="btn-start-discovery-nav"
              onClick={onScrollToSegmentBuilder}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/25 rounded-xl transition-all uppercase tracking-tight"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Run Discovery</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
