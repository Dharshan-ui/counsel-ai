import { useState, useRef, useCallback } from 'react'
import {
  View,
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
  Text as RNText,
  ScrollView as HScroll,
} from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import { Mic } from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import AdviceCard from '@/components/AdviceCard'
import ThinkingState from '@/components/ThinkingState'
import VoiceWaveform from '@/components/VoiceWaveform'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { colors, radii, spacing, typeScale } from '@/lib/design/tokens'
import { useAdviceStore, type AdviceCategory } from '@/lib/store/adviceStore'
import { useToast } from '@/contexts/ToastContext'

const CATEGORIES: AdviceCategory[] = [
  'Salary', 'Lease', 'Relationship', 'Career move', 'Conflict', 'Big decision',
]

const DEV_PROMPT =
  "I've been at this company for 3 years. I just got a competing offer 30% above my salary. My manager keeps deflecting when I raise it. How do I handle this?"

export default function AdviseScreen() {
  const insets = useSafeAreaInsets()
  const { showToast } = useToast()
  const { dev } = useLocalSearchParams<{ dev?: string }>()
  const { current, isLoading, error, submitSituation, retry, clearCurrent, prefillPrompt, setPrefillPrompt } = useAdviceStore()

  useFocusEffect(
    useCallback(() => {
      if (prefillPrompt) {
        setPrompt(prefillPrompt)
        setPrefillPrompt(null)
      }
    }, [prefillPrompt, setPrefillPrompt])
  )

  const [prompt, setPrompt] = useState('')
  const [category, setCategory] = useState<AdviceCategory | null>(null)
  const [focused, setFocused] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const phase = isLoading
    ? 'thinking'
    : error
    ? 'error'
    : current?.advice
    ? 'result'
    : 'input'

  function handleSubmit(p?: string) {
    console.log('[press] Get counsel pressed at', Date.now())
    const text = (p ?? prompt).trim()
    if (!text || isLoading) return
    submitSituation(text, category ?? undefined)
  }

  function handleVoice() {
    if (isListening) {
      setIsListening(false)
      return
    }
    setIsListening(true)
    setTimeout(() => {
      setIsListening(false)
      showToast('Voice input — coming soon. Type your situation for now.', 'info')
    }, 2000)
  }

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={[
        s.content,
        { paddingTop: insets.top + spacing[6], paddingBottom: TAB_BAR_CLEARANCE + spacing[8] },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Wordmark */}
      <View style={s.wordmarkWrap}>
        <RNText style={s.wordmark}>COUNSEL</RNText>
        <View style={s.wordmarkUnderline} />
      </View>

      {/* ── INPUT PHASE ────────────────────────────────────── */}
      {phase === 'input' && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={s.inputPhase}>
          <View style={s.heroWrap}>
            <RNText style={s.hero}>What are you{'\n'}weighing?</RNText>
            <Text style={s.subHero}>Describe the situation. Counsel will reason through it.</Text>
          </View>

          {/* Text Input */}
          <TextInput
            style={[s.input, focused && s.inputFocused]}
            multiline
            textAlignVertical="top"
            placeholder="e.g. My manager keeps deflecting when I bring up promotion. Performance review is in two weeks."
            placeholderTextColor={colors.text.tertiary}
            value={prompt}
            onChangeText={setPrompt}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoCorrect
            autoCapitalize="sentences"
          />

          {/* Voice waveform */}
          {isListening && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={s.waveformWrap}>
              <VoiceWaveform active={isListening} />
            </Animated.View>
          )}

          {/* Category chips */}
          <HScroll
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.chipsRow}
          >
            {CATEGORIES.map(cat => (
              <Pressable
                key={cat}
                onPress={() => setCategory(prev => (prev === cat ? null : cat))}
                style={[s.chip, category === cat && s.chipActive]}
              >
                <Text style={[s.chipText, category === cat && s.chipTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </HScroll>

          {/* Action row */}
          <View style={s.actionRow}>
            <Pressable
              onPress={handleVoice}
              style={({ pressed }) => [s.voiceBtn, isListening && s.voiceBtnActive, pressed && { opacity: 0.7 }]}
            >
              <Mic size={20} color={isListening ? colors.semantic.danger : colors.text.secondary} strokeWidth={1.8} />
            </Pressable>

            <Pressable
              onPress={() => handleSubmit()}
              disabled={isLoading || !prompt.trim()}
              style={({ pressed }) => [
                s.submitBtn,
                (!prompt.trim()) && s.submitBtnDisabled,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={s.submitText}>Get counsel</Text>
            </Pressable>
          </View>

          {__DEV__ && dev === '1' && (
            <Pressable
              onPress={() => { setPrompt(DEV_PROMPT); handleSubmit(DEV_PROMPT) }}
              style={({ pressed }) => [s.devBtn, pressed && { opacity: 0.6 }]}
            >
              <Text style={s.devText}>dev: fire test prompt</Text>
            </Pressable>
          )}
        </Animated.View>
      )}

      {/* ── THINKING PHASE ─────────────────────────────────── */}
      {phase === 'thinking' && (
        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={s.thinkingPhase}>
          <ThinkingState />
        </Animated.View>
      )}

      {/* ── RESULT PHASE ───────────────────────────────────── */}
      {phase === 'result' && current?.advice && (
        <Animated.View entering={FadeIn.delay(100).duration(400)} style={s.resultPhase}>
          <Pressable
            onPress={clearCurrent}
            style={({ pressed }) => [s.newSitBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={s.newSitText}>← New situation</Text>
          </Pressable>

          <View style={s.situationMeta}>
            <Text style={s.situationLabel}>SITUATION</Text>
            <Text style={s.situationText} numberOfLines={2}>{current.prompt}</Text>
          </View>

          <AdviceCard advice={current.advice} />
        </Animated.View>
      )}

      {/* ── ERROR PHASE ────────────────────────────────────── */}
      {phase === 'error' && (
        <Animated.View entering={FadeIn.duration(300)} style={s.errorPhase}>
          <Text style={s.errorText}>{error}</Text>
          <View style={s.errorActions}>
            <Pressable onPress={retry} style={({ pressed }) => [s.retryBtn, pressed && { opacity: 0.7 }]}>
              <Text style={s.retryText}>Try again</Text>
            </Pressable>
            <Pressable onPress={clearCurrent} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
              <Text style={s.newSitText}>← New situation</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.base },
  content: { paddingHorizontal: spacing[5], gap: spacing[6] },

  wordmarkWrap: { gap: 5 },
  wordmark: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 18,
    color: colors.text.primary,
    letterSpacing: 1,
  },
  wordmarkUnderline: {
    width: 24,
    height: 2,
    backgroundColor: colors.accent.default,
    borderRadius: 1,
  },

  // Input phase
  inputPhase: { gap: spacing[4] },
  heroWrap: { gap: spacing[2] },
  hero: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 32,
    lineHeight: 40,
    color: colors.text.primary,
    letterSpacing: -0.6,
  },
  subHero: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    lineHeight: typeScale.small.lineHeight,
    color: colors.text.secondary,
  },

  input: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    padding: spacing[4],
    minHeight: 140,
    maxHeight: 280,
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.body.fontSize,
    lineHeight: typeScale.body.lineHeight,
    color: colors.text.primary,
  },
  inputFocused: { borderColor: colors.accent.default },

  waveformWrap: { paddingHorizontal: spacing[2] },

  chipsRow: { gap: spacing[2], paddingRight: spacing[5] },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  chipActive: {
    borderColor: colors.accent.default,
    backgroundColor: colors.bg.elevated,
  },
  chipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    color: colors.text.secondary,
  },
  chipTextActive: { color: colors.accent.default },

  actionRow: { flexDirection: 'row', gap: spacing[3], alignItems: 'center' },
  voiceBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.card,
  },
  voiceBtnActive: { borderColor: colors.semantic.danger },
  submitBtn: {
    flex: 1,
    backgroundColor: colors.accent.default,
    paddingVertical: 14,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: typeScale.body.fontSize,
    color: '#111111',
    letterSpacing: 0.1,
  },

  devBtn: { alignSelf: 'flex-start' },
  devText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.tiny.fontSize,
    color: colors.text.tertiary,
  },

  // Thinking phase
  thinkingPhase: { paddingTop: spacing[4] },

  // Result phase
  resultPhase: { gap: spacing[4] },
  newSitBtn: { alignSelf: 'flex-start' },
  newSitText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    color: colors.text.secondary,
  },
  situationMeta: { gap: spacing[2] },
  situationLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: typeScale.tiny.fontSize,
    color: colors.text.tertiary,
    letterSpacing: 1.2,
  },
  situationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    lineHeight: typeScale.small.lineHeight,
    color: colors.text.secondary,
  },

  // Error phase
  errorPhase: { gap: spacing[5], paddingTop: spacing[4] },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.body.fontSize,
    lineHeight: typeScale.body.lineHeight,
    color: colors.text.secondary,
  },
  errorActions: { gap: spacing[3] },
  retryBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.accent.default,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radii.md,
  },
  retryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: typeScale.small.fontSize,
    color: colors.accent.default,
  },
})
