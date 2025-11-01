# GitHub MCP - Repository Management

**Purpose:** Manage branches, PRs, issues, and releases via Claude

## Overview

GitHub MCP enables comprehensive repository management through natural language. Essential for maintaining clean git workflow and automating repetitive GitHub tasks.

## Installation

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

## Getting Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
   - `workflow` (Update GitHub Action workflows)
4. Generate token and copy
5. Add to config (keep secure!)

## TradoSphere Use Cases

### Branch Management
```
"Create feature branch: feature/signal-improvements"
"Delete merged branches from last sprint"
"Show all active feature branches"
```

### Pull Request Workflow
```
"Create PR: feature/live-streaming -> develop"
"Review PR #47 for TypeScript safety and test coverage"
"Merge PR #52 after CI passes"
"Show PRs waiting for review"
```

### Issue Tracking
```
"Create issue: P1 - Optimize leaderboard aggregation query"
"List all P1 bugs"
"Assign issue #145 to current sprint"
"Close issue #132 - fixed in PR #135"
```

### Release Management
```
"Create release v1.0.0 from main branch"
"Generate changelog since last release"
"Tag commit abc123 as v1.0.1"
```

## Example Workflows

### Feature Development Flow

```
1. Create Branch
   "Create branch feature/ai-trade-analysis from develop"

2. During Development
   "Show my current branch status"
   "List uncommitted changes"

3. Ready for Review
   "Create PR to develop with title 'Add AI-powered trade analysis'"

4. After Review
   "Merge PR #78 with squash"
   "Delete branch feature/ai-trade-analysis"
```

### Sprint Planning

```
1. Review Issues
   "List all unassigned issues labeled 'sprint-15'"

2. Prioritize
   "Show P1 issues without assignee"
   "Create issue for optimizing feed query performance"

3. Track Progress
   "Show sprint-15 issues by status"
   "List PRs merged this week"
```

### Release Preparation

```
1. Check Status
   "Show all merged PRs since v0.9.0"
   "List commits on develop not in main"

2. Create Release
   "Create release v1.0.0 from develop"
   "Generate release notes from merged PRs"

3. Deploy
   "Tag main as production-v1.0.0"
   "Create GitHub release with changelog"
```

## Advanced Commands

### Code Review

```
"Review PR #47 checking for:
- TypeScript strict mode compliance
- Test coverage >80%
- No console.logs
- Proper error handling"
```

**Output:** Detailed analysis with suggestions

### Issue Templates

```
"Create bug issue using template:
Title: Feed page crashes on scroll
Steps to reproduce: [...]
Expected: [...]
Actual: [...]
Browser: Chrome 120
Tier: Elite"
```

### Branch Protection

```
"Show branch protection rules for main"
"Require PR reviews for develop branch"
"Enable status checks for feature branches"
```

## TradoSphere Git Workflow Integration

### Branch Naming Convention

```
feature/signal-ai-parsing
fix/leaderboard-race-condition
refactor/extract-signal-service
docs/add-api-reference
chore/upgrade-next-14.2
```

**Use GitHub MCP:**
```
"Create feature branch following convention for 'add AI signal parsing'"
Result: Creates "feature/signal-ai-parsing"
```

### Commit Convention

```
feat(signals): add Gemini API integration for level parsing
fix(leaderboard): resolve race condition in score updates
docs(api): add Stripe webhook endpoint documentation
```

**GitHub MCP helps:**
```
"Show recent commits not following conventional commits format"
"Generate commit message for changes to signal parsing logic"
```

### PR Template

```
"Create PR using template:
- Description of changes
- Related issue: #145
- Testing done
- Screenshots (if UI changes)
- Checklist completed"
```

## Best Practices

1. **Use Descriptive Branches** - GitHub MCP can suggest based on issue
2. **Link PRs to Issues** - Automatically with "Closes #123"
3. **Review Before Merge** - Use MCP to check test coverage, types
4. **Clean Up Branches** - Delete merged branches regularly
5. **Semantic Versioning** - Follow semver for releases

## Security

⚠️ **Important:**
- Never commit GitHub token to repository
- Use environment variables only
- Rotate tokens periodically
- Use fine-grained tokens when possible
- Limit scope to minimum required

## Performance

- **API Rate Limit:** 5000 requests/hour (authenticated)
- **Response Time:** ~500ms per operation
- **Batch Operations:** Supported for efficiency

## Troubleshooting

### 403 Forbidden
- Check token has required scopes
- Verify token hasn't expired
- Ensure repo access permissions

### Rate Limit Exceeded
- Wait for limit reset (check headers)
- Use conditional requests for caching
- Batch operations when possible

### Branch Already Exists
- Check if branch exists remotely
- Use different naming
- Delete old branch first if appropriate

## Integration with Development Workflow

```
Plan (Sequential) → Create Branch (GitHub) →
Implement → Test (Playwright) →
Create PR (GitHub) → Review →
Merge (GitHub) → Deploy (CircleCI)
```

## Example Commands for TradoSphere

### Sprint Start
```
"Create branches for all sprint-15 issues"
"List features planned for current sprint"
```

### Daily Development
```
"Show my active branches"
"Create PR for current branch to develop"
"Check CI status for recent commits"
```

### Sprint End
```
"List all merged PRs this sprint"
"Generate sprint summary from closed issues"
"Archive completed milestone"
```

### Release
```
"Compare develop vs main branches"
"Create release v1.2.0 from develop"
"Generate changelog from PRs since v1.1.0"
```

---

**Priority:** HIGH
**When to Install:** Week 1 (Core Development)
**Velocity Impact:** 2x faster git operations, better organization
**Automation:** Reduces manual GitHub web interface usage by 80%
