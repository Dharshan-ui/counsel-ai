import { View, ScrollView, StyleSheet, Pressable, Text as RNText, Alert, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Text } from '@/components/ui/Text'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { colors, radii, spacing, typeScale } from '@/lib/design/tokens'
import { useAdviceStore } from '@/lib/store/adviceStore'

const CHALLENGES = [
  "Your manager just took credit for your work in front of the team. What do you say in the next 24 hours?",
  "A close friend asks to borrow $5,000. They've been unreliable with money before. Draft your response.",
  "Your roommate keeps inviting their partner over. The lease is yours. How do you raise this?",
  "A recruiter dangles a role with a 40% raise but worse manager and no remote. Write your decision framework.",
  "You've been underpriced for client work for 6 months. The next renewal is in two days. What's your move?",
  "Your direct report keeps missing deadlines but is going through a divorce. How do you handle the next 1:1?",
  "You spotted a serious security flaw in a vendor's product. They're also a key partner. Who do you tell first and how?",
]

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const CHALLENGE_EPOCH = 20453 // epoch day for Jan 1, 2026

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`)
  } else {
    Alert.alert(title, message, [{ text: 'OK' }])
  }
}

function formatDate(d: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const setPrefillPrompt = useAdviceStore(s => s.setPrefillPrompt)

  const today = new Date()
  const epochDay = Math.floor(Date.now() / 86400000)
  const dayIndex = epochDay % 7
  const challengeNumber = String(epochDay - CHALLENGE_EPOCH + 1).padStart(3, '0')
  // JS getDay(): 0=Sun … 6=Sat → remap to 0=Mon … 6=Sun
  const todayDot = (today.getDay() + 6) % 7

  const challenge = CHALLENGES[dayIndex]
  const pastChallenges = [
    { label: 'Yesterday',   text: CHALLENGES[(dayIndex + 6) % 7] },
    { label: '2 days ago',  text: CHALLENGES[(dayIndex + 5) % 7] },
    { label: '3 days ago',  text: CHALLENGES[(dayIndex + 4) % 7] },
  ]

  function handleGetCounsel() {
    setPrefillPrompt(challenge)
    router.navigate('/')
  }

  function handlePracticeThis() {
    showAlert('Practice this challenge', 'Coming soon — for now, get counsel on it instead.')
  }

  function handleLockedChallenge() {
    showAlert('Locked', "Past challenges unlock with a daily streak. Today's is ready now.")
  }

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={[
        s.content,
        { paddingTop: insets.top + spacing[6], paddingBottom: TAB_BAR_CLEARANCE + spacing[8] },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <View style={s.wordmarkWrap}>
          <RNText style={s.wordmark}>TODAY</RNText>
          <View style={s.wordmarkUnderline} />
        </View>
        <Text style={s.dateText}>{formatDate(today)}</Text>
      </View>

      {/* Daily Challenge Card */}
      <View style={s.challengeCard}>
        <RNText style={s.challengeTag}>CHALLENGE {challengeNumber}</RNText>
        <RNText style={s.challengeTitle}>{challenge}</RNText>
        <View style={s.challengeActions}>
          <Pressable
            onPress={handleGetCounsel}
            style={({ pressed }) => [s.counselBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={s.counselBtnText}>Get counsel on this</Text>
          </Pressable>
          <Pressable
            onPress={handlePracticeThis}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Text style={s.practiceText}>Practice this</Text>
          </Pressable>
        </View>
      </View>

      {/* Streak */}
      <View style={s.section}>
        <RNText style={s.sectionLabel}>STREAK</RNText>
        <View style={s.dayCirclesRow}>
          {DAY_LABELS.map((label, i) => (
            <View key={label} style={s.dayCircleWrap}>
              <View style={[s.dayCircle, i === todayDot && s.dayCircleToday]} />
              <Text style={[s.dayLabel, i === todayDot && s.dayLabelToday]}>{label}</Text>
            </View>
          ))}
        </View>
        <Text style={s.streakCaption}>Build the muscle. Daily.</Text>
      </View>

      {/* Past Challenges */}
      <View style={s.section}>
        <RNText style={s.sectionLabel}>PAST CHALLENGES</RNText>
        {pastChallenges.map(({ label, text }) => (
          <Pressable
            key={label}
            onPress={handleLockedChallenge}
            style={({ pressed }) => [s.pastCard, pressed && { opacity: 0.35 }]}
          >
            <View style={s.pastCardHeader}>
              <Text style={s.pastCardMeta}>{label.toUpperCase()}</Text>
              <View style={s.lockedBadge}>
                <Text style={s.lockedText}>LOCKED</Text>
              </View>
            </View>
            <RNText style={s.pastCardTitle} numberOfLines={2}>{text}</RNText>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.base },
  content: { paddingHorizontal: spacing[5], gap: spacing[6] },

  // Header
  header: { gap: spacing[2] },
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
  dateText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    lineHeight: typeScale.small.lineHeight,
    color: colors.text.secondary,
  },

  // Challenge card
  challengeCard: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    padding: spacing[5],
    gap: spacing[4],
  },
  challengeTag: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: typeScale.tiny.fontSize,
    color: colors.accent.default,
    letterSpacing: 1.5,
  },
  challengeTitle: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 22,
    lineHeight: 30,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  challengeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  counselBtn: {
    backgroundColor: colors.accent.default,
    paddingVertical: 11,
    paddingHorizontal: spacing[4],
    borderRadius: radii.lg,
  },
  counselBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: typeScale.small.fontSize,
    color: '#111111',
    letterSpacing: 0.1,
  },
  practiceText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    color: colors.text.secondary,
  },

  // Streak + Past (shared section style)
  section: { gap: spacing[3] },
  sectionLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: typeScale.tiny.fontSize,
    color: colors.text.tertiary,
    letterSpacing: 1.2,
  },

  // Streak circles
  dayCirclesRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  dayCircleWrap: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.accent.default,
    opacity: 0.35,
  },
  dayCircleToday: {
    opacity: 1,
    borderWidth: 0,
    backgroundColor: colors.accent.default,
    shadowColor: colors.accent.default,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  dayLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.tiny.fontSize,
    color: colors.text.tertiary,
  },
  dayLabelToday: {
    color: colors.accent.default,
    fontFamily: 'Inter_600SemiBold',
  },
  streakCaption: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    color: colors.text.tertiary,
  },

  // Past challenge cards
  pastCard: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    padding: spacing[4],
    gap: spacing[2],
    opacity: 0.5,
  },
  pastCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pastCardMeta: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: typeScale.tiny.fontSize,
    color: colors.text.tertiary,
    letterSpacing: 1,
  },
  lockedBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  lockedText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    color: colors.text.tertiary,
    letterSpacing: 1,
  },
  pastCardTitle: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: typeScale.body.fontSize,
    lineHeight: typeScale.body.lineHeight,
    color: colors.text.secondary,
  },
})
