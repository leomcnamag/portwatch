import { describe, it, expect, beforeEach } from 'vitest';
import { SnapshotStore } from './snapshotStore';
import { PortBinding } from './portScanner';

function makeBinding(port: number, pid = 1, protocol: 'tcp' | 'udp' = 'tcp'): PortBinding {
  return { port, pid, protocol, address: '0.0.0.0', process: 'test' };
}

describe('SnapshotStore', () => {
  let store: SnapshotStore;

  beforeEach(() => {
    store = new SnapshotStore();
  });

  it('starts empty', () => {
    expect(store.isEmpty).toBe(true);
    expect(store.getAll()).toEqual([]);
  });

  it('first update populates snapshot and reports all as added', () => {
    const diff = store.update([makeBinding(3000), makeBinding(8080)]);
    expect(diff.added).toHaveLength(2);
    expect(diff.removed).toHaveLength(0);
    expect(store.isEmpty).toBe(false);
  });

  it('detects newly bound port', () => {
    store.update([makeBinding(3000)]);
    const diff = store.update([makeBinding(3000), makeBinding(4000)]);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].port).toBe(4000);
    expect(diff.removed).toHaveLength(0);
  });

  it('detects released port', () => {
    store.update([makeBinding(3000), makeBinding(4000)]);
    const diff = store.update([makeBinding(3000)]);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].port).toBe(4000);
    expect(diff.added).toHaveLength(0);
  });

  it('treats same port on different protocols as distinct', () => {
    store.update([makeBinding(53, 1, 'tcp')]);
    const diff = store.update([makeBinding(53, 1, 'tcp'), makeBinding(53, 2, 'udp')]);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].protocol).toBe('udp');
  });
});
