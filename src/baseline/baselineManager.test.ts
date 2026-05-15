import { createBaselineManager } from './baselineManager';
import { PortBinding } from '../scanner/portScanner';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

function makeBinding(overrides: Partial<PortBinding> = {}): PortBinding {
  return {
    port: 8080,
    protocol: 'tcp',
    process: 'nginx',
    pid: 42,
    address: '127.0.0.1',
    ...overrides,
  };
}

describe('baselineManager', () => {
  it('learns bindings and reports size', () => {
    const mgr = createBaselineManager();
    mgr.learn([makeBinding({ port: 80 }), makeBinding({ port: 443 })]);
    expect(mgr.size()).toBe(2);
  });

  it('identifies known bindings', () => {
    const mgr = createBaselineManager();
    const b = makeBinding();
    mgr.learn([b]);
    expect(mgr.isKnown(b)).toBe(true);
  });

  it('filters out unknown bindings', () => {
    const mgr = createBaselineManager();
    mgr.learn([makeBinding({ port: 80 })]);
    const result = mgr.filterUnknown([
      makeBinding({ port: 80 }),
      makeBinding({ port: 9000 }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].port).toBe(9000);
  });

  it('resets the store', () => {
    const mgr = createBaselineManager();
    mgr.learn([makeBinding()]);
    mgr.reset();
    expect(mgr.size()).toBe(0);
  });

  it('saves and loads baseline from file', async () => {
    const mgr = createBaselineManager();
    mgr.learn([makeBinding({ port: 3306, process: 'mysqld' })]);

    const tmpFile = path.join(os.tmpdir(), `portwatch-baseline-${Date.now()}.json`);
    await mgr.save(tmpFile);

    const mgr2 = createBaselineManager();
    await mgr2.load(tmpFile);
    expect(mgr2.size()).toBe(1);
    expect(mgr2.isKnown(makeBinding({ port: 3306, process: 'mysqld' }))).toBe(true);

    await fs.promises.unlink(tmpFile);
  });
});
