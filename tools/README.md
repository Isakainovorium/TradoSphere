# TradoSphere MCP Tools

This branch contains compiled MCP (Model Context Protocol) tools for TradoSphere development.

## Available Tools

### TradoSphere Context Engine

**Location:** `tools/mcp-servers/tradosphere-context/`

A comprehensive indexing and code retrieval system that provides intelligent search and navigation capabilities through all TradoSphere documentation and code.

**Features:**
- Full-text search across all documentation
- Feature-to-code mapping (routes, components, APIs, DB tables)
- MCP server for Claude Desktop integration
- 5 tools: search_docs, get_feature, list_features, find_route, get_stats

**Installation:**

1. **Install Dependencies:**
   ```bash
   cd tools/mcp-servers/tradosphere-context
   npm install --production
   ```

2. **Configure Claude Desktop:**

   Add to your Claude Desktop config file:

   **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   **Linux:** `~/.config/claude/claude_desktop_config.json`

   ```json
   {
     "mcpServers": {
       "tradosphere-context": {
         "command": "node",
         "args": ["./dist/mcp/server.js"],
         "cwd": "/path/to/TradoSphere/tools/mcp-servers/tradosphere-context"
       }
     }
   }
   ```

3. **Restart Claude Desktop**

## Usage

Once configured, Claude can use these tools:

### search_docs
Search TradoSphere documentation and code.

```
"Search for signal posting implementation"
"Find database schema for competitions"
```

### get_feature
Get detailed information about a specific feature.

```
"Get details for the live streaming feature"
"What components are used in the feed page?"
```

### list_features
List all features, optionally filtered by tier.

```
"List all Elite tier features"
"Show all features in the competition system"
```

### find_route
Find route information by path.

```
"Find route details for /feed"
"What type is the /live/[streamId] route?"
```

### get_stats
Get codebase statistics.

```
"Show me the project statistics"
"How many documents are indexed?"
```

## MCP Tools

### What is MCP?

Model Context Protocol (MCP) is an open protocol that allows AI assistants like Claude to access external tools and data sources.

### Available MCP Tools

1. **TradoSphere Context Engine** (this repository)
   - Custom tool for TradoSphere project navigation
   - 5 specialized tools for code exploration

2. **External MCP Servers** (recommended)
   - **Exa Search** - Technical research agent
   - **GitHub** - Repository management
   - **Memory** - Context persistence
   - **Supabase** - Database management
   - **Playwright** - E2E test automation

## Architecture

```
tools/
└── mcp-servers/
    └── tradosphere-context/
        ├── dist/              # Compiled JavaScript
        │   ├── mcp/
        │   │   └── server.js  # MCP server entry point
        │   ├── indexer/
        │   ├── retriever/
        │   └── cli/
        ├── package.json
        └── package-lock.json
```

## Requirements

- Node.js 20+ (LTS)
- Claude Desktop (for MCP integration)
- Access to TradoSphere documentation (stored locally)

## Build from Source

If you need to rebuild the tools:

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd TradoSphere
   ```

2. **Switch to main branch:**
   ```bash
   git checkout main  # or develop
   ```

3. **Build context engine:**
   ```bash
   cd context-engine
   npm install
   npm run build
   ```

4. **Copy to tools:**
   ```bash
   cp -r dist ../tools/mcp-servers/tradosphere-context/
   ```

## Troubleshooting

### MCP Server Not Starting

- Verify Node.js is installed: `node --version`
- Check that paths in config are absolute
- Ensure `dist/mcp/server.js` exists

### Tools Not Appearing in Claude

- Restart Claude Desktop completely
- Check JSON syntax in config file
- Review Claude Desktop logs

### Permission Errors

- Ensure execute permissions: `chmod +x dist/mcp/server.js`
- Check file ownership
- Verify Claude Desktop has access to the directory

## Performance

- **Indexing Time:** ~3-5 seconds for 346 documents
- **Search Time:** <50ms for most queries
- **Memory Usage:** ~50MB indexed data

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Claude Desktop MCP documentation
3. Consult the main TradoSphere documentation (if you have access)

## License

Same as TradoSphere project license.

---

**Version:** 1.0.0
**Last Updated:** 2025-10-21
