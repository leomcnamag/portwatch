import { createConsoleHandler } from './consoleHandler';
import { Alert } from './alertManager';
import { PortBinding } from '../scanner/snapshotStore';

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  const binding: PortBinding = {
    pid: 999,
    process: 'nginx',
    protocol: 'tcp',
    address: '0.0.0.0',
    port: 80,
  };
  return {
    id: 'test-alert-1',
    severity: 'critical',
    message: 'Test alert message',
    binding,
    timestamp: new Date('2024-01-15T12:00:00Z'),
    ...overrides,
  };
}

describe('createConsoleHandler', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs alerts at or above minSeverity', () => {
    const handler = createConsoleHandler({ minSeverity: 'warning', useColor: false });
    handler(makeAlert({ severity: 'warning' }));
    handler(makeAlert({ severity: 'critical' }));
    expect(logSpy).toHaveBeenCalledTimes(2);
  });

  it('suppresses alerts below minSeverity', () => {
    const handler = createConsoleHandler({ minSeverity: 'warning', useColor: false });
    handler(makeAlert({ severity: 'info' }));
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('includes severity label in output', () => {
    const handler = createConsoleHandler({ minSeverity: 'info', useColor: false });
    handler(makeAlert({ severity: 'info', message: 'hello world' }));
    const output: string = logSpy.mock.calls[0][0];
    expect(output).toContain('[INFO]');
    expect(output).toContain('hello world');
  });

  it('includes timestamp in output', () => {
    const handler = createConsoleHandler({ minSeverity: 'info', useColor: false });
    handler(makeAlert({ severity: 'info' }));
    const output: string = logSpy.mock.calls[0][0];
    expect(output).toContain('2024-01-15');
  });

  it('defaults to info minSeverity', () => {
    const handler = createConsoleHandler({ useColor: false });
    handler(makeAlert({ severity: 'info' }));
    expect(logSpy).toHaveBeenCalledTimes(1);
  });

  it('includes port and process info in output', () => {
    const handler = createConsoleHandler({ minSeverity: 'info', useColor: false });
    handler(makeAlert({ severity: 'info' }));
    const output: string = logSpy.mock.calls[0][0];
    expect(output).toContain('80');
    expect(output).toContain('nginx');
  });
});
