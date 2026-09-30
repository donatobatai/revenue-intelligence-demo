import React, { useState } from 'react';
import { DimensionBreakdownItem } from '../../lib/analytics';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { PieChart, Layers } from 'lucide-react';

interface RevenueMixChartProps {
  items: DimensionBreakdownItem[];
  title?: string;
  onSelectDimension?: (dim: string) => void;
  selectedDimension?: string | null;
}

const COLOR_PALETTE = ['#38bdf8', '#34d399', '#a78bfa', '#fbbf24', '#f43f5e', '#818cf8'];

export const RevenueMixChart: React.FC<RevenueMixChartProps> = ({
  items,
  title = 'Revenue Composition',
  onSelectDimension,
  selectedDimension
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = items.reduce((s, it) => s + it.currentRevenue, 0) || 1;

  // Donut geometry calculations
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const slices = items.map((item, idx) => {
    const percent = (item.currentRevenue / total) * 100;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percent;

    return {
      ...item,
      color: COLOR_PALETTE[idx % COLOR_PALETTE.length],
      percent,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Total: {formatCurrency(total, true)}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Donut */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#1e293b"
              strokeWidth={strokeWidth}
            />
            {slices.map((slice, idx) => {
              const isSelected = selectedDimension === slice.dimension;
              const isHovered = hoveredIdx === idx;
              return (
                <circle
                  key={slice.dimension}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth={isHovered || isSelected ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => onSelectDimension && onSelectDimension(slice.dimension)}
                />
              );
            })}
          </svg>

          {/* Donut Center Label */}
          <div className="absolute text-center pointer-events-none">
            <div className="text-xs text-slate-400 font-medium">Largest Share</div>
            <div className="text-lg font-bold text-white font-mono">
              {slices[0]?.percent.toFixed(0)}%
            </div>
            <div className="text-[10px] text-cyan-400 font-medium truncate max-w-[100px]">
              {slices[0]?.dimension.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* Legend / Breakdown List */}
        <div className="flex-1 w-full space-y-2">
          {slices.map((slice, idx) => {
            const isSelected = selectedDimension === slice.dimension;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={slice.dimension}
                onClick={() => onSelectDimension && onSelectDimension(slice.dimension)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`p-2 rounded-lg cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-slate-800/80 border-cyan-500/60'
                    : isHovered
                    ? 'bg-slate-800/40 border-slate-700'
                    : 'bg-transparent border-transparent hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-slate-200 font-medium truncate max-w-[170px]">
                      {slice.dimension}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-white font-semibold">
                      {formatCurrency(slice.currentRevenue, true)}
                    </span>
                    <span className="text-slate-400 w-10 text-right">
                      {slice.percent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800/80 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${slice.percent}%`, backgroundColor: slice.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
