import { PortBinding } from '../scanner/portScanner';

export interface BaselineEntry {
  port: number;
  protocol: string;
  process: string;
  pid: number;
  addedAt: number;
}

export interface BaselineStore {
  entries: Map<string, BaselineEntry>;
  createdAt: number;
  updatedAt: number;
}

export function createBaselineStore(): BaselineStore {
  return {
    entries: new Map(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function toBaselineKey(binding: PortBinding): string {
  return `${binding.protocol}:${binding.port}:${binding.process}`;
}

export function addToBaseline(store: BaselineStore, binding: PortBinding): void {
  const key = toBaselineKey(binding);
  store.entries.set(key, {
    port: binding.port,
    protocol: binding.protocol,
    process: binding.process,
    pid: binding.pid,
    addedAt: Date.now(),
  });
  store.updatedAt = Date.now();
}

export function removeFromBaseline(store: BaselineStore, binding: PortBinding): boolean {
  const key = toBaselineKey(binding);
  const deleted = store.entries.delete(key);
  if (deleted) store.updatedAt = Date.now();
  return deleted;
}

export function isInBaseline(store: BaselineStore, binding: PortBinding): boolean {
  return store.entries.has(toBaselineKey(binding));
}

export function clearBaseline(store: BaselineStore): void {
  store.entries.clear();
  store.updatedAt = Date.now();
}

export function baselineSize(store: BaselineStore): number {
  return store.entries.size;
}
