import { PortBinding } from '../scanner/portScanner';
import { Alert } from '../alerts/alertManager';

export interface PortReport {
  generatedAt: string;
  totalBindings: number;
  totalAlerts: number;
  alertsBySeverity: Record<string, number>;
  topProcesses: Array<{ process: string; count: number }>;
  bindings: PortBinding[];
  alerts: Alert[];
}

export function buildSeveritySummary(alerts: Alert[]): Record<string, number> {
  return alerts.reduce<Record<string, number>>((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] ?? 0) + 1;
    return acc;
  }, {});
}

export function buildTopProcesses(
  bindings: PortBinding[],
  limit = 5
): Array<{ process: string; count: number }> {
  const counts = bindings.reduce<Record<string, number>>((acc, b) => {
    acc[b.process] = (acc[b.process] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([process, count]) => ({ process, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function generateReport(
  bindings: PortBinding[],
  alerts: Alert[]
): PortReport {
  return {
    generatedAt: new Date().toISOString(),
    totalBindings: bindings.length,
    totalAlerts: alerts.length,
    alertsBySeverity: buildSeveritySummary(alerts),
    topProcesses: buildTopProcesses(bindings),
    bindings,
    alerts,
  };
}
