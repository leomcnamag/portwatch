import * as fs from 'fs';
import * as path from 'path';
import { Alert } from '../alerts/alertManager';

export interface HistoryEntry {
  timestamp: string;
  alert: Alert;
}

export interface HistoryStore {
  entries: HistoryEntry[];
  maxEntries: number;
}

export function createHistoryStore(maxEntries = 1000): HistoryStore {
  return { entries: [], maxEntries };
}

export function addToHistory(store: HistoryStore, alert: Alert): void {
  store.entries.push({ timestamp: new Date().toISOString(), alert });
  if (store.entries.length > store.maxEntries) {
    store.entries.splice(0, store.entries.length - store.maxEntries);
  }
}

export function queryHistory(
  store: HistoryStore,
  options: { since?: Date; severity?: string; port?: number } = {}
): HistoryEntry[] {
  return store.entries.filter((entry) => {
    if (options.since && new Date(entry.timestamp) < options.since) return false;
    if (options.severity && entry.alert.severity !== options.severity) return false;
    if (options.port && entry.alert.binding.port !== options.port) return false;
    return true;
  });
}

export function clearHistory(store: HistoryStore): void {
  store.entries = [];
}

export function persistHistory(store: HistoryStore, filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(store.entries, null, 2), 'utf-8');
}

export function loadHistory(store: HistoryStore, filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed: HistoryEntry[] = JSON.parse(raw);
  store.entries = parsed.slice(-store.maxEntries);
}
