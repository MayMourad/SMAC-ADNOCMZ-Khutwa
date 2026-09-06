/**
 * Bottom tab bar (native)
 * =======================
 *
 * Four tabs, matching the four route files in `src/app/`:
 *   index.tsx   -> Home    (the shared Ghaf tree + Khutwa Score)
 *   walk.tsx    -> Walk     (active tracking: steps, geofence check-ins, bloom)
 *   stories.tsx -> Stories  (log of unlocked location memories)
 *   family.tsx  -> Family   (members + privacy settings)
 *
 * Uses `expo-router/unstable-native-tabs`, which renders a real UITabBar /
 * BottomNavigationView. Icons are SF Symbols on iOS (`sf`) and Material Symbols
 * on Android (`md`) — no image assets needed. The web bar is a separate file
 * (`app-tabs.web.tsx`) because native tabs don't render on web.
 */

import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="tree.fill" md="park" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="walk">
        <NativeTabs.Trigger.Label>Walk</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="figure.walk" md="directions_walk" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="stories">
        <NativeTabs.Trigger.Label>Stories</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="book.fill" md="menu_book" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="family">
        <NativeTabs.Trigger.Label>Family</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2.fill" md="groups" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
