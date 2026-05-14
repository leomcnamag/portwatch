import { filterBindings, isPortIgnored, isProcessIgnored } from './portFilter';
import { PortBinding } from '../scanner/portScanner';

function makeBinding(overrides: Partial<PortBinding> = {}): PortBinding {
  return {
    port: 3000,
    protocol: 'TCP',
    process: 'node',
    pid: 1234,
    address: '127.0.0.1',
    ...overrides,
  };
}

describe('isPortIgnored', () => {
  it('returns true when port is in ignored list', () => {
    expect(isPortIgnored(8080, [3000, 8080])).toBe(true);
  });

  it('returns false when port is not in ignored list', () => {
    expect(isPortIgnored(9090, [3000, 8080])).toBe(false);
  });

  it('returns false for empty ignored list', () => {
    expect(isPortIgnored(3000, [])).toBe(false);
  });
});

describe('isProcessIgnored', () => {
  it('returns true for exact process name match', () => {
    expect(isProcessIgnored('nginx', ['nginx', 'sshd'])).toBe(true);
  });

  it('returns false when process is not in list', () => {
    expect(isProcessIgnored('node', ['nginx', 'sshd'])).toBe(false);
  });

  it('supports wildcard matching', () => {
    expect(isProcessIgnored('node-server', ['node*'])).toBe(true);
    expect(isProcessIgnored('python', ['node*'])).toBe(false);
  });
});

describe('filterBindings', () => {
  it('separates allowed and suppressed bindings', () => {
    const bindings = [
      makeBinding({ port: 3000, process: 'node' }),
      makeBinding({ port: 8080, process: 'nginx' }),
      makeBinding({ port: 9090, process: 'python' }),
    ];

    const result = filterBindings(bindings, {
      ignoredPorts: [8080],
      ignoredProcesses: ['nginx'],
    });

    expect(result.allowed).toHaveLength(2);
    expect(result.suppressed).toHaveLength(1);
    expect(result.suppressed[0].port).toBe(8080);
  });

  it('returns all bindings as allowed when no filters set', () => {
    const bindings = [makeBinding(), makeBinding({ port: 4000 })];
    const result = filterBindings(bindings, { ignoredPorts: [], ignoredProcesses: [] });
    expect(result.allowed).toHaveLength(2);
    expect(result.suppressed).toHaveLength(0);
  });

  it('handles undefined ignoredPorts and ignoredProcesses gracefully', () => {
    const bindings = [makeBinding()];
    const result = filterBindings(bindings, {});
    expect(result.allowed).toHaveLength(1);
  });
});
