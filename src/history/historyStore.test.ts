import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  createHistoryStore,
  addToHistory,
  queryHistory,
  clearHistory,
  persistHistory,
  loadHistory,
} from './historyStore';
import { Alert } from '../alerts/alertManager';
import { PortBinding } from '../scanner/portScanner';

function makeBinding(port: number, process = 'node'): PortBinding {
  return { port, protocol: 'tcp', address: '0.0.0.0', pid: 1234, process };
}

function makeAlert(port: number, severity: Alert['severity'] = 'medium'): Alert {
  return {
    id: `alert-${port}`,
    severity,
    binding: makeBinding(port),
    message: `Unexpected binding on port ${port}`,
    timestamp: new Date().toISOString(),
  };
}

describe('historyStore', () => {
  it('adds entries and respects maxEntries', () => {
    const store = createHistoryStore(3);
    addToHistory(store, makeAlert(3000));
    addToHistory(store, makeAlert(3001));
    addToHistory(store, makeAlert(3002));
    addToHistory(store, makeAlert(3003));
    expect(store.entries).toHaveLength(3);
    expect(store.entries[0].alert.binding.port).toBe(3001);
  });

  it('queryHistory filters by severity', () => {
    const store = createHistoryStore();
    addToHistory(store, makeAlert(80, 'low'));
    addToHistory(store, makeAlert(443, 'critical'));
    const results = queryHistory(store, { severity: 'critical' });
    expect(results).toHaveLength(1);
    expect(results[0].alert.binding.port).toBe(443);
  });

  it('queryHistory filters by port', () => {
    const store = createHistoryStore();
    addToHistory(store, makeAlert(8080));
    addToHistory(store, makeAlert(9090));
    const results = queryHistory(store, { port: 8080 });
    expect(results).toHaveLength(1);
  });

  it('clearHistory empties entries', () => {
    const store = createHistoryStore();
    addToHistory(store, makeAlert(3000));
    clearHistory(store);
    expect(store.entries).toHaveLength(0);
  });

  it('persists and loads history from disk', () => {
    const store = createHistoryStore();
    addToHistory(store, makeAlert(5000));
    const tmpFile = path.join(os.tmpdir(), 'portwatch-history-test.json');
    persistHistory(store, tmpFile);
    const store2 = createHistoryStore();
    loadHistory(store2, tmpFile);
    expect(store2.entries).toHaveLength(1);
    expect(store2.entries[0].alert.binding.port).toBe(5000);
    fs.unlinkSync(tmpFile);
  });

  it('loadHistory is a no-op for missing file', () => {
    const store = createHistoryStore();
    loadHistory(store, '/nonexistent/path/history.json');
    expect(store.entries).toHaveLength(0);
  });
});
