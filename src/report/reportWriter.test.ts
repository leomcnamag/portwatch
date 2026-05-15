import fs from 'fs';
import path from 'path';
import { buildReportFilename } from './reportWriter';

describe('buildReportFilename', () => {
  it('generates filename with correct prefix', () => {
    const filename = buildReportFilename('text', new Date('2024-01-15T10:30:00Z'));
    expect(filename).toMatch(/^portwatch-report-/);
  });

  it('uses .txt extension for text format', () => {
    const filename = buildReportFilename('text', new Date('2024-01-15T10:30:00Z'));
    expect(filename).toMatch(/\.txt$/);
  });

  it('uses .json extension for json format', () => {
    const filename = buildReportFilename('json', new Date('2024-01-15T10:30:00Z'));
    expect(filename).toMatch(/\.json$/);
  });

  it('includes date components in filename', () => {
    const filename = buildReportFilename('text', new Date('2024-01-15T10:30:00Z'));
    expect(filename).toContain('2024');
    expect(filename).toContain('01');
    expect(filename).toContain('15');
  });

  it('produces consistent filenames for same timestamp', () => {
    const date = new Date('2024-06-20T08:00:00Z');
    const a = buildReportFilename('json', date);
    const b = buildReportFilename('json', date);
    expect(a).toBe(b);
  });

  it('produces different filenames for different formats', () => {
    const date = new Date('2024-06-20T08:00:00Z');
    const textFile = buildReportFilename('text', date);
    const jsonFile = buildReportFilename('json', date);
    expect(textFile).not.toBe(jsonFile);
  });
});
