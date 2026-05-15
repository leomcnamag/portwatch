import { BaselineStore, BaselineEntry, createBaselineStore } from './baselineStore';

interface SerializedBaseline {
  createdAt: number;
  updatedAt: number;
  entries: Array<{ key: string; entry: BaselineEntry }>;
}

export function serializeBaseline(store: BaselineStore): string {
  const payload: SerializedBaseline = {
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
    entries: Array.from(store.entries.entries()).map(([key, entry]) => ({
      key,
      entry,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

export function deserializeBaseline(raw: string): BaselineStore {
  let parsed: SerializedBaseline;
  try {
    parsed = JSON.parse(raw) as SerializedBaseline;
  } catch {
    throw new Error('Failed to parse baseline file: invalid JSON');
  }

  if (!Array.isArray(parsed.entries)) {
    throw new Error('Failed to parse baseline file: missing entries array');
  }

  const store = createBaselineStore();
  store.createdAt = parsed.createdAt ?? store.createdAt;
  store.updatedAt = parsed.updatedAt ?? store.updatedAt;

  for (const { key, entry } of parsed.entries) {
    store.entries.set(key, entry);
  }

  return store;
}
