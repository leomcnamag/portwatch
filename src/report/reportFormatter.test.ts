import { formatReportAsText, formatReportAsJson } from './reportFormatter';
import { PortReport } from './reportGenerator';
import { PortBinding } from '../scanner/portScanner';

function makeReport(overrides: Partial<PortReport> = {}): PortReport {
  const binding: PortBinding = {
    port: 3000,
    address: '127.0.0.1',
    process: 'node',
    pid: 42,
    protocol: 'TCP',
  };
  return {
    generatedAt: '2024-01-01T00:00:00.000Z',
    totalBindings: 1,
    totalAlerts: 1,
    alertsBySeverity: { high: 1 },
    topProcesses: [{ process: 'node', count: 1 }],
    bindings: [binding],
    alerts: [],
    ...overrides,
  };
}

describe('formatReportAsText', () => {
  it('includes header and generated timestamp', () => {
    const text = formatReportAsText(makeReport());
    expect(text).toContain('=== PortWatch Report ===');
    expect(text).toContain('2024-01-01T00:00:00.000Z');
  });

  it('includes severity summary', () => {
    const text = formatReportAsText(makeReport());
    expect(text).toContain('high');
    expect(text).toContain('1');
  });

  it('includes binding details', () => {
    const text = formatReportAsText(makeReport());
    expect(text).toContain('node');
    expect(text).toContain('127.0.0.1:3000');
  });
});

describe('formatReportAsJson', () => {
  it('returns valid JSON matching the report', () => {
    const report = makeReport();
    const json = formatReportAsJson(report);
    const parsed = JSON.parse(json);
    expect(parsed.totalBindings).toBe(1);
    expect(parsed.generatedAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('is pretty-printed', () => {
    const json = formatReportAsJson(makeReport());
    expect(json).toContain('\n');
  });
});
