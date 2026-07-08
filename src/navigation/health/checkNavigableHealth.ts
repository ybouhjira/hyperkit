import { getAllNavigables, getActionHistory } from '../NavigableRegistry';

export type HealthStatus = 'healthy' | 'degraded' | 'unresponsive';

export interface NavigableHealth {
  id: string;
  label: string;
  status: HealthStatus;
  actionCount: number;
  errorCount: number;
  errorRate: number;
  lastActionTimestamp: number | null;
}

export interface HealthCheckOptions {
  errorRateThreshold?: number;
  inactivityThreshold?: number;
}

export function checkNavigableHealth(options: HealthCheckOptions = {}): NavigableHealth[] {
  const { errorRateThreshold = 0.1, inactivityThreshold = 60_000 } = options;
  const navigables = getAllNavigables();
  const history = getActionHistory();
  const now = Date.now();

  return navigables.map((nav) => {
    const navHistory = history.filter((e) => e.target === nav.id);
    const actionCount = navHistory.length;
    const errorCount = navHistory.filter((e) => !e.result.ok).length;
    const errorRate = actionCount > 0 ? errorCount / actionCount : 0;
    const lastEntry = navHistory.length > 0 ? navHistory[navHistory.length - 1] : undefined;
    const lastAction = lastEntry?.timestamp ?? null;

    let status: HealthStatus = 'healthy';
    if (errorRate > errorRateThreshold) status = 'degraded';
    if (lastAction !== null && now - lastAction > inactivityThreshold) {
      // Only mark unresponsive if there was activity but it stopped
      if (actionCount > 0) status = 'unresponsive';
    }

    return {
      id: nav.id,
      label: nav.label,
      status,
      actionCount,
      errorCount,
      errorRate,
      lastActionTimestamp: lastAction,
    };
  });
}
