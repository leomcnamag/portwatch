import { PortBinding } from './portScanner';

export type PortKey = string;

export function toPortKey(binding: PortBinding): PortKey {
  return `${binding.protocol}:${binding.address}:${binding.port}`;
}

export interface SnapshotDiff {
  added: PortBinding[];
  removed: PortBinding[];
}

export class SnapshotStore {
  private snapshot: Map<PortKey, PortBinding> = new Map();

  /**
   * Returns whether this is the very first snapshot (no prior state).
   */
  get isEmpty(): boolean {
    return this.snapshot.size === 0;
  }

  /**
   * Updates the internal snapshot with the new scan results and returns
   * the diff (added / removed bindings) relative to the previous snapshot.
   */
  update(current: PortBinding[]): SnapshotDiff {
    const currentMap = new Map<PortKey, PortBinding>();
    for (const b of current) {
      currentMap.set(toPortKey(b), b);
    }

    const added: PortBinding[] = [];
    const removed: PortBinding[] = [];

    for (const [key, binding] of currentMap) {
      if (!this.snapshot.has(key)) {
        added.push(binding);
      }
    }

    for (const [key, binding] of this.snapshot) {
      if (!currentMap.has(key)) {
        removed.push(binding);
      }
    }

    this.snapshot = currentMap;
    return { added, removed };
  }

  getAll(): PortBinding[] {
    return Array.from(this.snapshot.values());
  }
}
