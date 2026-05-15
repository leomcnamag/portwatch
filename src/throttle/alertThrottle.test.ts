import {
  createThrottleStore,
  makeThrottleKey,
  isThrottled,
  recordAlert,
  pruneExpiredEntries,
  ThrottleConfig,
} from './alertThrottle';
import { PortBinding } from '../scanner/portScanner';

function makeBinding(overrides: Partial<PortBinding> = {}): PortBinding {
  return {
    port: 8080,
    protocol: 'tcp',
    pid: 1234,
    process: 'node',
    address: '0.0.0.0',
    ...overrides,
  };
}

const config: ThrottleConfig = { windowMs: 60_000, maxAlertsPerPort: 3 };

describe('makeThrottleKey', () => {
  it('creates a unique key from binding fields', () => {
    const binding = makeBinding();
    expect(makeThrottleKey(binding)).toBe('8080:tcp:1234');
  });
});

describe('isThrottled', () => {
  it('returns false when no entry exists', () => {
    const store = createThrottleStore();
    expect(isThrottled(store, 'key', config)).toBe(false);
  });

  it('returns false when count is below max', () => {
    const store = createThrottleStore();
    const now = Date.now();
    store.set('key', { count: 2, windowStart: now });
    expect(isThrottled(store, 'key', config, now)).toBe(false);
  });

  it('returns true when count meets max within window', () => {
    const store = createThrottleStore();
    const now = Date.now();
    store.set('key', { count: 3, windowStart: now });
    expect(isThrottled(store, 'key', config, now)).toBe(true);
  });

  it('returns false when window has expired', () => {
    const store = createThrottleStore();
    const past = Date.now() - 120_000;
    store.set('key', { count: 5, windowStart: past });
    expect(isThrottled(store, 'key', config)).toBe(false);
  });
});

describe('recordAlert', () => {
  it('creates a new entry on first record', () => {
    const store = createThrottleStore();
    const now = Date.now();
    recordAlert(store, 'key', config, now);
    expect(store.get('key')).toEqual({ count: 1, windowStart: now });
  });

  it('increments count within same window', () => {
    const store = createThrottleStore();
    const now = Date.now();
    recordAlert(store, 'key', config, now);
    recordAlert(store, 'key', config, now + 1000);
    expect(store.get('key')?.count).toBe(2);
  });

  it('resets entry when window has expired', () => {
    const store = createThrottleStore();
    const past = Date.now() - 120_000;
    store.set('key', { count: 5, windowStart: past });
    const now = Date.now();
    recordAlert(store, 'key', config, now);
    expect(store.get('key')).toEqual({ count: 1, windowStart: now });
  });
});

describe('pruneExpiredEntries', () => {
  it('removes entries outside the window', () => {
    const store = createThrottleStore();
    const past = Date.now() - 120_000;
    store.set('old', { count: 1, windowStart: past });
    store.set('new', { count: 1, windowStart: Date.now() });
    pruneExpiredEntries(store, config);
    expect(store.has('old')).toBe(false);
    expect(store.has('new')).toBe(true);
  });
});
