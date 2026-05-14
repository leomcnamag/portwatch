import * as fs from 'fs';
import * as path from 'path';

export interface PortwatchConfig {
  scanIntervalMs: number;
  allowedPorts: number[];
  alertSeverityThresholds: {
    critical: number[];
    high: number[];
  };
  logFilePath: string | null;
  enableConsoleAlerts: boolean;
}

const DEFAULT_CONFIG: PortwatchConfig = {
  scanIntervalMs: 5000,
  allowedPorts: [],
  alertSeverityThresholds: {
    critical: [22, 23, 3389],
    high: [80, 443, 8080, 8443],
  },
  logFilePath: null,
  enableConsoleAlerts: true,
};

export function parseConfig(raw: Record<string, unknown>): PortwatchConfig {
  return {
    scanIntervalMs:
      typeof raw.scanIntervalMs === 'number' ? raw.scanIntervalMs : DEFAULT_CONFIG.scanIntervalMs,
    allowedPorts:
      Array.isArray(raw.allowedPorts) ? (raw.allowedPorts as number[]) : DEFAULT_CONFIG.allowedPorts,
    alertSeverityThresholds: {
      critical:
        Array.isArray(raw?.alertSeverityThresholds?.critical)
          ? (raw.alertSeverityThresholds as any).critical
          : DEFAULT_CONFIG.alertSeverityThresholds.critical,
      high:
        Array.isArray(raw?.alertSeverityThresholds?.high)
          ? (raw.alertSeverityThresholds as any).high
          : DEFAULT_CONFIG.alertSeverityThresholds.high,
    },
    logFilePath:
      typeof raw.logFilePath === 'string' ? raw.logFilePath : DEFAULT_CONFIG.logFilePath,
    enableConsoleAlerts:
      typeof raw.enableConsoleAlerts === 'boolean'
        ? raw.enableConsoleAlerts
        : DEFAULT_CONFIG.enableConsoleAlerts,
  };
}

export function loadConfig(configPath?: string): PortwatchConfig {
  const resolved = configPath ?? path.resolve(process.cwd(), 'portwatch.config.json');
  if (!fs.existsSync(resolved)) {
    return { ...DEFAULT_CONFIG };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(resolved, 'utf-8'));
    return parseConfig(raw);
  } catch {
    console.warn(`[portwatch] Failed to parse config at ${resolved}, using defaults.`);
    return { ...DEFAULT_CONFIG };
  }
}
