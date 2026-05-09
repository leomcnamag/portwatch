import { execSync } from 'child_process';

export interface PortBinding {
  port: number;
  pid: number;
  protocol: 'tcp' | 'udp';
  address: string;
  process?: string;
}

function parseLsofLine(line: string): PortBinding | null {
  // COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME
  const parts = line.trim().split(/\s+/);
  if (parts.length < 9) return null;

  const name = parts[8];
  const match = name.match(/^(.*?):(\d+)$/);
  if (!match) return null;

  const protocol = parts[7].toLowerCase() as 'tcp' | 'udp';
  if (protocol !== 'tcp' && protocol !== 'udp') return null;

  return {
    port: parseInt(match[2], 10),
    pid: parseInt(parts[1], 10),
    protocol,
    address: match[1] || '0.0.0.0',
    process: parts[0],
  };
}

export function scanPorts(): PortBinding[] {
  try {
    const output = execSync('lsof -iTCP -iUDP -n -P -sTCP:LISTEN', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const lines = output.split('\n').slice(1); // skip header
    const bindings: PortBinding[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      const binding = parseLsofLine(line);
      if (binding) bindings.push(binding);
    }

    return bindings;
  } catch (err) {
    // lsof returns non-zero if no matches; treat as empty
    return [];
  }
}
