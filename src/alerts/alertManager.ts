import { PortBinding } from '../scanner/snapshotStore';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  binding: PortBinding;
  timestamp: Date;
}

export type AlertHandler = (alert: Alert) => void | Promise<void>;

let handlers: AlertHandler[] = [];

export function registerHandler(handler: AlertHandler): void {
  handlers.push(handler);
}

export function clearHandlers(): void {
  handlers = [];
}

export function classifySeverity(binding: PortBinding): AlertSeverity {
  if (binding.port < 1024) return 'critical';
  if (binding.port < 8000) return 'warning';
  return 'info';
}

function generateId(binding: PortBinding, timestamp: Date): string {
  return `${binding.protocol}-${binding.address}-${binding.port}-${timestamp.getTime()}`;
}

export async function emitAlert(
  binding: PortBinding,
  message: string
): Promise<Alert> {
  const timestamp = new Date();
  const alert: Alert = {
    id: generateId(binding, timestamp),
    severity: classifySeverity(binding),
    message,
    binding,
    timestamp,
  };

  await Promise.all(handlers.map((h) => h(alert)));
  return alert;
}

export async function emitNewBindingAlert(binding: PortBinding): Promise<Alert> {
  const msg = `New port binding detected: ${binding.protocol.toUpperCase()} ${binding.address}:${binding.port} (${binding.process})`;
  return emitAlert(binding, msg);
}

export async function emitRemovedBindingAlert(binding: PortBinding): Promise<Alert> {
  const msg = `Port binding removed: ${binding.protocol.toUpperCase()} ${binding.address}:${binding.port} (${binding.process})`;
  return emitAlert(binding, msg);
}
