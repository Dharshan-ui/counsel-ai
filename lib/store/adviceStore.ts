import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { chat, AIInvalidResponseError, AINetworkError } from '@/lib/ai/client'
import { ADVICE_SYSTEM_PROMPT } from '@/lib/ai/prompts'
import type { AdviceData } from '@/components/AdviceCard'

export type AdviceCategory =
  | 'Salary'
  | 'Lease'
  | 'Relationship'
  | 'Career move'
  | 'Conflict'
  | 'Big decision'

export type SituationEntry = {
  id: string
  createdAt: string
  prompt: string
  category?: AdviceCategory
  advice: AdviceData | null
  source: 'voice' | 'text'
}

type AdviceState = {
  situations: SituationEntry[]
  current: SituationEntry | null
  isLoading: boolean
  error: string | null
}

type AdviceActions = {
  submitSituation: (prompt: string, category?: AdviceCategory) => Promise<void>
  retry: () => Promise<void>
  clearCurrent: () => void
  deleteSituation: (id: string) => void
}

function parseAdviceJSON(raw: string): AdviceData {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new AIInvalidResponseError('No JSON object in response')
    try {
      parsed = JSON.parse(match[0])
    } catch {
      throw new AIInvalidResponseError('Could not parse extracted JSON block')
    }
  }

  const obj = parsed as Record<string, unknown>
  if (
    typeof obj.headline !== 'string' ||
    typeof obj.strategy !== 'string' ||
    !Array.isArray(obj.talkingPoints) ||
    typeof obj.likelyOutcomes !== 'object' ||
    obj.likelyOutcomes === null ||
    !Array.isArray(obj.followUps) ||
    !Array.isArray(obj.riskFlags)
  ) {
    throw new AIInvalidResponseError('Response missing required fields')
  }

  return parsed as AdviceData
}

export const useAdviceStore = create<AdviceState & AdviceActions>()(
  persist(
    (set, get) => ({
      situations: [],
      current: null,
      isLoading: false,
      error: null,

      submitSituation: async (prompt, category) => {
        console.log('[store] submitSituation called, isLoading:', get().isLoading)
        if (get().isLoading) {
          console.log('[store] already loading — duplicate call dropped')
          return
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const stub: SituationEntry = {
          id,
          createdAt: new Date().toISOString(),
          prompt,
          category,
          advice: null,
          source: 'text',
        }

        set({ isLoading: true, current: stub, error: null })

        try {
          const userContent = prompt + (category ? ` [Category: ${category}]` : '')
          const raw = await chat(
            [
              { role: 'system', content: ADVICE_SYSTEM_PROMPT },
              { role: 'user', content: userContent },
            ],
            { jsonMode: true, temperature: 0.7, maxTokens: 1500 },
          )

          const advice = parseAdviceJSON(raw)
          const entry: SituationEntry = { ...stub, advice }

          set(state => ({
            situations: [entry, ...state.situations],
            current: entry,
            isLoading: false,
            error: null,
          }))
        } catch (err) {
          console.error('[store] caught error, current advice exists?', !!get().current?.advice)
          console.error('[AI] submitSituation failed:', {
            name: err instanceof Error ? err.name : typeof err,
            message: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined,
          })
          // If the primary call already wrote advice (race: second invocation's
          // catch fires after the first invocation succeeded), don't clobber it.
          if (get().current?.advice) {
            console.log('[store] advice already set — suppressing error state')
            set({ isLoading: false })
            return
          }
          const userMessage = err instanceof AINetworkError
            ? "Counsel is taking longer than usual. The model may be cold-starting. Try once more."
            : "Counsel couldn't reach the model. Try again."
          set({ isLoading: false, error: userMessage })
        }
      },

      retry: async () => {
        const { current } = get()
        if (!current) return
        await get().submitSituation(current.prompt, current.category)
      },

      clearCurrent: () => set({ current: null, error: null }),

      deleteSituation: (id) =>
        set(state => ({
          situations: state.situations.filter(s => s.id !== id),
          current: state.current?.id === id ? null : state.current,
        })),
    }),
    {
      name: 'counsel.situations.v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        situations: state.situations,
        // current is intentionally excluded — always start fresh on relaunch
      }),
    },
  ),
)
