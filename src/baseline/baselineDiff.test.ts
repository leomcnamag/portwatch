import { createBaselineStore, addToBaseline } from './baselineStore';
import { getNewBindings, getRemovedBindings, diffAgainstBaseline } from './baselineDiff';
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

describe('getNewBindings', () => {
  it('returns bindings not in baseline', () => {
    const store = createBaselineStore();
    addToBaseline(store, makeBinding({ port: 3000 }));
    const current = [makeBinding({ port: 3000 }), makeBinding({ port: 4000 })];
    const result = getNewBindings(store, current);
    expect(result).toHaveLength(1);
    expect(result[0].port).toBe(4000);
  });

  it('returns empty array when all bindings are in baseline', () => {
    const store = createBaselineStore();
    addToBaseline(store, makeBinding({ port: 3000 }));
    const result = getNewBindings(store, [makeBinding({ port: 3000 })]);
    expect(result).toHaveLength(0);
  });
});

describe('getRemovedBindings', () => {
  it('returns baseline entries missing from current snapshot', () => {
    const store = createBaselineStore();
    addToBaseline(store, makeBinding({ port: 3000 }));
    addToBaseline(store, makeBinding({ port: 5000 }));
    const result = getRemovedBindings(store, [makeBinding({ port: 3000 })]);
    expect(result).toHaveLength(1);
    expect(result[0].port).toBe(5000);
  });

  it('returns empty when all baseline entries are present', () => {
    const store = createBaselineStore();
    addToBaseline(store, makeBinding({ port: 3000 }));
    const result = getRemovedBindings(store, [makeBinding({ port: 3000 })]);
    expect(result).toHaveLength(0);
  });
});

describe('diffAgainstBaseline', () => {
  it('returns both new and removed bindings', () => {
    const store = createBaselineStore();
    addToBaseline(store, makeBinding({ port: 3000 }));
    const current = [makeBinding({ port: 4000 })];
    const diff = diffAgainstBaseline(store, current);
    expect(diff.newBindings).toHaveLength(1);
    expect(diff.newBindings[0].port).toBe(4000);
    expect(diff.removedFromBaseline).toHaveLength(1);
    expect(diff.removedFromBaseline[0].port).toBe(3000);
  });

  it('returns empty arrays when snapshot matches baseline exactly', () => {
    const store = createBaselineStore();
    addToBaseline(store, makeBinding({ port: 3000 }));
    const diff = diffAgainstBaseline(store, [makeBinding({ port: 3000 })]);
    expect(diff.newBindings).toHaveLength(0);
    expect(diff.removedFromBaseline).toHaveLength(0);
  });
});
