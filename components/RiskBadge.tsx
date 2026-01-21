
import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level }) => {
  const configs = {
    [RiskLevel.LOW]: { bg: 'bg-green-100', text: 'text-green-700', label: 'Low Risk' },
    [RiskLevel.EARLY_WARNING]: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Early Warning' },
    [RiskLevel.MODERATE]: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Moderate Risk' },
    [RiskLevel.HIGH]: { bg: 'bg-red-100', text: 'text-red-700', label: 'High Risk' },
  };

  const config = configs[level];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};
