#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve, basename, sep } from 'path';
import os from 'os';
import axios from 'axios';

import { findTransactionTool, handleFindTransaction } from './tools/findTransaction.js';
import { splitTransactionTool, handleSplitTransaction } from './tools/splitTransaction.js';
import { attachFileTool, handleAttachFile, getMimeType } from './tools/attachFile.js';
import { createTransactionTool, handleCreateTransaction } from './tools/createTransaction.js';

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

const defaultAllowedPaths = [
  join(process.cwd(), 'files'),
  os.tmpdir()
];

const allowedFilePaths = (config.allowedFilePaths?.length ? config.allowedFilePaths : defaultAllowedPaths)
  .map(p => resolve(p));

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
      resources: {},
    },
  }
);

// Expose readable file roots so hosts (Claude/ChatGPT) can save uploads where we can read them
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: allowedFilePaths.map(path => ({
      uri: `file://${path}`,
      name: basename(path) || path,
      description: `Local files available for attachments under ${path}`,
      mimeType: 'application/x-directory',
    })),
  };
});

// Allow hosts to read files back (used when a user uploads an invoice)
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const url = new URL(uri);

  if (url.protocol !== 'file:') {
    throw new Error('Only file:// URIs are supported for file reads');
  }

  const filePath = resolve(fileURLToPath(url));

  if (!isPathAllowed(filePath)) {
    throw new Error(`Access to ${filePath} is not permitted. Add the directory to allowedFilePaths in config.json.`);
  }

  const stats = statSync(filePath);
  if (!stats.isFile()) {
    throw new Error(`Path is not a file: ${filePath}`);
  }

  const data = readFileSync(filePath);

  return {
    contents: [
      {
        uri,
        blob: data.toString('base64'),
        mimeType: getMimeType(filePath),
      },
    ],
  };
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      findTransactionTool,
      splitTransactionTool,
      attachFileTool,
      createTransactionTool
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

      case 'create_transaction':
        return await handleCreateTransaction(apiClient, args);

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

function isPathAllowed(pathToCheck) {
  const normalized = resolve(pathToCheck);
  return allowedFilePaths.some(base => normalized === base || normalized.startsWith(base + sep));
}
