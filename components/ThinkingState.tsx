import { useEffect, useState } from 'react'
import { View, StyleSheet, Text as RNText } from 'react-native'
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { colors, spacing, typeScale } from '@/lib/design/tokens'

const LINES = [
  'Reading the situation carefully.',
  'Considering context and stakes.',
  'Weighing what to actually say.',
  'Drafting your counsel.',
]

function PulseDot({ isActive }: { isActive: boolean }) {
  const opacity = useSharedValue(1)

  useEffect(() => {
    if (isActive) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.25, { duration: 650 }),
          withTiming(1, { duration: 650 }),
        ),
        -1,
        false,
      )
    } else {
      opacity.value = withTiming(0.3, { duration: 300 })
    }
  }, [isActive])

  const dotStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return <Animated.View style={[s.dot, dotStyle]} />
}

function ThinkingLine({ text, isActive }: { text: string; isActive: boolean }) {
  return (
    <Animated.View entering={FadeIn.duration(400)} style={s.lineRow}>
      <PulseDot isActive={isActive} />
      <RNText style={[s.lineText, !isActive && s.lineTextPast]}>{text}</RNText>
    </Animated.View>
  )
}

export default function ThinkingState() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [lineCount, setLineCount] = useState(1)
  const [showAlmost, setShowAlmost] = useState(false)

  useEffect(() => {
    let idx = 0
    const interval = setInterval(() => {
      idx += 1
      if (idx < LINES.length) {
        setActiveIdx(idx)
        setLineCount(idx + 1)
      } else {
        clearInterval(interval)
      }
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowAlmost(true), 8000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <View style={s.root}>
      <RNText style={s.label}>REASONING</RNText>
      <View style={s.lines}>
        {Array.from({ length: lineCount }, (_, i) => (
          <ThinkingLine key={i} text={LINES[i]} isActive={i === activeIdx} />
        ))}
        {showAlmost && (
          <ThinkingLine text="Almost there." isActive />
        )}
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: {
    paddingTop: spacing[2],
    gap: spacing[4],
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: typeScale.tiny.fontSize,
    lineHeight: typeScale.tiny.lineHeight,
    color: colors.accent.default,
    letterSpacing: 1.4,
  },
  lines: {
    gap: spacing[4],
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent.default,
    marginTop: 7,
  },
  lineText: {
    fontFamily: 'Fraunces_400Regular',
    fontSize: 20,
    lineHeight: 28,
    color: colors.text.primary,
    flex: 1,
  },
  lineTextPast: {
    color: colors.text.tertiary,
  },
})
