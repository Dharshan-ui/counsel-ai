import { useState, useRef, useEffect } from 'react'
import {
  View,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Text as RNText,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { Send, ArrowLeft } from 'lucide-react-native'
import { Text } from '@/components/ui/Text'
import { colors, radii, spacing, typeScale } from '@/lib/design/tokens'
import { useScenarioStore, type Turn } from '@/lib/store/scenarioStore'
import { SCENARIOS } from '@/lib/scenarios'

function TypingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3)

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.3, { duration: 400 }),
      ),
      -1,
      false,
    )
    // offset each dot by its delay — wrap in setTimeout so it starts staggered
    const id = setTimeout(() => {}, delay)
    return () => clearTimeout(id)
  }, [])

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return <Animated.View style={[s.typingDot, style]} />
}

function TypingIndicator() {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={s.typingBubble}>
      <TypingDot delay={0} />
      <TypingDot delay={133} />
      <TypingDot delay={266} />
    </Animated.View>
  )
}

function MessageBubble({ turn }: { turn: Turn }) {
  const isUser = turn.role === 'user'
  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      style={[s.bubbleWrap, isUser ? s.bubbleWrapUser : s.bubbleWrapCounterparty]}
    >
      <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleCounterparty]}>
        <RNText style={[s.bubbleText, isUser ? s.bubbleTextUser : s.bubbleTextCounterparty]}>
          {turn.content}
        </RNText>
      </View>
    </Animated.View>
  )
}

export default function ScenarioScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { activeSession, isTyping, sendMessage, endAndScore } = useScenarioStore()
  const [draft, setDraft] = useState('')
  const listRef = useRef<FlatList>(null)
  const inputRef = useRef<TextInput>(null)

  const scenario = SCENARIOS.find(s => s.id === id)

  // Auto-scroll when turns or typing indicator changes
  useEffect(() => {
    if ((activeSession?.turns.length ?? 0) > 0 || isTyping) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [activeSession?.turns.length, isTyping])

  async function handleSend() {
    const text = draft.trim()
    if (!text || isTyping) return
    setDraft('')
    await sendMessage(text)
  }

  async function handleEndAndScore() {
    await endAndScore()
    router.replace('/score')
  }

  const turns = activeSession?.turns ?? []

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + spacing[2] }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [s.backBtn, pressed && { opacity: 0.6 }]}
          hitSlop={8}
        >
          <ArrowLeft size={20} color={colors.text.secondary} strokeWidth={1.8} />
        </Pressable>
        <View style={s.headerCenter}>
          <RNText style={s.headerTitle} numberOfLines={1}>
            {scenario?.title ?? 'Practice'}
          </RNText>
          <Text style={s.headerSub}>vs. {activeSession?.persona ?? scenario?.persona}</Text>
        </View>
        <Pressable
          onPress={handleEndAndScore}
          style={({ pressed }) => [s.endBtn, pressed && { opacity: 0.7 }]}
          disabled={turns.length < 2}
        >
          <Text style={[s.endText, turns.length < 2 && s.endTextDisabled]}>End & score</Text>
        </Pressable>
      </View>

      {/* Chat list */}
      <FlatList
        ref={listRef}
        data={turns}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => <MessageBubble turn={item} />}
        contentContainerStyle={[s.listContent, { paddingBottom: spacing[4] }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={s.emptyWrap}>
            <Text style={s.emptyText}>
              Start the negotiation. Make your opening move.
            </Text>
          </View>
        }
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input bar */}
      <View style={[s.inputBar, { paddingBottom: insets.bottom + spacing[3] }]}>
        <TextInput
          ref={inputRef}
          style={s.input}
          placeholder="Say something…"
          placeholderTextColor={colors.text.tertiary}
          value={draft}
          onChangeText={setDraft}
          multiline
          maxLength={500}
          returnKeyType="default"
          autoCapitalize="sentences"
          autoCorrect
          editable={!isTyping}
        />
        <Pressable
          onPress={handleSend}
          disabled={!draft.trim() || isTyping}
          style={({ pressed }) => [
            s.sendBtn,
            (!draft.trim() || isTyping) && s.sendBtnDisabled,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Send size={17} color="#111" strokeWidth={2} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg.base },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    gap: spacing[3],
    backgroundColor: colors.bg.base,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, gap: 2 },
  headerTitle: {
    fontFamily: 'Fraunces_700Bold',
    fontSize: 17,
    color: colors.text.primary,
    letterSpacing: -0.2,
  },
  headerSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.tiny.fontSize,
    color: colors.text.tertiary,
  },
  endBtn: { paddingVertical: 6, paddingHorizontal: 12 },
  endText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: typeScale.small.fontSize,
    color: colors.accent.default,
  },
  endTextDisabled: { opacity: 0.35 },

  listContent: { paddingHorizontal: spacing[4], paddingTop: spacing[4], gap: spacing[3] },

  bubbleWrap: { flexDirection: 'row' },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapCounterparty: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    borderRadius: radii.lg,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  bubbleUser: {
    backgroundColor: colors.accent.default,
    borderBottomRightRadius: 3,
  },
  bubbleCounterparty: {
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderBottomLeftRadius: 3,
  },
  bubbleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.body.fontSize,
    lineHeight: typeScale.body.lineHeight,
  },
  bubbleTextUser: { color: '#111111' },
  bubbleTextCounterparty: { color: colors.text.primary },

  typingBubble: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    borderBottomLeftRadius: 3,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    marginTop: spacing[3],
    marginHorizontal: spacing[4],
    minWidth: 60,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.text.tertiary,
  },

  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing[8],
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.small.fontSize,
    lineHeight: typeScale.small.lineHeight,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
    backgroundColor: colors.bg.base,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    borderRadius: radii.lg,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
    maxHeight: 100,
    fontFamily: 'Inter_400Regular',
    fontSize: typeScale.body.fontSize,
    lineHeight: typeScale.body.lineHeight,
    color: colors.text.primary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.lg,
    backgroundColor: colors.accent.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
})
