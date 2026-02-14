#!/usr/bin/env node

/**
 * MCP Client for Kimi CLI
 * Allows Kimi CLI to call MCP tools programmatically
 * 
 * Usage: node mcp-client.js <tool-name> '<json-args>'
 * Example: node mcp-client.js kimi_ask '{"question":"Hello"}'
 */

import { spawn } from 'child_process'

const MCP_SERVERS = {
  'kimi-cli': {
    command: 'node',
    args: ['C:\\Users\\prabh\\Other Projects\\INVTL\\mcp-servers\\kimi-cli\\dist\\index.js'],
    env: { ...process.env }
  }
}

async function callMCPTool(serverName, toolName, args) {
  const server = MCP_SERVERS[serverName]
  if (!server) {
    throw new Error(`Unknown MCP server: ${serverName}`)
  }

  return new Promise((resolve, reject) => {
    const proc = spawn(server.command, server.args, {
      env: server.env,
      stdio: ['pipe', 'pipe', 'pipe']
    })

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    // Initialize
    setTimeout(() => {
      const init = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'kimi-cli-mcp-client', version: '1.0.0' }
        }
      }
      proc.stdin.write(JSON.stringify(init) + '\n')
    }, 500)

    // Call tool
    setTimeout(() => {
      const call = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      }
      proc.stdin.write(JSON.stringify(call) + '\n')
      proc.stdin.end()
    }, 1000)

    proc.on('close', (code) => {
      // Parse the response
      const lines = stdout.trim().split('\n').filter(l => l.trim())
      for (const line of lines) {
        try {
          const msg = JSON.parse(line)
          if (msg.id === 2 && msg.result) {
            resolve(msg.result)
            return
          }
        } catch {}
      }
      reject(new Error('Failed to get tool response'))
    })

    setTimeout(() => {
      proc.kill()
      reject(new Error('Timeout'))
    }, 30000)
  })
}

// CLI usage
if (process.argv.length >= 3) {
  const toolName = process.argv[2]
  const argsJson = process.argv[3] || '{}'
  
  try {
    const args = JSON.parse(argsJson)
    console.log(`🔧 Calling MCP tool: ${toolName}`)
    console.log(`📦 Arguments:`, args)
    console.log('⏳ Waiting for response...\n')
    
    callMCPTool('kimi-cli', toolName, args)
      .then(result => {
        console.log('✅ Result:')
        console.log(JSON.stringify(result, null, 2))
      })
      .catch(err => {
        console.error('❌ Error:', err.message)
        process.exit(1)
      })
  } catch (e) {
    console.error('❌ Invalid JSON arguments:', e.message)
    console.log('Usage: node mcp-client.js <tool-name> \'<json-args>\'')
    console.log('Example: node mcp-client.js kimi_ask \'{"question":"Hello"}\'')
    process.exit(1)
  }
} else {
  console.log('MCP Client for Kimi CLI')
  console.log('========================\n')
  console.log('Usage: node mcp-client.js <tool-name> \'<json-args>\'\n')
  console.log('Available tools:')
  console.log('  - kimi_ask')
  console.log('  - kimi_edit')
  console.log('  - kimi_read')
  console.log('  - kimi_search')
  console.log('  - kimi_run')
  console.log('  - kimi_codebase_query\n')
  console.log('Example:')
  console.log('  node mcp-client.js kimi_ask \'{"question":"What is Node.js?"}\'')
}
