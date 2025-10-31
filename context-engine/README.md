# TradoSphere Context Engine

A comprehensive indexing and code retrieval system for the TradoSphere project.

## Features

- **Document Indexing**: Automatically index all markdown documentation
- **Code Mapping**: Map features to routes, components, and API endpoints
- **Semantic Search**: Find relevant code and documentation quickly
- **MCP Integration**: Enhanced capabilities through Model Context Protocol
- **Real-time Updates**: Watch for file changes and re-index automatically

## Architecture

```
context-engine/
├── index.ts              # Main entry point
├── indexer/              # Document and code indexing
│   ├── doc-indexer.ts    # Documentation indexer
│   ├── code-indexer.ts   # Code file indexer
│   └── feature-mapper.ts # Feature-to-code mapper
├── retriever/            # Search and retrieval
│   ├── search.ts         # Search engine
│   ├── semantic.ts       # Semantic search
│   └── query-builder.ts  # Query construction
├── storage/              # Data storage
│   ├── index-store.ts    # Index storage
│   └── vector-store.ts   # Vector embeddings (optional)
└── mcp/                  # MCP integration
    ├── server.ts         # MCP server
    └── tools.ts          # MCP tools definition
```

## Usage

```typescript
import { ContextEngine } from './context-engine';

const engine = new ContextEngine();

// Index all documents
await engine.indexAll();

// Search for relevant code
const results = await engine.search('signal posting feature');

// Get feature details
const feature = await engine.getFeature('Signal Posting');

// Find route by path
const route = await engine.findRoute('/feed');

// Get component dependencies
const deps = await engine.getComponentDependencies('SignalCard');
```

## Installation

```bash
cd context-engine
npm install
npm run build
npm run index  # Initial indexing
```

## MCP Integration

The context engine can be exposed as an MCP server for Claude:

```json
{
  "mcpServers": {
    "tradosphere-context": {
      "command": "node",
      "args": ["./context-engine/dist/mcp/server.js"],
      "cwd": "/path/to/TradoSphere"
    }
  }
}
```
