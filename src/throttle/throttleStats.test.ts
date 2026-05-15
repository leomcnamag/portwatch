import { computeThrottleStats, formatThrottleStats } from './throttleStats';
import { ThrottleStore } from './alertThrottle';

const NOW = 1_700_000_000_000;

function makeStore(overrides: Partial<ThrottleStore> = {}): ThrottleStore {
  return { ...overrides };
}

describe('computeThrottleStats', () => {
  it('returns zeroed stats for empty store', () => {
    const stats = computeThrottleStats(makeStore(), NOW);
    expect(stats.totalKeys).toBe(0);
    expect(stats.activeKeys).toBe(0);
    expect(stats.suppressedCount).toBe(0);
    expect(stats.topSuppressedKeys).toEqual([]);
    expect(stats.oldestEntry).toBeNull();
    expect(stats.newestEntry).toBeNull();
  });

  it('counts only active (non-expired) keys', () => {
    const store = makeStore({
      'key:active': { count: 3, firstSeenAt: NOW - 1000, expiresAt: NOW + 5000 },
      'key:expired': { count: 7, firstSeenAt: NOW - 9000, expiresAt: NOW - 1 },
    });
    const stats = computeThrottleStats(store, NOW);
    expect(stats.totalKeys).toBe(2);
    expect(stats.activeKeys).toBe(1);
    expect(stats.suppressedCount).toBe(3);
  });

  it('sums suppressed counts across active entries', () => {
    const store = makeStore({
      'a': { count: 4, firstSeenAt: NOW - 500, expiresAt: NOW + 1000 },
      'b': { count: 6, firstSeenAt: NOW - 300, expiresAt: NOW + 2000 },
    });
    const stats = computeThrottleStats(store, NOW);
    expect(stats.suppressedCount).toBe(10);
  });

  it('returns top suppressed keys sorted descending', () => {
    const store = makeStore({
      'low': { count: 1, firstSeenAt: NOW - 100, expiresAt: NOW + 1000 },
      'high': { count: 9, firstSeenAt: NOW - 200, expiresAt: NOW + 1000 },
      'mid': { count: 5, firstSeenAt: NOW - 300, expiresAt: NOW + 1000 },
    });
    const stats = computeThrottleStats(store, NOW);
    expect(stats.topSuppressedKeys[0].key).toBe('high');
    expect(stats.topSuppressedKeys[1].key).toBe('mid');
    expect(stats.topSuppressedKeys[2].key).toBe('low');
  });

  it('computes oldest and newest firstSeenAt timestamps', () => {
    const store = makeStore({
      'a': { count: 1, firstSeenAt: NOW - 2000, expiresAt: NOW + 1000 },
      'b': { count: 1, firstSeenAt: NOW - 500, expiresAt: NOW + 1000 },
    });
    const stats = computeThrottleStats(store, NOW);
    expect(stats.oldestEntry).toBe(NOW - 2000);
    expect(stats.newestEntry).toBe(NOW - 500);
  });
});

describe('formatThrottleStats', () => {
  it('includes key stat labels in output', () => {
    const stats = computeThrottleStats(
      makeStore({
        'port:3000:node': { count: 2, firstSeenAt: NOW - 100, expiresAt: NOW + 5000 },
      }),
      NOW
    );
    const text = formatThrottleStats(stats);
    expect(text).toContain('Active keys:');
    expect(text).toContain('Suppressed alerts:');
    expect(text).toContain('port:3000:node');
  });

  it('omits timestamp lines when no active entries', () => {
    const stats = computeThrottleStats(makeStore(), NOW);
    const text = formatThrottleStats(stats);
    expect(text).not.toContain('Oldest active entry');
    expect(text).not.toContain('Newest active entry');
  });
});
