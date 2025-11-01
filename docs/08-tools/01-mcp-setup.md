# TradoSphere MCP Integration Guide

This guide explains how to set up and use Model Context Protocol (MCP) tools with TradoSphere.

## What is MCP?

Model Context Protocol (MCP) is an open protocol that allows AI assistants like Claude to access external tools and data sources. For TradoSphere, MCP enables:

- **Intelligent Code Search**: Search through all documentation and code
- **Feature Discovery**: Find features, routes, components, and APIs
- **Project Navigation**: Understand the codebase structure instantly
- **Context Retrieval**: Get relevant information for any task

## Available MCP Servers

### 1. TradoSphere Context Engine (Built-in)

Located in `/context-engine`, this custom MCP server provides:

**Tools:**
- `search_docs` - Search all documentation and code
- `get_feature` - Get detailed feature information
- `list_features` - List all features with filters
- `find_route` - Find route information
- `get_stats` - Get codebase statistics

**Setup:**
```json
{
  "mcpServers": {
    "tradosphere-context": {
      "command": "node",
      "args": ["/path/to/TradoSphere/context-engine/dist/mcp/server.js"],
      "cwd": "/path/to/TradoSphere/context-engine"
    }
  }
}
```

### 2. Recommended External MCP Servers

Based on the MCP architecture documentation, here are the recommended external servers:

#### Exa Search (Technical Research)
```json
{
  "mcpServers": {
    "exa": {
      "command": "npx",
      "args": ["-y", "@exa/mcp-server"],
      "env": {
        "EXA_API_KEY": "your_exa_api_key_here"
      }
    }
  }
}
```

**Use for:**
- Finding Next.js 14 patterns
- TradingView Charting examples
- NestJS architecture patterns

#### GitHub MCP (Repository Management)
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

**Use for:**
- Creating branches and PRs
- Managing issues
- Code reviews

#### Memory MCP (Context Persistence)
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

**Use for:**
- Maintaining context across sessions
- Storing architectural decisions
- Tracking technical debt

#### Supabase MCP (Database Management)
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_KEY": "your_service_key_here"
      }
    }
  }
}
```

**Use for:**
- Schema migrations
- RLS policy management
- Query optimization

#### Playwright MCP (E2E Testing)
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

**Use for:**
- Generating E2E tests
- Running test suites
- Test debugging

## Complete Claude Desktop Configuration

1. **Locate Config File:**

   **macOS:**
   ```bash
   ~/Library/Application Support/Claude/claude_desktop_config.json
   ```

   **Windows:**
   ```bash
   %APPDATA%\Claude\claude_desktop_config.json
   ```

   **Linux:**
   ```bash
   ~/.config/claude/claude_desktop_config.json
   ```

2. **Add Configuration:**

```json
{
  "mcpServers": {
    "tradosphere-context": {
      "command": "node",
      "args": ["/path/to/TradoSphere/context-engine/dist/mcp/server.js"],
      "cwd": "/path/to/TradoSphere/context-engine"
    },
    "exa": {
      "command": "npx",
      "args": ["-y", "@exa/mcp-server"],
      "env": {
        "EXA_API_KEY": "your_exa_api_key"
      }
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token"
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_KEY": "your_service_key"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

3. **Restart Claude Desktop**

## Getting API Keys

### Exa API Key
1. Visit https://exa.ai/
2. Sign up for an account
3. Navigate to API settings
4. Generate an API key
5. Add to config: `"EXA_API_KEY": "your_key"`

### GitHub Token
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:org`
4. Add to config: `"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token"`

### Supabase Credentials
1. Open Supabase Dashboard
2. Go to Settings → API
3. Copy Project URL and service_role key
4. Add to config

## Using MCP Tools with Claude

Once configured, you can ask Claude:

**Search Documentation:**
```
"Search for signal posting implementation"
"Find database schema for competitions"
"Show me authentication routes"
```

**Get Feature Details:**
```
"Get details for the live streaming feature"
"What components are used in the feed page?"
"List all Elite tier features"
```

**Research Patterns:**
```
"Find Next.js 14 WebSocket patterns using Exa"
"Search for TradingView Charting examples"
```

**Manage Repository:**
```
"Create branch feature/signal-improvements"
"Show recent commits on develop"
"Create PR for current branch"
```

## Verification

To verify MCP servers are working:

1. Open Claude Desktop
2. Start a new conversation
3. Look for the tools icon (🔧) in the input area
4. You should see all configured MCP tools available

## Troubleshooting

### Server Not Starting
- Check that paths are absolute, not relative
- Verify Node.js is in PATH
- Check permissions on MCP server files

### Tools Not Appearing
- Restart Claude Desktop completely
- Check JSON syntax in config file
- Review Claude Desktop logs

### Permission Errors
- Ensure API keys are correct
- Check network connectivity
- Verify file permissions

## Performance Tips

1. **Pre-index Context Engine:**
   ```bash
   cd context-engine
   npm run index
   ```

2. **Use Specific Queries:**
   - Good: "Find signal posting feature implementation"
   - Bad: "Show me everything about signals"

3. **Cache Results:**
   - Memory MCP automatically caches important information
   - Reuse previous searches when possible

## Recommended Workflow

1. **Start of Session:**
   - Ask Claude to search for relevant documentation
   - Get feature details you'll be working on
   - Check current sprint status

2. **During Development:**
   - Use Exa to find implementation patterns
   - Search context engine for related code
   - Create branches and PRs via GitHub MCP

3. **Testing:**
   - Generate Playwright tests
   - Run test suites
   - Debug failures

4. **End of Session:**
   - Store decisions in Memory MCP
   - Create issues for follow-up
   - Update documentation

## Advanced: Custom MCP Server Development

To extend the TradoSphere context engine:

1. **Add New Tool:**
   ```typescript
   // In src/mcp/server.ts
   {
     name: 'my_custom_tool',
     description: 'Description',
     inputSchema: { /* ... */ }
   }
   ```

2. **Implement Handler:**
   ```typescript
   case 'my_custom_tool': {
     // Implementation
     return { content: [{ type: 'text', text: result }] };
   }
   ```

3. **Rebuild:**
   ```bash
   npm run build
   ```

4. **Restart Claude Desktop**

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP GitHub](https://github.com/modelcontextprotocol)
- [Available MCP Servers](https://github.com/modelcontextprotocol/servers)
- [TradoSphere MCP Architecture Doc](./tradosphere-mcp-architecture.md)

## Support

For issues with:
- **TradoSphere Context Engine**: Check `/context-engine/README.md`
- **External MCP Servers**: Visit their respective GitHub repositories
- **Claude Desktop MCP**: Check Anthropic's documentation
