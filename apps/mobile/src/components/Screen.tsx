import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon, Txt, gutter, space, useTheme } from '@freetogo/ui';

/** Page shell (ported from texttranslator): background, safe areas, optional back/title row and pinned footer. */
export function Screen({
  title, back, right, footer, scroll = true, children, contentStyle, pad = true, ...rest
}: {
  title?: string;
  back?: boolean;
  right?: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  pad?: boolean;
  children: React.ReactNode;
  contentStyle?: ScrollViewProps['contentContainerStyle'];
} & Omit<ScrollViewProps, 'children'>) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const header = back || title || right ? (
    <View style={styles.header}>
      {back ? (
        <Pressable accessibilityRole="button" accessibilityLabel={t('back')} hitSlop={8} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.back}>
          <Icon name="left" size={24} />
        </Pressable>
      ) : null}
      {title ? <Txt variant="lead" weight="bold" numberOfLines={1} style={{ flex: 1 }} accessibilityRole="header">{title}</Txt> : <View style={{ flex: 1 }} />}
      {right}
    </View>
  ) : null;
  return (
    <View style={[styles.root, { backgroundColor: colors.surface, paddingTop: insets.top }]}>
      {header}
      {scroll ? (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[pad && styles.content, { paddingBottom: footer ? space.l : insets.bottom + space.xxxl }, contentStyle]} {...rest}>
          {children}
        </ScrollView>
      ) : (
        <View style={[pad && styles.content, { flex: 1 }]}>{children}</View>
      )}
      {footer ? <View style={[styles.footer, { paddingBottom: insets.bottom + space.m, backgroundColor: colors.surface, borderTopColor: colors.border }]}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: space.s, paddingHorizontal: space.s, minHeight: 52 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: gutter, gap: space.m },
  footer: { paddingHorizontal: gutter, paddingTop: space.m, gap: space.xs, borderTopWidth: StyleSheet.hairlineWidth },
});
