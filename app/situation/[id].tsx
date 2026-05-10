import { ScrollView, View, StyleSheet, Pressable, Text as RNText } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import Animated, { FadeIn } from 'react-native-reanimated'
import { ArrowLeft } from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import AdviceCard from '@/components/AdviceCard'
import { colors, radii, spacing, typeScale } from '@/lib/design/tokens'
import { useAdviceStore } from '@/lib/store/adviceStore'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function SituationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { situations } = useAdviceStore()

  const entry = situations.find(s => s.id === id)

  if (!entry) {
    return (
      <View style={[s.root, s.center]}>
        <Text style={s.notFound}>Situation not found.</Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.backLink, pressed && { opacity: 0.6 }]}
        >
          <Text style={s.backLinkText}>← Go back</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={[
        s.content,
        { paddingTop: insets.top + spacing[3], paddingBottom: insets.bottom + spacing[8] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
        hitSlop={8}
      >
        <ArrowLeft size={20} color={colors.text.secondary} strokeWidth={1.8} />
        <Text style={s.backText}>History</Text>
      </Pressable>

      <Animated.View entering={FadeIn.duration(350)} style={s.inner}>
        {/* Original situation */}
        <View style={s.situationCard}>
          <Text style={s.situationLabel}>ORIGINAL SITUATION</Text>
          <RNText style={s.situationText}>{entry.prompt}</RNText>
          <Text style={s.dateText}>{formatDate(entry.createdAt)}</Text>
        </View>

        {/* Full advice card */}
        {entry.advice ? (
          <AdviceCard advice={entry.advice} />
        ) : (
          <View style={s.noAdvice}>
            <Text style={s.noAdviceText}>No advice generated for this entry.</Text>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.base },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing[5], gap: spacing[5] },
  inner: { gap: spacing[4] },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    alignSelf: 'flex-start',
    paddingVertical: spacing[2],
  },
  backText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    color: colors.text.secondary,
  },

  situationCard: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    padding: spacing[5],
    gap: spacing[3],
  },
  situationLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: typeScale.tiny.fontSize,
    color: colors.accent.default,
    letterSpacing: 1.2,
  },
  situationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.body.fontSize,
    lineHeight: typeScale.body.lineHeight,
    color: colors.text.primary,
  },
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.tiny.fontSize,
    color: colors.text.tertiary,
  },

  noAdvice: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    padding: spacing[5],
    alignItems: 'center',
  },
  noAdviceText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    color: colors.text.tertiary,
  },

  notFound: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.body.fontSize,
    color: colors.text.tertiary,
    marginBottom: spacing[4],
  },
  backLink: { alignSelf: 'flex-start' },
  backLinkText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    color: colors.text.secondary,
  },
})
