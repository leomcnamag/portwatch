import { PortBinding } from '../scanner/portScanner';
import { PortwatchConfig } from '../config/configLoader';

export interface FilterResult {
  allowed: PortBinding[];
  suppressed: PortBinding[];
}

export function isPortIgnored(port: number, ignoredPorts: number[]): boolean {
  return ignoredPorts.includes(port);
}

export function isProcessIgnored(processName: string, ignoredProcesses: string[]): boolean {
  return ignoredProcesses.some((pattern) => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(processName);
    }
    return pattern === processName;
  });
}

export function filterBindings(
  bindings: PortBinding[],
  config: Pick<PortwatchConfig, 'ignoredPorts' | 'ignoredProcesses'>
): FilterResult {
  const allowed: PortBinding[] = [];
  const suppressed: PortBinding[] = [];

  for (const binding of bindings) {
    const portIgnored = isPortIgnored(binding.port, config.ignoredPorts ?? []);
    const processIgnored = isProcessIgnored(binding.process, config.ignoredProcesses ?? []);

    if (portIgnored || processIgnored) {
      suppressed.push(binding);
    } else {
      allowed.push(binding);
    }
  }

  return { allowed, suppressed };
}
