import { ScrollView, View, StyleSheet, Pressable, Text as RNText } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { colors, radii, spacing, typeScale } from '@/lib/design/tokens'
import { SCENARIOS, type Scenario } from '@/lib/scenarios'
import { useScenarioStore } from '@/lib/store/scenarioStore'

function DifficultyDots({ level }: { level: 1 | 2 | 3 }) {
  return (
    <View style={s.dots}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[s.dot, i <= level ? s.dotFilled : s.dotEmpty]} />
      ))}
    </View>
  )
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const { startScenario } = useScenarioStore()

  function handlePress() {
    startScenario(scenario.id, scenario.persona, scenario.difficulty)
    router.push(`/scenario/${scenario.id}`)
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [s.card, pressed && { opacity: 0.75 }]}
    >
      <View style={s.cardTop}>
        <RNText style={s.cardTitle}>{scenario.title}</RNText>
        <DifficultyDots level={scenario.difficulty} />
      </View>
      <Text style={s.cardSetup} numberOfLines={2}>{scenario.setup}</Text>
      <View style={s.personaPill}>
        <Text style={s.personaText}>vs. {scenario.persona}</Text>
      </View>
    </Pressable>
  )
}

export default function PracticeScreen() {
  const insets = useSafeAreaInsets()

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={[
        s.content,
        { paddingTop: insets.top + spacing[6], paddingBottom: TAB_BAR_CLEARANCE + spacing[8] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.header}>
        <RNText style={s.title}>Practice</RNText>
        <Text style={s.tagline}>Negotiate without stakes.</Text>
      </View>

      <View style={s.list}>
        {SCENARIOS.map(scenario => (
          <ScenarioCard key={scenario.id} scenario={scenario} />
        ))}
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.base },
  content: { paddingHorizontal: spacing[5], gap: spacing[5] },

  header: { gap: spacing[2] },
  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: typeScale.display.fontSize,
    lineHeight: typeScale.display.lineHeight,
    color: colors.text.primary,
    letterSpacing: -0.6,
  },
  tagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    color: colors.text.tertiary,
  },

  list: { gap: spacing[3] },

  card: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    padding: spacing[5],
    gap: spacing[3],
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  cardTitle: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 18,
    lineHeight: 24,
    color: colors.text.primary,
    flex: 1,
    letterSpacing: -0.2,
  },
  cardSetup: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    lineHeight: typeScale.small.lineHeight,
    color: colors.text.secondary,
  },

  personaPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: `${colors.accent.default}55`,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  personaText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: colors.accent.default,
    letterSpacing: 0.2,
  },

  dots: { flexDirection: 'row', gap: 5, paddingTop: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotFilled: { backgroundColor: colors.accent.default },
  dotEmpty: { backgroundColor: colors.border.strong },
})
