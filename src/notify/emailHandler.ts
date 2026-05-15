import { Alert } from '../alerts/alertManager';
import { NotifyHandler } from './notifyManager';

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  from: string;
  to: string[];
  subject?: string;
  secure?: boolean;
}

export interface EmailPayload {
  from: string;
  to: string[];
  subject: string;
  text: string;
}

export function buildEmailPayload(alert: Alert, config: EmailConfig): EmailPayload {
  const subject = config.subject ?? `[portwatch] ${alert.severity.toUpperCase()} – Port ${alert.binding.port} ${alert.type}`;

  const lines = [
    `Alert Type  : ${alert.type}`,
    `Severity    : ${alert.severity}`,
    `Port        : ${alert.binding.port}`,
    `Protocol    : ${alert.binding.protocol}`,
    `Process     : ${alert.binding.process} (PID ${alert.binding.pid})`,
    `Address     : ${alert.binding.address}`,
    `Timestamp   : ${new Date(alert.timestamp).toISOString()}`,
  ];

  return {
    from: config.from,
    to: config.to,
    subject,
    text: lines.join('\n'),
  };
}

export function createEmailHandler(
  config: EmailConfig,
  send: (payload: EmailPayload) => Promise<void>
): NotifyHandler {
  return async (alert: Alert): Promise<void> => {
    const payload = buildEmailPayload(alert, config);
    await send(payload);
  };
}
