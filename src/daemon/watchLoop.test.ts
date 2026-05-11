import { diffSnapshots, startWatchLoop } from './watchLoop';
import { PortBinding } from '../scanner/portScanner';
import { SnapshotStore } from '../scanner/snapshotStore';
import { AlertManager, createAlertManager } from '../alerts/alertManager';

function makeBinding(port: number, protocol: 'tcp' | 'udp' = 'tcp'): PortBinding {
  return { port, protocol, pid: 1234, process: 'test' };
}

describe('diffSnapshots', () => {
  it('detects newly added bindings', () => {
    const prev = [makeBinding(3000)];
    const curr = [makeBinding(3000), makeBinding(4000)];
    const { added, removed } = diffSnapshots(prev, curr);
    expect(added).toHaveLength(1);
    expect(added[0].port).toBe(4000);
    expect(removed).toHaveLength(0);
  });

  it('detects removed bindings', () => {
    const prev = [makeBinding(3000), makeBinding(8080)];
    const curr = [makeBinding(3000)];
    const { added, removed } = diffSnapshots(prev, curr);
    expect(removed).toHaveLength(1);
    expect(removed[0].port).toBe(8080);
    expect(added).toHaveLength(0);
  });

  it('returns empty diff when snapshots are identical', () => {
    const prev = [makeBinding(3000)];
    const curr = [makeBinding(3000)];
    const { added, removed } = diffSnapshots(prev, curr);
    expect(added).toHaveLength(0);
    expect(removed).toHaveLength(0);
  });

  it('handles empty previous snapshot', () => {
    const { added, removed } = diffSnapshots([], [makeBinding(9000)]);
    expect(added).toHaveLength(1);
    expect(removed).toHaveLength(0);
  });
});

describe('startWatchLoop', () => {
  it('returns a handle with stop and isRunning', () => {
    const store = new SnapshotStore();
    const manager = createAlertManager();
    const handle = startWatchLoop(store, manager, { intervalMs: 60000 });
    expect(handle.isRunning()).toBe(true);
    handle.stop();
    expect(handle.isRunning()).toBe(false);
  });

  it('calls onError when scanPorts throws', async () => {
    jest.useFakeTimers();
    const store = new SnapshotStore();
    const manager = createAlertManager();
    const errors: Error[] = [];

    const handle = startWatchLoop(store, manager, {
      intervalMs: 100,
      onError: (e) => errors.push(e),
    });

    jest.advanceTimersByTime(200);
    handle.stop();
    jest.useRealTimers();
  });
});
