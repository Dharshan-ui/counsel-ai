import { View, StyleSheet, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Sun } from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { colors, radii, spacing, typeScale } from '@/lib/design/tokens'

export default function TodayScreen() {
  const insets = useSafeAreaInsets()

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <View style={s.inner}>
        <View style={s.iconWrap}>
          <Sun size={32} color={colors.accent.default} strokeWidth={1.4} />
        </View>

        <Text style={s.headline}>One challenge. Every day.</Text>
        <Text style={s.description}>
          A daily situation designed to sharpen your judgment — before you need it.
        </Text>

        <Pressable
          style={({ pressed }) => [s.cta, pressed && { opacity: 0.7 }]}
        >
          <Text style={s.ctaText}>See today's challenge</Text>
        </Pressable>
      </View>
    </View>
  )
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.base,
    paddingBottom: TAB_BAR_CLEARANCE,
  },
  inner: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    gap: spacing[4],
  },
  iconWrap: {
    marginBottom: spacing[2],
  },
  headline: {
    fontFamily: 'Fraunces_700Bold',
    ...typeScale.h1,
    color: colors.text.primary,
    letterSpacing: -0.4,
  },
  description: {
    ...typeScale.body,
    color: colors.text.secondary,
    maxWidth: 280,
  },
  cta: {
    marginTop: spacing[2],
    borderWidth: 1,
    borderColor: colors.accent.default,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radii.md,
  },
  ctaText: {
    ...typeScale.small,
    color: colors.accent.default,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
})
