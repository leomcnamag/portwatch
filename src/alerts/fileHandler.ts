import * as fs from 'fs';
import * as path from 'path';
import { Alert, AlertHandler } from './alertManager';

export interface FileHandlerOptions {
  filePath: string;
  append?: boolean;
}

export function formatAlertLine(alert: Alert): string {
  const ts = new Date(alert.timestamp).toISOString();
  const port = alert.binding.port;
  const pid = alert.binding.pid ?? 'unknown';
  const proc = alert.binding.process ?? 'unknown';
  const addr = alert.binding.address ?? '*';
  return `[${ts}] [${alert.severity.toUpperCase()}] ${alert.type} port=${port} addr=${addr} pid=${pid} process=${proc} id=${alert.id}\n`;
}

export function createFileHandler(options: FileHandlerOptions): AlertHandler {
  const { filePath, append = true } = options;

  const dir = path.dirname(filePath);
  if (dir && dir !== '.') {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!append && fs.existsSync(filePath)) {
    fs.truncateSync(filePath, 0);
  }

  return function fileHandler(alert: Alert): void {
    const line = formatAlertLine(alert);
    fs.appendFileSync(filePath, line, { encoding: 'utf8' });
  };
}
