import * as fs from 'fs';
import * as path from 'path';
import { PortReport } from './reportGenerator';
import { formatReportAsText, formatReportAsJson } from './reportFormatter';

export type ReportFormat = 'text' | 'json';

export interface ReportWriterOptions {
  outputDir: string;
  format: ReportFormat;
  filenamePrefix?: string;
}

export function buildReportFilename(
  prefix: string,
  format: ReportFormat
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const ext = format === 'json' ? 'json' : 'txt';
  return `${prefix}-${timestamp}.${ext}`;
}

export async function writeReport(
  report: PortReport,
  options: ReportWriterOptions
): Promise<string> {
  const { outputDir, format, filenamePrefix = 'portwatch-report' } = options;

  const content =
    format === 'json'
      ? formatReportAsJson(report)
      : formatReportAsText(report);

  const filename = buildReportFilename(filenamePrefix, format);
  const filePath = path.join(outputDir, filename);

  await fs.promises.mkdir(outputDir, { recursive: true });
  await fs.promises.writeFile(filePath, content, 'utf-8');

  return filePath;
}
