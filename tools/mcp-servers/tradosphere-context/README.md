# TradoSphere Context Engine MCP Server

A Model Context Protocol (MCP) server that provides intelligent search and navigation capabilities for the TradoSphere codebase.

## Quick Start

### 1. Install Dependencies

```bash
npm install --production
```

### 2. Configure Claude Desktop

Add this to your Claude Desktop configuration:

**Config Location:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux:** `~/.config/claude/claude_desktop_config.json`

**Configuration:**
```json
{
  "mcpServers": {
    "tradosphere-context": {
      "command": "node",
      "args": ["./dist/mcp/server.js"],
      "cwd": "/absolute/path/to/this/directory"
    }
  }
}
```

### 3. Restart Claude Desktop

The tools will be available immediately in any conversation.

## Available Tools

### 1. search_docs

Search TradoSphere documentation and code.

**Parameters:**
- `query` (required) - Search term
- `type` (optional) - Filter: all | docs | code | features
- `limit` (optional) - Max results (default: 10)

**Example:**
```
"Search for signal posting implementation"
```

### 2. get_feature

Get detailed information about a specific feature.

**Parameters:**
- `feature` (required) - Feature name or ID

**Example:**
```
"Get details for the Signal Posting feature"
```

### 3. list_features

List all features, optionally filtered by tier.

**Parameters:**
- `tier` (optional) - Filter: all | free | grow | elite | gladiator | legend

**Example:**
```
"List all Elite tier features"
```

### 4. find_route

Find route information by path.

**Parameters:**
- `path` (required) - Route path (e.g., /feed)

**Example:**
```
"Find route details for /feed"
```

### 5. get_stats

Get codebase statistics.

**Parameters:** None

**Example:**
```
"Show me the project statistics"
```

## Features

- **346 Documents Indexed** - Complete TradoSphere documentation
- **Feature Mapping** - Links features to routes, components, APIs, tables
- **Full-Text Search** - Fast search with relevance ranking
- **Real-Time Indexing** - Auto-indexes on first use

## Requirements

- Node.js 20+ (LTS)
- Claude Desktop
- Access to TradoSphere documentation

## Architecture

```
tradosphere-context/
├── dist/              # Compiled JavaScript
│   ├── mcp/
│   │   └── server.js  # MCP server (entry point)
│   ├── indexer/       # Document indexing
│   ├── retriever/     # Search engine
│   ├── cli/           # CLI tools
│   └── types/         # Type definitions
├── package.json
└── README.md
```

## Troubleshooting

### Server Not Starting

1. Check Node.js version: `node --version` (should be 20+)
2. Verify paths are absolute in config
3. Check file exists: `ls dist/mcp/server.js`

### No Results in Search

1. Ensure you're in a workspace with TradoSphere docs
2. Check that documentation exists in parent directories
3. Review search query syntax

### Performance Issues

1. First search may be slow (indexing)
2. Subsequent searches are cached (<50ms)
3. Check available memory (needs ~50MB)

## Performance

- **Indexing:** ~3-5 seconds (first time only)
- **Search:** <50ms (cached)
- **Memory:** ~50MB

## Version

**Version:** 1.0.0
**Built:** 2025-10-21
**Node Version:** 20+

## License

Same as TradoSphere project.
