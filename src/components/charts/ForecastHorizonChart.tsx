import React, { useState } from 'react';
import { FilterState } from '../../types/revenue';
import { MonthlyTrendPoint } from '../../lib/analytics';
import { formatCurrency, formatMonthLabel } from '../../lib/formatters';
import { TrendingUp, ShieldCheck, Target, Layers } from 'lucide-react';

interface ForecastHorizonChartProps {
  data: MonthlyTrendPoint[];
  cutoffMonth: string;
  weightingMode: FilterState['weightingMode'];
  scenario: FilterState['scenario'];
}

export const ForecastHorizonChart: React.FC<ForecastHorizonChartProps> = ({
  data,
  cutoffMonth,
  weightingMode,
  scenario
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG dimensions
  const width = 850;
  const height = 320;
  const margin = { top: 35, right: 35, bottom: 45, left: 75 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Max value calculation
  const maxVal = Math.max(...data.map(d => Math.max(d.totalProjected, d.target))) * 1.12 || 4500000;
  const yScale = (v: number) => innerHeight - (v / maxVal) * innerHeight;
  const xScale = (i: number) => (i / (data.length - 1)) * innerWidth;

  const cutoffIndex = data.findIndex(d => d.periodMonth === cutoffMonth);

  // Generate SVG path for Historical Actuals
  const actualPoints = data.slice(0, cutoffIndex + 1);
  const actualPath = actualPoints
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${margin.left + xScale(i)} ${margin.top + yScale(d.actual)}`)
    .join(' ');

  const actualAreaPath = actualPoints.length > 0
    ? `${actualPath} L ${margin.left + xScale(cutoffIndex)} ${margin.top + innerHeight} L ${margin.left} ${margin.top + innerHeight} Z`
    : '';

  // Generate SVG path for Future Committed Baseline
  const futurePoints = data.slice(cutoffIndex);
  const committedPath = futurePoints
    .map((d, idx) => {
      const globalIdx = cutoffIndex + idx;
      const x = margin.left + xScale(globalIdx);
      const y = margin.top + yScale(globalIdx === cutoffIndex ? d.actual : d.committed);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Generate SVG path for Total Projected (Committed + Pipeline)
  const projectedPath = futurePoints
    .map((d, idx) => {
      const globalIdx = cutoffIndex + idx;
      const x = margin.left + xScale(globalIdx);
      const y = margin.top + yScale(globalIdx === cutoffIndex ? d.actual : d.totalProjected);
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Fan area between committed and total projected
  const fanAreaPath = futurePoints.length > 0
    ? `${projectedPath} ` +
      futurePoints
        .slice()
        .reverse()
        .map((d, idx) => {
          const globalIdx = cutoffIndex + (futurePoints.length - 1 - idx);
          const x = margin.left + xScale(globalIdx);
          const y = margin.top + yScale(globalIdx === cutoffIndex ? d.actual : d.committed);
          return `L ${x} ${y}`;
        })
        .join(' ') +
      ' Z'
    : '';

  // Target path
  const targetPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${margin.left + xScale(i)} ${margin.top + yScale(d.target)}`)
    .join(' ');

  const hoveredPoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      {/* Chart Top Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Revenue Horizon: Verified Actuals &amp; Predictive Runway
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Contrasts historical realized P&amp;L revenue against contracted commitments and stage-probability pipeline.
          </p>
        </div>

        {/* Dynamic Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="text-slate-300">Historical Actuals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-sky-400" />
            <span className="text-slate-300">Committed Contracts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-purple-400 border-t border-dashed border-purple-300" />
            <span className="text-purple-300">
              {weightingMode === 'Weighted' ? 'Weighted Pipeline' : weightingMode === 'Unweighted' ? 'Full Pipeline' : 'Contracted Floor'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-amber-400 border-t border-dashed border-amber-300" />
            <span className="text-amber-400">Monthly Target</span>
          </div>
        </div>
      </div>

      {/* Main SVG Area */}
      <div className="relative overflow-x-auto select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto max-h-[400px] overflow-visible"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Historical Gradient */}
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>

            {/* Pipeline Fan Gradient */}
            <linearGradient id="fanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((t, i) => {
            const val = maxVal * t;
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
                  x={margin.left - 12}
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

          {/* Shaded Areas */}
          {actualAreaPath && <path d={actualAreaPath} fill="url(#actualGradient)" />}
          {fanAreaPath && <path d={fanAreaPath} fill="url(#fanGradient)" />}

          {/* Target Line (Dashed Amber) */}
          <path
            d={targetPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.75"
            strokeDasharray="5,4"
          />

          {/* Actuals Line (Solid Emerald) */}
          <path
            d={actualPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.75"
            strokeLinecap="round"
          />

          {/* Future Committed Line (Solid Sky) */}
          <path
            d={committedPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.25"
          />

          {/* Total Projected Line (Dashed Purple) */}
          {weightingMode !== 'Contracted Only' && (
            <path
              d={projectedPath}
              fill="none"
              stroke="#c084fc"
              strokeWidth="2.25"
              strokeDasharray="4,3"
            />
          )}

          {/* Cutoff Boundary Marker */}
          {cutoffIndex >= 0 && (
            <g>
              <line
                x1={margin.left + xScale(cutoffIndex)}
                y1={margin.top}
                x2={margin.left + xScale(cutoffIndex)}
                y2={height - margin.bottom}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="3,3"
              />
              <rect
                x={margin.left + xScale(cutoffIndex) - 48}
                y={margin.top - 24}
                width="96"
                height="20"
                rx="4"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="1"
              />
              <text
                x={margin.left + xScale(cutoffIndex)}
                y={margin.top - 10}
                fill="#38bdf8"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
              >
                Actuals Cutoff
              </text>
            </g>
          )}

          {/* Interactive Hover Columns */}
          {data.map((d, i) => {
            const x = margin.left + xScale(i);
            const colWidth = innerWidth / (data.length - 1);
            return (
              <rect
                key={d.periodMonth}
                x={x - colWidth / 2}
                y={margin.top}
                width={colWidth}
                height={innerHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                className="cursor-pointer"
              />
            );
          })}

          {/* Hover Crosshair & Indicators */}
          {hoveredIndex !== null && hoveredPoint && (
            <g pointerEvents="none">
              <line
                x1={margin.left + xScale(hoveredIndex)}
                y1={margin.top}
                x2={margin.left + xScale(hoveredIndex)}
                y2={height - margin.bottom}
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeDasharray="2,2"
              />
              {hoveredPoint.isHistorical ? (
                <circle
                  cx={margin.left + xScale(hoveredIndex)}
                  cy={margin.top + yScale(hoveredPoint.actual)}
                  r="5"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              ) : (
                <>
                  <circle
                    cx={margin.left + xScale(hoveredIndex)}
                    cy={margin.top + yScale(hoveredPoint.totalProjected)}
                    r="5"
                    fill="#c084fc"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <circle
                    cx={margin.left + xScale(hoveredIndex)}
                    cy={margin.top + yScale(hoveredPoint.committed)}
                    r="4"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                </>
              )}
            </g>
          )}

          {/* X-axis Month Labels */}
          {data.map((d, i) => {
            const isLast = i === data.length - 1;
            const isRegular = i % 4 === 0;
            if (!isRegular && !isLast) return null;
            if (isRegular && data.length - 1 - i < 2) return null;
            const x = margin.left + xScale(i);
            return (
              <text
                key={d.periodMonth}
                x={x}
                y={height - margin.bottom + 20}
                fill="#64748b"
                fontSize="11"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {formatMonthLabel(d.periodMonth)}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && hoveredPoint && (
          <div
            className="absolute top-2 pointer-events-none bg-[#090d16]/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs z-20 space-y-1.5 font-mono min-w-[210px]"
            style={{
              left: `${Math.min(
                Math.max(10, ((margin.left + xScale(hoveredIndex)) / width) * 100),
                75
              )}%`
            }}
          >
            <div className="flex items-center justify-between text-slate-400 font-sans pb-1 border-b border-slate-800">
              <span className="font-semibold text-white">{formatMonthLabel(hoveredPoint.periodMonth)}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${
                hoveredPoint.isHistorical ? 'bg-emerald-500/10 text-emerald-400' : 'bg-purple-500/10 text-purple-400'
              }`}>
                {hoveredPoint.isHistorical ? 'Actual GAAP' : 'Projection'}
              </span>
            </div>

            {hoveredPoint.isHistorical ? (
              <div className="flex justify-between items-center text-emerald-400 font-bold">
                <span>Recognized Actual:</span>
                <span>{formatCurrency(hoveredPoint.actual)}</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center text-sky-400">
                  <span>Committed Signed:</span>
                  <span>{formatCurrency(hoveredPoint.committed)}</span>
                </div>
                {weightingMode !== 'Contracted Only' && (
                  <div className="flex justify-between items-center text-purple-400">
                    <span>Pipeline ({weightingMode}):</span>
                    <span>+{formatCurrency(hoveredPoint.pipeline)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-white font-bold pt-1 border-t border-slate-800/80">
                  <span>Total Projected:</span>
                  <span>{formatCurrency(hoveredPoint.totalProjected)}</span>
                </div>
              </>
            )}

            <div className="flex justify-between items-center text-amber-400 pt-1 border-t border-slate-800/60">
              <span>Quota Target:</span>
              <span>{formatCurrency(hoveredPoint.target)}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Target Gap:</span>
              <span className={hoveredPoint.gap <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {hoveredPoint.gap <= 0 ? `+${formatCurrency(Math.abs(hoveredPoint.gap))}` : `-${formatCurrency(hoveredPoint.gap)}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
