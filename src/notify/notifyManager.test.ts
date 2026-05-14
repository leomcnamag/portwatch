import {
  registerNotifyHandler,
  clearNotifyHandlers,
  dispatchNotification,
  buildNotifyMessage,
  NotifyHandler,
} from './notifyManager';
import { Alert } from '../alerts/alertManager';

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'test-id',
    type: 'new',
    severity: 'medium',
    timestamp: '2024-01-01T00:00:00.000Z',
    binding: { port: 8080, protocol: 'tcp', process: 'node', pid: 1234, address: '0.0.0.0' },
    ...overrides,
  };
}

beforeEach(() => clearNotifyHandlers());

describe('buildNotifyMessage', () => {
  it('formats a new binding alert', () => {
    const msg = buildNotifyMessage(makeAlert({ type: 'new' }));
    expect(msg).toContain('opened');
    expect(msg).toContain('8080');
    expect(msg).toContain('node');
    expect(msg).toContain('MEDIUM');
  });

  it('formats a closed binding alert', () => {
    const msg = buildNotifyMessage(makeAlert({ type: 'closed' }));
    expect(msg).toContain('closed');
  });
});

describe('dispatchNotification', () => {
  it('calls all registered handlers', async () => {
    const calls: string[] = [];
    const h1: NotifyHandler = async (a) => { calls.push('h1:' + a.id); };
    const h2: NotifyHandler = async (a) => { calls.push('h2:' + a.id); };
    registerNotifyHandler(h1);
    registerNotifyHandler(h2);
    await dispatchNotification(makeAlert({ id: 'abc' }));
    expect(calls).toEqual(['h1:abc', 'h2:abc']);
  });

  it('continues dispatching if one handler throws', async () => {
    const calls: string[] = [];
    registerNotifyHandler(async () => { throw new Error('fail'); });
    registerNotifyHandler(async () => { calls.push('ok'); });
    await expect(dispatchNotification(makeAlert())).resolves.toBeUndefined();
    expect(calls).toEqual(['ok']);
  });
});
