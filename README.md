# portwatch

Lightweight daemon that monitors local port usage and alerts on unexpected bindings.

## Installation

```bash
npm install -g portwatch
```

## Usage

Start the daemon with a config file defining your expected port bindings:

```bash
portwatch start --config portwatch.json
```

**Example `portwatch.json`:**

```json
{
  "allowedPorts": [3000, 8080, 5432],
  "alertOn": "unexpected",
  "notify": "console"
}
```

portwatch will run in the background and log a warning whenever a process binds to a port not in your allowed list:

```
[portwatch] ALERT: Unexpected binding on port 4444 by process node (pid 9821)
```

Stop the daemon at any time:

```bash
portwatch stop
```

### CLI Options

| Flag | Description |
|------|-------------|
| `--config <path>` | Path to config file (default: `./portwatch.json`) |
| `--interval <ms>` | Polling interval in milliseconds (default: `2000`) |
| `--verbose` | Enable verbose logging |

## Requirements

- Node.js >= 18
- macOS or Linux

## License

MIT © [portwatch contributors](LICENSE)