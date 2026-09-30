import React, { useState } from 'react';
import { Opportunity, MonthlyRevenueScheduleItem } from '../../types/revenue';
import { ClosedWonFlowChart } from '../charts/ClosedWonFlowChart';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { 
  Workflow, 
  Clock, 
  CheckCircle2, 
  Layers, 
  HelpCircle, 
  ArrowRight, 
  TrendingUp, 
  FileText,
  Sliders
} from 'lucide-react';

interface ClosedWonToRevViewProps {
  opportunities: Opportunity[];
  schedules: MonthlyRevenueScheduleItem[];
}

export const ClosedWonToRevView: React.FC<ClosedWonToRevViewProps> = ({
  opportunities,
  schedules
}) => {
  // Interactive Simulation Controls
  const [dealTcv, setDealTcv] = useState<number>(1200000); // $1.2M deal
  const [termMonths, setTermMonths] = useState<number>(24); // 24 months
  const [rampDays, setRampDays] = useState<number>(35); // 35 days onboarding
  const [closeMonth, setCloseMonth] = useState<number>(6); // June (month 6)

  // Math simulation for a single flagship contract
  const annualAcv = Math.round(dealTcv / (termMonths / 12));
  const monthlyRate = annualAcv / 12;

  // Active months in Year 1:
  // Starts on June + (rampDays / 30) months
  const startMonthFraction = closeMonth + (rampDays / 30);
  const remainingYearMonths = Math.max(0, 12 - startMonthFraction);
  const year1Recognized = Math.round(monthlyRate * remainingYearMonths);
  const year2Recognized = Math.min(dealTcv - year1Recognized, annualAcv);
  const year3Backlog = Math.max(0, dealTcv - year1Recognized - year2Recognized);
  const year1RealizationPct = (year1Recognized / dealTcv) * 100;

  return (
    <div className="space-y-6">
      {/* View Title & Context */}
      <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Workflow className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                The Closed Won → Revenue Recognition Pipeline
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              In enterprise B2B infrastructure, a Salesforce booking is merely an intent to deliver. 
              This interactive view demonstrates the mathematical translation between signature date, onboarding delays, 
              ASC 606 revenue performance obligations, and actual P&amp;L cash flow.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs">
            <span className="text-slate-400">Framework:</span>
            <span className="font-mono text-cyan-400 font-semibold">GAAP ASC 606 / IFRS 15</span>
          </div>
        </div>
      </div>

      {/* Main Visual Sankey Flow Chart */}
      <ClosedWonFlowChart
        opportunities={opportunities}
        schedules={schedules}
        selectedYear="2025"
      />

      {/* Interactive Deal Ramp Simulator */}
      <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Interactive Contract Ramp &amp; Realization Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Adjust contract parameters to observe how signature timing and provisioning friction dynamically reshape Year 1 recognized revenue vs multi-year backlog.
            </p>
          </div>
          <span className="text-xs font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
            Live Simulation Engine
          </span>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 bg-slate-900/60 p-4.5 rounded-xl border border-slate-800">
          {/* TCV Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Contract Value (TCV):</span>
              <span className="font-mono font-bold text-white">{formatCurrency(dealTcv, true)}</span>
            </div>
            <input
              type="range"
              min="240000"
              max="3600000"
              step="60000"
              value={dealTcv}
              onChange={(e) => setDealTcv(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>$240k</span>
              <span>$3.6M</span>
            </div>
          </div>

          {/* Term Months Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Contract Term:</span>
              <span className="font-mono font-bold text-cyan-400">{termMonths} Months</span>
            </div>
            <input
              type="range"
              min="12"
              max="36"
              step="12"
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>12 mo (1 yr)</span>
              <span>24 mo (2 yr)</span>
              <span>36 mo (3 yr)</span>
            </div>
          </div>

          {/* Ramp Days Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Provisioning Ramp Delay:</span>
              <span className="font-mono font-bold text-amber-400">{rampDays} Days</span>
            </div>
            <input
              type="range"
              min="7"
              max="90"
              step="7"
              value={rampDays}
              onChange={(e) => setRampDays(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>7d (Fast)</span>
              <span>45d (Normal)</span>
              <span>90d (Lagged)</span>
            </div>
          </div>

          {/* Close Month Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Close Date in Year:</span>
              <span className="font-mono font-bold text-sky-400">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][closeMonth - 1]}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="12"
              step="1"
              value={closeMonth}
              onChange={(e) => setCloseMonth(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Q1 (Jan)</span>
              <span>Q2 (Jun)</span>
              <span>Q4 (Dec)</span>
            </div>
          </div>
        </div>

        {/* Dynamic Simulation Result Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Annualized Value (ACV)</span>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {formatCurrency(annualAcv, true)}
            </div>
            <span className="text-[11px] text-slate-500 font-mono">{formatCurrency(monthlyRate, true)} / month MRR</span>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-500/40 p-4 rounded-xl">
            <span className="text-xs text-emerald-400 font-medium">Year 1 Recognized P&amp;L</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {formatCurrency(year1Recognized, true)}
            </div>
            <span className="text-[11px] text-emerald-400/80 font-mono">
              Only {year1RealizationPct.toFixed(1)}% of TCV recognized in Y1
            </span>
          </div>

          <div className="bg-sky-950/20 border border-sky-500/40 p-4 rounded-xl">
            <span className="text-xs text-sky-400 font-medium">Year 2 Committed Base</span>
            <div className="text-xl font-bold text-sky-400 font-mono mt-1">
              {formatCurrency(year2Recognized, true)}
            </div>
            <span className="text-[11px] text-sky-400/80 font-mono">Full 12-month run rate</span>
          </div>

          <div className="bg-purple-950/20 border border-purple-500/40 p-4 rounded-xl">
            <span className="text-xs text-purple-400 font-medium">Year 3 Backlog Reserve</span>
            <div className="text-xl font-bold text-purple-400 font-mono mt-1">
              {formatCurrency(year3Backlog, true)}
            </div>
            <span className="text-[11px] text-purple-400/80 font-mono">Guaranteed out-year revenue</span>
          </div>
        </div>

        {/* Visual Progress Bar of the Contract Realization */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300 font-mono">
            <span>Recognition Breakdown:</span>
            <span>Total TCV: {formatCurrency(dealTcv, true)}</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 flex overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${(year1Recognized / dealTcv) * 100}%` }}
              title={`Year 1: ${formatCurrency(year1Recognized)}`}
            />
            <div
              className="bg-sky-500 h-full transition-all duration-300"
              style={{ width: `${(year2Recognized / dealTcv) * 100}%` }}
              title={`Year 2: ${formatCurrency(year2Recognized)}`}
            />
            <div
              className="bg-purple-500 h-full transition-all duration-300"
              style={{ width: `${(year3Backlog / dealTcv) * 100}%` }}
              title={`Year 3: ${formatCurrency(year3Backlog)}`}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 font-mono pt-1">
            <span className="text-emerald-400">■ Year 1 Recognized ({((year1Recognized / dealTcv) * 100).toFixed(0)}%)</span>
            <span className="text-sky-400">■ Year 2 Committed ({((year2Recognized / dealTcv) * 100).toFixed(0)}%)</span>
            <span className="text-purple-400">■ Year 3 Backlog ({((year3Backlog / dealTcv) * 100).toFixed(0)}%)</span>
          </div>
        </div>
      </div>

      {/* Analytical Deep Dive: The 4 Stages of Commercial Conversion */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4.5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center font-mono font-bold text-sm">
            01
          </div>
          <h4 className="text-sm font-semibold text-white">Commercial Execution</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            The deal reaches <span className="text-emerald-400 font-mono">Closed Won</span> in Salesforce. 
            Full TCV is booked into quota attainment, but zero revenue is legally recognized yet under ASC 606.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4.5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono font-bold text-sm">
            02
          </div>
          <h4 className="text-sm font-semibold text-white">Provisioning &amp; Ramp</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Infrastructure provisioning, VPC peering, and KMS key generation take 14 to 45 days. 
            This lag shifts the revenue start date past the booking date, creating an in-year revenue slippage window.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4.5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
            03
          </div>
          <h4 className="text-sm font-semibold text-white">Straight-Line Delivery</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Once provisioned, subscription revenue is recognized ratably over the active contract term (<span className="text-cyan-300 font-mono">ACV / 12</span> per month), 
            matching economic service delivery to GAAP requirements.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4.5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-mono font-bold text-sm">
            04
          </div>
          <h4 className="text-sm font-semibold text-white">Contract Backlog</h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-year commitments create non-cancellable forward revenue visibility (Committed Backlog), 
            ensuring the company enters future fiscal years with a solid carried-in baseline.
          </p>
        </div>
      </div>
    </div>
  );
};
