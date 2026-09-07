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
 *
 * Why an overlay instead of conditionally rendering the navigator: expo-router
 * wants the root layout to always render a navigator/Slot. Keeping <AppTabs/>
 * mounted at all times and painting over it keeps routing happy on every
 * platform. The screens underneath are inert while unauthenticated (their hooks
 * early-return without a user).
 */

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { isFirebaseConfigured } from '@/config/env';
import { Spacing } from '@/constants/theme';
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
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
      </ThemedView>
    </FullScreen>
  );
}

export function AuthOverlay() {
  const { user, loading: authLoading } = useAuth();
  const { family, loading: familyLoading, reload } = useFamily(user?.uid ?? null);

  if (!isFirebaseConfigured) return null; // mock mode — no gate
  if (authLoading) return <Loading label="Starting Khutwa…" />;
  if (!user) return <FullScreen><SignInScreen /></FullScreen>;
  if (familyLoading) return <Loading label="Finding your family…" />;
  if (!family) return <FullScreen><FamilySetupScreen onDone={reload} /></FullScreen>;

  return null; // signed in + in a family — show the app underneath
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
