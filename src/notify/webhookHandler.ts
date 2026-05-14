import { Alert } from '../alerts/alertManager';
import { buildNotifyMessage } from './notifyManager';

export interface WebhookPayload {
  message: string;
  severity: string;
  port: number;
  protocol: string;
  process: string;
  pid: number;
  timestamp: string;
  type: string;
}

export function buildWebhookPayload(alert: Alert): WebhookPayload {
  return {
    message: buildNotifyMessage(alert),
    severity: alert.severity,
    port: alert.binding.port,
    protocol: alert.binding.protocol,
    process: alert.binding.process,
    pid: alert.binding.pid,
    timestamp: alert.timestamp,
    type: alert.type,
  };
}

export function createWebhookHandler(
  webhookUrl: string,
  fetchFn: (url: string, init: RequestInit) => Promise<{ ok: boolean; status: number }> = fetch
) {
  return async (alert: Alert): Promise<void> => {
    const payload = buildWebhookPayload(alert);
    const response = await fetchFn(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`Webhook request failed with status ${response.status}`);
    }
  };
}
