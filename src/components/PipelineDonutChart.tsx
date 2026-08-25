import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Lead, LeadStatus } from '../types';
import { Layers, ChevronDown } from 'lucide-react';

interface PipelineDonutChartProps {
  leads: Lead[];
  onSelectStageFilter?: (stage: string) => void;
}

interface StageConfig {
  key: LeadStatus;
  label: string;
  color: string;
  glowColor: string;
}

const STAGE_CONFIGS: StageConfig[] = [
  { key: 'discovered', label: 'Discovered', color: '#94a3b8', glowColor: 'rgba(148, 163, 184, 0.4)' },
  { key: 'verified', label: 'Verified', color: '#06b6d4', glowColor: 'rgba(6, 182, 212, 0.4)' },
  { key: 'qualified', label: 'Qualified', color: '#6366f1', glowColor: 'rgba(99, 102, 241, 0.4)' },
  { key: 'contacted', label: 'Contacted', color: '#f59e0b', glowColor: 'rgba(245, 158, 11, 0.4)' },
  { key: 'in_discovery', label: 'In Discovery', color: '#14b8a6', glowColor: 'rgba(20, 184, 166, 0.4)' },
  { key: 'won', label: 'Won', color: '#10b981', glowColor: 'rgba(16, 185, 129, 0.4)' },
];

export const PipelineDonutChart: React.FC<PipelineDonutChartProps> = ({ 
  leads,
  onSelectStageFilter 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Compute distribution
  const stageCounts: Record<string, number> = {};
  leads.forEach((l) => {
    stageCounts[l.status] = (stageCounts[l.status] || 0) + 1;
  });

  const chartData = STAGE_CONFIGS.map((stage) => ({
    name: stage.label,
    stageKey: stage.key,
    value: stageCounts[stage.key] || 0,
    color: stage.color,
    glowColor: stage.glowColor,
  })).filter((item) => item.value > 0);

  // Fallback if empty
  const displayData = chartData.length > 0 ? chartData : [
    { name: 'No Data', stageKey: 'none', value: 1, color: '#334155', glowColor: 'transparent' }
  ];

  const total = leads.length;
  const qualifiedOrBetter = (stageCounts['qualified'] || 0) + (stageCounts['contacted'] || 0) + (stageCounts['in_discovery'] || 0) + (stageCounts['won'] || 0);
  const conversionRate = total > 0 ? Math.round((qualifiedOrBetter / total) * 100) : 0;

  return (
    <div className="relative inline-block text-left">
      {/* Mini Header Donut Trigger Badge */}
      <button
        type="button"
        id="btn-pipeline-donut-header"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="group flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-all cursor-pointer shadow-sm hover:border-emerald-500/30"
        title="View Pipeline Distribution Chart"
      >
        {/* Compact Recharts Donut */}
        <div className="w-8 h-8 relative shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={9}
                outerRadius={15}
                paddingAngle={chartData.length > 1 ? 2 : 0}
                dataKey="value"
                stroke="none"
                isAnimationActive={true}
              >
                {displayData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[8px] font-black text-slate-300 group-hover:text-emerald-400 transition-colors">
              {total}
            </span>
          </div>
        </div>

        {/* Text Details */}
        <div className="text-left hidden xl:block">
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Pipeline</span>
            <span className="text-[9px] font-bold px-1 rounded bg-emerald-500/20 text-emerald-300">
              {conversionRate}% Fit
            </span>
          </div>
          <p className="text-[11px] font-semibold text-slate-200 leading-none mt-0.5">
            {stageCounts['won'] || 0} Won • {stageCounts['qualified'] || 0} Qual
          </p>
        </div>

        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
      </button>

      {/* Flyout Glass Dossier on Click/Hover */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div 
            id="pipeline-distribution-popover"
            onMouseLeave={() => setIsOpen(false)}
            className="absolute right-0 mt-2 w-72 z-50 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight">Pipeline Breakdown</h4>
                  <p className="text-[10px] text-slate-400">{total} Active Nairobi Leads</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {conversionRate}% Pipeline Active
              </span>
            </div>

            {/* Donut Visualizer Centerpiece */}
            <div className="my-3 flex items-center justify-center py-1">
              <div className="w-28 h-28 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const pct = total > 0 ? Math.round((data.value / total) * 100) : 0;
                          return (
                            <div className="bg-slate-950/90 border border-white/20 p-2 rounded-xl text-xs backdrop-blur-md shadow-xl text-white">
                              <span className="font-bold block" style={{ color: data.color }}>{data.name}</span>
                              <span className="text-slate-300">{data.value} leads ({pct}%)</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={displayData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={48}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="#020617"
                      strokeWidth={2}
                    >
                      {displayData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-black text-white leading-none">{total}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Leads</span>
                </div>
              </div>
            </div>

            {/* Stage List Legend Breakdown */}
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              {STAGE_CONFIGS.map((stage) => {
                const count = stageCounts[stage.key] || 0;
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;

                return (
                  <div
                    key={stage.key}
                    onClick={() => {
                      if (onSelectStageFilter) {
                        onSelectStageFilter(stage.key);
                        setIsOpen(false);
                      }
                    }}
                    className="flex items-center justify-between p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center space-x-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" 
                        style={{ backgroundColor: stage.color }} 
                      />
                      <span className="text-xs text-slate-300 group-hover:text-white font-medium">
                        {stage.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="font-bold text-white font-mono">{count}</span>
                      <span className="text-[10px] text-slate-400 w-7 text-right">({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
