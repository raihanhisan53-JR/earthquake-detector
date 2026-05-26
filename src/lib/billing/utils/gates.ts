import { Plan } from '../../../generated/client';
import { billingRepository } from '../repositories/billing.repository';

/**
 * Check if a user has access to a specific plan level or higher.
 * Hierarchy: STARTER < PROFESSIONAL < ENTERPRISE
 */
export async function hasPlanAccess(userId: string, requiredPlan: Plan): Promise<boolean> {
  const subscription = await billingRepository.getUserSubscription(userId);
  if (!subscription || !subscription.active) return requiredPlan === Plan.STARTER;

  const planHierarchy: Record<Plan, number> = {
    [Plan.STARTER]: 0,
    [Plan.PROFESSIONAL]: 1,
    [Plan.ENTERPRISE]: 2,
  };

  return planHierarchy[subscription.plan] >= planHierarchy[requiredPlan];
}

/**
 * Convenience helper for Pro features
 */
export async function hasProAccess(userId: string): Promise<boolean> {
  return hasPlanAccess(userId, Plan.PROFESSIONAL);
}

/**
 * Get full subscription details
 */
export async function getUserSubscription(userId: string) {
  return billingRepository.getUserSubscription(userId);
}
