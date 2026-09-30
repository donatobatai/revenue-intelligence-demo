import React, { useState } from 'react';
import { Opportunity, Account } from '../../types/revenue';
import { formatCurrency, formatPercent } from '../../lib/formatters';
import { Badge } from '../common/Badge';
import { 
  Building2, 
  Search, 
  ArrowUpDown, 
  ExternalLink, 
  Layers, 
  Clock, 
  DollarSign,
  ChevronRight,
  Filter
} from 'lucide-react';

interface AccountsViewProps {
  opportunities: Opportunity[];
  accounts: Account[];
  onSelectAccount: (acc: Account) => void;
  onSelectOpp: (opp: Opportunity) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  opportunities,
  accounts,
  onSelectAccount,
  onSelectOpp
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'acv' | 'tcv' | 'closeDate' | 'name'>('acv');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('All');

  const accountMap = new Map(accounts.map(a => [a.id, a]));

  // Filtered & sorted opportunities
  const filteredOpps = opportunities.filter(opp => {
    if (selectedStage !== 'All' && opp.stage !== selectedStage) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        opp.name.toLowerCase().includes(q) ||
        opp.accountName.toLowerCase().includes(q) ||
        opp.productFamily.toLowerCase().includes(q) ||
        opp.owner.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const sortedOpps = [...filteredOpps].sort((a, b) => {
    let diff = 0;
    if (sortBy === 'acv') diff = a.acv - b.acv;
    else if (sortBy === 'tcv') diff = a.tcv - b.tcv;
    else if (sortBy === 'closeDate') diff = a.closeDate.localeCompare(b.closeDate);
    else diff = a.accountName.localeCompare(b.accountName);
    return sortAsc ? diff : -diff;
  });

  const toggleSort = (field: 'acv' | 'tcv' | 'closeDate' | 'name') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Building2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Account 360 &amp; Commercial Deal Ledger
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Granular inspection of synthetic institutional accounts, contracts, provisioning ramp delays, 
              and individual revenue schedules. Click any row to inspect complete contract cash flow schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
              {filteredOpps.length} Opportunities Filtered
            </span>
          </div>
        </div>
      </div>

      {/* Filter / Sort Control Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by deal, account, owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Stages</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Negotiation & Legal">Negotiation &amp; Legal</option>
              <option value="Proposal & Quote">Proposal &amp; Quote</option>
              <option value="Technical Evaluation">Technical Evaluation</option>
              <option value="Qualifying">Qualifying</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px]">Sort by:</span>
          {(['acv', 'tcv', 'closeDate', 'name'] as const).map(field => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                sortBy === field
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{field === 'acv' ? 'ACV' : field === 'tcv' ? 'TCV' : field === 'closeDate' ? 'Close Date' : 'Account'}</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400">
                <th className="py-3.5 pl-4 font-semibold">Account &amp; Opportunity</th>
                <th className="py-3.5 px-3 font-semibold">Product Line</th>
                <th className="py-3.5 px-3 font-semibold">Type</th>
                <th className="py-3.5 px-3 font-semibold">Stage</th>
                <th className="py-3.5 px-3 font-semibold">Close Date</th>
                <th className="py-3.5 px-3 font-semibold">Contract Ramp</th>
                <th className="py-3.5 px-3 font-semibold text-right">ACV</th>
                <th className="py-3.5 px-3 font-semibold text-right">TCV</th>
                <th className="py-3.5 px-3 font-semibold">Owner</th>
                <th className="py-3.5 pr-4 font-semibold text-right">Drill-Down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {sortedOpps.map((opp) => {
                const acc = accountMap.get(opp.accountId);
                return (
                  <tr
                    key={opp.id}
                    onClick={() => acc && onSelectAccount(acc)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 pl-4">
                      <div className="font-sans font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {opp.accountName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans truncate max-w-[200px]">
                        {opp.name}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300 truncate max-w-[160px]">
                      {opp.productFamily}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <Badge variant="dealType">{opp.dealType}</Badge>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <Badge variant="stage">{opp.stage}</Badge>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {opp.closeDate}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-slate-200">{opp.termMonths} mo</span>
                      <span className="text-[10px] text-amber-400/80 block">+{opp.rampDays}d ramp</span>
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                      {formatCurrency(opp.acv, true)}
                    </td>
                    <td className="py-3 px-3 text-right text-white">
                      {formatCurrency(opp.tcv, true)}
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-300">
                      {opp.owner}
                    </td>
                    <td className="py-3 pr-4 text-right font-sans">
                      <span className="inline-flex items-center gap-1 text-cyan-400 group-hover:text-cyan-300 font-semibold text-xs">
                        Deep Dive <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
