#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import axios from 'axios';

import { findTransactionTool, handleFindTransaction } from './tools/findTransaction.js';
import { splitTransactionTool, handleSplitTransaction } from './tools/splitTransaction.js';
import { attachFileTool, handleAttachFile } from './tools/attachFile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load configuration
let config;
try {
  const configPath = join(__dirname, '..', 'config.json');
  config = JSON.parse(readFileSync(configPath, 'utf-8'));
} catch (error) {
  console.error('Error loading config.json. Please create it from config.example.json');
  process.exit(1);
}

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Authorization': `Bearer ${config.jwtToken}`,
    'Content-Type': 'application/json'
  }
});

// Create MCP server
const server = new Server(
  {
    name: 'psbfinance-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      findTransactionTool,
      splitTransactionTool,
      attachFileTool
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'find_transaction':
        return await handleFindTransaction(apiClient, args);

      case 'split_transaction':
        return await handleSplitTransaction(apiClient, args);

      case 'attach_file':
        return await handleAttachFile(apiClient, args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}\n${error.response?.data ? JSON.stringify(error.response.data, null, 2) : ''}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('psbFinance MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
