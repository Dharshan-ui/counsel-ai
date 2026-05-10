import { Tabs } from 'expo-router'
import { MessageSquareText, Swords, Archive, Sun } from 'lucide-react-native'
import TabBar, { TAB_BAR_HEIGHT } from '@/components/TabBar'
import { BG } from '@/lib/theme'

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: BG },
        tabBarStyle: { height: TAB_BAR_HEIGHT },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Advise',
          tabBarIcon: ({ color, size }) => (
            <MessageSquareText size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          tabBarLabel: 'Practice',
          tabBarIcon: ({ color, size }) => (
            <Swords size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => (
            <Archive size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          tabBarLabel: 'Today',
          tabBarIcon: ({ color, size }) => (
            <Sun size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />

      {/* Legacy template screens — hidden from tab bar */}
      <Tabs.Screen name="explore"  options={{ href: null }} />
      <Tabs.Screen name="activity" options={{ href: null }} />
      <Tabs.Screen name="profile"  options={{ href: null }} />
    </Tabs>
  )
}
