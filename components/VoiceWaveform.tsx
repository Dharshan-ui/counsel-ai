import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated'
import { colors } from '@/lib/design/tokens'

// Pre-defined bar configs: [minHeight, maxHeight, duration, initialDelay]
const BAR_CONFIGS: [number, number, number, number][] = [
  [8, 18, 320, 0],
  [14, 28, 260, 80],
  [10, 32, 290, 40],
  [12, 24, 310, 120],
  [8, 20, 280, 60],
]

function WaveBar({
  minH,
  maxH,
  duration,
  delay,
  active,
}: {
  minH: number
  maxH: number
  duration: number
  delay: number
  active: boolean
}) {
  const height = useSharedValue(minH)

  useEffect(() => {
    if (active) {
      height.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(maxH, { duration }),
            withTiming(minH, { duration }),
          ),
          -1,
          false,
        ),
      )
    } else {
      height.value = withTiming(minH, { duration: 200 })
    }
  }, [active])

  const style = useAnimatedStyle(() => ({ height: height.value }))

  return <Animated.View style={[s.bar, style]} />
}

export default function VoiceWaveform({ active }: { active: boolean }) {
  return (
    <View style={s.row}>
      {BAR_CONFIGS.map(([minH, maxH, dur, delay], i) => (
        <WaveBar
          key={i}
          minH={minH}
          maxH={maxH}
          duration={dur}
          delay={delay}
          active={active}
        />
      ))}
    </View>
  )
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.accent.default,
  },
})
