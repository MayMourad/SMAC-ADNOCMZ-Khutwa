/**
 * AuthGate
 * ========
 *
 * Wraps the tab navigator. Decides what the user sees before the app proper:
 *
 *   Firebase not configured  -> children  (mock mode: always "signed in")
 *   auth still loading         -> spinner
 *   no user                    -> <SignInScreen>
 *   user, family still loading -> spinner
 *   user but no family         -> <FamilySetupScreen>
 *   user + family              -> children
 *
 * Kept as plain conditional rendering (no routing) so the flow is easy to trace.
 */

import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { isFirebaseConfigured } from '@/config/env';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useFamily } from '@/hooks/use-family';
import { FamilySetupScreen } from '@/screens/family-setup-screen';
import { SignInScreen } from '@/screens/sign-in-screen';

function Loading({ label }: { label: string }) {
  return (
    <ThemedView style={styles.center}>
      <ActivityIndicator />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </ThemedView>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { family, loading: familyLoading, reload } = useFamily(user?.uid ?? null);

  // Mock mode — no Firebase, so skip the whole flow.
  if (!isFirebaseConfigured) return <>{children}</>;

  if (authLoading) return <Loading label="Starting Khutwa…" />;
  if (!user) return <SignInScreen />;
  if (familyLoading) return <Loading label="Finding your family…" />;
  if (!family) return <FamilySetupScreen onDone={reload} />;

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
});
