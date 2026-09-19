import React from 'react';
import { getExpiryBadgeDetails, ExpiryStatus } from '@/lib/expiry/engine';

interface ExpiryBadgeProps {
  status: ExpiryStatus | string;
  customLabel?: string;
  showDot?: boolean;
}

export const ExpiryBadge: React.FC<ExpiryBadgeProps> = ({
  status,
  customLabel,
  showDot = true,
}) => {
  const details = getExpiryBadgeDetails(status as ExpiryStatus);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${details.bg} ${details.border}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${details.dot}`} />
      )}
      <span>{customLabel || details.label}</span>
    </span>
  );
};
