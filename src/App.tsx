import React, { useState, useMemo } from 'react';
import { 
  generateSyntheticCommercialData, 
  getCalendarMonths 
} from './data/syntheticData';
import { 
  FilterState, 
  Account, 
  Opportunity, 
  ForecastScenario, 
  TimeGrain 
} from './types/revenue';
import { 
  applyFiltersToSchedules, 
  applyFiltersToOpportunities, 
  calculateExecutiveSummary, 
  buildMonthlyTimeSeries, 
  calculateArrBridge, 
  calculateDimensionBreakdowns, 
  calculateCohortMatrix, 
  calculateClosedWonMetrics 
} from './lib/analytics';
import { Header } from './components/layout/Header';
import { Navigation, ActiveTab } from './components/layout/Navigation';
import { FilterBar } from './components/layout/FilterBar';
import { Drawer } from './components/common/Drawer';
import { OverviewView } from './components/views/OverviewView';
import { ClosedWonToRevView } from './components/views/ClosedWonToRevView';
import { ForecastView } from './components/views/ForecastView';
import { BreakdownView } from './components/views/BreakdownView';
import { AccountsView } from './components/views/AccountsView';
import { SqlArchitectureView } from './components/views/SqlArchitectureView';

export const App: React.FC = () => {
  // 1. Generate Synthetic Data once
  const rawData = useMemo(() => generateSyntheticCommercialData(), []);

  // 2. Global State & Filters with URL Hash Sync
  const getInitialTab = (): ActiveTab => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '') as ActiveTab;
      if (['overview', 'closed-won', 'forecast', 'breakdown', 'accounts', 'sql'].includes(hash)) {
        return hash;
      }
    }
    return 'overview';
  };

  const [activeTab, setActiveTabState] = useState<ActiveTab>(getInitialTab);

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
    }
  };
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    region: 'All',
    productFamily: 'All',
    segment: 'All',
    dealType: 'All',
    owner: 'All',
    weightingMode: 'Weighted',
    scenario: 'Base',
    timeGrain: 'Month',
    selectedAccountId: null,
    selectedOppId: null
  });

  // Drawer inspection state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inspectedAccount, setInspectedAccount] = useState<Account | null>(null);

  // 3. Reactive Calculations
  const filteredSchedules = useMemo(
    () => applyFiltersToSchedules(rawData.revenueSchedules, filters),
    [rawData.revenueSchedules, filters]
  );

  const filteredOpportunities = useMemo(
    () => applyFiltersToOpportunities(rawData.opportunities, filters),
    [rawData.opportunities, filters]
  );

  const summary = useMemo(
    () => calculateExecutiveSummary(
      filteredSchedules,
      filteredOpportunities,
      rawData.targets,
      rawData.currentCutoffMonth,
      filters.scenario,
      filters.weightingMode
    ),
    [filteredSchedules, filteredOpportunities, rawData.targets, rawData.currentCutoffMonth, filters.scenario, filters.weightingMode]
  );

  const timeSeries = useMemo(
    () => buildMonthlyTimeSeries(
      filteredSchedules,
      rawData.targets,
      rawData.currentCutoffMonth,
      filters.scenario,
      filters.weightingMode
    ),
    [filteredSchedules, rawData.targets, rawData.currentCutoffMonth, filters.scenario, filters.weightingMode]
  );

  const arrBridge = useMemo(
    () => calculateArrBridge(rawData.revenueSchedules, '2025'),
    [rawData.revenueSchedules]
  );

  const productBreakdown = useMemo(
    () => calculateDimensionBreakdowns(filteredSchedules, 'productFamily', '2025'),
    [filteredSchedules]
  );

  const regionBreakdown = useMemo(
    () => calculateDimensionBreakdowns(filteredSchedules, 'region', '2025'),
    [filteredSchedules]
  );

  const segmentBreakdown = useMemo(
    () => calculateDimensionBreakdowns(filteredSchedules, 'segment', '2025'),
    [filteredSchedules]
  );

  const revenueTypeBreakdown = useMemo(
    () => calculateDimensionBreakdowns(filteredSchedules, 'revenueType', '2025'),
    [filteredSchedules]
  );

  const cohortMatrix = useMemo(
    () => calculateCohortMatrix(rawData.revenueSchedules, rawData.accounts),
    [rawData.revenueSchedules, rawData.accounts]
  );

  // Check if any filters are applied
  const hasActiveFilters = 
    filters.search !== '' ||
    filters.region !== 'All' ||
    filters.productFamily !== 'All' ||
    filters.segment !== 'All' ||
    filters.dealType !== 'All' ||
    filters.owner !== 'All' ||
    filters.selectedAccountId !== null;

  const handleResetFilters = () => {
    setFilters(prev => ({
      ...prev,
      search: '',
      region: 'All',
      productFamily: 'All',
      segment: 'All',
      dealType: 'All',
      owner: 'All',
      selectedAccountId: null,
      selectedOppId: null
    }));
  };

  const handleSelectAccount = (account: Account) => {
    setInspectedAccount(account);
    setIsDrawerOpen(true);
  };

  const handleSelectProduct = (product: string) => {
    setFilters(prev => ({
      ...prev,
      productFamily: prev.productFamily === product ? 'All' : (product as any)
    }));
  };

  const handleSelectDimensionValue = (dimKey: string, val: string) => {
    if (dimKey === 'productFamily') {
      setFilters(prev => ({ ...prev, productFamily: val as any }));
    } else if (dimKey === 'region') {
      setFilters(prev => ({ ...prev, region: val as any }));
    } else if (dimKey === 'segment') {
      setFilters(prev => ({ ...prev, segment: val as any }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      {/* 1. Global Navigation Header */}
      <Header
        scenario={filters.scenario}
        onScenarioChange={(scen) => setFilters(prev => ({ ...prev, scenario: scen }))}
        timeGrain={filters.timeGrain}
        onTimeGrainChange={(grain) => setFilters(prev => ({ ...prev, timeGrain: grain }))}
        onOpenSql={() => setActiveTab('sql')}
        activeFiltersCount={hasActiveFilters ? 1 : 0}
      />

      {/* 2. Primary Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        openOppsCount={filteredOpportunities.filter(o => o.stage !== 'Closed Won' && o.stage !== 'Closed Lost').length}
      />

      {/* 3. Global Cross-Filter Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 4. Main Tab Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewView
            summary={summary}
            timeSeries={timeSeries}
            arrBridge={arrBridge}
            productBreakdown={productBreakdown}
            topAccounts={rawData.accounts}
            topOpportunities={filteredOpportunities}
            cutoffMonth={rawData.currentCutoffMonth}
            filters={filters}
            onSelectAccount={handleSelectAccount}
            onSelectProduct={handleSelectProduct}
            onNavigateToClosedWon={() => setActiveTab('closed-won')}
          />
        )}

        {activeTab === 'closed-won' && (
          <ClosedWonToRevView
            opportunities={rawData.opportunities}
            schedules={rawData.revenueSchedules}
          />
        )}

        {activeTab === 'forecast' && (
          <ForecastView
            timeSeries={timeSeries}
            opportunities={rawData.opportunities}
            targets={rawData.targets}
            summary={summary}
            cutoffMonth={rawData.currentCutoffMonth}
            filters={filters}
            onScenarioChange={(s) => setFilters(prev => ({ ...prev, scenario: s }))}
            onWeightingChange={(w) => setFilters(prev => ({ ...prev, weightingMode: w }))}
          />
        )}

        {activeTab === 'breakdown' && (
          <BreakdownView
            productBreakdown={productBreakdown}
            regionBreakdown={regionBreakdown}
            segmentBreakdown={segmentBreakdown}
            revenueTypeBreakdown={revenueTypeBreakdown}
            cohortMatrix={cohortMatrix}
            onSelectDimensionValue={handleSelectDimensionValue}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsView
            opportunities={filteredOpportunities}
            accounts={rawData.accounts}
            onSelectAccount={handleSelectAccount}
            onSelectOpp={(opp) => {
              const acc = rawData.accounts.find(a => a.id === opp.accountId);
              if (acc) handleSelectAccount(acc);
            }}
          />
        )}

        {activeTab === 'sql' && (
          <SqlArchitectureView />
        )}
      </main>

      {/* 5. Detail Inspection Slide-Out Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        account={inspectedAccount}
        opportunities={rawData.opportunities}
        schedules={rawData.revenueSchedules}
      />

      {/* 6. Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070a10] py-6 px-4 sm:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-300">StrataCloud Infrastructure</span>
            <span>•</span>
            <span>Commercial Revenue Intelligence &amp; FP&amp;A Portfolio Demonstration</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Deterministic Seed: #881273</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">100% Synthetic Domain Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
