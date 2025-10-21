# Figma MCP - Design-to-Code Integration

**Purpose:** Extract component code, design tokens, and assets from Figma

## Overview

Figma MCP enables seamless design-to-code workflow through Claude. Essential for maintaining design system consistency and faster component implementation.

## Installation

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@figma/mcp-server"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "your_figma_token_here"
      }
    }
  }
}
```

## Getting Access Token

1. Go to https://www.figma.com/settings
2. Scroll to "Personal Access Tokens"
3. Click "Create new token"
4. Name it "MCP Integration"
5. Copy token
6. Add to config (keep secure!)

## TradoSphere Use Cases

### Component Generation
```
"Generate React component from Figma node: signal-card-v2"
"Extract SignalComposer component structure"
"Convert CompetitionCard design to shadcn/ui component"
```

### Design Tokens
```
"Export color tokens as Tailwind config"
"Generate spacing system from design file"
"Extract typography scale"
"Get tier badge colors"
```

### Asset Export
```
"Export tier badge SVGs"
"Get achievement icons"
"Download logo variations"
"Export app icons for PWA"
```

### Design System Sync
```
"Sync button variants with Figma"
"Update color palette from design system"
"Check for design-code discrepancies"
```

## Example Operations

### Generating Signal Card Component

**Request:**
```
"Generate React component from Figma node: signal-card-design"
```

**Figma Analysis:**
```
Node: SignalCard
Type: Frame
Size: 400x280px
Children:
  - SignalHeader (Frame)
    - UserAvatar (Ellipse)
    - Username (Text)
    - TierBadge (Component)
    - Timestamp (Text)
  - TradingChart (Component)
  - SignalMetrics (Frame)
    - EntryPrice (Text + Label)
    - TargetPrice (Text + Label)
    - StopLoss (Text + Label)
  - SignalActions (Frame)
    - ReactionButtons (Component)
    - ShareButton (Component)
```

**Generated Component:**
```typescript
// components/signals/signal-card.tsx
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TradingChart } from './trading-chart';
import { formatDistance } from 'date-fns';

interface SignalCardProps {
  signal: {
    id: string;
    creator: {
      username: string;
      avatar_url: string;
      tier: string;
    };
    asset_symbol: string;
    direction: 'LONG' | 'SHORT';
    entry_price: number;
    target_price: number;
    stop_loss: number;
    posted_at: Date;
  };
}

export function SignalCard({ signal }: SignalCardProps) {
  return (
    <Card className="w-full max-w-[400px]">
      <CardHeader className="flex flex-row items-center gap-3 pb-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={signal.creator.avatar_url} />
          <AvatarFallback>{signal.creator.username[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{signal.creator.username}</span>
            <Badge variant={getTierVariant(signal.creator.tier)}>
              {signal.creator.tier}
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDistance(signal.posted_at, new Date(), { addSuffix: true })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <TradingChart
          symbol={signal.asset_symbol}
          levels={{
            entry: signal.entry_price,
            target: signal.target_price,
            stop: signal.stop_loss
          }}
        />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Entry</div>
            <div className="text-lg font-semibold">
              ${signal.entry_price.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Target</div>
            <div className="text-lg font-semibold text-profit">
              ${signal.target_price.toLocaleString()}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground">Stop</div>
            <div className="text-lg font-semibold text-loss">
              ${signal.stop_loss.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Extracting Design Tokens

**Request:**
```
"Export color tokens as Tailwind config"
```

**Figma Colors:**
```
Tier Colors:
  free: #6B7280
  grow: #10B981
  elite: #8B5CF6
  gladiator: #F59E0B
  legend: #EF4444

Trading Colors:
  profit: #00D97E
  loss: #FF3B30
  neutral: #6B7280

Background:
  dark: #0A0E27
  darker: #060818
```

**Generated Tailwind Config:**
```javascript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        tier: {
          free: '#6B7280',
          grow: '#10B981',
          elite: '#8B5CF6',
          gladiator: '#F59E0B',
          legend: '#EF4444',
        },
        trading: {
          profit: '#00D97E',
          loss: '#FF3B30',
          neutral: '#6B7280',
        },
        background: {
          dark: '#0A0E27',
          darker: '#060818',
        },
      },
      spacing: {
        unit: '8px', // Base 8px unit from Figma
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};
```

### Exporting Assets

**Request:**
```
"Export tier badge SVGs"
```

**Process:**
```
Finding tier badge components in Figma...

Found:
  - free-badge.svg
  - grow-badge.svg
  - elite-badge.svg
  - gladiator-badge.svg
  - legend-badge.svg

Exporting to: public/images/badges/

Options:
  - Format: SVG
  - Scale: 2x
  - Optimize: true
  - Color: Preserve original

Export complete:
  ✓ free-badge.svg (1.2KB)
  ✓ grow-badge.svg (1.4KB)
  ✓ elite-badge.svg (1.8KB)
  ✓ gladiator-badge.svg (2.1KB)
  ✓ legend-badge.svg (2.3KB)

Total: 8.8KB
```

### Design System Sync

**Request:**
```
"Check for design-code discrepancies in button component"
```

**Analysis:**
```
Button Component Comparison
===========================

Figma Design:
  Variants: primary, secondary, ghost, danger
  Sizes: sm (32px), md (40px), lg (48px)
  Border Radius: 8px
  Font Weight: 600

Current Code (components/ui/button.tsx):
  Variants: default, secondary, outline, ghost, destructive
  Sizes: sm, default, lg
  Border Radius: var(--radius) = 0.5rem (8px)
  Font Weight: 500

Discrepancies Found:
  1. Variant naming:
     - Figma: "primary" → Code: "default"
     - Figma: "danger" → Code: "destructive"

  2. Font weight:
     - Figma: 600 → Code: 500
     - Impact: Buttons appear lighter than design

  3. Missing variant:
     - Figma has "danger" variant
     - Code missing equivalent

Recommendations:
  1. Rename "default" → "primary" for consistency
  2. Update font-weight to 600
  3. Ensure all variants match Figma
```

## TradoSphere Design System

### Component Categories

```yaml
Core UI:
  - Button (primary, secondary, ghost, danger)
  - Input (text, number, email)
  - Card (default, elevated, bordered)
  - Badge (tier, status, count)
  - Avatar (user, creator)

Trading Components:
  - SignalCard (active, hit, miss)
  - TradingChart (lightweight, advanced)
  - PriceLevel (entry, target, stop)
  - PerformanceMetric (pnl, winRate, sharpe)

Social Components:
  - ProfileCard
  - ChatMessage
  - EmojiReaction
  - FollowButton

Competition Components:
  - CompetitionCard
  - LeaderboardRow
  - PrizePoolDisplay
  - EntryButton
```

### Typography Scale

```css
/* From Figma typography system */
.text-xs { font-size: 12px; line-height: 16px; }
.text-sm { font-size: 14px; line-height: 20px; }
.text-base { font-size: 16px; line-height: 24px; }
.text-lg { font-size: 18px; line-height: 28px; }
.text-xl { font-size: 20px; line-height: 28px; }
.text-2xl { font-size: 24px; line-height: 32px; }
.text-3xl { font-size: 30px; line-height: 36px; }
```

## Best Practices

1. **Keep Figma Organized** - Use clear naming for components
2. **Version Designs** - Tag releases to match code versions
3. **Document Tokens** - Maintain design token documentation
4. **Sync Regularly** - Check for discrepancies weekly
5. **Use Auto Layout** - Easier to convert to Flexbox

## Troubleshooting

### Can't Access Design File
- Check Figma sharing permissions
- Verify access token is valid
- Ensure file URL is correct

### Component Export Failed
- Check component is properly named
- Verify node ID is correct
- Review export settings

### Design Tokens Mismatch
- Compare Figma version with code
- Check for recent design changes
- Review token naming conventions

## Integration with Development Flow

```
Design in Figma → Review Design →
Extract Component (Figma MCP) →
Implement in Code → Review Code →
Update Figma if Needed → Sync Tokens
```

---

**Priority:** LOW
**When to Install:** Week 3 (Domain Tools)
**Velocity Impact:** 2x faster component implementation
**Quality Impact:** Better design-code consistency
**Designer-Developer Collaboration:** Seamless handoff
