# **TradoSphere Feature Brief: AI-Assisted Onboarding System**

Date: October 17, 2025  
Parent Document: TradoSphere: Final Feature Brief & Project Synopsis  
Status: Finalized

## **1\. Project Vision & Core Concept**

The first moments on a new platform are critical. Our onboarding process will be an immersive, encouraging, and intelligent experience designed to maximize user understanding and drive engagement from day one. We will introduce **"Sphirie," our Gemini-powered onboarding assistant**, who will act as a personal guide for every new user.

Sphirie's primary goal is to provide a **tier-aware tutorial**, showcasing the full power of the features available to the user based on their specific subscription level. The experience will be framed as a guided tour, culminating in a compelling preview of the premium features that await, creating a natural and effective upsell funnel.

## **2\. Core Mechanics & Technical Implementation**

* **Trigger:** The onboarding sequence will automatically initiate upon the user's first login. A welcome modal will appear, giving the user the option to "Start Tour" or "Explore on My Own." The tour can be restarted at any time from the Settings Hub.  
* **Gemini Integration:** Sphirie's dialogue (the script) will be powered by Gemini, ensuring a friendly, clear, and encouraging tone.  
* **Tier-Aware Logic:** The backend will serve a tutorial "script" based on the user's account tier.  
* **User Progress:** The user's progress through the tour will be saved, allowing them to exit and resume where they left off.

## **3\. Onboarding Scripts & User Journey**

### **Welcome Modal (All Tiers)**

**Sphirie:** "Welcome to TradeSphere\! I'm Sphirie, your personal AI guide. Ready for a quick tour of your new toolkit?"

\[ Start Tour \] \[ Explore on My Own \]

### **Module 1: The Core Experience (Free Tier & Up)**

* **Step 1 (The Feed):** **Sphirie:** "This is your Feed, the heart of the community. Watch for the 'Hit/Miss' score and 'Win Streak' flame to see who's on fire\!"  
* **Step 2 (The Live Page):** **Sphirie:** "Welcome to the command center. On the Live page, you can watch top traders stream their strategies in real-time."  
* **Step 3 (Portfolio Manager):** **Sphirie:** "This is your personal Portfolio Manager. Track your performance and analyze your progress over time. Knowledge is power\!"  
* **Step 4 (Free Competitions):** **Sphirie:** "Ready to test your skills? You can join any 'Free Entry' competition to compete and climb the leaderboards."

### **Module 2: The Growth Toolkit (TS Grow & Up)**

*(This module triggers after Module 1 for TS Grow users and above)*

* **Step 5 (Trading Journal):** **(Highlighting the Journal/Learning Hub)** **Sphirie:** "As a **TS Grow** member, you've unlocked the AI-powered Learning Hub and Trading Journal. Ask me any trading question, and save the answers here to build your personal knowledge base\!"  
* **Step 6 (API Connection):** **(Highlighting the 'Connect Broker' button)** **Sphirie:** "You can now connect your broker account via API to automatically sync your trades. No more manual entry\! Your **Growth Badge** 🌱 is now active."  
* **Step 7 (Weekly Signal):** **(Highlighting the 'Create Post' button)** **Sphirie:** "You also get to share one trade signal per week. Start contributing to the community and show them your skills\!"

### **Module 3: The Creator Toolkit (TS Elite & Up)**

*(This module triggers after Module 2 for TS Elite users and above)*

* **Step 8 (Unlimited Signals):** **Sphirie:** "As a **TS Elite** member, you're a full creator. You can now post unlimited signals\! Your **Guru Badge** ✨ shows you're a trusted voice."  
* **Step 9 (Streaming Your Journal):** **(Highlighting 'Go Live' button)** **Sphirie:** "You also have the power to go live\! Share your insights and build a community around your strategy."

### **Module 4: The Gladiator's Arena (TS Gladiator & Up)**

*(This module triggers after Module 3 for TS Gladiator users and above)*

* **Step 10 (Creating Competitions):** **Sphirie:** "Welcome to the arena, Gladiator. You can now create your own competitions. Your **Gladiator Badge** ⚔️ shows you mean business."

### **Module 5: The Legend's Circle (TS Legend Only)**

*(This module triggers after Module 4 for TS Legend users)*

* **Step 11 (Legend Status):** **Sphirie:** "Congratulations on achieving **Legend** status. Your content will now get preferential visibility, and your new **Legend Badge** 🏆 signifies your elite skill."

## **4\. The Upsell Finale: "But It Gets Better..."**

At the conclusion of the tour for any tier below **TS Legend**, a final modal appears.

**Sphirie:** "You've mastered the basics of your toolkit, but your journey is just beginning. Here’s a glimpse of what's on the next level:"

* **(For Free Users):**  
  * **Unlock Your AI Journal:** Ask any trading question and save the answers. 🌱  
  * **Automate Your Portfolio:** Connect your broker with API access.  
  * **Post Your First Signal:** Share one trade idea per week.  
  * \[ Upgrade to TS Grow \]  
* **(For TS Grow Users):**  
  * **Become a Creator:** Post unlimited signals and build your brand. ✨  
  * **Host Live Streams:** Share your knowledge and earn from subscribers.  
  * \[ Upgrade to TS Elite \]  
* **(For TS Elite Users):**  
  * **Unleash Your Competitive Edge:** Create and host your own competitions. ⚔️  
  * **Enter High-Stakes Tournaments:** Compete for larger prize pools.  
  * \[ Upgrade to TS Gladiator \]  
* **(For TS Gladiator Users):**  
  * **Achieve Legend Status:** Get priority visibility and become a top creator. 🏆  
  * **Access the Legends Pool:** Earn a share of an exclusive bonus pool.  
  * \[ Learn How to Become a Legend \]