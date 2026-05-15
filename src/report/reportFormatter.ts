import { PortReport } from './reportGenerator';

export function formatReportAsText(report: PortReport): string {
  const lines: string[] = [];

  lines.push('=== PortWatch Report ===');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Total Bindings: ${report.totalBindings}`);
  lines.push(`Total Alerts:   ${report.totalAlerts}`);
  lines.push('');

  lines.push('Alerts by Severity:');
  for (const [severity, count] of Object.entries(report.alertsBySeverity)) {
    lines.push(`  ${severity.padEnd(10)} ${count}`);
  }
  lines.push('');

  lines.push('Top Processes:');
  for (const { process, count } of report.topProcesses) {
    lines.push(`  ${process.padEnd(20)} ${count} port(s)`);
  }
  lines.push('');

  lines.push('Active Bindings:');
  for (const b of report.bindings) {
    lines.push(`  ${b.process.padEnd(20)} ${b.address}:${b.port}  (pid ${b.pid})`);
  }

  return lines.join('\n');
}

export function formatReportAsJson(report: PortReport): string {
  return JSON.stringify(report, null, 2);
}
