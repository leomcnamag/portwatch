import * as fs from 'fs';
import * as path from 'path';
import { parseConfig, loadConfig, PortwatchConfig } from './configLoader';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

describe('parseConfig', () => {
  it('returns defaults for empty object', () => {
    const config = parseConfig({});
    expect(config.scanIntervalMs).toBe(5000);
    expect(config.allowedPorts).toEqual([]);
    expect(config.enableConsoleAlerts).toBe(true);
    expect(config.logFilePath).toBeNull();
  });

  it('applies provided values', () => {
    const config = parseConfig({
      scanIntervalMs: 2000,
      allowedPorts: [3000, 4000],
      enableConsoleAlerts: false,
      logFilePath: '/var/log/portwatch.log',
    });
    expect(config.scanIntervalMs).toBe(2000);
    expect(config.allowedPorts).toEqual([3000, 4000]);
    expect(config.enableConsoleAlerts).toBe(false);
    expect(config.logFilePath).toBe('/var/log/portwatch.log');
  });

  it('applies custom severity thresholds', () => {
    const config = parseConfig({
      alertSeverityThresholds: { critical: [22], high: [80] },
    });
    expect(config.alertSeverityThresholds.critical).toEqual([22]);
    expect(config.alertSeverityThresholds.high).toEqual([80]);
  });

  it('falls back to default thresholds when malformed', () => {
    const config = parseConfig({ alertSeverityThresholds: 'bad' as any });
    expect(config.alertSeverityThresholds.critical).toContain(22);
  });
});

describe('loadConfig', () => {
  beforeEach(() => jest.resetAllMocks());

  it('returns defaults when config file does not exist', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const config = loadConfig('/nonexistent/portwatch.config.json');
    expect(config.scanIntervalMs).toBe(5000);
  });

  it('loads and parses existing config file', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(
      JSON.stringify({ scanIntervalMs: 1000, allowedPorts: [8080] })
    );
    const config = loadConfig('/some/portwatch.config.json');
    expect(config.scanIntervalMs).toBe(1000);
    expect(config.allowedPorts).toEqual([8080]);
  });

  it('returns defaults when JSON is invalid', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('not json');
    const config = loadConfig('/bad/portwatch.config.json');
    expect(config.scanIntervalMs).toBe(5000);
  });
});
