# TradoSphere: Complete App Router Architecture
*All 72+ Features Mapped to Routes with Technical Specifications*

## 📐 Architectural Philosophy

This routing architecture implements **progressive enhancement** through Next.js 14 App Router, where each route serves dual purposes:
1. **Server-rendered initial state** (SEO, performance, UX)
2. **Client-side interactivity** (real-time updates, animations)

---

## 🗺️ Complete Feature-to-Route Mapping

### Authentication Routes (7 Features)

| # | Feature | Route | Type | Key Components | Tier Access |
|---|---------|-------|------|----------------|-------------|
| 1 | Email/Password Login | `/login` | Server | Login form, OAuth buttons | Public |
| 2 | User Registration | `/signup` | Server | Multi-step form, validation | Public |
| 3 | Email Verification | `/verify-email` | Server | Token verification | Public |
| 4 | Password Reset | `/reset-password` | Server | Reset flow, token validation | Public |
| 5 | OAuth (Google/Twitter) | `/api/auth/[...nextauth]` | API | NextAuth handlers | Public |
| 6 | 2FA Setup | `/settings/security` | Client | TOTP QR generation | All tiers |
| 7 | Session Management | `/settings/security` | Hybrid | Active sessions list | All tiers |

**Technical Specifications:**
```typescript
// app/(auth)/login/page.tsx
import { AuthForm } from '@/components/auth/auth-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | TradoSphere',
  description: 'Access your trading community'
};

export default function LoginPage() {
  return (
    <div className="auth-container">
      <AuthForm mode="login" />
    </div>
  );
}
```

---

### Feed & Signal Features (12 Features)

| # | Feature | Route | Type | Key Components | Tier Access |
|---|---------|-------|------|----------------|-------------|
| 8 | Main Signal Feed | `/feed` | Server | InfiniteScroll, SignalCard | All tiers |
| 9 | Signal Posting | `/feed` (modal) | Client | SignalComposer, ChartDrawing | Grow+ |
| 10 | AI Level Parsing | API integration | API | Gemini parser, TradingView API | Grow+ |
| 11 | Hit/Miss Tracking | SignalCard component | Client | Status badge, outcome modal | All tiers |
| 12 | Win Streak Display | SignalCard component | Client | Flame icon, counter animation | All tiers |
| 13 | Signal Charts | SignalCard embed | Client | TradingView Lightweight | All tiers |
| 14 | Drawing Tools | Signal detail modal | Client | TradingView Charting Library | Grow+ |
| 15 | Live Signal Chat | SignalCard embed | Client | Socket.io chat, reactions | All tiers |
| 16 | Asset Scanner Widget | Feed sidebar | Client | Tabbed widget, sparklines | All tiers |
| 17 | Signal Detail View | `/signal/[id]` | Server | Full chart, analysis panel | All tiers |
| 18 | Signal Updates | Real-time | WebSocket | Supabase Realtime subscriptions | All tiers |
| 19 | Signal Filtering | `/feed?filter=...` | Server | Query params, server components | All tiers |

**Technical Specifications:**
```typescript
// app/(platform)/feed/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { SignalCard } from '@/components/signals/signal-card';
import { AssetScanner } from '@/components/widgets/asset-scanner';

export default async function FeedPage({
  searchParams
}: {
  searchParams: { filter?: string; asset?: string }
}) {
  const supabase = createServerClient();
  
  // Server-side data fetching with filters
  let query = supabase
    .from('signals')
    .select(`
      *,
      creator:profiles(id, username, avatar_url, tier),
      engagement:signal_engagement(count)
    `)
    .order('posted_at', { ascending: false })
    .limit(20);
    
  if (searchParams.filter === 'following') {
    const { data: { user } } = await supabase.auth.getUser();
    query = query.in('creator_id', /* followed creator IDs */);
  }
  
  if (searchParams.asset) {
    query = query.eq('asset_symbol', searchParams.asset);
  }
  
  const { data: signals } = await query;

  return (
    <div className="feed-layout">
      <main className="feed-main">
        <FeedHeader />
        <SignalList signals={signals} />
      </main>
      <aside className="feed-sidebar">
        <AssetScanner />
      </aside>
    </div>
  );
}

// components/signals/signal-card.tsx (Client Component)
'use client';
import { useEffect, useState } from 'react';
import { createClientClient } from '@/lib/supabase/client';

export function SignalCard({ signal: initial }: { signal: Signal }) {
  const [signal, setSignal] = useState(initial);
  const supabase = createClientClient();

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel(`signal-${signal.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'signals',
        filter: `id=eq.${signal.id}`
      }, (payload) => setSignal(payload.new as Signal))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [signal.id]);

  return (
    <Card className={`signal-card status-${signal.status}`}>
      <SignalHeader signal={signal} />
      <TradingChart signal={signal} />
      <SignalMetrics signal={signal} />
      <SignalChat signalId={signal.id} />
    </Card>
  );
}
```

---

### Live Streaming Features (15 Features)

| # | Feature | Route | Type | Key Components | Tier Access |
|---|---------|-------|------|----------------|-------------|
| 20 | Live Stream Hub | `/live` | Server | StreamGrid, filters | All tiers |
| 21 | Individual Stream | `/live/[streamId]` | Hybrid | StreamPlayer, multi-chart | All tiers |
| 22 | Stream Hosting | `/live/start` | Client | Stream setup, Agora init | Elite+ |
| 23 | Streamer Carousel | `/live` component | Client | Horizontal scroll, live badges | All tiers |
| 24 | Multi-Chart Layout | Stream page | Client | 3TF sync, layout switcher | All tiers |
| 25 | Fullscreen Mode | Stream page | Client | UI hide/show, keyboard controls | All tiers |
| 26 | Collapsible Sidebar | Layout wrapper | Client | Animate width, persist state | All tiers |
| 27 | Live Positions Table | Stream component | Client | Real-time updates, P/L calc | All tiers |
| 28 | Emoji Reactions | Stream overlay | Client | Framer Motion animations | All tiers |
| 29 | Live Chat | Stream sidebar | Client | Socket.io messages, moderation | All tiers |
| 30 | AI Chat Summary | Chat panel | Client | Gemini summarization | Grow+ |
| 31 | AI Trade Analysis | Position row | Client | Gemini + Google Search | Elite+ |
| 32 | Stream Recording | Backend | Job | Agora cloud recording | Elite+ |
| 33 | Market Ticker | Stream footer | Client | WebSocket prices, scroll | All tiers |
| 34 | Stream Search/Filter | `/live?filter=...` | Server | Competition/TS Journal filter | All tiers |

**Technical Specifications:**
```typescript
// app/(platform)/live/[streamId]/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { StreamPlayer } from '@/components/live/stream-player';
import { MultiChartLayout } from '@/components/live/multi-chart-layout';
import { LivePositionsTable } from '@/components/live/positions-table';
import { ChatPanel } from '@/components/live/chat-panel';

export default async function StreamPage({
  params
}: {
  params: { streamId: string }
}) {
  const supabase = createServerClient();
  
  // Fetch stream metadata
  const { data: stream } = await supabase
    .from('streams')
    .select(`
      *,
      creator:profiles(*)
    `)
    .eq('id', params.streamId)
    .single();

  if (!stream) return notFound();

  return (
    <div className="stream-layout">
      <StreamHeader stream={stream} />
      <div className="stream-content">
        <main className="stream-main">
          <StreamPlayer streamId={stream.id} creatorId={stream.creator_id} />
          <MultiChartLayout symbol={stream.current_symbol} />
          <LivePositionsTable streamId={stream.id} />
        </main>
        <aside className="stream-sidebar">
          <ChatPanel streamId={stream.id} />
        </aside>
      </div>
      <MarketTicker />
    </div>
  );
}

// components/live/stream-player.tsx
'use client';
import { useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { useStreamToken } from '@/lib/hooks/use-stream-token';

export function StreamPlayer({ streamId, creatorId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { token } = useStreamToken(streamId);
  
  useEffect(() => {
    if (!token || !containerRef.current) return;
    
    const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    
    async function joinStream() {
      await client.join(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        streamId,
        token,
        null
      );
      
      client.setClientRole('audience');
      
      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') {
          user.videoTrack?.play(containerRef.current!);
        }
        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });
    }
    
    joinStream();
    
    return () => { client.leave(); };
  }, [streamId, token]);

  return (
    <div ref={containerRef} className="stream-player" />
  );
}
```

---

### Portfolio Manager Features (10 Features)

| # | Feature | Route | Type | Key Components | Tier Access |
|---|---------|-------|------|----------------|-------------|
| 35 | Portfolio Dashboard | `/portfolio` | Server | MetricsCards, RecentTrades | Free |
| 36 | Performance Calendar | `/portfolio/calendar` | Hybrid | CalendarView, multi-view | Grow+ |
| 37 | AI Calendar Analysis | Calendar cell action | Client | Gemini day comparison | Grow+ |
| 38 | Trade Log | `/portfolio/trades` | Server | TradeTable, filters | Free |
| 39 | Trade Detail View | `/portfolio/trades/[id]` | Server | TradeDetail, charts | Free |
| 40 | Manual Trade Entry | Modal/form | Client | TradeForm, validation | Free |
| 41 | Broker API Connection | `/settings/connections` | Hybrid | OAuth flow, Tradovate | Grow+ |
| 42 | Auto Trade Sync | Background job | Job | Broker API polling | Grow+ |
| 43 | P/L Calculations | Real-time | Client | Risk/reward, Sharpe ratio | Free |
| 44 | Journal Privacy Toggle | Portfolio settings | Client | Public/private switch | All tiers |

**Technical Specifications:**
```typescript
// app/(platform)/portfolio/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { MetricsCards } from '@/components/portfolio/metrics-cards';
import { RecentTrades } from '@/components/portfolio/recent-trades';
import { PerformanceWidget } from '@/components/portfolio/performance-widget';

export default async function PortfolioPage() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Aggregate portfolio metrics
  const { data: trades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user?.id)
    .order('closed_at', { ascending: false });
    
  const metrics = calculatePortfolioMetrics(trades);

  return (
    <div className="portfolio-layout">
      <PortfolioHeader />
      <MetricsCards metrics={metrics} />
      <div className="portfolio-grid">
        <RecentTrades trades={trades.slice(0, 10)} />
        <PerformanceWidget />
        <AIAssistant />
      </div>
    </div>
  );
}

// app/(platform)/portfolio/calendar/page.tsx
import { PerformanceCalendar } from '@/components/portfolio/calendar-view';

export default async function CalendarPage({
  searchParams
}: {
  searchParams: { view?: 'month' | 'week' | 'day' }
}) {
  const view = searchParams.view || 'month';
  
  return (
    <div className="calendar-page">
      <CalendarHeader view={view} />
      <PerformanceCalendar view={view} />
    </div>
  );
}
```

---

### Competition Features (11 Features)

| # | Feature | Route | Type | Key Components | Tier Access |
|---|---------|-------|------|----------------|-------------|
| 45 | Competition Hub | `/competitions` | Server | CompetitionGrid, featured | All tiers |
| 46 | Competition Detail | `/competitions/[id]` | Server | Details, rules, participants | All tiers |
| 47 | Live Leaderboard | `/competitions/[id]/leaderboard` | Hybrid | Real-time rankings | All tiers |
| 48 | Create Competition | `/competitions/create` | Multi-step | Wizard flow, preview | Gladiator+ |
| 49 | Select Type | `/competitions/create/type` | Client | 1v1/Team/FFA selector | Gladiator+ |
| 50 | Configure Settings | `/competitions/create/configure` | Client | Rules, prize, duration | Gladiator+ |
| 51 | Join Competition | Competition page action | Client | Payment flow, confirmation | Tier-based |
| 52 | Competition Scoring | Background | Job | Real-time score calculation | N/A |
| 53 | Prize Distribution | Cron job | Job | Stripe payouts, Legends Pool | N/A |
| 54 | Competition Chat | Competition page | Client | Socket.io chat | All tiers |
| 55 | Competition Replay | `/competitions/[id]/replay` | Hybrid | Time-travel leaderboard | All tiers |

**Technical Specifications:**
```typescript
// app/(platform)/competitions/[id]/leaderboard/page.tsx
import { createServerClient } from '@/lib/supabase/server';
import { LeaderboardTable } from '@/components/competitions/leaderboard-table';

export default async function LeaderboardPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createServerClient();
  
  // Initial leaderboard state (server-rendered)
  const { data: rankings } = await supabase
    .from('competition_participants')
    .select(`
      *,
      user:profiles(username, avatar_url, tier)
    `)
    .eq('competition_id', params.id)
    .order('score', { ascending: false });

  return (
    <div className="leaderboard-page">
      <LeaderboardHeader competitionId={params.id} />
      <LeaderboardTable 
        initialRankings={rankings} 
        competitionId={params.id}
        enableRealtime={true}
      />
    </div>
  );
}

// Real-time leaderboard updates
'use client';
export function LeaderboardTable({ initialRankings, competitionId }: Props) {
  const [rankings, setRankings] = useState(initialRankings);
  
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL!);
    
    socket.on(`competition:${competitionId}:update`, (update) => {
      setRankings(prev => updateRankings(prev, update));
    });
    
    return () => { socket.disconnect(); };
  }, [competitionId]);
  
  return (
    <Table>
      {rankings.map((participant, index) => (
        <LeaderboardRow key={participant.id} rank={index + 1} {...participant} />
      ))}
    </Table>
  );
}
```

---

### Profile & Social Features (8 Features)

| # | Feature | Route | Type | Key Components | Tier Access |
|---|---------|-------|------|----------------|-------------|
| 56 | User Profile | `/profile/[username]` | Server | ProfileHeader, tabs | All tiers |
| 57 | Profile Signals Tab | `/profile/[username]/signals` | Server | SignalGrid, pagination | All tiers |
| 58 | Trophy Case Tab | `/profile/[username]/competitions` | Server | CompetitionGrid | All tiers |
| 59 | About Tab | `/profile/[username]/about` | Server | Story, style, why | All tiers |
| 60 | Videos Tab | `/profile/[username]/videos` | Server | VideoGrid, YouTube embed | All tiers |
| 61 | Share Modal | Profile action | Client | Multi-platform sharing | All tiers |
| 62 | Follow/Unfollow | Profile action | Client | Optimistic updates | All tiers |
| 63 | Subscribe Modal | Profile action | Client | Stripe checkout, tiers | All tiers |

---

### Buddies & Social Features (6 Features)

| # | Feature | Route | Type | Key Components | Tier Access |
|---|---------|-------|------|----------------|-------------|
| 64 | Friends List | `/buddies` | Server | FriendList, search | All tiers |
| 65 | Direct Messages | `/buddies/messages` | Hybrid | MessageList, inbox | All tiers |
| 66 | Message Thread | `/buddies/messages/[id]` | Hybrid | ThreadView, Socket.io | All tiers |
| 67 | Clans | `/buddies/clans` | Server | ClanList, management | Elite+ |
| 68 | Clan Page | `/buddies/clans/[id]` | Server | ClanDetail, members | All tiers |
| 69 | Shared Watchlists | `/buddies/watchlists` | Hybrid | WatchlistGrid, collab | All tiers |

---

### Leaderboards Features (3 Features)

| # | Feature | Route | Type | Key Components | Tier Access |
|---|---------|-------|------|----------------|-------------|
| 70 | Global Leaderboards | `/leaderboards` | Server | Tabs, category switcher | All tiers |
| 71 | Performance Rankings | `/leaderboards/performance` | Server | P/L, win rate tables | All tiers |
| 72 | Influence Rankings | `/leaderboards/influence` | Server | Followers, growth tables | All tiers |

---

### Learning Hub Features (2 Features)

| # | Feature | Route | Type | Key Components | Tier Access |
|---|---------|-------|------|----------------|-------------|
| 73 | Learning Hub | `/learning` | Hybrid | Q&A interface, Gemini | Grow+ |
| 74 | Saved Concepts | `/learning/journal` | Server | ConceptList, search | Grow+ |

---

### Settings Hub Features (8 Features)

| # | Feature | Route | Type | Key Components | Tier Access |
|---|---------|-------|------|----------------|-------------|
| 75 | Profile Settings | `/settings/profile` | Hybrid | Form, avatar upload | All tiers |
| 76 | Subscription Management | `/settings/subscription` | Hybrid | Tier selector, Stripe | All tiers |
| 77 | Theme Customization | `/settings/theme` | Client | Theme switcher, layout presets | All tiers |
| 78 | Notification Preferences | `/settings/notifications` | Hybrid | Channel toggles, events | All tiers |
| 79 | Security Settings | `/settings/security` | Hybrid | 2FA, sessions, password | All tiers |
| 80 | Connections | `/settings/connections` | Hybrid | Broker API, social auth | Grow+ |
| 81 | Creator Settings | `/settings/creator` | Hybrid | Stripe Connect, pricing | Elite+ |
| 82 | Stealth Mode | `/settings/profile` | Client | Visibility toggle | Gladiator+ |

---

### Creator Dashboard Features (6 Features)

| # | Feature | Route | Type | Key Components | Tier Access |
|---|---------|-------|------|----------------|-------------|
| 83 | Creator Dashboard | `/creator/dashboard` | Server | Analytics overview | Elite+ |
| 84 | Deep Analytics | `/creator/analytics` | Hybrid | Charts, benchmarking | Elite+ |
| 85 | Content Manager | `/creator/content` | Hybrid | Signal list, edit/delete | Elite+ |
| 86 | Subscriber CRM | `/creator/subscribers` | Server | Subscriber list, spotlight | Elite+ |
| 87 | Earnings Dashboard | `/creator/earnings` | Server | Revenue, payouts, history | Elite+ |
| 88 | Content Scheduler | `/creator/schedule` | Hybrid | Calendar, scheduling | Elite+ |

---

## 📊 Route Performance Targets

```yaml
Server Routes (SSR):
  Feed: <2s TTFB
  Profile: <1.5s TTFB
  Competitions: <2s TTFB
  
Client Routes (CSR):
  Live streaming: <500ms interaction
  Chat: <100ms message send
  Leaderboards: <1s real-time update
  
Hybrid Routes:
  Portfolio: <1s initial + real-time updates
  Settings: <500ms save confirmation
```

---

## 🔐 Route Protection Strategy

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  if (pathname.startsWith('/api/auth') || 
      pathname === '/login' || 
      pathname === '/signup') {
    return NextResponse.next();
  }
  
  // Protected routes - require authentication
  if (pathname.startsWith('/feed') ||
      pathname.startsWith('/portfolio') ||
      pathname.startsWith('/competitions')) {
    return requireAuth(request);
  }
  
  // Tier-restricted routes
  if (pathname.startsWith('/creator')) {
    return requireTier(request, ['elite', 'gladiator', 'legend']);
  }
  
  if (pathname.startsWith('/competitions/create')) {
    return requireTier(request, ['gladiator', 'legend']);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
```

---

**Total Features: 88 distinct features mapped across 50+ routes**

**Next Document: Development Scope & Sprint Planning**