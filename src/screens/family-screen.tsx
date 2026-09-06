/**
 * FamilyScreen  (tab: Family)
 * ===========================
 *
 * Members of the family group, the invite code for adding the 2nd/3rd member,
 * and the privacy controls that the brief's Privacy & Safety section calls for:
 *   - each member has a "share my location with the family" switch
 *   - a guardian can turn location sharing off for a younger member
 *   - a short, plain explanation of what stays on the device
 */

import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useFamily } from '@/hooks/use-family';
import { useTheme } from '@/hooks/use-theme';

export function FamilyScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { family } = useFamily(user?.uid ?? null);

  const me = family?.members.find((m) => m.uid === user?.uid);
  const iAmGuardian = me?.role === 'guardian';

  const setShareLocation = (uid: string, value: boolean) => {
    // TEAM TODO: persist to Firestore — updateDoc(family/<id>, members[...])
    // For now this is a visual stub so the interaction is demoable.
    console.log('[FamilyScreen] setShareLocation', uid, value);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SafeAreaView style={styles.inner}>
          <ThemedText type="subtitle">Family</ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Invite code</ThemedText>
            <ThemedText type="title">{family?.inviteCode ?? '—'}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Share this with a family member so they can join your group.
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Members</ThemedText>
            {family?.members.map((m) => {
              const canToggle = m.uid === user?.uid || (iAmGuardian && m.role === 'member');
              return (
                <View key={m.uid} style={styles.memberRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="small">
                      {m.displayName}
                      {m.uid === user?.uid ? ' (you)' : ''}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {m.role} · location {m.shareLocation ? 'shared' : 'private'}
                    </ThemedText>
                  </View>
                  <Switch
                    value={m.shareLocation}
                    disabled={!canToggle}
                    onValueChange={(v) => setShareLocation(m.uid, v)}
                  />
                </View>
              );
            })}
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">Your privacy</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Location is processed on your device. It is used only to unlock nearby
              family stories and to bloom the tree when you&apos;re together. It is not
              shared outside your family group and not sent to any third party. AI
              stories are written ahead of time from approved content — your live
              location is never sent to an AI service.
            </ThemedText>
          </ThemedView>
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.five,
  },
  inner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.three,
    paddingTop: Spacing.four,
  },
  card: {
    alignSelf: 'stretch',
    padding: Spacing.four,
    borderRadius: Spacing.four,
    gap: Spacing.two,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
