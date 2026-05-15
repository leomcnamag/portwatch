import type { PortBinding } from '../scanner/portScanner';
import { isInBaseline } from './baselineStore';
import type { BaselineStore } from './baselineStore';

export interface BaselineDiffResult {
  newBindings: PortBinding[];
  removedFromBaseline: PortBinding[];
}

/**
 * Returns bindings present in current snapshot but not in baseline.
 */
export function getNewBindings(
  store: BaselineStore,
  current: PortBinding[]
): PortBinding[] {
  return current.filter((b) => !isInBaseline(store, b));
}

/**
 * Returns baseline entries no longer present in the current snapshot.
 */
export function getRemovedBindings(
  store: BaselineStore,
  current: PortBinding[]
): PortBinding[] {
  const currentKeys = new Set(
    current.map((b) => `${b.port}:${b.protocol}:${b.process}`)
  );
  const removed: PortBinding[] = [];
  for (const entry of store.entries.values()) {
    const key = `${entry.port}:${entry.protocol}:${entry.process}`;
    if (!currentKeys.has(key)) {
      removed.push(entry);
    }
  }
  return removed;
}

/**
 * Computes a full diff between baseline and current snapshot.
 */
export function diffAgainstBaseline(
  store: BaselineStore,
  current: PortBinding[]
): BaselineDiffResult {
  return {
    newBindings: getNewBindings(store, current),
    removedFromBaseline: getRemovedBindings(store, current),
  };
}
