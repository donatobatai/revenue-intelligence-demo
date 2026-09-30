import React from 'react';
import { Database, Sliders, ShieldCheck, Sparkles, Terminal, Activity } from 'lucide-react';
import { ForecastScenario, TimeGrain } from '../../types/revenue';

interface HeaderProps {
  scenario: ForecastScenario;
  onScenarioChange: (s: ForecastScenario) => void;
  timeGrain: TimeGrain;
  onTimeGrainChange: (g: TimeGrain) => void;
  onOpenSql: () => void;
  activeFiltersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  scenario,
  onScenarioChange,
  timeGrain,
  onTimeGrainChange,
  onOpenSql,
  activeFiltersCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-lg border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white font-mono">
                STRATA<span className="text-cyan-400">CLOUD</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Revenue Intelligence
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Synthetic B2B Infrastructure Commercial Model</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">Portfolio Safe</span>
            </p>
          </div>
        </div>

        {/* Global Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Scenario Planner Switcher */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-xs shadow-inner">
            <span className="px-2 text-slate-400 text-[11px] font-medium flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Scenario:
            </span>
            {(['Conservative', 'Base', 'Aggressive'] as const).map(s => (
              <button
                key={s}
                onClick={() => onScenarioChange(s)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  scenario === s
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Time Grain */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-xs shadow-inner">
            {(['Month', 'Quarter', 'Year'] as const).map(g => (
              <button
                key={g}
                onClick={() => onTimeGrainChange(g)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  timeGrain === g
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* View SQL Drawer Button */}
          <button
            onClick={onOpenSql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-xs font-medium text-slate-200 transition-all hover:text-cyan-300 hover:border-cyan-500/50 shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>SQL Pipeline</span>
          </button>
        </div>
      </div>
    </header>
  );
};
