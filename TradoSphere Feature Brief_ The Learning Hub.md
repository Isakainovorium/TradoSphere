# **TradoSphere Feature Brief: The Learning Hub**

Date: October 17, 2025  
Parent Document: TradoSphere: Final Feature Brief & Project Synopsis  
Status: Proposed

## **1\. Project Vision & Core Concept**

The Learning Hub is an on-demand, AI-powered educational resource designed to demystify the language of trading. Its primary function is to serve as an interactive glossary and concept explainer, allowing traders to get clear, concise definitions for market jargon, patterns, and theories. By integrating a "save and modify" journaling feature, the Hub transforms passive learning into an active study session, empowering users to build a personalized knowledge base that supports their growth.

This feature is explicitly designed to supplement—not replace—the high-level strategic content provided by platform creators.

## **2\. Architectural Placement & Tier Access**

* **Placement:** The Learning Hub will be a new, dedicated page (/learn) accessible from the main navigation. It will be built using the established Next.js and Tailwind CSS stack.  
* **Backend:** A new Learning Service will be implemented to handle Gemini API requests and manage journal entries.

* ### **Tier Access: This feature will be exclusive to monetized tiers to enhance the value of a paid subscription. Access is granted to all TS Grow, TS Elite, TS Gladiator, and TS Legend members.**

## **3\. Page & Component Breakdown (/learn)**

The Learning Hub will feature a clean, minimalist UI focused on the core interaction of asking, learning, and saving.

* **Main Layout:** A single-view interface with three primary components.  
  1. **AI Interaction Module:**  
     * A prominent, central text input field with the prompt: "Ask about a trading concept..."  
     * A "Generate" button to submit the query.  
     * Below the input, a dynamic list of "Suggested Topics" (e.g., "What is Order Flow?", "Explain the Wyckoff Method," "What is a Doji candle?") to guide users.  
  2. **AI Response Display:**  
     * A clean, well-formatted container where the Gemini-generated explanation appears.  
     * The response will be styled for maximum readability (clear headings, bullet points, etc.).  
  3. **Action & Journaling Panel:**  
     * A persistent panel associated with the AI response.  
     * **"Save to Journal" Button:** A primary call-to-action that initiates the journaling workflow.  
     * **"Clear" Button:** To reset the interface for a new query.

## **4\. Core Functionality & User Workflow**

The user journey is designed to be a simple, three-step loop: **Query \-\> Learn \-\> Internalize.**

1. **Query:** A user enters a term or question into the AI Interaction Module (e.g., "What is ICT?").  
2. **Learn:** The Learning Service sends a structured prompt to the Gemini API. The response is formatted and displayed to the user, providing a direct and concise explanation of the concept.  
3. **Internalize (Journaling):**  
   * The user clicks **"Save to Journal."**  
   * This action saves the AI-generated text as a new, editable entry in their personal **TS Journal**.  
   * The user can then navigate to their journal to modify the entry, adding their own notes, clarifying points, or linking to examples from their own trading. This critical step allows them to re-frame the knowledge in their own words, drastically improving retention.

## **5\. Gemini API Integration & Prompt Engineering**

The success of this feature hinges on precise prompt engineering to ensure the AI's responses are helpful but scoped correctly.

* **System Prompt:** The backend Learning Service will prepend every user query with a carefully engineered system prompt.  
  * **Example System Prompt:** *"You are an expert trading educator. Your role is to explain trading concepts, terms, and jargon clearly and concisely for an aspiring trader. Provide definitions and brief overviews. **Do not give financial advice, predict market movements, or outline complex, multi-step trading strategies.** Keep the tone educational and neutral."*  
* **Content Guardrails:** This prompt ensures that the Learning Hub remains a tool for foundational knowledge, protecting the value proposition of creators who teach nuanced, actionable strategies.

## **6\. API & Data Model Considerations**

### **6.1. Key API Endpoints**

* POST /api/v1/learn/query: Accepts a user's query, passes it to the Learning Service for processing with Gemini, and returns the formatted response.  
* POST /api/v1/journal/entries: Creates a new entry in the user's journal. The request body will include the original prompt, the full AI-generated response, and an empty field for user modifications.

### **6.2. Data Model (Simplified)**

// /models/journalEntry.ts  
interface JournalEntry {  
  id: string;  
  userId: string;  
  createdAt: Date;  
  source: 'AI\_LEARNING\_HUB' | 'MANUAL';  
  title: string; // e.g., "What is ICT?"  
  content: {  
    aiGeneratedText: string;  
    userNotes?: string; // Markdown supported  
  };  
}  
