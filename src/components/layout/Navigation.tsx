import React from 'react';
import { 
  BarChart3, 
  Workflow, 
  TrendingUp, 
  Layers, 
  Building2, 
  Terminal, 
  Sparkles 
} from 'lucide-react';

export type ActiveTab = 'overview' | 'closed-won' | 'forecast' | 'breakdown' | 'accounts' | 'sql';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  openOppsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  openOppsCount
}) => {
  const tabs = [
    {
      id: 'overview' as ActiveTab,
      label: 'Executive Overview',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'closed-won' as ActiveTab,
      label: 'Closed Won → Revenue Engine',
      icon: Workflow,
      badge: 'Core Model'
    },
    {
      id: 'forecast' as ActiveTab,
      label: 'Forecast & Pacing',
      icon: TrendingUp,
      badge: null
    },
    {
      id: 'breakdown' as ActiveTab,
      label: 'Breakdown & Cohorts',
      icon: Layers,
      badge: null
    },
    {
      id: 'accounts' as ActiveTab,
      label: 'Account 360 & Deal Grid',
      icon: Building2,
      badge: openOppsCount ? `${openOppsCount} deals` : null
    },
    {
      id: 'sql' as ActiveTab,
      label: 'SQL & Data Architecture',
      icon: Terminal,
      badge: 'BigQuery'
    }
  ];

  return (
    <nav className="border-b border-slate-800/80 bg-[#0B0F17]/60 backdrop-blur-md px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
