import React from 'react';
import { Search, Filter, RotateCcw, Check } from 'lucide-react';
import { 
  FilterState, 
  Region, 
  ProductFamily, 
  CustomerSegment, 
  DealType 
} from '../../types/revenue';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  hasActiveFilters
}) => {
  const regions: (Region | 'All')[] = ['All', 'Americas', 'EMEA', 'APAC'];
  
  const productFamilies: (ProductFamily | 'All')[] = [
    'All',
    'Dedicated Compute & Nodes',
    'High-Throughput RPC & Data APIs',
    'Enterprise KMS & Security Fabric',
    'Implementation & Architecture'
  ];

  const segments: (CustomerSegment | 'All')[] = [
    'All',
    'Tier 1 Financial Institutions',
    'Global FinTech & Payments',
    'Enterprise Web3 Protocols',
    'Scaleup Cloud Native'
  ];

  const dealTypes: (DealType | 'All')[] = ['All', 'New Logo', 'Expansion', 'Renewal'];

  return (
    <div className="bg-[#0e1422] border-b border-slate-800/80 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        {/* Left Side: Search & Core Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Bar */}
          <div className="relative min-w-[200px] flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter accounts, deals, owners..."
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
          </div>

          {/* Region */}
          <select
            value={filters.region}
            onChange={(e) => onFilterChange({ ...filters, region: e.target.value as any })}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {regions.map(r => (
              <option key={r} value={r}>{r === 'All' ? 'All Regions' : r}</option>
            ))}
          </select>

          {/* Product Line */}
          <select
            value={filters.productFamily}
            onChange={(e) => onFilterChange({ ...filters, productFamily: e.target.value as any })}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[190px] truncate"
          >
            {productFamilies.map(p => (
              <option key={p} value={p}>{p === 'All' ? 'All Products' : p}</option>
            ))}
          </select>

          {/* Segment */}
          <select
            value={filters.segment}
            onChange={(e) => onFilterChange({ ...filters, segment: e.target.value as any })}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer max-w-[180px] truncate"
          >
            {segments.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Segments' : s}</option>
            ))}
          </select>

          {/* Deal Type */}
          <select
            value={filters.dealType}
            onChange={(e) => onFilterChange({ ...filters, dealType: e.target.value as any })}
            className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {dealTypes.map(d => (
              <option key={d} value={d}>{d === 'All' ? 'All Deal Types' : d}</option>
            ))}
          </select>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right Side: Weighting Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
          <span className="text-[11px] text-slate-400 font-medium px-2">Pipeline Weighting:</span>
          {(['Weighted', 'Unweighted', 'Contracted Only'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => onFilterChange({ ...filters, weightingMode: mode })}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                filters.weightingMode === mode
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
