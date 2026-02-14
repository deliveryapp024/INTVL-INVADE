# Kimi CLI MCP Server 🤖

A Model Context Protocol (MCP) server that enables AI agents to interact with Kimi Code CLI - allowing AI assistants to use Kimi's powerful coding capabilities.

## Features

- **kimi_ask** - Ask Kimi AI questions and get code assistance
- **kimi_edit** - Edit specific files with AI guidance
- **kimi_read** - Read and analyze files with context
- **kimi_search** - Search codebase for patterns
- **kimi_run** - Execute shell commands with AI oversight
- **kimi_codebase_query** - Natural language queries about the entire codebase

## Installation

### Prerequisites
- Node.js 18+
- Kimi CLI installed (`npm install -g kimi-cli` or `uv tool install kimi-cli`)

### Setup

```bash
cd mcp-servers/kimi-cli
npm install
npm run build
```

## Configuration

### For Claude Desktop / Cursor

Add to your MCP settings file:

**Windows:**
```json
{
  "mcpServers": {
    "kimi-cli": {
      "command": "node",
      "args": ["C:\\Users\\prabh\\Other Projects\\INVTL\\mcp-servers\\kimi-cli\\dist\\index.js"],
      "env": {
        "PATH": "C:\\Users\\prabh\\AppData\\Roaming\\uv\\tools\\kimi-cli\\Scripts"
      }
    }
  }
}
```

**macOS/Linux:**
```json
{
  "mcpServers": {
    "kimi-cli": {
      "command": "node",
      "args": ["/path/to/mcp-servers/kimi-cli/dist/index.js"],
      "env": {
        "PATH": "/usr/local/bin:/usr/bin"
      }
    }
  }
}
```

### For Cline VSCode Extension

Location: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

```json
{
  "mcpServers": {
    "kimi-cli": {
      "command": "node",
      "args": ["C:\\Users\\prabh\\Other Projects\\INVTL\\mcp-servers\\kimi-cli\\dist\\index.js"],
      "env": {
        "PATH": "C:\\Users\\prabh\\AppData\\Roaming\\uv\\tools\\kimi-cli\\Scripts"
      }
    }
  }
}
```

## Usage Examples

### Ask Kimi a Question
```json
{
  "tool": "kimi_ask",
  "arguments": {
    "question": "How do I implement authentication in my Express app?",
    "workingDir": "C:\\Users\\prabh\\Other Projects\\INVTL\\backend"
  }
}
```

### Edit a File
```json
{
  "tool": "kimi_edit",
  "arguments": {
    "file": "src/app.ts",
    "instruction": "Add rate limiting middleware",
    "workingDir": "C:\\Users\\prabh\\Other Projects\\INVTL\\backend"
  }
}
```

### Query Codebase
```json
{
  "tool": "kimi_codebase_query",
  "arguments": {
    "query": "Find all API endpoints that need authentication"
  }
}
```

## Tools Reference

| Tool | Description | Required Args |
|------|-------------|---------------|
| `kimi_ask` | Ask Kimi AI anything | `question` |
| `kimi_edit` | Edit a specific file | `file`, `instruction` |
| `kimi_read` | Read and analyze file | `file` |
| `kimi_search` | Search for patterns | `pattern` |
| `kimi_run` | Run shell command | `command` |
| `kimi_codebase_query` | Query entire codebase | `query` |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode
npm run dev
```

## Troubleshooting

### Kimi CLI Not Found
Make sure Kimi CLI is installed and in PATH:
```bash
which kimi  # macOS/Linux
where kimi  # Windows
```

### Permission Issues
On macOS/Linux, you may need to make the script executable:
```bash
chmod +x dist/index.js
```

## License

MIT
