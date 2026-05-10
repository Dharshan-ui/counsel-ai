import { View, StyleSheet, useWindowDimensions } from 'react-native'
import { ChevronRight, AlertTriangle } from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { colors, radii, spacing, typeScale } from '@/lib/design/tokens'

export type AdviceData = {
  headline: string
  strategy: string
  talkingPoints: string[]
  likelyOutcomes: {
    best: string
    likely: string
    worst: string
  }
  followUps: string[]
  riskFlags: string[]
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={s.sectionLabel}>{children}</Text>
}

function OutcomeChip({
  label,
  text,
  accentColor,
  stacked,
}: {
  label: string
  text: string
  accentColor: string
  stacked: boolean
}) {
  return (
    <View style={[s.outcomeChip, { borderColor: `${accentColor}44` }, stacked && s.outcomeChipStacked]}>
      <Text style={[s.outcomeLabel, { color: accentColor }]}>{label}</Text>
      <Text style={s.outcomeText}>{text}</Text>
    </View>
  )
}

export default function AdviceCard({ advice }: { advice: AdviceData }) {
  const { width } = useWindowDimensions()
  const stacked = width < 400

  return (
    <View style={s.card}>
      <Text style={s.headline} numberOfLines={4}>
        {advice.headline}
      </Text>

      <View style={s.divider} />

      <View style={s.section}>
        <SectionLabel>STRATEGY</SectionLabel>
        <Text style={s.strategyText}>{advice.strategy}</Text>
      </View>

      <View style={s.section}>
        <SectionLabel>TALKING POINTS</SectionLabel>
        <View style={s.talkingList}>
          {advice.talkingPoints.map((point, i) => (
            <View key={i} style={s.talkingRow}>
              <Text style={s.talkingNumber}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={s.talkingText}>{point}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.section}>
        <SectionLabel>LIKELY OUTCOMES</SectionLabel>
        <View style={stacked ? s.outcomesCol : s.outcomesRow}>
          <OutcomeChip label="BEST" text={advice.likelyOutcomes.best} accentColor={colors.semantic.success} stacked={stacked} />
          <OutcomeChip label="LIKELY" text={advice.likelyOutcomes.likely} accentColor={colors.accent.default} stacked={stacked} />
          <OutcomeChip label="WORST" text={advice.likelyOutcomes.worst} accentColor={colors.semantic.danger} stacked={stacked} />
        </View>
      </View>

      <View style={s.section}>
        <SectionLabel>NEXT STEPS</SectionLabel>
        <View style={s.followList}>
          {advice.followUps.map((item, i) => (
            <View key={i} style={s.followRow}>
              <ChevronRight size={13} color={colors.accent.default} strokeWidth={2.2} style={s.followIcon} />
              <Text style={s.followText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {advice.riskFlags.length > 0 && (
        <View style={s.section}>
          <SectionLabel>RISK FLAGS</SectionLabel>
          <View style={s.riskList}>
            {advice.riskFlags.map((flag, i) => (
              <View key={i} style={s.riskChip}>
                <AlertTriangle size={11} color={colors.semantic.warning} strokeWidth={2} />
                <Text style={s.riskText}>{flag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    padding: spacing[6],
    gap: spacing[5],
  },
  headline: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: typeScale.h1.fontSize,
    lineHeight: typeScale.h1.lineHeight,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border.subtle,
    marginVertical: -spacing[2],
  },
  section: { gap: spacing[3] },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: typeScale.tiny.fontSize,
    lineHeight: typeScale.tiny.lineHeight,
    color: colors.accent.default,
    letterSpacing: 1.2,
  },
  strategyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.body.fontSize,
    lineHeight: typeScale.body.lineHeight,
    color: colors.text.secondary,
  },
  talkingList: { gap: spacing[3] },
  talkingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[3] },
  talkingNumber: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: typeScale.small.fontSize,
    lineHeight: typeScale.body.lineHeight,
    color: colors.accent.default,
    minWidth: 22,
  },
  talkingText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.body.fontSize,
    lineHeight: typeScale.body.lineHeight,
    color: colors.text.primary,
  },
  outcomesRow: { flexDirection: 'row', gap: spacing[2] },
  outcomesCol: { flexDirection: 'column', gap: spacing[2] },
  outcomeChip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing[3],
    gap: spacing[2],
    backgroundColor: colors.bg.elevated,
  },
  outcomeChipStacked: { flex: undefined },
  outcomeLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1 },
  outcomeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    lineHeight: 15,
    color: colors.text.secondary,
  },
  followList: { gap: spacing[3] },
  followRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing[2] },
  followIcon: { marginTop: 4 },
  followText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.body.fontSize,
    lineHeight: typeScale.body.lineHeight,
    color: colors.text.primary,
  },
  riskList: { gap: spacing[2] },
  riskChip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    borderWidth: 1,
    borderColor: `${colors.semantic.warning}33`,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: `${colors.semantic.warning}08`,
  },
  riskText: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    lineHeight: typeScale.small.lineHeight,
    color: colors.text.secondary,
  },
})
