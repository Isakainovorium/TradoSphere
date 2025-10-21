#!/usr/bin/env node
/**
 * MCP Server for TradoSphere Context Engine
 * Exposes context engine capabilities to Claude via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { ContextEngine } from '../index.js';

// Initialize context engine
const engine = new ContextEngine();
let isIndexed = false;

// Define MCP tools
const tools: Tool[] = [
  {
    name: 'search_docs',
    description: 'Search TradoSphere documentation and code. Returns relevant documents, features, routes, and components.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "signal posting", "authentication", "database schema")'
        },
        type: {
          type: 'string',
          enum: ['all', 'docs', 'code', 'features'],
          description: 'Type of content to search',
          default: 'all'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results',
          default: 10
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_feature',
    description: 'Get detailed information about a specific TradoSphere feature including routes, components, APIs, and database tables.',
    inputSchema: {
      type: 'object',
      properties: {
        feature: {
          type: 'string',
          description: 'Feature name or ID (e.g., "Signal Posting", "feature-9")'
        }
      },
      required: ['feature']
    }
  },
  {
    name: 'list_features',
    description: 'List all features in TradoSphere, optionally filtered by tier.',
    inputSchema: {
      type: 'object',
      properties: {
        tier: {
          type: 'string',
          enum: ['all', 'free', 'grow', 'elite', 'gladiator', 'legend'],
          description: 'Filter by user tier',
          default: 'all'
        }
      }
    }
  },
  {
    name: 'find_route',
    description: 'Find route information by path (e.g., /feed, /live/[streamId]).',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Route path'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'get_stats',
    description: 'Get statistics about the TradoSphere codebase (documents, features, routes, etc.).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Create MCP server
const server = new Server(
  {
    name: 'tradosphere-context',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// Handle tool list requests
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // Ensure index is loaded
  if (!isIndexed) {
    console.error('Indexing TradoSphere documentation...');
    await engine.indexAll();
    isIndexed = true;
  }

  try {
    switch (name) {
      case 'search_docs': {
        const { query, type = 'all', limit = 10 } = args as any;
        const results = await engine.search({ query, type, limit });

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              query,
              totalResults: results.length,
              results: results.map(r => ({
                title: r.title,
                path: r.path,
                type: r.type,
                snippet: r.snippet,
                score: r.score
              }))
            }, null, 2)
          }]
        };
      }

      case 'get_feature': {
        const { feature } = args as any;
        const featureData = engine.getFeature(feature);

        if (!featureData) {
          return {
            content: [{
              type: 'text',
              text: `Feature "${feature}" not found.`
            }]
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(featureData, null, 2)
          }]
        };
      }

      case 'list_features': {
        const { tier = 'all' } = args as any;
        const features = tier === 'all'
          ? engine.getAllFeatures()
          : engine.getFeaturesByTier(tier);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              tier,
              totalFeatures: features.length,
              features: features.map(f => ({
                id: f.id,
                name: f.name,
                route: f.route,
                tierAccess: f.tierAccess,
                status: f.status
              }))
            }, null, 2)
          }]
        };
      }

      case 'find_route': {
        const { path } = args as any;
        const route = engine.findRoute(path);

        if (!route) {
          return {
            content: [{
              type: 'text',
              text: `Route "${path}" not found.`
            }]
          };
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(route, null, 2)
          }]
        };
      }

      case 'get_stats': {
        const stats = engine.getStats();

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(stats, null, 2)
          }]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('TradoSphere Context MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
