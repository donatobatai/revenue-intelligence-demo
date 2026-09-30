import React from 'react';
import { 
  FilteredAnalyticsSummary, 
  MonthlyTrendPoint, 
  DimensionBreakdownItem 
} from '../../lib/analytics';
import { Opportunity, Account, FilterState, ArrBridgeItem } from '../../types/revenue';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { MetricCard } from '../common/MetricCard';
import { ForecastHorizonChart } from '../charts/ForecastHorizonChart';
import { ArrWaterfallChart } from '../charts/ArrWaterfallChart';
import { RevenueMixChart } from '../charts/RevenueMixChart';
import { Badge } from '../common/Badge';
import { 
  DollarSign, 
  TrendingUp, 
  Layers, 
  ShieldCheck, 
  ArrowUpRight, 
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface OverviewViewProps {
  summary: FilteredAnalyticsSummary;
  timeSeries: MonthlyTrendPoint[];
  arrBridge: ArrBridgeItem[];
  productBreakdown: DimensionBreakdownItem[];
  topAccounts: Account[];
  topOpportunities: Opportunity[];
  cutoffMonth: string;
  filters: FilterState;
  onSelectAccount: (acc: Account) => void;
  onSelectProduct: (prod: string) => void;
  onNavigateToClosedWon: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  summary,
  timeSeries,
  arrBridge,
  productBreakdown,
  topAccounts,
  topOpportunities,
  cutoffMonth,
  filters,
  onSelectAccount,
  onSelectProduct,
  onNavigateToClosedWon
}) => {
  // Mini sparkline for ARR
  const arrSparkline = timeSeries.slice(-12).map(t => t.totalProjected);

  return (
    <div className="space-y-6">
      {/* Executive Key Metric Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <MetricCard
          label="Run-Rate ARR"
          value={formatCurrency(summary.currentArr, true)}
          subValue={`${formatCurrency(summary.currentArr / 12, true)} MRR`}
          change={summary.arrYoyGrowth}
          changeLabel="YoY expansion"
          sparklineData={arrSparkline}
          tooltip="Annualized Recurring Revenue based on verified March 2026 actual MRR * 12."
        />

        <MetricCard
          label="FY 2026 Projected Rev"
          value={formatCurrency(summary.fullYearProjectedRevenue, true)}
          subValue={`Target: ${formatCurrency(summary.targetFullYearRevenue, true)}`}
          change={summary.quotaAttainmentPct - 100}
          changeLabel="vs FY quota plan"
          status={summary.quotaAttainmentPct >= 100 ? 'positive' : 'warning'}
          benchmark={`${summary.quotaAttainmentPct.toFixed(1)}% Attain`}
          tooltip="Full-year projected recognized revenue (verified actuals + committed contracts + weighted pipeline)."
        />

        <MetricCard
          label="Closed Won Bookings"
          value={formatCurrency(summary.totalBookingsAcv, true)}
          subValue={`${formatCurrency(summary.totalBookingsTcv, true)} TCV`}
          change={24.8}
          changeLabel="vs prior year"
          tooltip="Annualized Contract Value (ACV) signed in the current calendar period."
        />

        <MetricCard
          label="Net Retention (NRR)"
          value={`${summary.netRevenueRetention.toFixed(1)}%`}
          subValue="GRR: 94.2%"
          change={4.2}
          changeLabel="expansion velocity"
          benchmark="Top Decile"
          tooltip="Net Revenue Retention on existing customer cohorts over trailing 12 months."
        />

        <MetricCard
          label="Pipeline Coverage"
          value={`${summary.pipelineCoverageRatio.toFixed(1)}x`}
          subValue={`${formatCurrency(summary.openPipelineValue, true)} Open`}
          benchmark="Target: 3.0x"
          status={summary.pipelineCoverageRatio >= 3.0 ? 'positive' : 'warning'}
          tooltip="Ratio of open pipeline value relative to the remaining uncontracted revenue quota."
        />

        <MetricCard
          label="Recognized YTD"
          value={formatCurrency(summary.recognizedYtdRevenue, true)}
          subValue="Through Q1 2026"
          change={18.6}
          changeLabel="YoY realized"
          tooltip="Cumulative GAAP recognized revenue on the P&L through March 2026."
        />
      </div>

      {/* Featured Callout Banner: Closed Won to Revenue Engine */}
      <div 
        onClick={onNavigateToClosedWon}
        className="bg-gradient-to-r from-slate-900 via-[#101b33] to-slate-900 border border-cyan-500/30 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-cyan-400/60 transition-all shadow-lg group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                Featured Portfolio Simulation: Closed Won → Revenue Realization Engine
              </span>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
                Interactive Model
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Explore how signed multi-year contract bookings (TCV) convert to monthly recognized P&amp;L revenue under ASC 606 straight-line schedules and onboarding ramp lags.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-cyan-300 group-hover:text-cyan-200 flex-shrink-0">
          <span>Launch Engine</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/* Core Time-Series Chart */}
      <ForecastHorizonChart
        data={timeSeries}
        cutoffMonth={cutoffMonth}
        weightingMode={filters.weightingMode}
        scenario={filters.scenario}
      />

      {/* Mid-Row: ARR Waterfall Bridge & Revenue Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <ArrWaterfallChart
            bridgeData={arrBridge}
            selectedYear="2025"
          />
        </div>
        <div className="lg:col-span-4">
          <RevenueMixChart
            items={productBreakdown}
            title="Revenue by Product Line"
            onSelectDimension={onSelectProduct}
            selectedDimension={filters.productFamily !== 'All' ? filters.productFamily : null}
          />
        </div>
      </div>

      {/* Bottom Row: Top Enterprise Accounts Ledger */}
      <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Top Institutional Accounts &amp; Commercial Exposure
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Click any account to open interactive drill-down drawer
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 pl-3 font-semibold">Account Entity</th>
                <th className="pb-3 px-3 font-semibold">Segment</th>
                <th className="pb-3 px-3 font-semibold">Region</th>
                <th className="pb-3 px-3 font-semibold">Tier</th>
                <th className="pb-3 px-3 font-semibold text-right">Lifetime Recognized</th>
                <th className="pb-3 px-3 font-semibold text-right">Status</th>
                <th className="pb-3 pr-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {topAccounts.slice(0, 7).map((acc) => (
                <tr
                  key={acc.id}
                  onClick={() => onSelectAccount(acc)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 pl-3 font-sans font-medium text-white group-hover:text-cyan-300 transition-colors">
                    {acc.name}
                  </td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{acc.segment}</td>
                  <td className="py-3 px-3 text-slate-300 font-sans">{acc.region}</td>
                  <td className="py-3 px-3 font-sans">
                    <Badge variant="neutral">{acc.tier}</Badge>
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                    {formatCurrency(acc.totalLtv, true)}
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <Badge variant={acc.status === 'Active' ? 'success' : 'neutral'}>
                      {acc.status}
                    </Badge>
                  </td>
                  <td className="py-3 pr-3 text-right font-sans">
                    <span className="text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1">
                      Inspect <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
