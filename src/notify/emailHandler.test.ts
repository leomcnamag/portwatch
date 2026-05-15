import { buildEmailPayload, createEmailHandler, EmailConfig } from './emailHandler';
import { Alert } from '../alerts/alertManager';

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'test-id-001',
    type: 'new_binding',
    severity: 'warning',
    timestamp: 1700000000000,
    binding: {
      port: 8080,
      protocol: 'tcp',
      address: '0.0.0.0',
      process: 'node',
      pid: 1234,
    },
    ...overrides,
  };
}

const baseConfig: EmailConfig = {
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  from: 'portwatch@example.com',
  to: ['admin@example.com'],
  secure: false,
};

describe('buildEmailPayload', () => {
  it('uses default subject when none provided', () => {
    const alert = makeAlert();
    const payload = buildEmailPayload(alert, baseConfig);
    expect(payload.subject).toContain('portwatch');
    expect(payload.subject).toContain('WARNING');
    expect(payload.subject).toContain('8080');
  });

  it('uses custom subject when provided', () => {
    const alert = makeAlert();
    const config = { ...baseConfig, subject: 'Custom Subject' };
    const payload = buildEmailPayload(alert, config);
    expect(payload.subject).toBe('Custom Subject');
  });

  it('includes binding details in text body', () => {
    const alert = makeAlert();
    const payload = buildEmailPayload(alert, baseConfig);
    expect(payload.text).toContain('8080');
    expect(payload.text).toContain('node');
    expect(payload.text).toContain('1234');
    expect(payload.text).toContain('tcp');
    expect(payload.text).toContain('0.0.0.0');
  });

  it('sets from and to from config', () => {
    const alert = makeAlert();
    const payload = buildEmailPayload(alert, baseConfig);
    expect(payload.from).toBe('portwatch@example.com');
    expect(payload.to).toEqual(['admin@example.com']);
  });
});

describe('createEmailHandler', () => {
  it('calls send with the built payload', async () => {
    const send = jest.fn().mockResolvedValue(undefined);
    const handler = createEmailHandler(baseConfig, send);
    const alert = makeAlert();
    await handler(alert);
    expect(send).toHaveBeenCalledTimes(1);
    const payload = send.mock.calls[0][0];
    expect(payload.to).toEqual(['admin@example.com']);
    expect(payload.text).toContain('8080');
  });

  it('propagates errors from send', async () => {
    const send = jest.fn().mockRejectedValue(new Error('SMTP failure'));
    const handler = createEmailHandler(baseConfig, send);
    await expect(handler(makeAlert())).rejects.toThrow('SMTP failure');
  });
});
