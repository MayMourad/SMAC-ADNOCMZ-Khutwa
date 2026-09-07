/**
 * FamilyScreen (tab: Family)
 * ==========================
 *
 * Members, the invite code, the privacy controls the brief calls for, the
 * language toggle, and sign out.
 */

import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { FadeIn } from '@/components/fade-in';

import { Card } from '@/components/card';
import { LanguageToggle } from '@/components/language-toggle';
import { PressableScale } from '@/components/pressable-scale';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { isFirebaseConfigured } from '@/config/env';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useLang } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';
import { useFamily } from '@/hooks/use-family';
import { useTheme } from '@/hooks/use-theme';
import { setMemberShareLocation, signOutUser } from '@/services/firebase';

const AVATAR_TONES = ['primary', 'accent', 'sky'] as const;

export function FamilyScreen() {
  const theme = useTheme();
  const { t } = useLang();
  const { user } = useAuth();
  const { family } = useFamily(user?.uid ?? null);
  const [pendingUid, setPendingUid] = useState<string | null>(null);

  const me = family?.members.find((m) => m.uid === user?.uid);
  const iAmGuardian = me?.role === 'guardian';

  const setShare = async (uid: string, value: boolean) => {
    if (!family || !isFirebaseConfigured) return;
    setPendingUid(uid);
    try {
      await setMemberShareLocation(family.id, uid, value);
    } finally {
      setPendingUid(null);
    }
  };

  return (
    <Screen wash="primary">
      <FadeIn>
        <ThemedText type="title">{t('family.title')}</ThemedText>
      </FadeIn>

      <FadeIn delay={80}>
        <Card style={styles.card}>
          <ThemedText type="label" color="textMuted" uppercase>
            {t('family.inviteCode')}
          </ThemedText>
          <ThemedText
            ltr
            style={{ fontFamily: Fonts.serifSemiBold, fontSize: 32, lineHeight: 38, color: theme.text, letterSpacing: 2 }}>
            {family?.inviteCode ?? '—'}
          </ThemedText>
          <ThemedText type="small" color="textMuted">
            {t('family.inviteHint')}
          </ThemedText>
        </Card>
      </FadeIn>

      <FadeIn delay={150}>
        <Card style={styles.card}>
          <ThemedText type="label" color="textMuted" uppercase>
            {t('family.members')}
          </ThemedText>
          {family?.members.map((m, i) => {
            const canToggle = m.uid === user?.uid || (iAmGuardian && m.role === 'member');
            const tone = AVATAR_TONES[i % AVATAR_TONES.length];
            return (
              <View key={m.uid} style={styles.memberRow}>
                <View style={[styles.avatar, { backgroundColor: theme[tone] }]}>
                  <ThemedText type="subtitle" style={{ color: theme.onPrimary }} ltr>
                    {m.displayName.trim().charAt(0).toUpperCase() || '?'}
                  </ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="subtitle">
                    {m.displayName}
                    {m.uid === user?.uid ? ` (${t('family.you')})` : ''}
                  </ThemedText>
                  <ThemedText type="small" color="textMuted">
                    {t(`family.role.${m.role}`)} ·{' '}
                    {m.shareLocation ? t('family.location.shared') : t('family.location.private')}
                  </ThemedText>
                </View>
                <Switch
                  value={m.shareLocation}
                  disabled={!canToggle || pendingUid === m.uid}
                  onValueChange={(v) => setShare(m.uid, v)}
                  trackColor={{ true: theme.primary }}
                />
              </View>
            );
          })}
        </Card>
      </FadeIn>

      <FadeIn delay={220}>
        <Card style={styles.card}>
          <ThemedText type="label" color="textMuted" uppercase>
            {t('family.language')}
          </ThemedText>
          <LanguageToggle />
        </Card>
      </FadeIn>

      <FadeIn delay={290}>
        <Card variant="flat" style={styles.card}>
          <ThemedText type="heading">{t('family.privacy')}</ThemedText>
          <ThemedText type="body" color="textSecondary">
            {t('family.privacyBody')}
          </ThemedText>
        </Card>
      </FadeIn>

      {isFirebaseConfigured && (
        <PressableScale haptic={false} onPress={() => signOutUser()} style={styles.signOut}>
          <ThemedText type="callout" color="textMuted">
            {t('common.signOut')}
          </ThemedText>
        </PressableScale>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignSelf: 'stretch', gap: Spacing.two },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOut: { alignSelf: 'center', paddingVertical: Spacing.three },
});
