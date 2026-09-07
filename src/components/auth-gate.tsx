/**
 * AuthOverlay
 * ===========
 *
 * Sits on TOP of the (always-mounted) tab navigator and covers it until the
 * user is signed in and in a family:
 *
 *   Firebase not configured    -> nothing (mock mode: always "signed in")
 *   auth still loading          -> full-screen spinner
 *   no user                    -> <SignInScreen>
 *   user, family still loading  -> full-screen spinner
 *   user but no family         -> <FamilySetupScreen>
 *   user + family              -> nothing (the tabs underneath show through)
 */

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { isFirebaseConfigured } from '@/config/env';
import { Spacing } from '@/constants/theme';
import { useLang } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { useFamily } from '@/hooks/use-family';
import { FamilySetupScreen } from '@/screens/family-setup-screen';
import { SignInScreen } from '@/screens/sign-in-screen';

function FullScreen({ children }: { children: React.ReactNode }) {
  return <View style={styles.overlay}>{children}</View>;
}

function Loading({ label }: { label: string }) {
  return (
    <FullScreen>
      <ThemedView style={styles.center}>
        <ActivityIndicator />
        <ThemedText type="callout" color="textSecondary">
          {label}
        </ThemedText>
      </ThemedView>
    </FullScreen>
  );
}

export function AuthOverlay() {
  const { t } = useLang();
  const { user, loading: authLoading } = useAuth();
  const { family, loading: familyLoading, reload } = useFamily(user?.uid ?? null);

  if (!isFirebaseConfigured) return null;
  if (authLoading) return <Loading label={t('auth.starting')} />;
  if (!user) return <FullScreen><SignInScreen /></FullScreen>;
  if (familyLoading) return <Loading label={t('setup.finding')} />;
  if (!family) return <FullScreen><FamilySetupScreen onDone={reload} /></FullScreen>;

  return null;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 100,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
});
