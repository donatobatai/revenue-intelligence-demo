import React from 'react';
import { OpportunityStage, DealType, Region, CustomerSegment } from '../../types/revenue';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'stage' | 'dealType' | 'region' | 'neutral' | 'success' | 'warning' | 'info';
  value?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  value,
  size = 'sm'
}) => {
  let styleClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  const val = value || (typeof children === 'string' ? children : '');

  if (variant === 'stage' || val in { 'Closed Won': 1, 'Closed Lost': 1, 'Negotiation & Legal': 1, 'Proposal & Quote': 1, 'Technical Evaluation': 1, 'Qualifying': 1 }) {
    switch (val) {
      case 'Closed Won':
        styleClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        break;
      case 'Closed Lost':
        styleClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
        break;
      case 'Negotiation & Legal':
        styleClasses = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
        break;
      case 'Proposal & Quote':
        styleClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        break;
      case 'Technical Evaluation':
        styleClasses = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
        break;
      case 'Qualifying':
        styleClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        break;
    }
  } else if (variant === 'dealType' || val in { 'New Logo': 1, 'Expansion': 1, 'Renewal': 1 }) {
    switch (val) {
      case 'New Logo':
        styleClasses = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
        break;
      case 'Expansion':
        styleClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        break;
      case 'Renewal':
        styleClasses = 'bg-violet-500/10 text-violet-400 border-violet-500/30';
        break;
    }
  } else if (variant === 'success') {
    styleClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (variant === 'warning') {
    styleClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (variant === 'info') {
    styleClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${styleClasses} transition-colors`}>
      {children}
    </span>
  );
};
