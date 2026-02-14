#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js'
import { execSync } from 'child_process'

// Tool definitions
const TOOLS: Tool[] = [
  {
    name: 'kimi_ask',
    description: 'Ask Kimi AI a question or request code changes. This invokes the Kimi CLI to perform AI-powered coding tasks.',
    inputSchema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'The question or request to ask Kimi AI'
        },
        workingDir: {
          type: 'string',
          description: 'Working directory for the command (optional, defaults to current)'
        },
        contextFiles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Additional files to include as context (optional)'
        }
      },
      required: ['question']
    }
  },
  {
    name: 'kimi_edit',
    description: 'Ask Kimi to edit code in a specific file. Use this for targeted code modifications.',
    inputSchema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          description: 'Path to the file to edit'
        },
        instruction: {
          type: 'string',
          description: 'What changes to make to the file'
        },
        workingDir: {
          type: 'string',
          description: 'Working directory (optional)'
        }
      },
      required: ['file', 'instruction']
    }
  },
  {
    name: 'kimi_read',
    description: 'Read a file using Kimi CLI. Useful for getting file contents with context.',
    inputSchema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          description: 'Path to the file to read'
        },
        workingDir: {
          type: 'string',
          description: 'Working directory (optional)'
        }
      },
      required: ['file']
    }
  },
  {
    name: 'kimi_search',
    description: 'Search for code patterns using Kimi CLI. Finds files matching patterns.',
    inputSchema: {
      type: 'object',
      properties: {
        pattern: {
          type: 'string',
          description: 'Search pattern (glob or regex)'
        },
        workingDir: {
          type: 'string',
          description: 'Working directory (optional)'
        }
      },
      required: ['pattern']
    }
  },
  {
    name: 'kimi_run',
    description: 'Execute a shell command through Kimi CLI with AI oversight.',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'Shell command to execute'
        },
        workingDir: {
          type: 'string',
          description: 'Working directory (optional)'
        },
        explanation: {
          type: 'string',
          description: 'Explanation of what the command does'
        }
      },
      required: ['command']
    }
  },
  {
    name: 'kimi_codebase_query',
    description: 'Query the entire codebase with natural language. Kimi will analyze and answer based on all code.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Natural language query about the codebase'
        },
        workingDir: {
          type: 'string',
          description: 'Root directory of the codebase (optional)'
        }
      },
      required: ['query']
    }
  }
]

class KimiCLIServer {
  private server: Server

  constructor() {
    this.server = new Server(
      {
        name: 'kimi-cli-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    )

    this.setupToolHandlers()
    
    // Error handling
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error)
    }

    process.on('SIGINT', async () => {
      await this.server.close()
      process.exit(0)
    })
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: TOOLS,
      }
    })

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case 'kimi_ask':
            return await this.handleKimiAsk(args)
          case 'kimi_edit':
            return await this.handleKimiEdit(args)
          case 'kimi_read':
            return await this.handleKimiRead(args)
          case 'kimi_search':
            return await this.handleKimiSearch(args)
          case 'kimi_run':
            return await this.handleKimiRun(args)
          case 'kimi_codebase_query':
            return await this.handleKimiCodebaseQuery(args)
          default:
            throw new Error(`Unknown tool: ${name}`)
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        }
      }
    })
  }

  private async handleKimiAsk(args: any) {
    const { question, workingDir = process.cwd(), contextFiles = [] } = args
    
    console.error(`[Kimi Ask] ${question}`)
    
    try {
      // Build context file arguments
      const contextArgs = contextFiles.map((f: string) => `--context ${f}`).join(' ')
      
      const result = execSync(
        `kimi "${question}" ${contextArgs}`,
        {
          cwd: workingDir,
          encoding: 'utf-8',
          timeout: 120000, // 2 minutes
          maxBuffer: 10 * 1024 * 1024 // 10MB
        }
      )

      return {
        content: [
          {
            type: 'text',
            text: result || 'Kimi completed the request successfully.',
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Kimi execution failed: ${error.message}\n${error.stderr || ''}`,
          },
        ],
        isError: true,
      }
    }
  }

  private async handleKimiEdit(args: any) {
    const { file, instruction, workingDir = process.cwd() } = args
    
    console.error(`[Kimi Edit] ${file}: ${instruction}`)
    
    try {
      const promptText = `Edit the file ${file}: ${instruction}`
      
      const result = execSync(
        `kimi "${promptText}"`,
        {
          cwd: workingDir,
          encoding: 'utf-8',
          timeout: 120000,
          maxBuffer: 10 * 1024 * 1024
        }
      )

      return {
        content: [
          {
            type: 'text',
            text: result || `Successfully edited ${file}`,
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Edit failed: ${error.message}`,
          },
        ],
        isError: true,
      }
    }
  }

  private async handleKimiRead(args: any) {
    const { file, workingDir = process.cwd() } = args
    
    console.error(`[Kimi Read] ${file}`)
    
    try {
      const result = execSync(
        `kimi "Read and summarize the file ${file}"`,
        {
          cwd: workingDir,
          encoding: 'utf-8',
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024
        }
      )

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Read failed: ${error.message}`,
          },
        ],
        isError: true,
      }
    }
  }

  private async handleKimiSearch(args: any) {
    const { pattern, workingDir = process.cwd() } = args
    
    console.error(`[Kimi Search] ${pattern}`)
    
    try {
      const result = execSync(
        `kimi "Search for files matching pattern: ${pattern}. List all matching files."`,
        {
          cwd: workingDir,
          encoding: 'utf-8',
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024
        }
      )

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Search failed: ${error.message}`,
          },
        ],
        isError: true,
      }
    }
  }

  private async handleKimiRun(args: any) {
    const { command, workingDir = process.cwd(), explanation = '' } = args
    
    console.error(`[Kimi Run] ${command}`)
    
    try {
      const prompt = explanation 
        ? `Run this command and explain the results: ${command}\nContext: ${explanation}`
        : `Run this command: ${command}`
      
      const result = execSync(
        `kimi "${prompt}"`,
        {
          cwd: workingDir,
          encoding: 'utf-8',
          timeout: 120000,
          maxBuffer: 10 * 1024 * 1024
        }
      )

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Command execution failed: ${error.message}\n${error.stderr || ''}`,
          },
        ],
        isError: true,
      }
    }
  }

  private async handleKimiCodebaseQuery(args: any) {
    const { query, workingDir = process.cwd() } = args
    
    console.error(`[Kimi Codebase Query] ${query}`)
    
    try {
      const result = execSync(
        `kimi "${query}"`,
        {
          cwd: workingDir,
          encoding: 'utf-8',
          timeout: 180000, // 3 minutes for codebase analysis
          maxBuffer: 10 * 1024 * 1024
        }
      )

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Codebase query failed: ${error.message}`,
          },
        ],
        isError: true,
      }
    }
  }

  async run() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.error('Kimi CLI MCP Server running on stdio')
  }
}

// Start server
const server = new KimiCLIServer()
server.run().catch(console.error)
