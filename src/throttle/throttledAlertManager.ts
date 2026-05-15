import { Alert } from '../alerts/alertManager';
import { PortBinding } from '../scanner/portScanner';
import { registerHandler, clearHandlers } from '../alerts/alertManager';
import {
  ThrottleConfig,
  ThrottleStore,
  createThrottleStore,
  makeThrottleKey,
  isThrottled,
  recordAlert,
  pruneExpiredEntries,
} from './alertThrottle';

export interface ThrottledAlertManagerOptions {
  throttle: ThrottleConfig;
  pruneIntervalMs?: number;
}

export interface ThrottledAlertManager {
  emit: (alert: Alert, binding: PortBinding) => void;
  getStore: () => ThrottleStore;
  dispose: () => void;
}

export function createThrottledAlertManager(
  options: ThrottledAlertManagerOptions
): ThrottledAlertManager {
  const store = createThrottleStore();
  const { throttle, pruneIntervalMs = 300_000 } = options;

  const pruneTimer = setInterval(() => {
    pruneExpiredEntries(store, throttle);
  }, pruneIntervalMs);

  if (pruneTimer.unref) pruneTimer.unref();

  function emit(alert: Alert, binding: PortBinding): void {
    const key = makeThrottleKey(binding);

    if (isThrottled(store, key, throttle)) {
      return;
    }

    recordAlert(store, key, throttle);

    // Dispatch to registered alert handlers via alertManager
    const handlers = (globalThis as any).__portwatch_handlers__ as
      | Array<(a: Alert) => void>
      | undefined;

    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(alert);
        } catch {
          // handler errors should not crash the daemon
        }
      }
    }
  }

  function dispose(): void {
    clearInterval(pruneTimer);
  }

  return { emit, getStore: () => store, dispose };
}
