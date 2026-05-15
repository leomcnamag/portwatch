import { createThrottledAlertManager } from './throttledAlertManager';
import { Alert } from '../alerts/alertManager';
import { PortBinding } from '../scanner/portScanner';

function makeBinding(overrides: Partial<PortBinding> = {}): PortBinding {
  return {
    port: 3000,
    protocol: 'tcp',
    pid: 42,
    process: 'node',
    address: '127.0.0.1',
    ...overrides,
  };
}

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'alert-1',
    type: 'new_binding',
    severity: 'medium',
    binding: makeBinding(),
    message: 'New binding detected',
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe('createThrottledAlertManager', () => {
  it('returns a manager with emit, getStore, and dispose', () => {
    const mgr = createThrottledAlertManager({
      throttle: { windowMs: 60_000, maxAlertsPerPort: 3 },
    });
    expect(typeof mgr.emit).toBe('function');
    expect(typeof mgr.getStore).toBe('function');
    expect(typeof mgr.dispose).toBe('function');
    mgr.dispose();
  });

  it('records alert in store on first emit', () => {
    const mgr = createThrottledAlertManager({
      throttle: { windowMs: 60_000, maxAlertsPerPort: 3 },
    });
    const binding = makeBinding();
    const alert = makeAlert();
    mgr.emit(alert, binding);
    const store = mgr.getStore();
    expect(store.size).toBe(1);
    mgr.dispose();
  });

  it('suppresses emit when throttle limit is reached', () => {
    const mgr = createThrottledAlertManager({
      throttle: { windowMs: 60_000, maxAlertsPerPort: 2 },
    });
    const binding = makeBinding();
    const alert = makeAlert();

    mgr.emit(alert, binding);
    mgr.emit(alert, binding);

    const storeBefore = new Map(mgr.getStore());
    mgr.emit(alert, binding); // should be throttled
    const storeAfter = mgr.getStore();

    const key = '3000:tcp:42';
    expect(storeBefore.get(key)?.count).toBe(2);
    expect(storeAfter.get(key)?.count).toBe(2); // not incremented
    mgr.dispose();
  });

  it('allows emit again after window resets', () => {
    const mgr = createThrottledAlertManager({
      throttle: { windowMs: 1, maxAlertsPerPort: 1 },
    });
    const binding = makeBinding();
    const alert = makeAlert();

    mgr.emit(alert, binding);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        mgr.emit(alert, binding);
        const store = mgr.getStore();
        expect(store.get('3000:tcp:42')?.count).toBe(1);
        mgr.dispose();
        resolve();
      }, 10);
    });
  });
});
