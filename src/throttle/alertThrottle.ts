import { PortBinding } from '../scanner/portScanner';

export interface ThrottleConfig {
  windowMs: number;
  maxAlertsPerPort: number;
}

export interface ThrottleEntry {
  count: number;
  windowStart: number;
}

export type ThrottleStore = Map<string, ThrottleEntry>;

export function createThrottleStore(): ThrottleStore {
  return new Map();
}

export function makeThrottleKey(binding: PortBinding): string {
  return `${binding.port}:${binding.protocol}:${binding.pid}`;
}

export function isThrottled(
  store: ThrottleStore,
  key: string,
  config: ThrottleConfig,
  now: number = Date.now()
): boolean {
  const entry = store.get(key);
  if (!entry) return false;

  const elapsed = now - entry.windowStart;
  if (elapsed > config.windowMs) return false;

  return entry.count >= config.maxAlertsPerPort;
}

export function recordAlert(
  store: ThrottleStore,
  key: string,
  config: ThrottleConfig,
  now: number = Date.now()
): void {
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > config.windowMs) {
    store.set(key, { count: 1, windowStart: now });
  } else {
    entry.count += 1;
  }
}

export function pruneExpiredEntries(
  store: ThrottleStore,
  config: ThrottleConfig,
  now: number = Date.now()
): void {
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > config.windowMs) {
      store.delete(key);
    }
  }
}
