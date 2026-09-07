/**
 * LanguageToggle — a small EN / العربية segmented control.
 * Lives on the Family screen (and the sign-in screen).
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PressableScale } from '@/components/pressable-scale';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { LANGUAGES, useLang } from '@/i18n';

export function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();
  const { lang, setLang } = useLang();

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: theme.backgroundAlt, borderColor: theme.border },
      ]}>
      {LANGUAGES.map((l) => {
        const active = l.code === lang;
        return (
          <PressableScale
            key={l.code}
            activeScale={0.94}
            onPress={() => setLang(l.code)}
            style={[
              styles.seg,
              compact && styles.segCompact,
              active && { backgroundColor: theme.surface },
              active && styles.segActive,
            ]}>
            <ThemedText
              type="callout"
              ltr
              style={{ color: active ? theme.text : theme.textMuted }}>
              {l.native}
            </ThemedText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: Radii.pill,
    borderWidth: 1,
    gap: 3,
    alignSelf: 'flex-start',
  },
  seg: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segCompact: { paddingVertical: Spacing.one, paddingHorizontal: Spacing.three },
  segActive: {
    shadowColor: '#3B2A15',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
