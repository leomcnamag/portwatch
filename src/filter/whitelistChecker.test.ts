import {
  matchesWhitelistEntry,
  checkWhitelist,
  getUnwhitelistedBindings,
  WhitelistEntry,
} from './whitelistChecker';
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

describe('matchesWhitelistEntry', () => {
  it('matches when only port is specified', () => {
    const entry: WhitelistEntry = { port: 3000 };
    expect(matchesWhitelistEntry(makeBinding(), entry)).toBe(true);
  });

  it('does not match when port differs', () => {
    const entry: WhitelistEntry = { port: 4000 };
    expect(matchesWhitelistEntry(makeBinding(), entry)).toBe(false);
  });

  it('matches when port and process both match', () => {
    const entry: WhitelistEntry = { port: 3000, process: 'node' };
    expect(matchesWhitelistEntry(makeBinding(), entry)).toBe(true);
  });

  it('does not match when process differs', () => {
    const entry: WhitelistEntry = { port: 3000, process: 'nginx' };
    expect(matchesWhitelistEntry(makeBinding(), entry)).toBe(false);
  });

  it('matches protocol case-insensitively', () => {
    const entry: WhitelistEntry = { port: 3000, protocol: 'tcp' };
    expect(matchesWhitelistEntry(makeBinding({ protocol: 'TCP' }), entry)).toBe(true);
  });
});

describe('checkWhitelist', () => {
  it('marks bindings as whitelisted when they match', () => {
    const bindings = [makeBinding({ port: 3000 }), makeBinding({ port: 9999 })];
    const results = checkWhitelist(bindings, { whitelist: [{ port: 3000 }] });

    expect(results[0].whitelisted).toBe(true);
    expect(results[0].matchedEntry).toEqual({ port: 3000 });
    expect(results[1].whitelisted).toBe(false);
    expect(results[1].matchedEntry).toBeUndefined();
  });

  it('returns all as non-whitelisted when whitelist is empty', () => {
    const bindings = [makeBinding()];
    const results = checkWhitelist(bindings, { whitelist: [] });
    expect(results[0].whitelisted).toBe(false);
  });
});

describe('getUnwhitelistedBindings', () => {
  it('returns only non-whitelisted bindings', () => {
    const bindings = [makeBinding({ port: 3000 }), makeBinding({ port: 9999 })];
    const results = checkWhitelist(bindings, { whitelist: [{ port: 3000 }] });
    const unwhitelisted = getUnwhitelistedBindings(results);

    expect(unwhitelisted).toHaveLength(1);
    expect(unwhitelisted[0].port).toBe(9999);
  });
});
