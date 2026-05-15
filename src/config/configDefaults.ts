import { PortwatchConfig } from "./configLoader";
import { applyThrottleDefaults } from "../throttle/throttleConfig";

const DEFAULTS: Partial<PortwatchConfig> = {
  scanIntervalMs: 5_000,
  ignorePorts: [],
  ignoreProcesses: [],
  whitelist: [],
  alertSeverityThreshold: "low",
};

export function applyDefaults(config: Partial<PortwatchConfig>): PortwatchConfig {
  const merged: PortwatchConfig = {
    ...DEFAULTS,
    ...config,
  } as PortwatchConfig;

  if (!merged.scanIntervalMs || merged.scanIntervalMs <= 0) {
    merged.scanIntervalMs = DEFAULTS.scanIntervalMs!;
  }

  if (!Array.isArray(merged.ignorePorts)) {
    merged.ignorePorts = [];
  }

  if (!Array.isArray(merged.ignoreProcesses)) {
    merged.ignoreProcesses = [];
  }

  if (!Array.isArray(merged.whitelist)) {
    merged.whitelist = [];
  }

  merged.throttle = applyThrottleDefaults(config.throttle ?? undefined);

  return merged;
}
