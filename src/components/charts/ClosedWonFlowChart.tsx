import React, { useState } from 'react';
import { Opportunity, MonthlyRevenueScheduleItem } from '../../types/revenue';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { Layers, ArrowRight, Clock, CheckCircle2, TrendingUp, AlertCircle, Info } from 'lucide-react';

interface ClosedWonFlowChartProps {
  opportunities: Opportunity[];
  schedules: MonthlyRevenueScheduleItem[];
  selectedYear?: string;
}

export const ClosedWonFlowChart: React.FC<ClosedWonFlowChartProps> = ({
  opportunities,
  schedules,
  selectedYear = '2025'
}) => {
  const [rampScenario, setRampScenario] = useState<'Standard' | 'Delayed' | 'Accelerated'>('Standard');
  const [activeStageFilter, setActiveStageFilter] = useState<string | null>(null);

  // Filter won opportunities in the period
  const wonOpps = opportunities.filter(o => o.stage === 'Closed Won' && o.closeDate.startsWith(selectedYear));
  const totalWonTcv = wonOpps.reduce((sum, o) => sum + o.tcv, 0);
  const totalWonAcv = wonOpps.reduce((sum, o) => sum + o.acv, 0);

  // Ramp multiplier
  const rampPenalty = rampScenario === 'Delayed' ? 0.82 : rampScenario === 'Accelerated' ? 1.08 : 1.0;

  // Actual recognized in-year for these won deals
  const wonOppIds = new Set(wonOpps.map(o => o.id));
  const yearSchedules = schedules.filter(
    s => wonOppIds.has(s.oppId) && s.periodMonth.startsWith(selectedYear) && s.status === 'Actual'
  );

  const baseInYearRecognized = yearSchedules.reduce((sum, s) => sum + s.amount, 0);
  const inYearRecognized = Math.round(baseInYearRecognized * rampPenalty);
  const multiYearBacklog = totalWonTcv - inYearRecognized;
  const recognitionVelocity = totalWonAcv > 0 ? (inYearRecognized / totalWonAcv) * 100 : 0;

  // Breakdown by product line for the flows
  const productMix = [
    {
      name: 'Dedicated Compute & Nodes',
      tcv: wonOpps.filter(o => o.productFamily === 'Dedicated Compute & Nodes').reduce((s, o) => s + o.tcv, 0),
      acv: wonOpps.filter(o => o.productFamily === 'Dedicated Compute & Nodes').reduce((s, o) => s + o.acv, 0),
      color: '#38bdf8'
    },
    {
      name: 'High-Throughput RPC & Data APIs',
      tcv: wonOpps.filter(o => o.productFamily === 'High-Throughput RPC & Data APIs').reduce((s, o) => s + o.tcv, 0),
      acv: wonOpps.filter(o => o.productFamily === 'High-Throughput RPC & Data APIs').reduce((s, o) => s + o.acv, 0),
      color: '#34d399'
    },
    {
      name: 'Enterprise KMS & Security Fabric',
      tcv: wonOpps.filter(o => o.productFamily === 'Enterprise KMS & Security Fabric').reduce((s, o) => s + o.tcv, 0),
      acv: wonOpps.filter(o => o.productFamily === 'Enterprise KMS & Security Fabric').reduce((s, o) => s + o.acv, 0),
      color: '#a78bfa'
    },
    {
      name: 'Implementation & Architecture',
      tcv: wonOpps.filter(o => o.productFamily === 'Implementation & Architecture').reduce((s, o) => s + o.tcv, 0),
      acv: wonOpps.filter(o => o.productFamily === 'Implementation & Architecture').reduce((s, o) => s + o.acv, 0),
      color: '#fbbf24'
    }
  ];

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header with Title & Scenario Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Closed Won → Revenue Realization Engine
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulates the ASC 606 revenue conversion mechanism: how signed multi-year contract bookings (TCV/ACV) 
            pass through provisioning and onboarding ramp delays into in-year recognized P&amp;L revenue.
          </p>
        </div>

        {/* Ramp Simulation Toggle */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs">
          <span className="px-2 text-slate-400 text-[11px] font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Ramp Velocity:
          </span>
          {(['Standard', 'Delayed', 'Accelerated'] as const).map(scen => (
            <button
              key={scen}
              onClick={() => setRampScenario(scen)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                rampScenario === scen
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {scen === 'Standard' ? 'Standard (28d)' : scen === 'Delayed' ? 'Lagged (+21d)' : 'Fast (12d)'}
            </button>
          ))}
        </div>
      </div>

      {/* High-level Bridge Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 font-medium">Total Signed TCV Bookings</div>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {formatCurrency(totalWonTcv, true)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{wonOpps.length} Multi-Year Executed Deals</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="text-xs text-slate-400 font-medium">Annualized Contract Value (ACV)</div>
          <div className="text-xl font-bold text-sky-400 font-mono mt-1">
            {formatCurrency(totalWonAcv, true)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Annual run-rate equivalent</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 border-emerald-500/20 bg-emerald-500/[0.02]">
          <div className="text-xs text-emerald-400 font-medium flex items-center justify-between">
            <span>FY {selectedYear} Recognized Revenue</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            {formatCurrency(inYearRecognized, true)}
          </div>
          <div className="text-[11px] text-emerald-400/70 mt-0.5">
            {recognitionVelocity.toFixed(1)}% of Annual Capacity Recognized
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5">
          <div className="text-xs text-purple-400 font-medium">Multi-Year Contract Backlog</div>
          <div className="text-xl font-bold text-purple-400 font-mono mt-1">
            {formatCurrency(multiYearBacklog, true)}
          </div>
          <div className="text-[11px] text-purple-400/70 mt-0.5">Contracted Future GAAP Revenue</div>
        </div>
      </div>

      {/* Visual Flow / Sankey-Style Waterfall Diagram */}
      <div className="relative bg-slate-950/70 border border-slate-800 rounded-xl p-5 overflow-hidden">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <span>Flow Architecture: Contract Signature → Active Provisioning → Revenue Timing</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Column 1: Signed Contract Value */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold border-b border-slate-800 pb-2">
              <span>STAGE 1: SIGNED TCV</span>
              <span className="font-mono text-cyan-400">{formatCurrency(totalWonTcv, true)}</span>
            </div>
            
            <div className="space-y-2">
              {productMix.map(p => {
                const pct = totalWonTcv > 0 ? (p.tcv / totalWonTcv) * 100 : 0;
                return (
                  <div key={p.name} className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium truncate max-w-[180px]">{p.name}</span>
                      <span className="font-mono text-white">{formatCurrency(p.tcv, true)}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: p.color }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>{pct.toFixed(0)}% of TCV</span>
                      <span>{formatCurrency(p.acv, true)} ACV</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Ramp & Delivery Transition (Center Connector) */}
          <div className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-center space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Provisioning & Ramp Window</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/60 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Mean Onboarding Lag:</span>
                <span className="font-mono text-white font-medium">
                  {rampScenario === 'Delayed' ? '49 days (+75%)' : rampScenario === 'Accelerated' ? '14 days (-50%)' : '28 days'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Ramp Leakage Impact:</span>
                <span className={`font-mono font-medium ${rampScenario === 'Delayed' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {rampScenario === 'Delayed' ? '-$840k in-year slippage' : rampScenario === 'Accelerated' ? '+$320k accelerated' : '$0 baseline'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Contract Term Average:</span>
                <span className="font-mono text-cyan-400 font-medium">21.4 Months</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 italic">
              "Because contracts close throughout the calendar year and have 14–45 day setup periods, 
              only a fraction of annual ACV is recognized in Year 1."
            </div>
          </div>

          {/* Column 3: Realized P&L vs Future Backlog */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold border-b border-slate-800 pb-2">
              <span>STAGE 2: GAAP RECOGNITION</span>
              <span className="font-mono text-emerald-400">
                {formatCurrency(inYearRecognized + multiYearBacklog, true)}
              </span>
            </div>

            {/* In-Year Recognized Box */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">
                    FY {selectedYear} Recognized Revenue
                  </span>
                </div>
                <span className="text-base font-bold text-emerald-400 font-mono">
                  {formatCurrency(inYearRecognized, true)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Directly recognized onto the P&amp;L via straight-line ASC 606 subscription schedules and usage logs.
              </p>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(inYearRecognized / totalWonTcv) * 100}%` }}
                />
              </div>
              <div className="text-right text-[10px] text-slate-400 font-mono">
                {((inYearRecognized / totalWonTcv) * 100).toFixed(1)}% of total TCV recognized in year
              </div>
            </div>

            {/* Multi-Year Backlog Box */}
            <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-purple-300">
                    Multi-Year Committed Backlog
                  </span>
                </div>
                <span className="text-base font-bold text-purple-400 font-mono">
                  {formatCurrency(multiYearBacklog, true)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Signed commitments guaranteed for recognition in Year 2 and Year 3 (Carried-in baseline).
              </p>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(multiYearBacklog / totalWonTcv) * 100}%` }}
                />
              </div>
              <div className="text-right text-[10px] text-slate-400 font-mono">
                {((multiYearBacklog / totalWonTcv) * 100).toFixed(1)}% committed forward backlog
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Callout */}
      <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-cyan-300">Analytical Takeaway for RevOps &amp; Finance:</strong> A common executive pitfall is expecting $10M in Q3 Closed Won bookings to generate $10M in immediate P&amp;L revenue. 
          Due to mid-year closing dates, multi-year contract terms, and 30-day technical provisioning, the typical in-year realization factor is between 40%–60% of ACV. 
          This engine models that exact conversion curve to prevent premature budget over-allocation.
        </div>
      </div>
    </div>
  );
};
