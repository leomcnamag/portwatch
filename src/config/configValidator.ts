import { PortwatchConfig } from './configLoader';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateConfig(config: PortwatchConfig): ValidationResult {
  const errors: string[] = [];

  if (config.scanIntervalMs < 500) {
    errors.push(`scanIntervalMs must be >= 500ms, got ${config.scanIntervalMs}`);
  }

  if (config.scanIntervalMs > 60000) {
    errors.push(`scanIntervalMs must be <= 60000ms, got ${config.scanIntervalMs}`);
  }

  for (const port of config.allowedPorts) {
    if (!isValidPort(port)) {
      errors.push(`Invalid port in allowedPorts: ${port}`);
    }
  }

  for (const port of config.alertSeverityThresholds.critical) {
    if (!isValidPort(port)) {
      errors.push(`Invalid port in alertSeverityThresholds.critical: ${port}`);
    }
  }

  for (const port of config.alertSeverityThresholds.high) {
    if (!isValidPort(port)) {
      errors.push(`Invalid port in alertSeverityThresholds.high: ${port}`);
    }
  }

  if (
    config.logFilePath !== null &&
    (typeof config.logFilePath !== 'string' || config.logFilePath.trim() === '')
  ) {
    errors.push('logFilePath must be a non-empty string or null');
  }

  return { valid: errors.length === 0, errors };
}

function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}
