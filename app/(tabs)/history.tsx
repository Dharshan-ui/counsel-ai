import { useState, useMemo } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Text as RNText,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { Search } from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { TAB_BAR_CLEARANCE } from '@/components/TabBar'
import { colors, radii, spacing, typeScale } from '@/lib/design/tokens'
import { useAdviceStore, type SituationEntry } from '@/lib/store/adviceStore'

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const dayMs = 86_400_000
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (diff < dayMs && d.getDate() === now.getDate()) return `Today · ${timeStr}`
  if (diff < 2 * dayMs) return `Yesterday · ${timeStr}`
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${timeStr}`
}

function HistoryCard({ entry, onDelete }: { entry: SituationEntry; onDelete: () => void }) {
  const headline = entry.advice?.headline ?? entry.prompt.slice(0, 80)
  const preview = entry.advice?.strategy ?? ''

  return (
    <Pressable
      onPress={() => router.push(`/situation/${entry.id}`)}
      onLongPress={() =>
        Alert.alert('Delete', 'Remove this from your history?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: onDelete },
        ])
      }
      style={({ pressed }) => [s.card, pressed && { opacity: 0.75 }]}
    >
      <View style={s.cardRow}>
        <Text style={s.headline} numberOfLines={2}>{headline}</Text>
        <Text style={s.date}>{formatDate(entry.createdAt)}</Text>
      </View>
      {!!preview && (
        <Text style={s.preview} numberOfLines={2}>{preview}</Text>
      )}
    </Pressable>
  )
}

function GhostCard({ headline, preview }: { headline: string; preview: string }) {
  return (
    <View style={[s.card, s.ghostCard]}>
      <Text style={[s.headline, s.ghostText]} numberOfLines={2}>{headline}</Text>
      <Text style={[s.preview, s.ghostText]} numberOfLines={2}>{preview}</Text>
    </View>
  )
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets()
  const { situations, deleteSituation } = useAdviceStore()
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const timerRef = { current: 0 as ReturnType<typeof setTimeout> }

  function handleSearch(text: string) {
    setQuery(text)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setDebouncedQuery(text), 300)
  }

  const filtered = useMemo(() => {
    if (!debouncedQuery) return situations
    const q = debouncedQuery.toLowerCase()
    return situations.filter(
      s =>
        s.prompt.toLowerCase().includes(q) ||
        (s.advice?.headline?.toLowerCase().includes(q) ?? false),
    )
  }, [situations, debouncedQuery])

  const isEmpty = situations.length === 0

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
      <RNText style={s.title}>History</RNText>

      {/* Search bar */}
      <View style={s.searchRow}>
        <Search size={15} color={colors.text.tertiary} strokeWidth={1.8} />
        <TextInput
          style={s.searchInput}
          placeholder="Search situations…"
          placeholderTextColor={colors.text.tertiary}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {isEmpty ? (
        <View style={s.emptySection}>
          <Text style={s.emptyHint}>
            Once you've gotten counsel, your past situations live here.
          </Text>
          <GhostCard
            headline="You hold the leverage — the question is how much of it you're willing to use."
            preview="Walk in with the competing offer as a fact, not a threat. Your goal is a counter that reflects your market value."
          />
          <GhostCard
            headline="This conversation will not fix the relationship, but it might clarify whether one is worth having."
            preview="The goal isn't to win the argument — it's to be heard and to understand what you're actually dealing with."
          />
        </View>
      ) : (
        <View style={s.list}>
          {filtered.map(entry => (
            <HistoryCard
              key={entry.id}
              entry={entry}
              onDelete={() => deleteSituation(entry.id)}
            />
          ))}
          {filtered.length === 0 && (
            <Text style={s.noResults}>No results for "{debouncedQuery}"</Text>
          )}
        </View>
      )}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.base },
  content: { paddingHorizontal: spacing[5], gap: spacing[5] },

  title: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: typeScale.display.fontSize,
    lineHeight: typeScale.display.lineHeight,
    color: colors.text.primary,
    letterSpacing: -0.6,
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    paddingHorizontal: spacing[3],
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    color: colors.text.primary,
    height: 36,
  },

  emptySection: { gap: spacing[4] },
  emptyHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    lineHeight: typeScale.small.lineHeight,
    color: colors.text.tertiary,
  },

  list: { gap: spacing[3] },

  card: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    padding: spacing[5],
    gap: spacing[2],
  },
  ghostCard: { opacity: 0.35 },
  ghostText: {},

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing[3],
  },
  headline: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 17,
    lineHeight: 22,
    color: colors.text.primary,
    flex: 1,
    letterSpacing: -0.2,
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.tiny.fontSize,
    color: colors.text.tertiary,
    paddingTop: 2,
  },
  preview: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    lineHeight: typeScale.small.lineHeight,
    color: colors.text.secondary,
  },

  noResults: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing[8],
  },
})
