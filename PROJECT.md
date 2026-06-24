# Project Report: AI-Powered Study & Productivity Companion

An immersive, proactive, and beautifully styled digital workspace engineered to assist students and modern learners in planning, prioritizing, and mastering topics before critical deadlines are missed.

---

## 1. Problem Statement
Modern students and learners face cognitive overload. They struggle to balance competing course loads, homework sets, research papers, and exam preparation. While conventional digital task organizers exist, they suffer from critical gaps:
1. **Passive Nature**: Conventional planners are static buckets that rely entirely on manual maintenance. They do not proactively alert the user of upcoming deadline bottlenecks or estimate effort required.
2. **Cognitive Fragmentation**: Learners must jump between multiple disparate tools—one for listing tasks (Todoist/Trello), another for focus intervals (Pomodoro timers), another for active review (Anki/Quizlet), and yet another for lecture note taking (Notion/Google Docs). This constant context switching triggers mental fatigue and task avoidance.
3. **Lack of Personalization**: Static systems fail to offer contextual study advice or term deck suggestions tailored specifically to what the learner is working on right now.

---

## 2. Solution Overview
The **AI-Powered Study & Productivity Companion** solves these problems by consolidating planning, active recall, notes synthesis, and focus session timing into a single, beautifully unified "Natural Tones" styled dashboard. 

Powered by **Gemini 3.5**, the companion acts as a proactive digital advisor that:
*   **Monitors Task Deadlines**: Evaluates the learner's syllabus workload and highlights potential bottleneck timelines (overdue, due today, tomorrow).
*   **Recommends Priorities**: Uses intelligent heuristics to identify the top three immediate study actions, helping the user dodge last-minute panic.
*   **Closes the Learning Loop**: Connects note taking directly to task planning and active recall by parsing unstructured raw study text, generating condensed study sheets, and automatically spawning 5-card flashcard decks for immediate self-testing.
*   **Gamifies Deep Study**: Integrates a highly visual Pomodoro Focus Timer directly synced with the user's active tasks, allowing them to increment effort scores block-by-block.

---

## 3. High-Level System Architecture & Workflows

### System Context Diagram

```
+---------------------------------------------------------------------------------+
|                                 USER BROWSER                                    |
|                                                                                 |
|  +------------------------+  +----------------------+  +---------------------+  |
|  |     Task Planner       |  |    Active Recall     |  |    Smart Notepad    |  |
|  | (Add/Filter/Focus Pin) |  | (Interactive Decks)  |  |  (Markdown Editor)  |  |
|  +-----------+------------+  +----------+-----------+  +----------+----------+  |
|              |                          |                         |             |
+--------------|--------------------------|-------------------------|-------------+
               |                          |                         |
               | (Get recommendations)    | (Generate Decks)        | (Analyze Notes)
               v                          v                         v
+---------------------------------------------------------------------------------+
|                               EXPRESS BACKEND                                   |
|                                                                                 |
|                       Lazy-Initialized Google GenAI SDK                         |
+---------------------------------------------------------------------------------+
                                          |
                                          | Secure API Calls
                                          v
+---------------------------------------------------------------------------------+
|                        GOOGLE GEMINI 3.5 FLASH API                              |
|                                                                                 |
|   - Content Generation with Structured JSON Schemas                              |
|   - Note-to-Task Parsers & Extracted Study Blueprints                          |
+---------------------------------------------------------------------------------+
```

---

## 4. Key Workflows

### Workflow 1: Proactive Task Recommendation & Advisory
1. The user logs onto the dashboard. The local state aggregates all outstanding tasks, categories, priority ratings, and estimated effort blocks.
2. The UI issues an asynchronous `POST` to `/api/ai/recommend` carrying the tasks metadata.
3. The Express backend securely queries **Gemini 3.5** with a strict JSON schema prompt instructing the model to analyze deadlines and prioritize actions.
4. Gemini returns:
    *   Top 3 prioritized task objectives with detailed justifications and immediate next physical action steps.
    *   Contextual cognitive study tips (e.g., active recall strategies, Pomodoro breaks advice).
    *   Syllabus-aligned recommended flashcard deck titles.
5. The UI renders these suggestions inside the sidebar under the **"Study Companion"** section.

### Workflow 2: Note-to-Task Conversion & Study Sheet Extraction
1. The user pastes textbook outlines, research papers, or classroom scribbles into the **Smart Study Notepad**.
2. Clicking the **"AI Analyze"** button triggers a request to `/api/ai/analyze-notes`.
3. Gemini processes the text, extracts key structures, compiles a concise Markdown-formatted study sheet, and automatically identifies actionable todo items complete with estimated Pomodoro complexity.
4. The user reviews the extracted action checklist, and clicks **"Add to Planner"** to instantly inject these items into their master task manager without any manual typing.

### Workflow 3: Instant AI Active Recall Flashcard Decks
1. In the **Recall** tab, the student enters a study topic (e.g., *"Thermodynamics"* or *"JavaScript Closures"*).
2. The user triggers **"Generate 5 Flashcards"**.
3. The server communicates with Gemini to construct 5 high-quality, scientifically sound active-recall questions (Front) paired with comprehensive answers or mnemonic memory shortcuts (Back).
4. The system automatically provisions a brand new Study Deck, allowing the student to instantly click, flip, and study terms in a elegant 3D card layout.

---

## 5. Technologies & Google Ecosystem Utilized

### Google Technologies Utilized
*   **Google Gemini 3.5 Flash Model**: Serves as the primary AI engine. It powers note analysis, task extraction, proactive prioritizing advice, and high-quality flashcard content generation.
*   **@google/genai (v2.4.0) SDK**: The state-of-the-art server-side SDK is used to guarantee secure, type-safe API calls featuring native JSON schemas (`responseSchema`) for predictable structured output formatting.
*   **Google Cloud Run Container Ingress**: Houses the final full-stack application, serving as the high-availability layer with built-in SSL and scaling.

### Frontend Technologies
*   **React (v19.0.1)**: Powering the interactive UI layers and state synchronization.
*   **Vite**: Extremely fast frontend build compiler with custom asset pipeline structures.
*   **Tailwind CSS (v4)**: Modern, utility-first CSS framework configured to match the elegant, warm, high-contrast **"Natural Tones"** visual system (comprising sand color `#F5F2ED`, sage green `#889681`, and deep olive charcoal `#5A5A40`).
*   **Motion (v12)**: Native physics and transition handlers ensuring seamless tab swaps, card-flip animations, and task entry transitions.
*   **Lucide React**: Clean vector icon suite.

### Backend Technologies
*   **Node.js & Express**: Provides a robust, full-stack back-proxy routing layer. Securely hides API secrets and exposes clean endpoint pathways (`/api/ai/*`) to isolate the client browser from underlying cloud credential keys.
*   **TypeScript**: Implements rigorous compile-time verification across the backend and components schema boundaries.
