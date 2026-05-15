export interface ThrottleConfig {
  windowMs: number;
  maxAlertsPerWindow: number;
  perPort: boolean;
  perProcess: boolean;
}

const DEFAULT_THROTTLE_CONFIG: ThrottleConfig = {
  windowMs: 60_000,
  maxAlertsPerWindow: 5,
  perPort: true,
  perProcess: false,
};

export function parseThrottleConfig(
  raw: Partial<ThrottleConfig>
): ThrottleConfig {
  const config = { ...DEFAULT_THROTTLE_CONFIG, ...raw };

  if (config.windowMs <= 0) {
    throw new Error("throttle.windowMs must be a positive number");
  }
  if (config.maxAlertsPerWindow <= 0) {
    throw new Error("throttle.maxAlertsPerWindow must be a positive number");
  }

  return config;
}

export function applyThrottleDefaults(
  raw?: Partial<ThrottleConfig>
): ThrottleConfig {
  if (!raw) return { ...DEFAULT_THROTTLE_CONFIG };
  return parseThrottleConfig(raw);
}
