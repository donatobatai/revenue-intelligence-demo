import React, { useState } from 'react';
import { 
  DimensionBreakdownItem, 
  CohortMatrixItem 
} from '../../lib/analytics';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { RevenueMixChart } from '../charts/RevenueMixChart';
import { CohortHeatmap } from '../charts/CohortHeatmap';
import { 
  Layers, 
  Globe, 
  Users, 
  Building2, 
  Tag, 
  TrendingUp, 
  ArrowUpRight 
} from 'lucide-react';

interface BreakdownViewProps {
  productBreakdown: DimensionBreakdownItem[];
  regionBreakdown: DimensionBreakdownItem[];
  segmentBreakdown: DimensionBreakdownItem[];
  revenueTypeBreakdown: DimensionBreakdownItem[];
  cohortMatrix: CohortMatrixItem[];
  onSelectDimensionValue?: (dimension: string, value: string) => void;
}

export const BreakdownView: React.FC<BreakdownViewProps> = ({
  productBreakdown,
  regionBreakdown,
  segmentBreakdown,
  revenueTypeBreakdown,
  cohortMatrix,
  onSelectDimensionValue
}) => {
  const [activeDimension, setActiveDimension] = useState<
    'productFamily' | 'region' | 'segment' | 'revenueType'
  >('productFamily');

  const dimensionConfigs = {
    productFamily: {
      label: 'Product Family',
      icon: Layers,
      items: productBreakdown,
      description: 'Breakdown across Compute, APIs, Security Fabric, and Professional Services.'
    },
    region: {
      label: 'Geographic Region',
      icon: Globe,
      items: regionBreakdown,
      description: 'Commercial performance across Americas, EMEA, and APAC theaters.'
    },
    segment: {
      label: 'Customer Segment',
      icon: Building2,
      items: segmentBreakdown,
      description: 'Distribution across Financial Institutions, FinTech, Web3, and Scaleups.'
    },
    revenueType: {
      label: 'Revenue Type',
      icon: Tag,
      items: revenueTypeBreakdown,
      description: 'Recurring subscriptions vs usage/consumption vs milestone services.'
    }
  };

  const currentConfig = dimensionConfigs[activeDimension];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Layers className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Multi-Dimensional Commercial Breakdown &amp; Retention Dynamics
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Explore revenue concentration, portfolio mix shifts, and period-over-period organic expansion 
              across products, territories, customer tiers, and longitudinal retention cohorts.
            </p>
          </div>

          {/* Dimension Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs">
            {(Object.keys(dimensionConfigs) as Array<keyof typeof dimensionConfigs>).map(key => {
              const cfg = dimensionConfigs[key];
              const Icon = cfg.icon;
              const isActive = activeDimension === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveDimension(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dimensional Breakdown Matrix & Mix Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Slice */}
        <div className="lg:col-span-8 bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {currentConfig.label} Portfolio Matrix
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{currentConfig.description}</p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {currentConfig.items.length} Segments Analyzed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 pl-3 font-semibold">Dimension Category</th>
                  <th className="pb-3 px-3 font-semibold text-center">Accounts</th>
                  <th className="pb-3 px-3 font-semibold text-right">Recognized Rev</th>
                  <th className="pb-3 px-3 font-semibold text-right">Run-Rate ARR</th>
                  <th className="pb-3 px-3 font-semibold text-right">Share of Total</th>
                  <th className="pb-3 pr-3 font-semibold text-right">YoY Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono">
                {currentConfig.items.map((item) => (
                  <tr
                    key={item.dimension}
                    onClick={() => onSelectDimensionValue && onSelectDimensionValue(activeDimension, item.dimension)}
                    className="hover:bg-slate-900/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 pl-3 font-sans font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {item.dimension}
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-300 font-sans">
                      {item.count}
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-200">
                      {formatCurrency(item.currentRevenue, true)}
                    </td>
                    <td className="py-3.5 px-3 text-right text-emerald-400 font-bold">
                      {formatCurrency(item.arr, true)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full rounded-full"
                            style={{ width: `${item.sharePct}%` }}
                          />
                        </div>
                        <span className="text-slate-300 w-10">{item.sharePct.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 pr-3 text-right font-sans">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                        item.growthPct > 0 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {formatPercent(item.growthPct)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mix Donut */}
        <div className="lg:col-span-4">
          <RevenueMixChart
            items={currentConfig.items}
            title={`${currentConfig.label} Mix`}
            onSelectDimension={(dim) => onSelectDimensionValue && onSelectDimensionValue(activeDimension, dim)}
          />
        </div>
      </div>

      {/* Longitudinal Vintage Cohort Net Retention (NRR) Heatmap */}
      <CohortHeatmap cohorts={cohortMatrix} />
    </div>
  );
};
