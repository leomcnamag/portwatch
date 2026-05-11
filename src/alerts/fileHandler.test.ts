import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { formatAlertLine, createFileHandler } from './fileHandler';
import { Alert, AlertSeverity } from './alertManager';

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'test-id-001',
    type: 'NEW_BINDING',
    severity: 'high' as AlertSeverity,
    timestamp: new Date('2024-01-15T10:30:00.000Z').getTime(),
    binding: {
      port: 8080,
      pid: 1234,
      process: 'node',
      address: '0.0.0.0',
      protocol: 'tcp',
    },
    ...overrides,
  };
}

describe('formatAlertLine', () => {
  it('includes timestamp, severity, type, and binding info', () => {
    const alert = makeAlert();
    const line = formatAlertLine(alert);
    expect(line).toContain('2024-01-15T10:30:00.000Z');
    expect(line).toContain('[HIGH]');
    expect(line).toContain('NEW_BINDING');
    expect(line).toContain('port=8080');
    expect(line).toContain('pid=1234');
    expect(line).toContain('process=node');
    expect(line).toContain('addr=0.0.0.0');
  });

  it('uses "unknown" for missing pid and process', () => {
    const alert = makeAlert({ binding: { port: 443, protocol: 'tcp' } });
    const line = formatAlertLine(alert);
    expect(line).toContain('pid=unknown');
    expect(line).toContain('process=unknown');
  });

  it('ends with a newline', () => {
    const line = formatAlertLine(makeAlert());
    expect(line.endsWith('\n')).toBe(true);
  });
});

describe('createFileHandler', () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `portwatch-test-${Date.now()}.log`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it('writes alert to file', () => {
    const handler = createFileHandler({ filePath: tmpFile });
    handler(makeAlert());
    const content = fs.readFileSync(tmpFile, 'utf8');
    expect(content).toContain('NEW_BINDING');
    expect(content).toContain('port=8080');
  });

  it('appends multiple alerts', () => {
    const handler = createFileHandler({ filePath: tmpFile });
    handler(makeAlert({ id: 'a1' }));
    handler(makeAlert({ id: 'a2', binding: { port: 9090, protocol: 'tcp' } }));
    const lines = fs.readFileSync(tmpFile, 'utf8').trim().split('\n');
    expect(lines).toHaveLength(2);
  });

  it('truncates file when append is false', () => {
    fs.writeFileSync(tmpFile, 'old content\n');
    const handler = createFileHandler({ filePath: tmpFile, append: false });
    handler(makeAlert());
    const content = fs.readFileSync(tmpFile, 'utf8');
    expect(content).not.toContain('old content');
    expect(content).toContain('NEW_BINDING');
  });
});
