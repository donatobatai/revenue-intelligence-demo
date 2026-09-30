import React, { useState } from 'react';
import { SQL_PIPELINE_SNIPPETS, SqlSnippet } from '../../data/sqlSnippets';
import { Terminal, Copy, Check, Database, GitBranch, Cpu, Sparkles } from 'lucide-react';

export const SqlArchitectureView: React.FC = () => {
  const [selectedSnippetId, setSelectedSnippetId] = useState<string>(SQL_PIPELINE_SNIPPETS[0].id);
  const [copied, setCopied] = useState(false);

  const activeSnippet = SQL_PIPELINE_SNIPPETS.find(s => s.id === selectedSnippetId) || SQL_PIPELINE_SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#111827]/80 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Terminal className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Enterprise Data Warehouse &amp; SQL Modeling Architecture
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Inspect the production-grade BigQuery/Snowflake SQL CTE pipeline that powers this revenue engine. 
              Features calendar spine date expansion, window function ARR lag bridges, and multi-grain pre-aggregated semantic unions.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Dialect:</span>
            <span className="font-mono text-cyan-300 font-semibold">Google BigQuery / Snowflake SQL</span>
          </div>
        </div>
      </div>

      {/* SQL Snippets Selector & Code Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Snippet Index */}
        <div className="lg:col-span-4 space-y-3">
          {SQL_PIPELINE_SNIPPETS.map((snip) => {
            const isSelected = snip.id === selectedSnippetId;
            return (
              <div
                key={snip.id}
                onClick={() => setSelectedSnippetId(snip.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-950/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono text-cyan-400 font-semibold">{snip.category}</span>
                  {isSelected && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      Active
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-white tracking-tight">{snip.title}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{snip.description}</p>
              </div>
            );
          })}

          {/* Architectural Design Principles Box */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5">
            <h5 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Data Engineering Best Practices</span>
            </h5>
            <ul className="text-slate-400 space-y-1.5 text-[11px] list-disc list-inside">
              <li><strong className="text-slate-300">Continuous Calendar Spine:</strong> Prevents missing historical intervals when aggregating across sparse contracts.</li>
              <li><strong className="text-slate-300">Window Function Lags:</strong> Computes true cohort expansion and logo churn without expensive self-joins.</li>
              <li><strong className="text-slate-300">Unioned Semantic Layer:</strong> Serves executive KPI rollups and deal-level drilldowns from a single optimized view.</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Code Viewer & Architectural Takeaway */}
        <div className="lg:col-span-8 bg-[#090d16] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Code Window Header */}
          <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-mono text-slate-300 ml-2">{activeSnippet.id}.sql</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy SQL</span>
                </>
              )}
            </button>
          </div>

          {/* SQL Code Block */}
          <div className="p-5 font-mono text-xs overflow-x-auto leading-relaxed text-slate-300 flex-1 bg-black/40">
            <pre>{activeSnippet.sql}</pre>
          </div>

          {/* Key Architectural Takeaway */}
          <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-xs flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-cyan-300">Analytical Rationale: </span>
              <span className="text-slate-300">{activeSnippet.takeaway}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
