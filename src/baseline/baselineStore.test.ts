import {
  createBaselineStore,
  addToBaseline,
  removeFromBaseline,
  isInBaseline,
  clearBaseline,
  baselineSize,
  toBaselineKey,
} from './baselineStore';
import { PortBinding } from '../scanner/portScanner';

function makeBinding(overrides: Partial<PortBinding> = {}): PortBinding {
  return {
    port: 3000,
    protocol: 'tcp',
    process: 'node',
    pid: 1234,
    address: '0.0.0.0',
    ...overrides,
  };
}

describe('baselineStore', () => {
  it('creates an empty store', () => {
    const store = createBaselineStore();
    expect(store.entries.size).toBe(0);
    expect(store.createdAt).toBeLessThanOrEqual(Date.now());
  });

  it('adds a binding to the store', () => {
    const store = createBaselineStore();
    const binding = makeBinding();
    addToBaseline(store, binding);
    expect(baselineSize(store)).toBe(1);
  });

  it('detects a known binding', () => {
    const store = createBaselineStore();
    const binding = makeBinding();
    addToBaseline(store, binding);
    expect(isInBaseline(store, binding)).toBe(true);
  });

  it('returns false for unknown binding', () => {
    const store = createBaselineStore();
    expect(isInBaseline(store, makeBinding())).toBe(false);
  });

  it('removes a binding', () => {
    const store = createBaselineStore();
    const binding = makeBinding();
    addToBaseline(store, binding);
    const removed = removeFromBaseline(store, binding);
    expect(removed).toBe(true);
    expect(isInBaseline(store, binding)).toBe(false);
  });

  it('returns false when removing non-existent binding', () => {
    const store = createBaselineStore();
    expect(removeFromBaseline(store, makeBinding())).toBe(false);
  });

  it('clears all entries', () => {
    const store = createBaselineStore();
    addToBaseline(store, makeBinding({ port: 80 }));
    addToBaseline(store, makeBinding({ port: 443 }));
    clearBaseline(store);
    expect(baselineSize(store)).toBe(0);
  });

  it('generates consistent keys', () => {
    const b = makeBinding();
    expect(toBaselineKey(b)).toBe('tcp:3000:node');
  });
});
