import { Alert } from '../alerts/alertManager';

export type NotifyHandler = (alert: Alert) => Promise<void>;

const handlers: NotifyHandler[] = [];

export function registerNotifyHandler(handler: NotifyHandler): void {
  handlers.push(handler);
}

export function clearNotifyHandlers(): void {
  handlers.length = 0;
}

export function buildNotifyMessage(alert: Alert): string {
  return `[${alert.severity.toUpperCase()}] Port ${alert.binding.port}/${alert.binding.protocol} – ${alert.type} (${alert.binding.process} PID ${alert.binding.pid})`;
}

export async function dispatchNotifications(alert: Alert): Promise<void> {
  await Promise.all(handlers.map((h) => h(alert)));
}
