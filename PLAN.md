# Astra — AI Life Coach & Negotiation Advisor
## Product Plan · 8x Engineer Contest · Due May 15, 2026

---

## 1. Product Vision

Astra is a premium mobile AI advisor that meets you at the moments that matter most — difficult conversations, high-stakes negotiations, career pivots, and daily life decisions. Built on GLM-4.6 via NVIDIA NIM, it delivers structured, tactically precise guidance that feels like having a seasoned strategist in your pocket. Every interaction is private, personalized over time, and rendered with editorial craft — no chatbot aesthetics, no generic encouragement. Astra speaks plainly, thinks clearly, and prepares you to win.

---

## 2. Information Architecture

### Navigation Zones

```
Public
  └── /              Landing / splash

Authenticated
  ├── (tabs)
  │   ├── /           Home — daily prompt + recent advice cards
  │   ├── /advisor    New situation input (text + voice)
  │   ├── /scenario   Negotiation simulator
  │   ├── /history    Saved advice archive
  │   └── /profile    Account + settings
  │
  ├── /advice/[id]    Full advice detail view
  ├── /scenario/[id]  Active / past scenario session
  └── /upgrade        Paywall
```

### Screen Inventory

| Screen | Purpose |
|---|---|
| Home (tabs/index) | Daily challenge prompt card, recent 3 advice items, quick-start CTA |
| Advisor (tabs/advisor) | Situation input — text area + voice record button; category picker |
| Advice Detail (/advice/[id]) | Full structured advice: strategy, talking points, outcomes, follow-ups |
| Scenario (tabs/scenario) | Simulator lobby — pick a scenario or start from saved advice |
| Scenario Session (/scenario/[id]) | Live role-play chat with AI counterparty |
| History (tabs/history) | Saved advice list, filterable by category |
| Profile (tabs/profile) | Account, subscription badge, sign out |
| Upgrade (/upgrade) | Paywall |

---

## 3. Data Model

```typescript
// Advice category tags
type AdviceCategory =
  | 'salary_negotiation'
  | 'difficult_conversation'
  | 'career_decision'
  | 'relationship'
  | 'business_deal'
  | 'conflict_resolution'
  | 'life_decision'
  | 'other'

// User's raw situation input
interface Situation {
  id: string
  userId: string
  text: string                  // raw situation description
  voiceTranscript?: string      // if captured via voice
  category: AdviceCategory
  createdAt: string             // ISO 8601
}

// Structured AI response
interface Advice {
  id: string
  situationId: string
  userId: string
  category: AdviceCategory
  summary: string               // one-line headline
  strategy: string[]            // ordered strategic steps
  talkingPoints: string[]       // exact phrases / scripts
  likelyOutcomes: {
    scenario: string
    probability: 'high' | 'medium' | 'low'
  }[]
  followUps: string[]           // next actions / follow-up questions
  aiModel: string               // model string used
  createdAt: string
  isSaved: boolean
}

// A role-play session
interface ScenarioSession {
  id: string
  userId: string
  adviceId?: string             // optional — can start without prior advice
  title: string
  counterpartyRole: string      // e.g. "hiring manager", "landlord"
  status: 'active' | 'completed' | 'abandoned'
  messages: Message[]
  createdAt: string
  completedAt?: string
}

// Single message within a ScenarioSession
interface Message {
  id: string
  sessionId: string
  role: 'user' | 'counterparty' | 'coach'  // coach = post-turn feedback
  content: string
  createdAt: string
}

// Daily challenge prompt
interface DailyPrompt {
  id: string
  date: string                  // YYYY-MM-DD
  prompt: string                // challenge text
  category: AdviceCategory
  isCompleted: boolean          // persisted locally per user
}
```

---

## 4. AI Integration Plan

### Endpoint

- **Provider:** NVIDIA NIM (OpenAI-compatible)
- **Model:** `zai/glm-4.6`
- **Base URL:** `https://integrate.api.nvidia.com/v1`
- **Auth:** Bearer token from `EXPO_PUBLIC_NVIDIA_API_KEY`

### Adapter: `lib/aiClient.ts`

Single exported function `callAI({ systemPrompt, userPrompt, schema })` that:
1. Posts to the NIM chat completions endpoint
2. Expects JSON output shaped to `schema` (enforced via system prompt instruction)
3. Parses and validates the JSON response
4. Logs each call to `/ai-logs/` format: `YYYY-MM-DD_HH-mm-ss_<type>.json`

Model string is isolated in one constant — swap to any OpenAI-compatible model in one line.

### System Prompts

Each feature has its own strict system prompt that instructs the model to respond with a valid JSON object matching the `Advice` or `Message` shape. No markdown, no prose — pure JSON only.

---

## 5. Folder Structure

```
app/
  (auth)/
  (onboarding)/
  (tabs)/
    index.tsx          Home
    advisor.tsx        Situation input
    scenario.tsx       Simulator lobby
    history.tsx        Advice archive
    profile.tsx        Account
  advice/[id].tsx      Advice detail
  scenario/[id].tsx    Scenario session
  _layout.tsx
  index.tsx
  upgrade.tsx

features/
  advice/
    AdviceCard.tsx
    AdviceDetail.tsx
    SituationInput.tsx
    CategoryPicker.tsx
    useAdvice.ts
    useCreateAdvice.ts
  scenario/
    ScenarioLobby.tsx
    ScenarioChat.tsx
    MessageBubble.tsx
    useScenario.ts
    useScenarioSession.ts
  history/
    HistoryList.tsx
    HistoryFilter.tsx
    useHistory.ts
  daily/
    DailyPromptCard.tsx
    useDailyPrompt.ts

components/
  ui/
    (existing template components)
  VoiceButton.tsx
  StructuredSection.tsx    // reusable "Section header + bullet list" block

lib/
  aiClient.ts              // NVIDIA NIM adapter
  aiPrompts.ts             // all system prompts
  aiLogger.ts              // writes to /ai-logs/
  theme.ts
  constants.ts
  typography.ts
  (other existing)

store/
  adviceStore.ts           // Zustand or AsyncStorage for local advice cache
  scenarioStore.ts

types/
  advice.ts
  scenario.ts
  daily.ts

ai-logs/                   // AI call logs (gitkeep)
```

---

## 6. Design Language

### Philosophy
Dark, editorial, confident. This is a tool for serious moments — the UI should feel like a premium strategy brief, not a wellness app. No bubbly corners, no pastel gradients, no confetti. Every element earns its place.

### Core Tokens (already in lib/theme.ts — we will update)
- **Background:** `#0d0d0d` (near-black, already set)
- **Surface:** `#1a1a1a` / `#242424` (card layers)
- **Text:** White primary, 55% secondary, 28% tertiary

### Accent Color Candidates

| Option | Hex | Rationale |
|---|---|---|
| **A — Amber Gold** | `#d4a843` | Authority, premium, editorial. Used by Bloomberg, WSJ. Reads as "advisor you pay for." Warm against near-black without going orange-loud. |
| **B — Cold Indigo** | `#7c6ef7` | Intelligence, clarity, tech-premium. Sits cleanly on dark surfaces. Differentiates from generic teal/blue AI apps. |
| **C — Bone White accent** | `#e8e0d0` | Maximum restraint — a warm off-white used sparingly as the single accent. Ultra-editorial, editorial like NYT Cooking dark mode. Risk: low contrast on some elements. |

**Recommendation: Option A (Amber Gold `#d4a843`)** — it signals "trusted advisor" and photographs beautifully on screenshots, which is judging criterion #1.

### Typography
- **Display / headings:** System serif fallback now; propose adding `expo-google-fonts/playfair-display` in Phase 2
- **Body / UI:** Inter (already installed via `@expo-google-fonts/inter`)
- **Spacing:** 8pt grid, generous — minimum 24px section padding, 16px between cards

---

## 7. Five-Day Build Timeline

| Day | Date | Milestone |
|---|---|---|
| Day 1 | May 10 | Foundation: rename app, set accent, build Home screen + Advisor input screen (no AI yet), wire tab navigation |
| Day 2 | May 11 | AI core: `aiClient.ts` + `aiPrompts.ts` + `aiLogger.ts`; wire Advisor → real AI → Advice Detail screen |
| Day 3 | May 12 | History screen + Scenario Simulator (lobby + live session chat with AI counterparty) |
| Day 4 | May 13 | Daily prompts feature; polish pass — animations, typography, spacing; voice input button |
| Day 5 | May 14 | Screenshot sprint, Loom recording, AI logs review, reflection doc, final submission prep |

> **Buffer:** May 15 morning for any last fixes before deadline.
