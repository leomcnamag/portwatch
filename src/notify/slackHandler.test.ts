import { buildSlackPayload, SlackHandlerOptions } from "./slackHandler";
import { Alert } from "../alerts/alertManager";
import { PortBinding } from "../scanner/portScanner";

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  const binding: PortBinding = {
    port: 8080,
    protocol: "tcp",
    process: "node",
    pid: 1234,
    address: "127.0.0.1",
  };
  return {
    id: "test-id-001",
    timestamp: "2024-01-15T10:30:00.000Z",
    event: "opened",
    severity: "high",
    binding,
    ...overrides,
  };
}

const baseOptions: SlackHandlerOptions = {
  webhookUrl: "https://hooks.slack.com/services/TEST/TEST/TEST",
};

describe("buildSlackPayload", () => {
  it("includes the alert text in the payload", () => {
    const alert = makeAlert();
    const payload = buildSlackPayload(alert, baseOptions);
    expect(typeof payload.text).toBe("string");
    expect(payload.text).toContain("portwatch alert");
  });

  it("includes port and process in attachment fields", () => {
    const alert = makeAlert();
    const payload = buildSlackPayload(alert, baseOptions);
    const attachments = payload.attachments as Array<{ fields: Array<{ title: string; value: string }> }>;
    const fields = attachments[0].fields;
    const portField = fields.find((f) => f.title === "Port");
    const processField = fields.find((f) => f.title === "Process");
    expect(portField?.value).toBe("8080");
    expect(processField?.value).toBe("node");
  });

  it("uses danger color for critical severity", () => {
    const alert = makeAlert({ severity: "critical" });
    const payload = buildSlackPayload(alert, baseOptions);
    const attachments = payload.attachments as Array<{ color: string }>;
    expect(attachments[0].color).toBe("danger");
  });

  it("uses warning color for medium severity", () => {
    const alert = makeAlert({ severity: "medium" });
    const payload = buildSlackPayload(alert, baseOptions);
    const attachments = payload.attachments as Array<{ color: string }>;
    expect(attachments[0].color).toBe("warning");
  });

  it("includes channel when provided", () => {
    const alert = makeAlert();
    const options: SlackHandlerOptions = { ...baseOptions, channel: "#alerts" };
    const payload = buildSlackPayload(alert, options);
    expect(payload.channel).toBe("#alerts");
  });

  it("includes username when provided", () => {
    const alert = makeAlert();
    const options: SlackHandlerOptions = { ...baseOptions, username: "portwatch-bot" };
    const payload = buildSlackPayload(alert, options);
    expect(payload.username).toBe("portwatch-bot");
  });

  it("omits channel and username when not provided", () => {
    const alert = makeAlert();
    const payload = buildSlackPayload(alert, baseOptions);
    expect(payload.channel).toBeUndefined();
    expect(payload.username).toBeUndefined();
  });

  it("includes a unix timestamp in the attachment", () => {
    const alert = makeAlert({ timestamp: "2024-01-15T10:30:00.000Z" });
    const payload = buildSlackPayload(alert, baseOptions);
    const attachments = payload.attachments as Array<{ ts: number }>;
    expect(typeof attachments[0].ts).toBe("number");
    expect(attachments[0].ts).toBeGreaterThan(0);
  });
});
