import fs from 'fs';
import path from 'path';
import { Report } from './reportGenerator';
import { formatReportAsText, formatReportAsJson } from './reportFormatter';
import { buildReportFilename } from './reportWriter';

export type ExportFormat = 'text' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  outputDir: string;
  timestamp?: Date;
}

export interface ExportResult {
  filePath: string;
  bytesWritten: number;
  format: ExportFormat;
}

export function exportReport(report: Report, options: ExportOptions): ExportResult {
  const timestamp = options.timestamp ?? new Date();
  const filename = buildReportFilename(options.format, timestamp);
  const filePath = path.join(options.outputDir, filename);

  const content =
    options.format === 'json'
      ? formatReportAsJson(report)
      : formatReportAsText(report);

  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }

  fs.writeFileSync(filePath, content, 'utf-8');

  return {
    filePath,
    bytesWritten: Buffer.byteLength(content, 'utf-8'),
    format: options.format,
  };
}

export function exportReportMultiFormat(
  report: Report,
  outputDir: string,
  timestamp?: Date
): ExportResult[] {
  const formats: ExportFormat[] = ['text', 'json'];
  return formats.map((format) =>
    exportReport(report, { format, outputDir, timestamp })
  );
}
