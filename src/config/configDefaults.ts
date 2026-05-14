import { PortWatchConfig } from './configLoader';

export const DEFAULT_SCAN_INTERVAL_MS = 5000;
export const DEFAULT_ALERT_COOLDOWN_MS = 60000;
export const DEFAULT_LOG_FILE = '/var/log/portwatch/alerts.log';
export const DEFAULT_TRUSTED_PORTS: number[] = [22, 80, 443];
export const DEFAULT_TRUSTED_PROCESSES: string[] = ['sshd', 'nginx', 'httpd', 'node'];

export const CONFIG_DEFAULTS: Required<PortWatchConfig> = {
  scanIntervalMs: DEFAULT_SCAN_INTERVAL_MS,
  alertCooldownMs: DEFAULT_ALERT_COOLDOWN_MS,
  logFile: DEFAULT_LOG_FILE,
  trustedPorts: DEFAULT_TRUSTED_PORTS,
  trustedProcesses: DEFAULT_TRUSTED_PROCESSES,
  enableConsole: true,
  enableFile: false,
};

/**
 * Merges a partial user config with the defaults, ensuring all required
 * fields are present and that array fields are deduplicated.
 */
export function applyDefaults(partial: Partial<PortWatchConfig>): Required<PortWatchConfig> {
  const merged: Required<PortWatchConfig> = {
    ...CONFIG_DEFAULTS,
    ...partial,
  };

  // Merge and deduplicate array fields rather than replacing them
  if (partial.trustedPorts) {
    merged.trustedPorts = Array.from(
      new Set([...CONFIG_DEFAULTS.trustedPorts, ...partial.trustedPorts])
    );
  }

  if (partial.trustedProcesses) {
    merged.trustedProcesses = Array.from(
      new Set([...CONFIG_DEFAULTS.trustedProcesses, ...partial.trustedProcesses])
    );
  }

  return merged;
}
