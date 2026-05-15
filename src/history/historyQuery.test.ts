import { createHistoryStore, addToHistory } from './historyStore';
import { computeHistoryStats, getRecentEntries, getEntriesInRange } from './historyQuery';
import { Alert } from '../alerts/alertManager';
import { PortBinding } from '../scanner/portScanner';

function makeBinding(port: number, process = 'node'): PortBinding {
  return { port, protocol: 'tcp', address: '0.0.0.0', pid: 1234, process };
}

function makeAlert(port: number, severity: Alert['severity'] = 'medium', process = 'node'): Alert {
  return {
    id: `alert-${port}`,
    severity,
    binding: makeBinding(port, process),
    message: `Unexpected binding on port ${port}`,
    timestamp: new Date().toISOString(),
  };
}

describe('historyQuery', () => {
  describe('computeHistoryStats', () => {
    it('counts total and by severity', () => {
      const store = createHistoryStore();
      addToHistory(store, makeAlert(80, 'low'));
      addToHistory(store, makeAlert(443, 'critical'));
      addToHistory(store, makeAlert(8080, 'critical'));
      const stats = computeHistoryStats(store);
      expect(stats.total).toBe(3);
      expect(stats.bySeverity['critical']).toBe(2);
      expect(stats.bySeverity['low']).toBe(1);
    });

    it('returns top ports sorted by frequency', () => {
      const store = createHistoryStore();
      addToHistory(store, makeAlert(3000));
      addToHistory(store, makeAlert(3000));
      addToHistory(store, makeAlert(4000));
      const stats = computeHistoryStats(store);
      expect(stats.topPorts[0].port).toBe(3000);
      expect(stats.topPorts[0].count).toBe(2);
    });

    it('returns top processes sorted by frequency', () => {
      const store = createHistoryStore();
      addToHistory(store, makeAlert(3000, 'low', 'nginx'));
      addToHistory(store, makeAlert(3001, 'low', 'nginx'));
      addToHistory(store, makeAlert(3002, 'low', 'node'));
      const stats = computeHistoryStats(store);
      expect(stats.topProcesses[0].process).toBe('nginx');
    });
  });

  describe('getRecentEntries', () => {
    it('returns last N entries in reverse order', () => {
      const store = createHistoryStore();
      addToHistory(store, makeAlert(1));
      addToHistory(store, makeAlert(2));
      addToHistory(store, makeAlert(3));
      const recent = getRecentEntries(store, 2);
      expect(recent).toHaveLength(2);
      expect(recent[0].alert.binding.port).toBe(3);
    });
  });

  describe('getEntriesInRange', () => {
    it('filters entries within date range', () => {
      const store = createHistoryStore();
      addToHistory(store, makeAlert(80));
      const from = new Date(Date.now() - 60000);
      const to = new Date(Date.now() + 60000);
      const results = getEntriesInRange(store, from, to);
      expect(results).toHaveLength(1);
    });

    it('excludes entries outside range', () => {
      const store = createHistoryStore();
      addToHistory(store, makeAlert(80));
      const from = new Date(Date.now() + 10000);
      const to = new Date(Date.now() + 20000);
      const results = getEntriesInRange(store, from, to);
      expect(results).toHaveLength(0);
    });
  });
});
