import { SnapshotStore } from '../scanner/snapshotStore';
import { createAlertManager } from '../alerts/alertManager';
import { createConsoleHandler } from '../alerts/consoleHandler';
import { startWatchLoop, LoopHandle } from './watchLoop';

export interface DaemonConfig {
  intervalMs?: number;
  silent?: boolean;
}

export interface Daemon {
  start: () => LoopHandle;
}

export function createDaemon(config: DaemonConfig = {}): Daemon {
  const { intervalMs = 5000, silent = false } = config;

  const store = new SnapshotStore();
  const manager = createAlertManager();

  if (!silent) {
    const consoleHandler = createConsoleHandler();
    manager.registerHandler(consoleHandler);
  }

  return {
    start(): LoopHandle {
      const handle = startWatchLoop(store, manager, {
        intervalMs,
        onError: (err) => {
          if (!silent) {
            console.error('[portwatch] scan error:', err.message);
          }
        },
      });

      if (!silent) {
        console.log(`[portwatch] daemon started (interval: ${intervalMs}ms)`);
      }

      process.on('SIGINT', () => {
        handle.stop();
        if (!silent) console.log('\n[portwatch] daemon stopped');
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        handle.stop();
        process.exit(0);
      });

      return handle;
    },
  };
}
