# **TradoSphere Feature Brief: The Settings Hub**

Date: October 17, 2025  
Parent Document: TradoSphere: Final Feature Brief & Project Synopsis  
Status: Proposed

## **1\. Project Vision & Core Concept**

The Settings Hub is the central control panel for a user's entire TradeSphere identity and experience. It transcends basic account management by providing deep customization over the platform's interface, data flow, and privacy. The design philosophy is to empower traders with granular control, allowing them to tailor the platform to their precise workflow and preferences while maintaining the clean, professional aesthetic of the TradeSphere brand. This hub is a critical component for user retention, building trust, and enhancing the perceived value of premium tiers.

## **2\. Architectural Placement & Layout**

* **Placement:** The Settings Hub will be a new, dedicated page (/settings) accessible from the user's profile dropdown in the main navigation.  
* **Layout:** A two-panel layout will be used for clarity and ease of navigation.  
  * **Left Panel (Navigation):** A fixed, vertically-scrolling sidebar with clear icons and labels for each settings category (e.g., Profile, Subscription, Theme, Notifications).  
  * **Right Panel (Content):** The main content area that dynamically renders the components for the selected category. This ensures a focused, uncluttered user experience.

## **3\. Detailed Breakdown of Settings Sections**

### **3.1. Profile & Identity**

This section controls the user's public-facing persona.

* **Public Profile Management:** Input fields to edit the "My Story," "My Trading Style," and "My 'Why'" sections of their profile page.  
* **Avatar & Banner Upload:** Tools to upload and crop profile and banner images.  
* **Stealth Mode (Premium Feature):** A toggle available to **TS Gladiator & TS Legend** members. When enabled, it allows the user to participate in competitions and view content without appearing in public leaderboards or "currently viewing" lists, offering a layer of privacy for high-profile traders.

### **3.2. Account & Subscription**

The administrative and financial core of the user's account.

* **Tier Management:** Clearly displays the user's current tier (Free, Elite, Gladiator, Legend) with options to upgrade or manage their subscription.  
* **Payment History:** A detailed log of all transactions, including subscriptions and competition entry fees.  
* **Creator Dashboard (Conditional):** For users in the **TS Elite** tier and above, this section provides a prominent link to their dedicated Creator Hub for managing payouts, subscribers, and content.

### **3.3. Theme & Layout Customization**

This section directly addresses the user's need for a personalized trading environment.

* **Theme Engine:**  
  * **Classic Dark:** The default TradeSphere theme.  
  * **Focus Light:** A clean, high-contrast light theme for daytime use.  
  * **Terminal:** A retro green-on-black theme for a classic trading floor feel.  
* **Live Page Layout Manager (Premium Feature):**  
  * An interactive module that allows users to save, name, and load custom presets for their multi-chart and widget configurations on the /live page. A trader could have a "Scalping" preset with specific timeframes and a "Swing" preset with different indicators.  
* **Data Density Control:** A slider that adjusts the amount of information visible on signal cards and portfolio views, catering to both minimalists and data-heavy traders.

### **3.4. Notifications & Price Alerts**

Granular control over how and when the user is contacted.

* **Notification Channels:** Toggles to enable/disable Email, Push, and In-App notifications.  
* **Event-Based Alerts:** A checklist of events for which to receive notifications:  
  * **Social:** New followers, DMs from Buddies, mentions in a chat.  
  * **Trading:** A followed creator posts a new signal, a signal hits its target or stop.  
  * **Competitions:** A competition you've joined is about to start, results are posted.  
* **Advanced Price Alerts:** A dedicated interface for setting up custom market alerts (e.g., "Alert me when BTC crosses the 50-day EMA" or "When SPY's RSI goes below 30").

### **3.5. Security & Privacy**

Essential tools for account protection and data control.

* **Password Management:** Standard change password functionality.  
* **Two-Factor Authentication (2FA):** A streamlined setup process using an authenticator app (required for creators).  
* **Active Sessions:** A list of all devices currently logged into the account, with the ability to revoke access remotely.  
* **Data Management:** Options to request an export of all user data (trade history, journal entries) or to initiate account deletion.

### **3.6. Connections & Integrations**

A centralized hub for managing third-party connections.

* **Broker Connections:** The primary interface for securely connecting broker accounts (e.g., Tradovate) for read-only trade syncing with the Portfolio Manager.  
* **Social Connections:** Options to link social media accounts for easier sharing and profile enrichment.

### **3.7. Creator Hub Settings (Guru+ Exclusive)**

This section is dedicated to the business side of being a TradeSphere creator.

* **Stripe Connect Onboarding:** A secure module to set up and manage the Stripe account required for receiving payouts.  
* **Subscription Management:** Set and adjust monthly subscription prices.  
* **Clan Badge Customizer:** For Community Group admins, an interface to upload or design their unique Clan Badge, reinforcing their brand identity within the platform.