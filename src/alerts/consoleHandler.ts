import { Alert, AlertHandler, AlertSeverity } from './alertManager';

const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  info: '\x1b[36m',     // cyan
  warning: '\x1b[33m', // yellow
  critical: '\x1b[31m', // red
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function formatTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', ' UTC');
}

function formatAlert(alert: Alert): string {
  const color = SEVERITY_COLORS[alert.severity];
  const label = `[${alert.severity.toUpperCase()}]`.padEnd(10);
  const ts = formatTimestamp(alert.timestamp);
  return `${BOLD}${color}${label}${RESET} ${ts} ${alert.message}`;
}

export const consoleHandler: AlertHandler = (alert: Alert): void => {
  const formatted = formatAlert(alert);
  if (alert.severity === 'critical') {
    console.error(formatted);
  } else {
    console.log(formatted);
  }
};

export function createConsoleHandler(options: {
  minSeverity?: AlertSeverity;
  useColor?: boolean;
} = {}): AlertHandler {
  const severityOrder: AlertSeverity[] = ['info', 'warning', 'critical'];
  const minIdx = severityOrder.indexOf(options.minSeverity ?? 'info');
  const useColor = options.useColor ?? true;

  return (alert: Alert): void => {
    const alertIdx = severityOrder.indexOf(alert.severity);
    if (alertIdx < minIdx) return;

    if (useColor) {
      console.log(formatAlert(alert));
    } else {
      const label = `[${alert.severity.toUpperCase()}]`.padEnd(10);
      console.log(`${label} ${formatTimestamp(alert.timestamp)} ${alert.message}`);
    }
  };
}
