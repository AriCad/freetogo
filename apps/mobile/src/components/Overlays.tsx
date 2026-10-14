import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Txt, shadow, space, useTheme } from '@freetogo/ui';
import { useStore } from '../state/AppStore';

/** In-app alert banner (also shown while a system notification is delivered on a device). Tap → offer. */
export function AlertBanner() {
  const { banner, dismissBanner } = useStore();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  if (!banner) return null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={banner.title}
      onPress={() => {
        dismissBanner();
        router.push(banner.href as never);
      }}
      style={[styles.banner, shadow.float, { top: insets.top + 8, backgroundColor: colors.surface }]}
    >
      <Image source={require('../../assets/icon.png')} style={styles.icon} />
      <View style={{ flex: 1 }}>
        <Txt variant="tiny" color="textSecondary">FREE TO GO · {t('now_lbl')}</Txt>
        <Txt weight="bold" numberOfLines={2}>{banner.title}</Txt>
        <Txt variant="small" numberOfLines={2}>{banner.body}</Txt>
      </View>
    </Pressable>
  );
}

export function Toast() {
  const { toast } = useStore();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  if (!toast) return null;
  return (
    <View pointerEvents="none" accessibilityLiveRegion="polite" style={[styles.toast, { bottom: insets.bottom + 92, backgroundColor: colors.textPrimary }]}>
      <Txt variant="small" style={{ color: colors.surface }}>{toast}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { position: 'absolute', left: 8, right: 8, zIndex: 50, borderRadius: 22, padding: 12, flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  icon: { width: 38, height: 38, borderRadius: 10 },
  toast: { position: 'absolute', left: 16, right: 16, zIndex: 40, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, ...shadow.float },
});
