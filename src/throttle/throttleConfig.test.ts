import { describe, it, expect } from "vitest";
import {
  parseThrottleConfig,
  applyThrottleDefaults,
  ThrottleConfig,
} from "./throttleConfig";

function makeConfig(overrides: Partial<ThrottleConfig> = {}): Partial<ThrottleConfig> {
  return {
    windowMs: 30_000,
    maxAlertsPerWindow: 3,
    perPort: true,
    perProcess: false,
    ...overrides,
  };
}

describe("parseThrottleConfig", () => {
  it("returns merged config with provided values", () => {
    const result = parseThrottleConfig(makeConfig());
    expect(result.windowMs).toBe(30_000);
    expect(result.maxAlertsPerWindow).toBe(3);
  });

  it("fills missing fields with defaults", () => {
    const result = parseThrottleConfig({});
    expect(result.windowMs).toBe(60_000);
    expect(result.maxAlertsPerWindow).toBe(5);
    expect(result.perPort).toBe(true);
    expect(result.perProcess).toBe(false);
  });

  it("throws if windowMs is zero", () => {
    expect(() => parseThrottleConfig(makeConfig({ windowMs: 0 }))).toThrow(
      "windowMs"
    );
  });

  it("throws if windowMs is negative", () => {
    expect(() => parseThrottleConfig(makeConfig({ windowMs: -1 }))).toThrow(
      "windowMs"
    );
  });

  it("throws if maxAlertsPerWindow is zero", () => {
    expect(() =>
      parseThrottleConfig(makeConfig({ maxAlertsPerWindow: 0 }))
    ).toThrow("maxAlertsPerWindow");
  });
});

describe("applyThrottleDefaults", () => {
  it("returns defaults when called with no args", () => {
    const result = applyThrottleDefaults();
    expect(result.windowMs).toBe(60_000);
    expect(result.maxAlertsPerWindow).toBe(5);
  });

  it("merges partial overrides with defaults", () => {
    const result = applyThrottleDefaults({ windowMs: 10_000 });
    expect(result.windowMs).toBe(10_000);
    expect(result.maxAlertsPerWindow).toBe(5);
  });

  it("respects perProcess flag", () => {
    const result = applyThrottleDefaults({ perProcess: true });
    expect(result.perProcess).toBe(true);
  });
});
