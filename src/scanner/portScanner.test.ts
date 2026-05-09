import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { scanPorts } from './portScanner';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

const mockExecSync = vi.mocked(execSync);

const LSOF_HEADER = 'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME';

describe('scanPorts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty array when lsof throws', () => {
    mockExecSync.mockImplementation(() => { throw new Error('no output'); });
    expect(scanPorts()).toEqual([]);
  });

  it('parses a single TCP binding correctly', () => {
    mockExecSync.mockReturnValue(
      `${LSOF_HEADER}\nnode      1234 user   22u  IPv4 0x1234      0t0  TCP *:3000\n`
    );
    const result = scanPorts();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      port: 3000,
      pid: 1234,
      protocol: 'tcp',
      process: 'node',
    });
  });

  it('parses multiple bindings', () => {
    mockExecSync.mockReturnValue(
      [
        LSOF_HEADER,
        'nginx     42  root   6u  IPv4 0xabc  0t0  TCP *:80',
        'postgres  99  user  10u  IPv4 0xdef  0t0  TCP 127.0.0.1:5432',
      ].join('\n') + '\n'
    );
    const result = scanPorts();
    expect(result).toHaveLength(2);
    expect(result[0].port).toBe(80);
    expect(result[1].port).toBe(5432);
    expect(result[1].address).toBe('127.0.0.1');
  });

  it('skips malformed lines', () => {
    mockExecSync.mockReturnValue(`${LSOF_HEADER}\nbadline\n`);
    expect(scanPorts()).toEqual([]);
  });
});
