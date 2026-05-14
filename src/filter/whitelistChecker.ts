import { PortBinding } from '../scanner/portScanner';
import { PortwatchConfig } from '../config/configLoader';

export interface WhitelistEntry {
  port: number;
  process?: string;
  protocol?: string;
}

export interface WhitelistCheckResult {
  binding: PortBinding;
  whitelisted: boolean;
  matchedEntry?: WhitelistEntry;
}

export function matchesWhitelistEntry(binding: PortBinding, entry: WhitelistEntry): boolean {
  if (entry.port !== binding.port) return false;
  if (entry.process && entry.process !== binding.process) return false;
  if (entry.protocol && entry.protocol.toUpperCase() !== binding.protocol.toUpperCase()) return false;
  return true;
}

export function checkWhitelist(
  bindings: PortBinding[],
  config: Pick<PortwatchConfig, 'whitelist'>
): WhitelistCheckResult[] {
  const whitelist: WhitelistEntry[] = config.whitelist ?? [];

  return bindings.map((binding) => {
    const matchedEntry = whitelist.find((entry) => matchesWhitelistEntry(binding, entry));
    return {
      binding,
      whitelisted: matchedEntry !== undefined,
      matchedEntry,
    };
  });
}

export function getUnwhitelistedBindings(results: WhitelistCheckResult[]): PortBinding[] {
  return results.filter((r) => !r.whitelisted).map((r) => r.binding);
}
