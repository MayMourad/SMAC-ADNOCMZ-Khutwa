/**
 * Bottom tab bar (native)
 * =======================
 *
 * The platform's real tab bar (`expo-router/unstable-native-tabs`), themed to
 * the oasis palette. We deliberately do NOT hand-roll a JS tab bar — the native
 * one brings the correct press behaviour, blur and transitions for free; the
 * app's character lives in the screens, not the chrome.
 *
 * Four triggers, matching the four route files in src/app/. Icons are SF
 * Symbols on iOS and Material Symbols on Android. Labels are translated by the
 * per-route screen titles isn't possible here, so the labels stay in the app
 * language via the i18n table.
 */

import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLang } from '@/i18n';

export default function AppTabs() {
  const scheme = useColorScheme();
  const c = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { t } = useLang();

  return (
    <NativeTabs
      backgroundColor={c.surface}
      tintColor={c.primary}
      iconColor={{ default: c.textMuted, selected: c.primary }}
      labelStyle={{ default: { color: c.textMuted }, selected: { color: c.primary } }}
      indicatorColor={c.backgroundAlt}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>{t('nav.home')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'tree', selected: 'tree.fill' }} md="park" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="walk">
        <NativeTabs.Trigger.Label>{t('walk.title')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="figure.walk" md="directions_walk" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="stories">
        <NativeTabs.Trigger.Label>{t('stories.title')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'book', selected: 'book.fill' }} md="menu_book" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="family">
        <NativeTabs.Trigger.Label>{t('family.title')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.2.fill" md="groups" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
