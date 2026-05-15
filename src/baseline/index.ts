export {
  createBaselineStore,
  addToBaseline,
  removeFromBaseline,
  isInBaseline,
  toBaselineKey,
} from './baselineStore';

export type { BaselineStore } from './baselineStore';

export { createBaselineManager } from './baselineManager';

export { serializeBaseline, deserializeBaseline } from './baselineSerializer';

export {
  getNewBindings,
  getRemovedBindings,
  diffAgainstBaseline,
} from './baselineDiff';

export type { BaselineDiffResult } from './baselineDiff';
