import React from 'react';
import { 
  MonthlyTrendPoint, 
  FilteredAnalyticsSummary 
} from '../../lib/analytics';
import { Opportunity, FilterState, MonthlyTarget } from '../../types/revenue';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { ForecastHorizonChart } from '../charts/ForecastHorizonChart';
import { Badge } from '../common/Badge';
import { 
  TrendingUp, 
  Target, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface ForecastViewProps {
  timeSeries: MonthlyTrendPoint[];
  opportunities: Opportunity[];
  targets: MonthlyTarget[];
  summary: FilteredAnalyticsSummary;
  cutoffMonth: string;
  filters: FilterState;
  onScenarioChange: (s: FilterState['scenario']) => void;
  onWeightingChange: (w: FilterState['weightingMode']) => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  timeSeries,
  opportunities,
  targets,
  summary,
  cutoffMonth,
  filters,
  onScenarioChange,
  onWeightingChange
}) => {
  // Aggregate into 2026 Quarters (Q1, Q2, Q3, Q4)
  const quarterNames = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];
  const quartersData = quarterNames.map((qName, qIdx) => {
    const qMonths = [
      `2026-0${qIdx * 3 + 1}`,
      `2026-0${qIdx * 3 + 2}`,
      `2026-0${qIdx * 3 + 3}`
    ];

    const qPoints = timeSeries.filter(t => qMonths.includes(t.periodMonth));
    const target = qPoints.reduce((s, p) => s + p.target, 0);
    const actual = qPoints.reduce((s, p) => s + p.actual, 0);
    const committed = qPoints.reduce((s, p) => s + p.committed, 0);
    const pipeline = qPoints.reduce((s, p) => s + p.pipeline, 0);
    const totalProjected = qPoints.reduce((s, p) => s + p.totalProjected, 0);
    const gap = target - totalProjected;
    const attainment = target > 0 ? (totalProjected / target) * 100 : 0;

    return {
      name: qName,
      target,
      actual,
      committed,
      pipeline,
      totalProjected,
      gap,
      attainment,
      isClosed: qIdx === 0 // Q1 is historical actual
    };
  });

  // Pipeline by Stage breakdown
  const stages = [
    { name: 'Qualifying', prob: 0.10, color: 'text-amber-400' },
    { name: 'Technical Evaluation', prob: 0.30, color: 'text-purple-400' },
    { name: 'Proposal & Quote', prob: 0.60, color: 'text-blue-400' },
    { name: 'Negotiation & Legal', prob: 0.80, color: 'text-cyan-400' },
    { name: 'Closed Won', prob: 1.00, color: 'text-emerald-400' }
  ];

  const stageBreakdown = stages.map(st => {
    const opps = opportunities.filter(o => o.stage === st.name && o.closeDate.startsWith('2026'));
    const unweightedAcv = opps.reduce((s, o) => s + o.acv, 0);
    const weightedAcv = Math.round(unweightedAcv * st.prob);
    const avgPushCount = opps.length > 0 
      ? (opps.reduce((s, o) => s + o.pushCount, 0) / opps.length).toFixed(1) 
      : '0.0';

    return {
      stage: st.name,
      prob: st.prob,
      color: st.color,
      count: opps.length,
      unweightedAcv,
      weightedAcv,
      avgPushCount
    };
  });

  // Sales Rep Quota Leaderboard
  const reps = [
    { name: 'Elena Rostova', quota: 6800000, region: 'Americas' },
    { name: 'Marcus Chen', quota: 5200000, region: 'APAC' },
    { name: 'Sarah Jenkins', quota: 5800000, region: 'EMEA' },
    { name: 'David Kalu', quota: 4400000, region: 'Americas' },
    { name: 'Sofia Morales', quota: 4800000, region: 'Americas' },
    { name: 'Liam O\'Connor', quota: 3600000, region: 'EMEA' }
  ];

  const repLeaderboard = reps.map(rep => {
    const repOpps = opportunities.filter(o => o.owner === rep.name && o.closeDate.startsWith('2026'));
    const wonAcv = repOpps.filter(o => o.stage === 'Closed Won').reduce((s, o) => s + o.acv, 0);
    const openWeightedAcv = repOpps
      .filter(o => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost')
      .reduce((s, o) => s + (o.acv * o.probability), 0);
    const totalForecast = wonAcv + openWeightedAcv;
    const attainment = rep.quota > 0 ? (totalForecast / rep.quota) * 100 : 0;

    return {
      ...rep,
      wonAcv,
      openWeightedAcv,
      totalForecast,
      attainment
    };
  }).sort((a, b) => b.attainment - a.attainment);

  return (
    <div className="space-y-6">
      {/* Header Banner & Scenario Explanation */}
      <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Target className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Predictive Revenue Forecast &amp; Quota Pacing
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Synthesizes historical actuals, non-cancellable contract commitments, and stage-probability weighted pipeline. 
              Enables real-time scenario simulation across optimistic, base, and downside commercial environments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs">
              <span className="text-slate-400">Current Forecast Mode: </span>
              <span className="font-mono text-cyan-400 font-semibold">{filters.scenario} Scenario</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Horizon Area Chart */}
      <ForecastHorizonChart
        data={timeSeries}
        cutoffMonth={cutoffMonth}
        weightingMode={filters.weightingMode}
        scenario={filters.scenario}
      />

      {/* 2026 Quarterly Pacing & Quota Bridge */}
      <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              FY 2026 Quarterly Quota Attainment &amp; Target Gap Schedule
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Full-Year Target: {formatCurrency(quartersData.reduce((s, q) => s + q.target, 0), true)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 pl-3 font-semibold">Quarter</th>
                <th className="pb-3 px-3 font-semibold text-right">Quota Target</th>
                <th className="pb-3 px-3 font-semibold text-right">Closed Actuals</th>
                <th className="pb-3 px-3 font-semibold text-right">Committed Contracts</th>
                <th className="pb-3 px-3 font-semibold text-right">Weighted Pipeline</th>
                <th className="pb-3 px-3 font-semibold text-right">Total Expected</th>
                <th className="pb-3 px-3 font-semibold text-right">Target Gap</th>
                <th className="pb-3 pr-3 font-semibold text-right">Attainment %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {quartersData.map((q) => {
                const isSurplus = q.gap <= 0;
                return (
                  <tr key={q.name} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 pl-3 font-sans font-semibold text-white flex items-center gap-2">
                      <span>{q.name}</span>
                      {q.isClosed && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {formatCurrency(q.target, true)}
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-semibold">
                      {q.actual > 0 ? formatCurrency(q.actual, true) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right text-sky-400">
                      {q.committed > 0 ? formatCurrency(q.committed, true) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right text-purple-400">
                      {q.pipeline > 0 ? formatCurrency(q.pipeline, true) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right text-white font-bold">
                      {formatCurrency(q.totalProjected, true)}
                    </td>
                    <td className={`py-3 px-3 text-right font-semibold ${isSurplus ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isSurplus ? `+${formatCurrency(Math.abs(q.gap), true)}` : `-${formatCurrency(q.gap, true)}`}
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        q.attainment >= 100
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : q.attainment >= 85
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {q.attainment.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mid Grid: Stage Conversion Health & Sales Rep Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline Stage Health */}
        <div className="lg:col-span-6 bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Pipeline Health by Opportunity Stage
              </h3>
            </div>
            <span className="text-xs text-slate-400">Normalized Conversion Weights</span>
          </div>

          <div className="space-y-3">
            {stageBreakdown.map((st) => (
              <div key={st.stage} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{st.stage}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300">
                      {(st.prob * 100).toFixed(0)}% Weight
                    </span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs text-slate-400 mr-2">
                      {st.count} deals ({st.avgPushCount} avg pushes)
                    </span>
                    <span className="text-xs font-bold text-white">
                      {formatCurrency(st.weightedAcv, true)}
                    </span>
                  </div>
                </div>

                {/* Progress bar showing weighted contribution vs unweighted */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${st.prob * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Gross Pipeline: {formatCurrency(st.unweightedAcv, true)}</span>
                  <span>Probability-Weighted Yield: {formatCurrency(st.weightedAcv, true)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rep Quota Attainment Leaderboard */}
        <div className="lg:col-span-6 bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Sales Rep Quota Pacing &amp; Coverage Leaderboard
              </h3>
            </div>
            <span className="text-xs text-slate-400">FY 2026 Expected</span>
          </div>

          <div className="space-y-3">
            {repLeaderboard.map((rep, idx) => (
              <div key={rep.name} className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                      0{idx + 1}
                    </span>
                    <span className="font-semibold text-white">{rep.name}</span>
                    <span className="text-[10px] text-slate-400">({rep.region})</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-white mr-2">
                      {formatCurrency(rep.totalForecast, true)}
                    </span>
                    <span className={`text-[11px] font-bold ${
                      rep.attainment >= 100 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {rep.attainment.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rep.attainment >= 100 ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${Math.min(100, rep.attainment)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Quota: {formatCurrency(rep.quota, true)}</span>
                  <span>Won: {formatCurrency(rep.wonAcv, true)} • Weighted Open: {formatCurrency(rep.openWeightedAcv, true)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
