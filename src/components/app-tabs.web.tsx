/**
 * Bottom tab bar (web)
 * ====================
 *
 * Web fallback for `app-tabs.tsx` (native tabs don't render on web). A floating
 * pill bar in the oasis palette. The phone is the real target — this is for
 * quick layout checks.
 */

import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { PressableScale } from './pressable-scale';
import { Colors, MaxContentWidth, Radii, Shadow, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLang } from '@/i18n';

export default function AppTabs() {
  const { t } = useLang();
  const TABS = [
    { name: 'home', href: '/', label: t('nav.home') },
    { name: 'walk', href: '/walk', label: t('walk.title') },
    { name: 'stories', href: '/stories', label: t('stories.title') },
    { name: 'family', href: '/family', label: t('family.title') },
  ] as const;

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          {TABS.map((tab) => (
            <TabTrigger key={tab.name} name={tab.name} href={tab.href} asChild>
              <TabButton>{tab.label}</TabButton>
            </TabTrigger>
          ))}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <PressableScale {...(props as object)} haptic={false} activeScale={0.95}>
      <View
        style={[
          styles.tab,
          isFocused && { backgroundColor: c.backgroundAlt },
        ]}>
        <ThemedText type="callout" style={{ color: isFocused ? c.primary : c.textMuted }}>
          {children as React.ReactNode}
        </ThemedText>
      </View>
    </PressableScale>
  );
}

function CustomTabList(props: TabListProps) {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <View style={[styles.bar, { backgroundColor: c.surface, borderColor: c.border }]}>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: Spacing.four,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    gap: Spacing.one,
    padding: Spacing.one,
    borderRadius: Radii.pill,
    borderWidth: 1,
    maxWidth: MaxContentWidth,
    ...Shadow.lg,
  },
  tab: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radii.pill,
  },
});
