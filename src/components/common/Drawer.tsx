import React, { useEffect } from 'react';
import { X, ExternalLink, ShieldCheck, Calendar, DollarSign, Layers } from 'lucide-react';
import { Account, Opportunity, MonthlyRevenueScheduleItem } from '../../types/revenue';
import { formatCurrency, formatMonthLabel } from '../../lib/formatters';
import { Badge } from './Badge';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  account?: Account | null;
  opportunities?: Opportunity[];
  schedules?: MonthlyRevenueScheduleItem[];
  onSelectOpp?: (opp: Opportunity) => void;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  account,
  opportunities = [],
  schedules = [],
  onSelectOpp
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !account) return null;

  const accountOpps = opportunities.filter(o => o.accountId === account.id);
  const accountSchedules = schedules.filter(s => s.accountId === account.id);
  const activeArr = accountSchedules
    .filter(s => s.periodMonth === '2026-03' && s.isHistorical)
    .reduce((sum, s) => sum + s.amount * 12, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#0f172a] border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-start justify-between bg-[#131d35]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Account Deep Dive
                </span>
                <Badge variant="neutral">{account.tier}</Badge>
                <Badge variant={account.status === 'Active' ? 'success' : 'neutral'}>
                  {account.status}
                </Badge>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{account.name}</h2>
              <p className="text-xs text-slate-400 mt-1">
                {account.segment} • {account.region} • Owner: <span className="text-slate-200">{account.owner}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Account Financial Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Active ARR</span>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                  {formatCurrency(activeArr, true)}
                </div>
                <span className="text-[10px] text-slate-500">Run-rate (Mar 2026)</span>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Lifetime Recognized</span>
                <div className="text-lg font-bold text-white font-mono mt-1">
                  {formatCurrency(account.totalLtv, true)}
                </div>
                <span className="text-[10px] text-slate-500">Historical GAAP</span>
              </div>
              <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Total Opportunities</span>
                <div className="text-lg font-bold text-cyan-400 font-mono mt-1">
                  {accountOpps.length}
                </div>
                <span className="text-[10px] text-slate-500">{accountOpps.filter(o => o.stage === 'Closed Won').length} Closed Won</span>
              </div>
            </div>

            {/* Opportunities Ledger */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Commercial Opportunities & Contracts ({accountOpps.length})
                </h3>
              </div>
              <div className="space-y-2.5">
                {accountOpps.map((opp) => (
                  <div
                    key={opp.id}
                    onClick={() => onSelectOpp && onSelectOpp(opp)}
                    className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500">{opp.id}</span>
                          <Badge variant="dealType">{opp.dealType}</Badge>
                          <Badge variant="stage">{opp.stage}</Badge>
                        </div>
                        <h4 className="text-sm font-medium text-white mt-1 group-hover:text-cyan-300 transition-colors">
                          {opp.name}
                        </h4>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white font-mono">
                          {formatCurrency(opp.acv, true)} <span className="text-xs font-normal text-slate-400">ACV</span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {formatCurrency(opp.tcv, true)} TCV
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs text-slate-400">
                      <div>
                        <span className="text-slate-500">Close Date:</span> {opp.closeDate}
                      </div>
                      <div>
                        <span className="text-slate-500">Term:</span> {opp.termMonths} mo (Ramp {opp.rampDays}d)
                      </div>
                      <div>
                        <span className="text-slate-500">Contract Start:</span> {opp.contractStartDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Recognized Schedule Preview */}
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Monthly Revenue Recognition Schedule (Recent 12 Months)
              </h3>
              <div className="bg-slate-950/60 rounded-lg border border-slate-800 p-3 max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="pb-2 font-medium">Period</th>
                      <th className="pb-2 font-medium">Product Line</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium text-right">Recognized</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {accountSchedules.slice(-14).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-900/40">
                        <td className="py-2 text-slate-300">{formatMonthLabel(s.periodMonth)}</td>
                        <td className="py-2 text-slate-400 truncate max-w-[140px]">{s.productFamily}</td>
                        <td className="py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              s.status === 'Actual'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : s.status === 'Committed'
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-2 text-right text-white font-medium">
                          {formatCurrency(s.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-800 bg-[#131d35] flex items-center justify-between text-xs text-slate-400">
            <span>Synthetic Account Identifier: <span className="font-mono text-slate-300">{account.id}</span></span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
