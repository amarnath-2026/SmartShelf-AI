import { differenceInDays, isBefore, startOfDay, format } from 'date-fns';

export type ExpiryStatus = 
  | 'SAFE'
  | 'WATCH'
  | 'WARNING'
  | 'URGENT'
  | 'CRITICAL'
  | 'EXPIRES_TODAY'
  | 'EXPIRED';

export interface ExpiryConfig {
  watchDays: number;
  warningDays: number;
  urgentDays: number;
  criticalDays: number;
}

export const DEFAULT_EXPIRY_CONFIG: ExpiryConfig = {
  watchDays: 30,
  warningDays: 14,
  urgentDays: 6,
  criticalDays: 2,
};

/**
 * Calculates the exact days remaining until expiry.
 */
export function getDaysRemaining(expiryDate: Date | string, referenceDate: Date = new Date()): number {
  const expiry = startOfDay(new Date(expiryDate));
  const ref = startOfDay(referenceDate);
  return differenceInDays(expiry, ref);
}

/**
 * Determines expiry status tier based on days remaining and store config.
 */
export function calculateExpiryStatus(
  expiryDate: Date | string,
  config: ExpiryConfig = DEFAULT_EXPIRY_CONFIG,
  referenceDate: Date = new Date()
): ExpiryStatus {
  const days = getDaysRemaining(expiryDate, referenceDate);

  if (days < 0) return 'EXPIRED';
  if (days === 0) return 'EXPIRES_TODAY';
  if (days <= config.criticalDays) return 'CRITICAL';
  if (days <= config.urgentDays) return 'URGENT';
  if (days <= config.warningDays) return 'WARNING';
  if (days <= config.watchDays) return 'WATCH';
  return 'SAFE';
}

/**
 * Calculates AI Risk Score (0 to 100) for inventory wastage prediction.
 */
export function calculateAIRiskScore(params: {
  daysRemaining: number;
  quantity: number;
  avgDailySales?: number;
  sellingPrice?: number;
}): {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedLeftover: number;
  recommendation: string;
} {
  const { daysRemaining, quantity, avgDailySales = 4, sellingPrice = 50 } = params;

  if (daysRemaining <= 0) {
    return {
      riskScore: 100,
      riskLevel: 'CRITICAL',
      expectedLeftover: quantity,
      recommendation: `Immediate discard or return to supplier. ${quantity} units expired costing ₹${(quantity * sellingPrice).toLocaleString()}.`,
    };
  }

  // Estimate expected sales before expiry
  const expectedSales = Math.floor(avgDailySales * Math.max(1, daysRemaining));
  const expectedLeftover = Math.max(0, quantity - expectedSales);

  // Compute risk metric
  const leftoverRatio = expectedLeftover / quantity;
  let timeWeight = 1.0;
  if (daysRemaining <= 2) timeWeight = 3.5;
  else if (daysRemaining <= 6) timeWeight = 2.2;
  else if (daysRemaining <= 14) timeWeight = 1.4;

  const rawScore = Math.min(100, Math.round((leftoverRatio * 60 + (1 / daysRemaining) * 40) * timeWeight));

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
  let recommendation = 'Stock velocity is adequate. Maintain regular shelf placement.';

  if (rawScore >= 80 || daysRemaining <= 2) {
    riskLevel = 'CRITICAL';
    recommendation = `🔥 SELL FIRST PRIORITY: High probability of ${expectedLeftover} units expiring unsold. Apply 30%-50% discount immediately or feature on front end-cap.`;
  } else if (rawScore >= 50 || daysRemaining <= 6) {
    riskLevel = 'HIGH';
    recommendation = `⚠️ WARNING: Estimated ${expectedLeftover} units may remain unsold. Highlight with 'Promotional Offer' tag or bundle with fast-moving items.`;
  } else if (rawScore >= 30 || daysRemaining <= 14) {
    riskLevel = 'MEDIUM';
    recommendation = `PRIORITY WATCH: Rotate stock to front shelf (FEFO). Monitor daily sales velocity.`;
  }

  return {
    riskScore: Math.min(100, Math.max(0, rawScore)),
    riskLevel,
    expectedLeftover,
    recommendation,
  };
}

/**
 * Returns color classes and badges for status rendering.
 */
export function getExpiryBadgeDetails(status: ExpiryStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  priorityOrder: number;
} {
  switch (status) {
    case 'EXPIRED':
      return {
        label: 'Expired',
        bg: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        text: 'text-gray-700',
        border: 'border-gray-300',
        dot: 'bg-gray-500',
        priorityOrder: 1,
      };
    case 'EXPIRES_TODAY':
      return {
        label: 'Expires Today!',
        bg: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 animate-pulse',
        text: 'text-red-700 font-bold',
        border: 'border-red-400',
        dot: 'bg-red-600',
        priorityOrder: 2,
      };
    case 'CRITICAL':
      return {
        label: 'Critical (1-2 Days)',
        bg: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        text: 'text-red-600',
        border: 'border-red-300',
        dot: 'bg-red-500',
        priorityOrder: 3,
      };
    case 'URGENT':
      return {
        label: 'Urgent (3-6 Days)',
        bg: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        text: 'text-orange-600',
        border: 'border-orange-300',
        dot: 'bg-orange-500',
        priorityOrder: 4,
      };
    case 'WARNING':
      return {
        label: 'Warning (7-14 Days)',
        bg: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        text: 'text-amber-600',
        border: 'border-amber-300',
        dot: 'bg-amber-500',
        priorityOrder: 5,
      };
    case 'WATCH':
      return {
        label: 'Watch (15-30 Days)',
        bg: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        text: 'text-yellow-600',
        border: 'border-yellow-200',
        dot: 'bg-yellow-400',
        priorityOrder: 6,
      };
    case 'SAFE':
    default:
      return {
        label: 'Safe (> 30 Days)',
        bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        priorityOrder: 7,
      };
  }
}
