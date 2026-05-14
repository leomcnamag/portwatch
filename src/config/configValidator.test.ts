import { validateConfig } from './configValidator';
import { PortwatchConfig } from './configLoader';

function makeConfig(overrides: Partial<PortwatchConfig> = {}): PortwatchConfig {
  return {
    scanIntervalMs: 5000,
    allowedPorts: [],
    alertSeverityThresholds: { critical: [22], high: [80] },
    logFilePath: null,
    enableConsoleAlerts: true,
    ...overrides,
  };
}

describe('validateConfig', () => {
  it('passes a valid default config', () => {
    const result = validateConfig(makeConfig());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when scanIntervalMs is too low', () => {
    const result = validateConfig(makeConfig({ scanIntervalMs: 100 }));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/scanIntervalMs/);
  });

  it('fails when scanIntervalMs is too high', () => {
    const result = validateConfig(makeConfig({ scanIntervalMs: 999999 }));
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/scanIntervalMs/);
  });

  it('fails when allowedPorts contains invalid port', () => {
    const result = validateConfig(makeConfig({ allowedPorts: [0, 70000] }));
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  it('fails when critical threshold contains invalid port', () => {
    const result = validateConfig(
      makeConfig({ alertSeverityThresholds: { critical: [99999], high: [] } })
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/critical/);
  });

  it('fails when high threshold contains invalid port', () => {
    const result = validateConfig(
      makeConfig({ alertSeverityThresholds: { critical: [], high: [-1] } })
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/high/);
  });

  it('passes with a valid logFilePath', () => {
    const result = validateConfig(makeConfig({ logFilePath: '/var/log/portwatch.log' }));
    expect(result.valid).toBe(true);
  });

  it('accumulates multiple errors', () => {
    const result = validateConfig(
      makeConfig({ scanIntervalMs: 10, allowedPorts: [99999] })
    );
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
