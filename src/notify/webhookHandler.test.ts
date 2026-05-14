import { buildWebhookPayload, createWebhookHandler } from './webhookHandler';
import { Alert } from '../alerts/alertManager';

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'wh-id',
    type: 'new',
    severity: 'high',
    timestamp: '2024-06-01T12:00:00.000Z',
    binding: { port: 443, protocol: 'tcp', process: 'nginx', pid: 99, address: '0.0.0.0' },
    ...overrides,
  };
}

describe('buildWebhookPayload', () => {
  it('includes all expected fields', () => {
    const payload = buildWebhookPayload(makeAlert());
    expect(payload.port).toBe(443);
    expect(payload.protocol).toBe('tcp');
    expect(payload.process).toBe('nginx');
    expect(payload.pid).toBe(99);
    expect(payload.severity).toBe('high');
    expect(payload.type).toBe('new');
    expect(payload.timestamp).toBe('2024-06-01T12:00:00.000Z');
    expect(payload.message).toContain('443');
  });
});

describe('createWebhookHandler', () => {
  it('posts JSON payload to the webhook URL', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const mockFetch = async (url: string, init: RequestInit) => {
      calls.push({ url, init });
      return { ok: true, status: 200 };
    };
    const handler = createWebhookHandler('https://example.com/hook', mockFetch);
    await handler(makeAlert());
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://example.com/hook');
    const body = JSON.parse(calls[0].init.body as string);
    expect(body.port).toBe(443);
  });

  it('throws when response is not ok', async () => {
    const mockFetch = async () => ({ ok: false, status: 500 });
    const handler = createWebhookHandler('https://example.com/hook', mockFetch);
    await expect(handler(makeAlert())).rejects.toThrow('500');
  });
});
