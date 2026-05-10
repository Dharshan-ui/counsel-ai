import { useEffect } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Text as RNText } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated'
import { ChevronRight } from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { colors, radii, spacing, typeScale } from '@/lib/design/tokens'
import { useScenarioStore, type ScoreCard } from '@/lib/store/scenarioStore'

const SCORE_LABELS: { key: keyof Pick<ScoreCard, 'anchoring' | 'framing' | 'concessionDiscipline'>; label: string }[] = [
  { key: 'anchoring', label: 'Anchoring' },
  { key: 'framing', label: 'Framing' },
  { key: 'concessionDiscipline', label: 'Concession discipline' },
]

function ScoreBar({
  label,
  score,
  delay,
}: {
  label: string
  score: number
  delay: number
}) {
  const width = useSharedValue(0)

  useEffect(() => {
    width.value = withDelay(
      delay,
      withTiming(score * 10, { duration: 800, easing: Easing.out(Easing.cubic) }),
    )
  }, [score])

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }))

  return (
    <View style={s.barRow}>
      <View style={s.barMeta}>
        <Text style={s.barLabel}>{label}</Text>
        <Text style={s.barScore}>{score}<Text style={s.barDenominator}>/10</Text></Text>
      </View>
      <View style={s.barTrack}>
        <Animated.View style={[s.barFill, barStyle]} />
      </View>
    </View>
  )
}

export default function ScoreScreen() {
  const insets = useSafeAreaInsets()
  const { activeSession, clearActive } = useScenarioStore()
  const score = activeSession?.score

  function handleDone() {
    clearActive()
    router.replace('/(tabs)/practice')
  }

  if (!score) {
    return (
      <View style={[s.root, s.center]}>
        <Text style={s.loadingText}>Scoring your session…</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={[
        s.content,
        { paddingTop: insets.top + spacing[6], paddingBottom: insets.bottom + spacing[8] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.duration(400)} style={s.inner}>
        {/* Headline */}
        <View style={s.heroSection}>
          <RNText style={s.heroTitle}>Here's how{'\n'}you handled it.</RNText>
          <View style={s.overallWrap}>
            <RNText style={s.overallScore}>{score.overall}</RNText>
            <Text style={s.overallLabel}>overall</Text>
          </View>
        </View>

        {/* Score bars */}
        <View style={s.barsSection}>
          {SCORE_LABELS.map(({ key, label }, i) => (
            <ScoreBar
              key={key}
              label={label}
              score={score[key]}
              delay={i * 150}
            />
          ))}
        </View>

        {/* Feedback */}
        {score.feedback.length > 0 && (
          <View style={s.feedbackSection}>
            <Text style={s.feedbackHeading}>FEEDBACK</Text>
            <View style={s.feedbackList}>
              {score.feedback.map((item, i) => (
                <Animated.View
                  key={i}
                  entering={FadeIn.delay(600 + i * 100).duration(300)}
                  style={s.feedbackRow}
                >
                  <ChevronRight size={13} color={colors.accent.default} strokeWidth={2.2} style={s.feedbackIcon} />
                  <Text style={s.feedbackText}>{item}</Text>
                </Animated.View>
              ))}
            </View>
          </View>
        )}

        {/* Done button */}
        <Animated.View entering={FadeIn.delay(800).duration(300)}>
          <Pressable
            onPress={handleDone}
            style={({ pressed }) => [s.doneBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={s.doneBtnText}>Back to practice</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.base },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing[5] },
  inner: { gap: spacing[6] },

  loadingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.body.fontSize,
    color: colors.text.tertiary,
  },

  heroSection: { gap: spacing[4] },
  heroTitle: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 32,
    lineHeight: 40,
    color: colors.text.primary,
    letterSpacing: -0.6,
  },
  overallWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  overallScore: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 64,
    lineHeight: 68,
    color: colors.accent.default,
    letterSpacing: -2,
  },
  overallLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    color: colors.text.tertiary,
    paddingBottom: 10,
  },

  barsSection: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    padding: spacing[5],
    gap: spacing[5],
  },
  barRow: { gap: spacing[2] },
  barMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  barLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: typeScale.small.fontSize,
    color: colors.text.secondary,
  },
  barScore: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: typeScale.h3.fontSize,
    color: colors.text.primary,
  },
  barDenominator: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.tiny.fontSize,
    color: colors.text.tertiary,
  },
  barTrack: {
    height: 6,
    backgroundColor: colors.bg.elevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.default,
  },

  feedbackSection: { gap: spacing[3] },
  feedbackHeading: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: typeScale.tiny.fontSize,
    color: colors.accent.default,
    letterSpacing: 1.2,
  },
  feedbackList: { gap: spacing[3] },
  feedbackRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] },
  feedbackIcon: { marginTop: 3 },
  feedbackText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.body.fontSize,
    lineHeight: typeScale.body.lineHeight,
    color: colors.text.secondary,
  },

  doneBtn: {
    backgroundColor: colors.accent.default,
    paddingVertical: 14,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: typeScale.body.fontSize,
    color: '#111111',
    letterSpacing: 0.1,
  },
})
