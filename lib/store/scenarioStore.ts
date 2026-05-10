import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { chat } from '@/lib/ai/client'
import { buildSimulatorPrompt, SCORECARD_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import { SCENARIOS } from '@/lib/scenarios'

export type Turn = {
  role: 'user' | 'counterparty'
  content: string
  ts: number
}

export type ScoreCard = {
  anchoring: number
  framing: number
  concessionDiscipline: number
  overall: number
  feedback: string[]
}

export type ScenarioSession = {
  id: string
  scenarioId: string
  persona: string
  difficulty: 1 | 2 | 3
  turns: Turn[]
  status: 'active' | 'completed'
  score?: ScoreCard
  createdAt: string
}

type ScenarioState = {
  activeSession: ScenarioSession | null
  sessions: ScenarioSession[]
  isTyping: boolean
  scoringError: string | null
}

type ScenarioActions = {
  startScenario: (scenarioId: string, persona: string, difficulty: 1 | 2 | 3) => void
  sendMessage: (text: string) => Promise<void>
  endAndScore: () => Promise<void>
  clearActive: () => void
}

export const useScenarioStore = create<ScenarioState & ScenarioActions>()(
  persist(
    (set, get) => ({
      activeSession: null,
      sessions: [],
      isTyping: false,
      scoringError: null,

      startScenario: (scenarioId, persona, difficulty) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const session: ScenarioSession = {
          id,
          scenarioId,
          persona,
          difficulty,
          turns: [],
          status: 'active',
          createdAt: new Date().toISOString(),
        }
        set({ activeSession: session, scoringError: null })
      },

      sendMessage: async (text) => {
        const session = get().activeSession
        if (!session) return

        const userTurn: Turn = { role: 'user', content: text, ts: Date.now() }
        const withUser: ScenarioSession = {
          ...session,
          turns: [...session.turns, userTurn],
        }
        set({ activeSession: withUser, isTyping: true })

        const scenario = SCENARIOS.find(s => s.id === session.scenarioId)
        if (!scenario) {
          set({ isTyping: false })
          return
        }

        try {
          const systemPrompt = buildSimulatorPrompt(
            session.persona,
            scenario.title,
            scenario.setup,
            session.difficulty,
          )

          // Build message history
          const messages = [
            { role: 'system' as const, content: systemPrompt },
            ...withUser.turns.map(t => ({
              role: (t.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
              content: t.content,
            })),
          ]

          const reply = await chat(messages, { temperature: 0.85, maxTokens: 250 })

          const counterTurn: Turn = { role: 'counterparty', content: reply.trim(), ts: Date.now() }
          set(state => ({
            activeSession: state.activeSession
              ? { ...state.activeSession, turns: [...state.activeSession.turns, counterTurn] }
              : null,
            isTyping: false,
          }))
        } catch {
          set({ isTyping: false })
        }
      },

      endAndScore: async () => {
        const session = get().activeSession
        if (!session) return

        const completed: ScenarioSession = { ...session, status: 'completed' }
        set(state => ({
          activeSession: completed,
          sessions: [completed, ...state.sessions.filter(s => s.id !== session.id)],
          scoringError: null,
        }))

        try {
          const transcript = session.turns
            .map(t => `${t.role === 'user' ? 'You' : 'Counterparty'}: ${t.content}`)
            .join('\n\n')

          const raw = await chat(
            [
              { role: 'system', content: SCORECARD_SYSTEM_PROMPT },
              { role: 'user', content: `Evaluate this negotiation session:\n\n${transcript}` },
            ],
            { jsonMode: true, temperature: 0.4, maxTokens: 800 },
          )

          let score: ScoreCard
          try {
            score = JSON.parse(raw) as ScoreCard
          } catch {
            const match = raw.match(/\{[\s\S]*\}/)
            score = match ? (JSON.parse(match[0]) as ScoreCard) : { anchoring: 5, framing: 5, concessionDiscipline: 5, overall: 5, feedback: [] }
          }

          const scored = { ...completed, score }
          set(state => ({
            activeSession: scored,
            sessions: state.sessions.map(s => (s.id === session.id ? scored : s)),
          }))
        } catch {
          set({ scoringError: 'Scoring failed — session saved.' })
        }
      },

      clearActive: () => set({ activeSession: null, scoringError: null }),
    }),
    {
      name: 'counsel.scenarios.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ sessions: state.sessions }),
    },
  ),
)
