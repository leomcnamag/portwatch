import {
  buildSeveritySummary,
  buildTopProcesses,
  generateReport,
} from './reportGenerator';
import { PortBinding } from '../scanner/portScanner';
import { Alert } from '../alerts/alertManager';

function makeBinding(overrides: Partial<PortBinding> = {}): PortBinding {
  return {
    port: 3000,
    address: '127.0.0.1',
    process: 'node',
    pid: 1234,
    protocol: 'TCP',
    ...overrides,
  };
}

function makeAlert(severity: Alert['severity'] = 'medium'): Alert {
  return {
    id: 'test-id',
    severity,
    message: 'test alert',
    binding: makeBinding(),
    timestamp: new Date().toISOString(),
    type: 'new_binding',
  };
}

describe('buildSeveritySummary', () => {
  it('counts alerts by severity', () => {
    const alerts = [makeAlert('high'), makeAlert('low'), makeAlert('high')];
    expect(buildSeveritySummary(alerts)).toEqual({ high: 2, low: 1 });
  });

  it('returns empty object for no alerts', () => {
    expect(buildSeveritySummary([])).toEqual({});
  });
});

describe('buildTopProcesses', () => {
  it('returns processes sorted by binding count', () => {
    const bindings = [
      makeBinding({ process: 'nginx' }),
      makeBinding({ process: 'node' }),
      makeBinding({ process: 'nginx' }),
    ];
    const result = buildTopProcesses(bindings);
    expect(result[0]).toEqual({ process: 'nginx', count: 2 });
    expect(result[1]).toEqual({ process: 'node', count: 1 });
  });

  it('respects the limit parameter', () => {
    const bindings = Array.from({ length: 10 }, (_, i) =>
      makeBinding({ process: `proc${i}` })
    );
    expect(buildTopProcesses(bindings, 3)).toHaveLength(3);
  });
});

describe('generateReport', () => {
  it('produces a report with correct totals', () => {
    const bindings = [makeBinding(), makeBinding({ port: 8080 })];
    const alerts = [makeAlert('high')];
    const report = generateReport(bindings, alerts);
    expect(report.totalBindings).toBe(2);
    expect(report.totalAlerts).toBe(1);
    expect(report.alertsBySeverity).toEqual({ high: 1 });
    expect(report.generatedAt).toBeTruthy();
  });
});
