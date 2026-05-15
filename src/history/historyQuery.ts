import { HistoryStore, HistoryEntry, queryHistory } from './historyStore';

export interface HistoryStats {
  total: number;
  bySeverity: Record<string, number>;
  topPorts: Array<{ port: number; count: number }>;
  topProcesses: Array<{ process: string; count: number }>;
}

export function computeHistoryStats(store: HistoryStore): HistoryStats {
  const bySeverity: Record<string, number> = {};
  const portCounts: Record<number, number> = {};
  const processCounts: Record<string, number> = {};

  for (const entry of store.entries) {
    const { severity, binding } = entry.alert;
    bySeverity[severity] = (bySeverity[severity] ?? 0) + 1;
    portCounts[binding.port] = (portCounts[binding.port] ?? 0) + 1;
    processCounts[binding.process] = (processCounts[binding.process] ?? 0) + 1;
  }

  const topPorts = Object.entries(portCounts)
    .map(([port, count]) => ({ port: Number(port), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const topProcesses = Object.entries(processCounts)
    .map(([process, count]) => ({ process, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { total: store.entries.length, bySeverity, topPorts, topProcesses };
}

export function getRecentEntries(store: HistoryStore, limit = 20): HistoryEntry[] {
  return store.entries.slice(-limit).reverse();
}

export function getEntriesInRange(store: HistoryStore, from: Date, to: Date): HistoryEntry[] {
  return store.entries.filter((e) => {
    const ts = new Date(e.timestamp);
    return ts >= from && ts <= to;
  });
}
