import { createBaselineManager } from './baselineManager';
import type { PortBinding } from '../scanner/portScanner';

function makeBinding(overrides: Partial<PortBinding> = {}): PortBinding {
  return {
    port: 3000,
    protocol: 'tcp',
    pid: 1234,
    process: 'node',
    address: '127.0.0.1',
    ...overrides,
  };
}

describe('createBaselineManager', () => {
  it('starts with an empty baseline', () => {
    const manager = createBaselineManager();
    expect(manager.has(makeBinding())).toBe(false);
  });

  it('adds a binding and detects it', () => {
    const manager = createBaselineManager();
    manager.add(makeBinding({ port: 8080 }));
    expect(manager.has(makeBinding({ port: 8080 }))).toBe(true);
  });

  it('removes a binding', () => {
    const manager = createBaselineManager();
    manager.add(makeBinding({ port: 8080 }));
    manager.remove(makeBinding({ port: 8080 }));
    expect(manager.has(makeBinding({ port: 8080 }))).toBe(false);
  });

  it('promotes a snapshot to baseline', () => {
    const manager = createBaselineManager();
    const bindings = [makeBinding({ port: 3000 }), makeBinding({ port: 4000 })];
    manager.promoteSnapshot(bindings);
    expect(manager.has(makeBinding({ port: 3000 }))).toBe(true);
    expect(manager.has(makeBinding({ port: 4000 }))).toBe(true);
  });

  it('serializes and restores state', () => {
    const manager = createBaselineManager();
    manager.add(makeBinding({ port: 9000 }));
    const serialized = manager.serialize();
    const restored = createBaselineManager();
    restored.restore(serialized);
    expect(restored.has(makeBinding({ port: 9000 }))).toBe(true);
  });
});
