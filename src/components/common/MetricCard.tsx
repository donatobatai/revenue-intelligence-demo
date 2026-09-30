import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: number; // e.g. 14.2 for +14.2%
  changeLabel?: string; // e.g. "vs prior period"
  sparklineData?: number[];
  benchmark?: string;
  status?: 'positive' | 'negative' | 'neutral' | 'warning';
  tooltip?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  change,
  changeLabel = 'vs prior year',
  sparklineData,
  benchmark,
  status,
  tooltip,
  onClick
}) => {
  const isPositive = change !== undefined ? change > 0 : undefined;
  const isNeutral = change !== undefined ? Math.abs(change) < 0.1 : undefined;

  // Mini sparkline SVG rendering
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;
    const w = 72;
    const h = 24;

    const points = sparklineData
      .map((d, i) => {
        const x = (i / (sparklineData.length - 1)) * w;
        const y = h - ((d - min) / range) * (h - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');

    const strokeColor = isPositive === false ? '#f43f5e' : '#10b981';

    return (
      <svg width={w} height={h} className="overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`relative bg-[#111827]/70 backdrop-blur-md border border-slate-800/80 rounded-xl p-4.5 transition-all duration-200 hover:border-slate-700 hover:shadow-lg hover:shadow-black/20 group ${
        onClick ? 'cursor-pointer hover:bg-slate-800/40' : ''
      }`}
    >
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium tracking-wide">
        <span className="flex items-center gap-1.5">
          {label}
          {tooltip && (
            <span title={tooltip} className="cursor-help text-slate-500 hover:text-slate-300">
              <Info className="w-3.5 h-3.5" />
            </span>
          )}
        </span>
        {renderSparkline()}
      </div>

      <div className="mt-1 space-y-0.5">
        <div className="text-xl font-bold tracking-tight text-white font-mono">
          {value}
        </div>
        {subValue && (
          <div className="text-[11px] text-slate-400 font-mono truncate">
            {subValue}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
        {change !== undefined ? (
          <div className="flex items-center gap-1">
            <span
              className={`inline-flex items-center font-medium ${
                isPositive
                  ? 'text-emerald-400'
                  : isNeutral
                  ? 'text-slate-400'
                  : 'text-rose-400'
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : isNeutral ? (
                <Minus className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {isPositive ? '+' : ''}
              {change.toFixed(1)}%
            </span>
            <span className="text-slate-500 text-[11px]">{changeLabel}</span>
          </div>
        ) : (
          <span className="text-slate-500 text-[11px]">{changeLabel}</span>
        )}

        {benchmark && (
          <span className="text-[11px] text-slate-400 font-medium bg-slate-800/60 px-2 py-0.5 rounded">
            {benchmark}
          </span>
        )}
      </div>
    </div>
  );
};
