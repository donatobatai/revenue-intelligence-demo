import React from 'react';
import { CohortMatrixItem } from '../../lib/analytics';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { Users, Info, Calendar } from 'lucide-react';

interface CohortHeatmapProps {
  cohorts: CohortMatrixItem[];
}

export const CohortHeatmap: React.FC<CohortHeatmapProps> = ({ cohorts }) => {
  const getCellBg = (nrr: number) => {
    if (nrr >= 120) return 'bg-emerald-500/30 text-emerald-300 border-emerald-500/40';
    if (nrr >= 110) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (nrr >= 100) return 'bg-teal-500/15 text-teal-300 border-teal-500/20';
    if (nrr >= 95) return 'bg-slate-800 text-slate-300 border-slate-700';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  };

  const timeHeaders = ['M0 (Base)', 'M3', 'M6', 'M9', 'M12 (Year 1)', 'M18', 'M24 (Year 2)'];

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Customer Vintage Cohort Net Retention (NRR) Heatmap
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracks longitudinal expansion and expansion velocity of client cohorts from contract inception date.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">NRR Scale:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-mono text-[11px]">&gt;120%</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[11px]">110-120%</span>
          <span className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 font-mono text-[11px]">100-110%</span>
          <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[11px]">&lt;100%</span>
        </div>
      </div>

      {/* Cohort Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-3 pl-3 font-semibold">Cohort Vintage</th>
              <th className="pb-3 px-3 font-semibold text-center">Accounts</th>
              <th className="pb-3 px-3 font-semibold text-right">Inception ACV</th>
              {timeHeaders.map((hdr) => (
                <th key={hdr} className="pb-3 px-2 font-semibold text-center min-w-[95px]">
                  {hdr}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 font-mono">
            {cohorts.map((cohort, rIdx) => (
              <tr key={cohort.cohortName} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3 pl-3 font-sans font-semibold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  {cohort.cohortName}
                </td>
                <td className="py-3 px-3 text-center text-slate-300 font-sans">
                  {cohort.initialAccounts}
                </td>
                <td className="py-3 px-3 text-right text-slate-300">
                  {formatCurrency(cohort.initialAcv, true)}
                </td>

                {cohort.retentionByMonth.map((cell, cIdx) => (
                  <td key={cIdx} className="py-2.5 px-1.5 text-center">
                    <div
                      className={`py-1.5 px-2 rounded-lg border text-center transition-all cursor-default ${getCellBg(
                        cell.nrr
                      )}`}
                      title={`${cohort.cohortName} at ${cell.periodMonth}: ${formatCurrency(
                        cell.activeAcv,
                        true
                      )} active ACV`}
                    >
                      <div className="font-bold">{cell.nrr.toFixed(1)}%</div>
                      <div className="text-[10px] opacity-75 font-sans">
                        {formatCurrency(cell.activeAcv, true)}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Cohort Expansion Insight: Enterprise accounts expand on average +18.4% within 18 months through node scale-ups and API volume tiers.</span>
        </span>
        <span className="font-mono text-cyan-300 font-semibold">Avg M18 NRR: 118.4%</span>
      </div>
    </div>
  );
};
