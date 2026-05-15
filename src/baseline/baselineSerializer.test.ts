import { serializeBaseline, deserializeBaseline } from './baselineSerializer';
import { createBaselineStore, addToBaseline } from './baselineStore';
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

describe('serializeBaseline', () => {
  it('serializes an empty store to a JSON string', () => {
    const store = createBaselineStore();
    const result = serializeBaseline(store);
    const parsed = JSON.parse(result);
    expect(parsed.entries).toEqual([]);
    expect(typeof parsed.createdAt).toBe('string');
  });

  it('serializes entries correctly', () => {
    const store = createBaselineStore();
    addToBaseline(store, makeBinding({ port: 8080 }));
    const result = serializeBaseline(store);
    const parsed = JSON.parse(result);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0].port).toBe(8080);
  });
});

describe('deserializeBaseline', () => {
  it('deserializes a serialized store back correctly', () => {
    const store = createBaselineStore();
    addToBaseline(store, makeBinding({ port: 9000, process: 'python' }));
    const serialized = serializeBaseline(store);
    const restored = deserializeBaseline(serialized);
    expect(restored.entries.size).toBe(1);
  });

  it('throws on invalid JSON', () => {
    expect(() => deserializeBaseline('not-json')).toThrow();
  });

  it('returns empty store for empty entries array', () => {
    const raw = JSON.stringify({ entries: [], createdAt: new Date().toISOString() });
    const store = deserializeBaseline(raw);
    expect(store.entries.size).toBe(0);
  });
});
