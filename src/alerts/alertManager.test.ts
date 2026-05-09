import {
  registerHandler,
  clearHandlers,
  classifySeverity,
  emitAlert,
  emitNewBindingAlert,
  emitRemovedBindingAlert,
  Alert,
} from './alertManager';
import { PortBinding } from '../scanner/snapshotStore';

function makeBinding(overrides: Partial<PortBinding> = {}): PortBinding {
  return {
    pid: 1234,
    process: 'node',
    protocol: 'tcp',
    address: '127.0.0.1',
    port: 3000,
    ...overrides,
  };
}

describe('classifySeverity', () => {
  it('returns critical for privileged ports', () => {
    expect(classifySeverity(makeBinding({ port: 80 }))).toBe('critical');
    expect(classifySeverity(makeBinding({ port: 443 }))).toBe('critical');
    expect(classifySeverity(makeBinding({ port: 1023 }))).toBe('critical');
  });

  it('returns warning for ports 1024-7999', () => {
    expect(classifySeverity(makeBinding({ port: 1024 }))).toBe('warning');
    expect(classifySeverity(makeBinding({ port: 5432 }))).toBe('warning');
  });

  it('returns info for ports 8000 and above', () => {
    expect(classifySeverity(makeBinding({ port: 8080 }))).toBe('info');
    expect(classifySeverity(makeBinding({ port: 3000 }))).toBe('info');
  });
});

describe('emitAlert', () => {
  beforeEach(() => clearHandlers());

  it('calls registered handlers with the alert', async () => {
    const received: Alert[] = [];
    registerHandler((a) => { received.push(a); });

    const binding = makeBinding({ port: 8080 });
    const alert = await emitAlert(binding, 'test alert');

    expect(received).toHaveLength(1);
    expect(received[0]).toBe(alert);
    expect(alert.message).toBe('test alert');
    expect(alert.severity).toBe('info');
  });

  it('supports multiple handlers', async () => {
    const calls: number[] = [];
    registerHandler(() => { calls.push(1); });
    registerHandler(() => { calls.push(2); });

    await emitAlert(makeBinding(), 'multi');
    expect(calls).toEqual([1, 2]);
  });
});

describe('emitNewBindingAlert', () => {
  beforeEach(() => clearHandlers());

  it('includes binding details in message', async () => {
    const binding = makeBinding({ port: 9000, process: 'python' });
    const alert = await emitNewBindingAlert(binding);
    expect(alert.message).toContain('9000');
    expect(alert.message).toContain('python');
    expect(alert.message).toContain('New port binding detected');
  });
});

describe('emitRemovedBindingAlert', () => {
  beforeEach(() => clearHandlers());

  it('includes removal info in message', async () => {
    const binding = makeBinding({ port: 443, protocol: 'tcp' });
    const alert = await emitRemovedBindingAlert(binding);
    expect(alert.message).toContain('Port binding removed');
    expect(alert.message).toContain('443');
  });
});
