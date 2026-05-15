import { ThrottleStore, ThrottleEntry } from './alertThrottle';

export interface ThrottleStats {
  totalKeys: number;
  activeKeys: number;
  suppressedCount: number;
  topSuppressedKeys: Array<{ key: string; count: number }>;
  oldestEntry: number | null;
  newestEntry: number | null;
}

export function computeThrottleStats(
  store: ThrottleStore,
  now: number = Date.now()
): ThrottleStats {
  const entries = Object.entries(store) as Array<[string, ThrottleEntry]>;
  const totalKeys = entries.length;

  const activeEntries = entries.filter(([, e]) => e.expiresAt > now);
  const activeKeys = activeEntries.length;

  const suppressedCount = activeEntries.reduce(
    (sum, [, e]) => sum + e.count,
    0
  );

  const topSuppressedKeys = activeEntries
    .map(([key, e]) => ({ key, count: e.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const timestamps = activeEntries.map(([, e]) => e.firstSeenAt);
  const oldestEntry = timestamps.length > 0 ? Math.min(...timestamps) : null;
  const newestEntry = timestamps.length > 0 ? Math.max(...timestamps) : null;

  return {
    totalKeys,
    activeKeys,
    suppressedCount,
    topSuppressedKeys,
    oldestEntry,
    newestEntry,
  };
}

export function formatThrottleStats(stats: ThrottleStats): string {
  const lines: string[] = [
    `Throttle Stats:`,
    `  Total keys (all-time): ${stats.totalKeys}`,
    `  Active keys:           ${stats.activeKeys}`,
    `  Suppressed alerts:     ${stats.suppressedCount}`,
  ];

  if (stats.topSuppressedKeys.length > 0) {
    lines.push(`  Top suppressed keys:`);
    for (const { key, count } of stats.topSuppressedKeys) {
      lines.push(`    ${key}: ${count}`);
    }
  }

  if (stats.oldestEntry !== null) {
    lines.push(`  Oldest active entry:   ${new Date(stats.oldestEntry).toISOString()}`);
  }
  if (stats.newestEntry !== null) {
    lines.push(`  Newest active entry:   ${new Date(stats.newestEntry).toISOString()}`);
  }

  return lines.join('\n');
}
