import { scanPorts, PortBinding } from '../scanner/portScanner';
import { SnapshotStore } from '../scanner/snapshotStore';
import { AlertManager } from '../alerts/alertManager';

export interface WatchLoopOptions {
  intervalMs?: number;
  onError?: (err: Error) => void;
}

export interface LoopHandle {
  stop: () => void;
  isRunning: () => boolean;
}

export function diffSnapshots(
  previous: PortBinding[],
  current: PortBinding[]
): { added: PortBinding[]; removed: PortBinding[] } {
  const prevKeys = new Set(previous.map((b) => `${b.protocol}:${b.port}`));
  const currKeys = new Set(current.map((b) => `${b.protocol}:${b.port}`));

  const added = current.filter((b) => !prevKeys.has(`${b.protocol}:${b.port}`));
  const removed = previous.filter((b) => !currKeys.has(`${b.protocol}:${b.port}`));

  return { added, removed };
}

export function startWatchLoop(
  store: SnapshotStore,
  manager: AlertManager,
  options: WatchLoopOptions = {}
): LoopHandle {
  const { intervalMs = 5000, onError } = options;
  let running = true;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  async function tick(): Promise<void> {
    try {
      const current = await scanPorts();
      const previous = store.getSnapshot();
      const { added, removed } = diffSnapshots(previous, current);

      for (const binding of added) {
        manager.emit({ type: 'PORT_OPENED', binding });
      }
      for (const binding of removed) {
        manager.emit({ type: 'PORT_CLOSED', binding });
      }

      store.setSnapshot(current);
    } catch (err) {
      if (onError) onError(err as Error);
    }

    if (running) {
      timeoutId = setTimeout(tick, intervalMs);
    }
  }

  timeoutId = setTimeout(tick, intervalMs);

  return {
    stop: () => {
      running = false;
      if (timeoutId !== null) clearTimeout(timeoutId);
    },
    isRunning: () => running,
  };
}
