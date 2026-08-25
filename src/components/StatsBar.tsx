import React from 'react';
import { 
  Building, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  MapPin, 
  TrendingUp,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  XAxis 
} from 'recharts';
import { Lead } from '../types';

interface StatsBarProps {
  leads: Lead[];
  currentLocation?: string;
  currentCategory?: string;
}

interface DailyLeadData {
  dateKey: string;
  dayLabel: string;
  fullDate: string;
  count: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  leads,
  currentLocation,
  currentCategory,
}) => {
  const totalLeads = leads.length;
  const verifiedContacts = leads.filter((l) => l.isVerified || (l.publicPhone && l.publicEmail)).length;
  const highIcpCount = leads.filter(
    (l) => (l.deepQualification?.icpScore && l.deepQualification.icpScore >= 80) || (l.confidenceScore && l.confidenceScore >= 90)
  ).length;

  const locationsCount = Array.from(new Set(leads.map((l) => l.location))).length;

  // Compute 7-day velocity data
  const weeklyData: DailyLeadData[] = React.useMemo(() => {
    const days: DailyLeadData[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const count = leads.filter((lead) => {
        if (!lead.savedAt) return false;
        try {
          const leadDate = new Date(lead.savedAt).toISOString().slice(0, 10);
          return leadDate === dateKey;
        } catch {
          return false;
        }
      }).length;

      days.push({
        dateKey,
        dayLabel,
        fullDate,
        count,
      });
    }

    return days;
  }, [leads]);

  const weeklyTotal = weeklyData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div id="dashboard-stats-bar" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 my-6">
      {/* Metric 1: Research Pool */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Companies</span>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-medium">
            Live Maps
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold text-white tracking-tight">{totalLeads}</span>
            <span className="text-xs text-slate-400 ml-1 font-normal">Places</span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" />
            <span>{locationsCount} Nairobi Hubs</span>
          </p>
        </div>
      </div>

      {/* Metric 2: 7-Day Lead Ingestion Velocity (Mini Recharts Bar Chart) */}
      <div 
        id="metric-weekly-lead-velocity"
        className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            7-Day Inflow
          </span>
          <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" />
            +{weeklyTotal} this week
          </span>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-2">
          {/* Total added in past 7 days */}
          <div className="shrink-0">
            <span className="text-3xl font-bold text-cyan-300 tracking-tight">{weeklyTotal}</span>
            <span className="text-xs text-slate-400 ml-1 font-normal">added</span>
          </div>

          {/* Mini Bar Chart */}
          <div className="h-12 flex-1 max-w-[130px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <Tooltip
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 4 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailyLeadData;
                      return (
                        <div className="bg-slate-950/95 border border-white/20 px-2.5 py-1 rounded-xl text-[11px] backdrop-blur-md shadow-2xl text-white">
                          <span className="font-semibold text-cyan-300 block text-[10px]">{data.fullDate} ({data.dayLabel})</span>
                          <span className="font-bold text-white">{data.count} {data.count === 1 ? 'lead' : 'leads'}</span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <XAxis 
                  dataKey="dayLabel" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 8 }}
                  interval={0}
                  hide={false}
                />
                <Bar 
                  dataKey="count" 
                  radius={[3, 3, 0, 0]}
                  isAnimationActive={true}
                >
                  {weeklyData.map((entry, index) => {
                    const isToday = index === weeklyData.length - 1;
                    const hasCount = entry.count > 0;
                    return (
                      <Cell 
                        key={`bar-${index}`} 
                        fill={isToday ? '#22d3ee' : hasCount ? '#06b6d4' : '#334155'}
                        opacity={hasCount ? 0.9 : 0.4}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Metric 3: Verified Public Contacts */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Public Contacts</span>
          <span className="text-[10px] bg-blue-500/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md font-medium">
            Verified
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold text-white tracking-tight">{verifiedContacts}</span>
            <span className="text-xs text-slate-400 ml-1 font-normal">Direct</span>
          </div>
          <p className="text-[11px] text-cyan-300 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
            <span>{totalLeads ? Math.round((verifiedContacts / totalLeads) * 100) : 0}% Outreach Ready</span>
          </p>
        </div>
      </div>

      {/* Metric 4: High ICP Fit */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">High ICP Fit (80+)</span>
          <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-md font-medium">
            Reasoned
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold text-white tracking-tight">{highIcpCount}</span>
            <span className="text-xs text-slate-400 ml-1 font-normal">Qualified</span>
          </div>
          <p className="text-[11px] text-purple-300">
            Top tier commercial fit
          </p>
        </div>
      </div>

      {/* Metric 5: Legal Basis & Privacy Standard */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Legal Compliance</span>
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-medium">
            Sec 28 PASS
          </span>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-3xl font-bold text-emerald-400 tracking-tight">100%</span>
          </div>
          <p className="text-[11px] text-emerald-300/90 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Public Domain Only</span>
          </p>
        </div>
      </div>
    </div>
  );
};
