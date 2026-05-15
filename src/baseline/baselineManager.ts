import { PortBinding } from '../scanner/portScanner';
import {
  BaselineStore,
  createBaselineStore,
  addToBaseline,
  isInBaseline,
  clearBaseline,
  baselineSize,
} from './baselineStore';
import { serializeBaseline, deserializeBaseline } from './baselineSerializer';
import * as fs from 'fs';

export interface BaselineManager {
  learn(bindings: PortBinding[]): void;
  isKnown(binding: PortBinding): boolean;
  filterUnknown(bindings: PortBinding[]): PortBinding[];
  reset(): void;
  size(): number;
  save(filePath: string): Promise<void>;
  load(filePath: string): Promise<void>;
}

export function createBaselineManager(): BaselineManager {
  let store: BaselineStore = createBaselineStore();

  return {
    learn(bindings: PortBinding[]): void {
      for (const binding of bindings) {
        addToBaseline(store, binding);
      }
    },

    isKnown(binding: PortBinding): boolean {
      return isInBaseline(store, binding);
    },

    filterUnknown(bindings: PortBinding[]): PortBinding[] {
      return bindings.filter((b) => !isInBaseline(store, b));
    },

    reset(): void {
      clearBaseline(store);
    },

    size(): number {
      return baselineSize(store);
    },

    async save(filePath: string): Promise<void> {
      const data = serializeBaseline(store);
      await fs.promises.writeFile(filePath, data, 'utf-8');
    },

    async load(filePath: string): Promise<void> {
      const data = await fs.promises.readFile(filePath, 'utf-8');
      store = deserializeBaseline(data);
    },
  };
}
