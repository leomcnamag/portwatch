import https from "https";
import http from "http";
import { Alert } from "../alerts/alertManager";
import { buildNotifyMessage } from "./notifyManager";

export interface SlackHandlerOptions {
  webhookUrl: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
}

export function buildSlackPayload(
  alert: Alert,
  options: SlackHandlerOptions
): Record<string, unknown> {
  const text = buildNotifyMessage(alert);

  const severityEmoji: Record<string, string> = {
    critical: ":red_circle:",
    high: ":large_orange_circle:",
    medium: ":large_yellow_circle:",
    low: ":white_circle:",
  };

  const emoji = severityEmoji[alert.severity] ?? ":white_circle:";

  const payload: Record<string, unknown> = {
    text: `${emoji} *portwatch alert*: ${text}`,
    attachments: [
      {
        color: alert.severity === "critical" || alert.severity === "high" ? "danger" : "warning",
        fields: [
          { title: "Port", value: String(alert.binding.port), short: true },
          { title: "Protocol", value: alert.binding.protocol, short: true },
          { title: "Process", value: alert.binding.process, short: true },
          { title: "Severity", value: alert.severity, short: true },
          { title: "Event", value: alert.event, short: true },
          { title: "PID", value: String(alert.binding.pid), short: true },
        ],
        footer: "portwatch",
        ts: Math.floor(new Date(alert.timestamp).getTime() / 1000),
      },
    ],
  };

  if (options.channel) payload.channel = options.channel;
  if (options.username) payload.username = options.username;
  if (options.iconEmoji) payload.icon_emoji = options.iconEmoji;

  return payload;
}

export function createSlackHandler(
  options: SlackHandlerOptions
): (alert: Alert) => Promise<void> {
  return async (alert: Alert): Promise<void> => {
    const payload = buildSlackPayload(alert, options);
    const body = JSON.stringify(payload);
    const url = new URL(options.webhookUrl);
    const lib = url.protocol === "https:" ? https : http;

    return new Promise((resolve, reject) => {
      const req = lib.request(
        {
          hostname: url.hostname,
          path: url.pathname + url.search,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
          },
        },
        (res) => {
          res.resume();
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Slack webhook returned status ${res.statusCode}`));
          }
        }
      );
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  };
}
