import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileCode, Copy, Check, ShieldCheck } from 'lucide-react';
import { Lead } from '../types';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, leads }) => {
  const [copied, setCopied] = useState(false);
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);

  if (!isOpen) return null;

  const targetLeads = filterVerifiedOnly
    ? leads.filter((l) => l.isVerified || (l.publicPhone && l.publicEmail))
    : leads;

  const handleCopyTable = () => {
    const textLines = [
      ['Company', 'Category', 'Location', 'Website', 'Public Email', 'Public Phone', 'ICP Score'].join('\t')
    ];

    targetLeads.forEach((lead) => {
      textLines.push([
        lead.name,
        lead.category,
        lead.location,
        lead.officialWebsite || 'N/A',
        lead.publicEmail || 'N/A',
        lead.publicPhone || 'N/A',
        lead.deepQualification?.icpScore ? `${lead.deepQualification.icpScore}/100` : 'N/A',
      ].join('\t'));
    });

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        id="export-leads-modal"
        className="bg-slate-900/95 backdrop-blur-2xl border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Export Qualified Leads</h2>
              <p className="text-xs text-slate-400">Download formatted dataset with public attribution links</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="mt-5 space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-slate-300 font-medium">Exporting total leads:</span>
            <span className="font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg text-xs border border-white/10">
              {targetLeads.length} of {leads.length} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="filter-verified"
              checked={filterVerifiedOnly}
              onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
              className="rounded border-white/20 text-emerald-500 focus:ring-emerald-500 bg-white/5"
            />
            <label htmlFor="filter-verified" className="text-slate-300 cursor-pointer">
              Export only leads with verified public phone & email ({leads.filter((l) => l.isVerified || (l.publicPhone && l.publicEmail)).length})
            </label>
          </div>

          {/* Export Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* CSV */}
            <button
              type="button"
              onClick={() => exportToCSV(targetLeads, `nairobi-leads-${new Date().toISOString().slice(0, 10)}.csv`)}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-2 transition-all text-center group backdrop-blur-sm shadow-lg"
            >
              <FileSpreadsheet className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-white text-xs">CSV Spreadsheet</span>
              <span className="text-[10px] text-slate-400">Excel / Sheets ready</span>
            </button>

            {/* JSON */}
            <button
              type="button"
              onClick={() => exportToJSON(targetLeads, `nairobi-leads-${new Date().toISOString().slice(0, 10)}.json`)}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 flex flex-col items-center justify-center gap-2 transition-all text-center group backdrop-blur-sm shadow-lg"
            >
              <FileCode className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold text-white text-xs">Structured JSON</span>
              <span className="text-[10px] text-slate-400">Full schema & metadata</span>
            </button>

            {/* Copy Table */}
            <button
              type="button"
              onClick={handleCopyTable}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/50 flex flex-col items-center justify-center gap-2 transition-all text-center group backdrop-blur-sm shadow-lg"
            >
              {copied ? (
                <Check className="w-6 h-6 text-emerald-400 scale-110" />
              ) : (
                <Copy className="w-6 h-6 text-teal-400 group-hover:scale-110 transition-transform" />
              )}
              <span className="font-bold text-white text-xs">{copied ? 'Copied!' : 'Copy TSV'}</span>
              <span className="text-[10px] text-slate-400">Paste directly into Sheet</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-[11px] text-emerald-300 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Dataset includes source URLs and ODPC Section 28 compliance tags.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
