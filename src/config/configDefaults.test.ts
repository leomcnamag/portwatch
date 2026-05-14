import {
  applyDefaults,
  CONFIG_DEFAULTS,
  DEFAULT_SCAN_INTERVAL_MS,
  DEFAULT_TRUSTED_PORTS,
  DEFAULT_TRUSTED_PROCESSES,
} from './configDefaults';

describe('applyDefaults', () => {
  it('returns all defaults when called with an empty object', () => {
    const result = applyDefaults({});
    expect(result).toEqual(CONFIG_DEFAULTS);
  });

  it('overrides scalar fields with provided values', () => {
    const result = applyDefaults({ scanIntervalMs: 1000, enableFile: true });
    expect(result.scanIntervalMs).toBe(1000);
    expect(result.enableFile).toBe(true);
    // Other fields should remain default
    expect(result.alertCooldownMs).toBe(CONFIG_DEFAULTS.alertCooldownMs);
  });

  it('merges trustedPorts with defaults and deduplicates', () => {
    const result = applyDefaults({ trustedPorts: [80, 8080] });
    // 80 is already in defaults, so no duplicate
    expect(result.trustedPorts).toContain(80);
    expect(result.trustedPorts).toContain(8080);
    expect(result.trustedPorts.filter((p) => p === 80)).toHaveLength(1);
    expect(result.trustedPorts.length).toBe(
      new Set([...DEFAULT_TRUSTED_PORTS, 80, 8080]).size
    );
  });

  it('merges trustedProcesses with defaults and deduplicates', () => {
    const result = applyDefaults({ trustedProcesses: ['nginx', 'myapp'] });
    expect(result.trustedProcesses).toContain('nginx');
    expect(result.trustedProcesses).toContain('myapp');
    expect(result.trustedProcesses.filter((p) => p === 'nginx')).toHaveLength(1);
    expect(result.trustedProcesses.length).toBe(
      new Set([...DEFAULT_TRUSTED_PROCESSES, 'nginx', 'myapp']).size
    );
  });

  it('does not mutate CONFIG_DEFAULTS', () => {
    const before = { ...CONFIG_DEFAULTS, trustedPorts: [...CONFIG_DEFAULTS.trustedPorts] };
    applyDefaults({ trustedPorts: [9999] });
    expect(CONFIG_DEFAULTS.trustedPorts).toEqual(before.trustedPorts);
  });

  it('uses DEFAULT_SCAN_INTERVAL_MS as the default scanIntervalMs', () => {
    const result = applyDefaults({});
    expect(result.scanIntervalMs).toBe(DEFAULT_SCAN_INTERVAL_MS);
  });
});
