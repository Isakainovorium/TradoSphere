# **TradoSphere:  Feature Brief & Project Synopsis**

**Date:** October 17, 2025

**Objective:** This document serves as the final, definitive feature brief for the TradeSphere web application UI. It is a synopsis of a long iterative design process and consolidates all user-approved features and layouts. This brief should be used as the primary source of truth for development.

## **1\. Project Vision & Core Concept**

TradeSphere is a premier social trading platform designed to be competitive, immersive, and data-rich. It combines social feeds, live streaming, community-driven competitions, and a powerful, AI-assisted portfolio manager to create an all-in-one ecosystem for traders. The UI prioritizes a dark theme, clean layouts, and interactive, data-dense components.

## **2\. Approved Feature Breakdown by Page**

### **Page 1: The Feed (feed.html)**

The central hub for social interaction.

* **Competitive Signal Cards:**  
  * Displays creator posts (signals).  
  * Each card has a prominent **"Hit / Miss"** score to gamify performance.  
  * A **"Win Streak"** flame icon and counter should appear for successful creators.  
  * Cards should have a visual profit-glow or loss-glow to indicate the outcome of a trade.  
* **Interactive Charts:**  
  * Each signal includes a chart canvas.  
  * **AI Feature:** The system should automatically parse the signal's text (e.g., "Entry at $X, Target at $Y") and draw these levels as labeled horizontal lines on the chart.  
  * Users must have simple **drawing tools** (cursor, line, rectangle) to add their own markup to the chart.  
* **Live Signal Chat:**  
  * Each signal card must have an embedded live chat section for real-time discussion about that specific trade.  
* **Asset Scanner Widget:**  
  * A permanent sidebar widget on the feed page.  
  * Features tabs for **Crypto, Futures, and Forex**.  
  * Displays a list of the top 20 trending assets in the selected category, each with a mini sparkline chart for at-a-glance visualization.

### **Page 2: The Live Page (live.html)**

The most immersive and feature-rich page, designed as a trading command center.

* **Core Layout:**  
  * **Collapsible Sidebar:** The main navigation sidebar must be collapsible to an icon-only view to maximize screen real estate. The collapse action must **not** cause the main content to disappear.  
  * **Top Streamer Carousel:** A horizontally scrolling carousel at the top of the page to browse currently live streamers.  
  * **Search & Filter Bar:** Positioned directly *below* the streamer carousel. Contains a search input and filter buttons for **"All Streams," "Competitions," and "TS Journals."**  
* **Main View:**  
  * **Customizable Chart Layouts:** A toggle must allow users to switch between a **multi-chart (3 TF) view** and a **single, focused chart view**.  
  * **Fullscreen Mode:** An "expand" button that hides all non-essential UI elements (sidebar, widgets, ticker) to make the chart view completely fullscreen.  
  * **Live Positions Panel:** A table below the main chart that displays the streamer's currently open trades in real time, including entry price, P/L, and an action button.  
* **Immersive Features:**  
  * **Live Market Ticker:** A continuously scrolling market price ticker at the bottom of the page.  
  * **Interactive Emoji Reactions:** Buttons in the chat that allow viewers to send animated emojis floating up over the stream.  
  * **Live Trade Action Alerts:** A professional "toast" notification that appears when a streamer closes a position, confirming the action.  
* **Gemini API Features:**  
  * **AI Chat Summary:** A "✨ Summarize Chat" button in the chat panel that uses an LLM to provide a bulleted summary of the conversation.  
  * **AI Trade Analysis:** An "Analyze" button next to each live position that opens a modal with a Gemini-powered analysis of the asset, including recent news and market sentiment, grounded with Google Search.

### **Page 3: The Portfolio Manager (2-Page Flow)**

An AI-powered trading journal inspired by TradeZella but with a unique UI.

* **Main Dashboard (portfolio-manager.html):**  
  * **Header:** Features a prominent **"Connect Broker"** button to signal the intent for API integration (Tradovate, etc.) for read-only trade tracking.  
  * **Key Metrics Section:** This section must be the **original, clean four-card layout**, displaying: Total Portfolio Value, Today's P/L, Overall P/L, and Win Rate. **It should NOT be the TradeZella-inspired layout.**  
  * **Main Content:** A two-column layout featuring a "Recent Trades" log on the left and two widgets on the right: one for the **Performance Calendar** and one for the **AI Trading Assistant**.  
* **Performance Calendar Page (performance-calendar.html):**  
  * **Navigation:** Accessible from the dashboard widget. Must contain a **"Back to Dashboard"** button for navigation.  
  * **Multi-View Functionality:** Must have filter buttons to switch between **Month (30-31 days), Week (7 days), and Day (six 4-hour blocks)** views. The calendar display must change accordingly.  
  * **Data Display:** Each cell (day or time block) should display the P/L and number of trades for that period, colored green for profit and red for loss.  
  * **Gemini API Feature:** Each calendar day with activity must have a **"✨ Analyze Day"** button. This opens a modal with an AI-powered analysis comparing the user's performance to the performance of the asset they traded that day.

### **Page 4: The Profile Page (profile.html)**

A user's public identity and content hub.

* **Reorganized Header:**  
  * The "Follow" button must be visually aligned with the "Followers" and "Subscribers" stats.  
  * The subscription price button must be **removed**.  
  * A "Share" button should open an **immersive share modal** with options for X, Facebook, Instagram, WhatsApp, Text, Direct Message, and a "Copy Link" feature.  
* **Clean Performance Stats:** A three-card layout displaying All-Time P/L, Avg. Win Rate, and Global Rank. The font size of the main stat must be scaled correctly to fit professionally within the card.  
* **Tabbed Content Area:**  
  * **Feed:** Shows the user's public posts.  
  * **Competitions:** Displays a "trophy case" grid of competitions the user has participated in, showing their rank and the prize pool.  
  * **Immersive About Page:** Features three distinct, well-designed sections for "My Story," "My Trading Style," and "My 'Why'".  
  * **Videos Tab:** A new tab displaying a YouTube-style grid of the creator's video content.

### **Page 5: Competitions Flow (Multi-Page)**

A user-driven system for creating and joining battles.

* **Main Page (competitions.html):** The hub, showing featured tournaments and community battles.  
* **Select Type (select-battle-type.html):** A page with three options: 1v1 Duel, Team Battle, and Free-for-All.  
* **Create Form (create-battle.html):** The simplified, single-page form for setting up a new battle. Includes a share modal upon successful creation.

This document represents the final state of the UI/UX design. All future development should reference these approved features.