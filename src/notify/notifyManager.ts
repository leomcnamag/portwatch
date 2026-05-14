import { Alert } from '../alerts/alertManager';

export type NotifyChannel = 'desktop' | 'webhook' | 'none';

export interface NotifyConfig {
  channel: NotifyChannel;
  webhookUrl?: string;
  desktopEnabled?: boolean;
}

export type NotifyHandler = (alert: Alert) => Promise<void>;

const handlers: NotifyHandler[] = [];

export function registerNotifyHandler(handler: NotifyHandler): void {
  handlers.push(handler);
}

export function clearNotifyHandlers(): void {
  handlers.length = 0;
}

export async function dispatchNotification(alert: Alert): Promise<void> {
  await Promise.all(handlers.map((h) => h(alert).catch((err) => {
    console.error('[notifyManager] handler error:', err);
  })));
}

export function buildNotifyMessage(alert: Alert): string {
  const { severity, binding, type } = alert;
  const action = type === 'new' ? 'opened' : 'closed';
  return `[${severity.toUpperCase()}] Port ${binding.port} (${binding.protocol}) ${action} by ${binding.process} (pid ${binding.pid})`;
}
