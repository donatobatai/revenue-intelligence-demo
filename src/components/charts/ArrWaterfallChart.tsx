import React, { useState } from 'react';
import { ArrBridgeItem } from '../../types/revenue';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { TrendingUp, Shield, BarChart3, Info } from 'lucide-react';

interface ArrWaterfallChartProps {
  bridgeData: ArrBridgeItem[];
  selectedYear?: string;
  onYearChange?: (year: string) => void;
}

export const ArrWaterfallChart: React.FC<ArrWaterfallChartProps> = ({
  bridgeData,
  selectedYear = '2025',
  onYearChange
}) => {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);

  const bridge = bridgeData[0] || {
    period: `FY ${selectedYear}`,
    startingArr: 24500000,
    newLogoArr: 7800000,
    expansionArr: 4400000,
    contractionArr: 850000,
    churnArr: 1250000,
    endingArr: 34600000,
    netRetentionRate: 118.2
  };

  // Steps in the waterfall
  interface Step {
    label: string;
    sublabel: string;
    value: number;
    type: 'total' | 'positive' | 'negative';
    color: string;
    start: number;
    end: number;
  }

  const s0 = 0;
  const s1 = bridge.startingArr;
  const s2 = s1 + bridge.newLogoArr;
  const s3 = s2 + bridge.expansionArr;
  const s4 = s3 - bridge.contractionArr;
  const s5 = s4 - bridge.churnArr; // equals endingArr

  const steps: Step[] = [
    {
      label: 'Starting ARR',
      sublabel: 'Opening Base (Jan 1)',
      value: bridge.startingArr,
      type: 'total',
      color: '#64748b', // Slate
      start: 0,
      end: bridge.startingArr
    },
    {
      label: 'New Logos',
      sublabel: 'Net New Enterprise Land',
      value: bridge.newLogoArr,
      type: 'positive',
      color: '#38bdf8', // Cyan
      start: s1,
      end: s2
    },
    {
      label: 'Expansion',
      sublabel: 'Upsell & Tier Upgrades',
      value: bridge.expansionArr,
      type: 'positive',
      color: '#10b981', // Emerald
      start: s2,
      end: s3
    },
    {
      label: 'Contraction',
      sublabel: 'Capacity Downsizing',
      value: -bridge.contractionArr,
      type: 'negative',
      color: '#f59e0b', // Amber
      start: s4,
      end: s3
    },
    {
      label: 'Churn',
      sublabel: 'Logo Offboarding',
      value: -bridge.churnArr,
      type: 'negative',
      color: '#f43f5e', // Rose
      start: s5,
      end: s4
    },
    {
      label: 'Ending ARR',
      sublabel: 'Closing Base (Dec 31)',
      value: bridge.endingArr,
      type: 'total',
      color: '#06b6d4', // Bright Cyan/Teal
      start: 0,
      end: bridge.endingArr
    }
  ];

  // SVG Chart dimensions
  const width = 800;
  const height = 300;
  const margin = { top: 30, right: 30, bottom: 65, left: 70 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxVal = Math.max(s3, bridge.endingArr) * 1.15;
  const yScale = (v: number) => innerHeight - (v / maxVal) * innerHeight;
  const barWidth = innerWidth / steps.length - 24;

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Annual Recurring Revenue (ARR) Waterfall Bridge
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Decomposes net ARR growth across discrete commercial drivers: new logo land, existing account expansion, contraction, and logo churn.
          </p>
        </div>

        {/* Year toggle & Retention Indicators */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] text-slate-400 font-medium">Net Retention (NRR):</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {bridge.netRetentionRate.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] text-slate-400 font-medium">Gross Retention:</span>
            <span className="text-xs font-mono font-bold text-sky-400">
              94.6%
            </span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[380px] overflow-visible select-none"
        >
          {/* Y-axis gridlines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((tick, i) => {
            const val = maxVal * tick;
            const y = margin.top + yScale(val);
            return (
              <g key={i}>
                <line
                  x1={margin.left}
                  y1={y}
                  x2={width - margin.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4,4"
                  strokeWidth="1"
                />
                <text
                  x={margin.left - 10}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="11"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {formatCurrency(val, true)}
                </text>
              </g>
            );
          })}

          {/* Waterfall Bars & Connectors */}
          {steps.map((step, idx) => {
            const x = margin.left + idx * (barWidth + 24) + 12;
            const yTop = margin.top + yScale(Math.max(step.start, step.end));
            const yBottom = margin.top + yScale(Math.min(step.start, step.end));
            const barHeight = Math.max(4, yBottom - yTop);
            const isHovered = hoveredStep === step.label;

            // Connector line to next bar
            const nextStep = steps[idx + 1];
            const connectorY = step.type === 'total' 
              ? margin.top + yScale(step.end)
              : margin.top + yScale(step.end);

            return (
              <g
                key={step.label}
                onMouseEnter={() => setHoveredStep(step.label)}
                onMouseLeave={() => setHoveredStep(null)}
                className="cursor-pointer group"
              >
                {/* Horizontal dotted connector to next step */}
                {nextStep && (
                  <line
                    x1={x + barWidth}
                    y1={connectorY}
                    x2={x + barWidth + 24}
                    y2={connectorY}
                    stroke="#475569"
                    strokeDasharray="2,2"
                    strokeWidth="1.25"
                  />
                )}

                {/* Bar */}
                <rect
                  x={x}
                  y={yTop}
                  width={barWidth}
                  height={barHeight}
                  rx="5"
                  fill={step.color}
                  fillOpacity={isHovered ? 1 : 0.85}
                  stroke={isHovered ? '#fff' : 'none'}
                  strokeWidth="1.5"
                  className="transition-all duration-200"
                />

                {/* Value Label above or below bar */}
                <text
                  x={x + barWidth / 2}
                  y={yTop - 8}
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {step.type === 'negative' ? '-' : step.type === 'positive' ? '+' : ''}
                  {formatCurrency(Math.abs(step.value), true)}
                </text>

                {/* X-axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={height - margin.bottom + 22}
                  fill={isHovered ? '#38bdf8' : '#cbd5e1'}
                  fontSize="12"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {step.label}
                </text>

                {/* Subtitle */}
                <text
                  x={x + barWidth / 2}
                  y={height - margin.bottom + 38}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {step.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Narrative Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-300 font-semibold block mb-1">High NRR Momentum (118.2%)</span>
          Existing account expansion (+{formatCurrency(bridge.expansionArr, true)}) outpaces total contraction &amp; churn (-{formatCurrency(bridge.contractionArr + bridge.churnArr, true)}) by over 2.1x.
        </div>
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-300 font-semibold block mb-1">New Logo Velocity</span>
          New logo land contributed {formatCurrency(bridge.newLogoArr, true)} (+{formatPercent((bridge.newLogoArr / bridge.startingArr) * 100)} of base), driven by Tier 1 Financial Institutions.
        </div>
        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-300 font-semibold block mb-1">Controlled Churn Rate (3.6%)</span>
          Net negative ARR churn demonstrates strong institutional lock-in across enterprise compute and cryptographic key infrastructure.
        </div>
      </div>
    </div>
  );
};
