import fs from 'fs';
import path from 'path';
import os from 'os';
import { exportReport, exportReportMultiFormat } from './reportExporter';
import { Report } from './reportGenerator';

function makeReport(): Report {
  return {
    generatedAt: new Date('2024-03-10T12:00:00Z'),
    totalAlerts: 2,
    severitySummary: { critical: 1, high: 1, medium: 0, low: 0 },
    topProcesses: [{ process: 'node', count: 2 }],
    alerts: [],
  };
}

describe('exportReport', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portwatch-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('writes a text file to the output directory', () => {
    const result = exportReport(makeReport(), {
      format: 'text',
      outputDir: tmpDir,
      timestamp: new Date('2024-03-10T12:00:00Z'),
    });
    expect(fs.existsSync(result.filePath)).toBe(true);
    expect(result.format).toBe('text');
    expect(result.filePath).toMatch(/\.txt$/);
  });

  it('writes a json file to the output directory', () => {
    const result = exportReport(makeReport(), {
      format: 'json',
      outputDir: tmpDir,
      timestamp: new Date('2024-03-10T12:00:00Z'),
    });
    expect(fs.existsSync(result.filePath)).toBe(true);
    expect(result.format).toBe('json');
    expect(result.filePath).toMatch(/\.json$/);
  });

  it('returns correct bytesWritten', () => {
    const result = exportReport(makeReport(), {
      format: 'json',
      outputDir: tmpDir,
    });
    const stat = fs.statSync(result.filePath);
    expect(result.bytesWritten).toBe(stat.size);
  });

  it('creates output directory if it does not exist', () => {
    const nestedDir = path.join(tmpDir, 'nested', 'reports');
    exportReport(makeReport(), { format: 'text', outputDir: nestedDir });
    expect(fs.existsSync(nestedDir)).toBe(true);
  });

  it('exports both formats with exportReportMultiFormat', () => {
    const results = exportReportMultiFormat(
      makeReport(),
      tmpDir,
      new Date('2024-03-10T12:00:00Z')
    );
    expect(results).toHaveLength(2);
    const formats = results.map((r) => r.format);
    expect(formats).toContain('text');
    expect(formats).toContain('json');
    results.forEach((r) => expect(fs.existsSync(r.filePath)).toBe(true));
  });
});
