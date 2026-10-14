import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { overall, reliabilityPct, type Store } from '@freetogo/core';
import { Block, Icon, Txt, gutter, radius, shadow, space, useTheme, type IconName } from '@freetogo/ui';
import { num1 } from '../format';

/** Titled horizontal rail of cards (approved Discover structure). */
export function Rail({ title, count, note, children }: { title: string; count?: string; note?: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: space.xxl }}>
      <View style={styles.railHead}>
        <Txt variant="heading" accessibilityRole="header">{title}</Txt>
        {count ? <Txt variant="small" weight="semibold" color="link">{count}</Txt> : null}
      </View>
      {note ? <Txt variant="small" color="textSecondary" style={{ paddingHorizontal: gutter, marginTop: -4, marginBottom: space.s }}>{note}</Txt> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: gutter, gap: space.m, paddingBottom: space.s }} snapToInterval={312} decelerationRate="fast">
        {children}
      </ScrollView>
    </View>
  );
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }} accessibilityLabel={`${num1(value)} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ opacity: value >= i - 0.25 ? 1 : 0.25 }}><Icon name="star" size={size} color="accent" /></View>
      ))}
    </View>
  );
}

export function StarInput({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 4 }} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable key={i} accessibilityRole="radio" accessibilityState={{ checked: value === i }} accessibilityLabel={`${i}/5`} onPress={() => onChange(i)} style={{ width: 46, height: 46, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="star" size={34} raw={value >= i ? colors.accent : colors.border} />
        </Pressable>
      ))}
    </View>
  );
}

/** Four food factors from verified pickups, plus the separate pickup-reliability measure. */
export function RatingBlock({ store }: { store: Store }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const r = store.ratings;
  const rel = reliabilityPct(store);
  return (
    <Block style={{ gap: space.s }}>
      <Txt weight="bold">{t('ratings_title')}</Txt>
      {!r.n ? <Txt variant="small" color="textSecondary">{t('ratings_none')}</Txt> : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
            <Txt variant="display">{num1(overall(r))}</Txt>
            <View><Stars value={overall(r)} /><Txt variant="small" color="textSecondary">{t('ratings_based', { n: r.n })}</Txt></View>
          </View>
          {([['f_quality', r.quality], ['f_quantity', r.quantity], ['f_variety', r.variety], ['f_smoothness', r.smoothness]] as const).map(([k, v]) => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: space.s }}>
              <Txt variant="small" style={{ flex: 1 }}>{t(k)}</Txt>
              <View style={{ width: 96, height: 8, borderRadius: 4, backgroundColor: colors.primarySoft, overflow: 'hidden' }}><View style={{ width: `${(v / 5) * 100}%`, height: 8, backgroundColor: colors.active }} /></View>
              <Txt variant="small" weight="bold" style={{ width: 30, textAlign: 'right' }}>{num1(v)}</Txt>
            </View>
          ))}
        </>
      )}
      {rel !== null ? (
        <View style={[styles.reliab, { backgroundColor: colors.okSoft }]}>
          <Icon name="shield" size={20} raw={colors.ok} />
          <View style={{ flex: 1 }}>
            <Txt variant="small" weight="bold" style={{ color: colors.ok }}>{rel} % · {t('reliability')}</Txt>
            <Txt variant="small" style={{ color: colors.ok }}>{t('reliability_s', { ok: store.reliability.ok, f: store.reliability.fail })}</Txt>
          </View>
        </View>
      ) : null}
    </Block>
  );
}

export function ActionCard({ icon, title, detail, onPress }: { icon: IconName; title: string; detail: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.action, shadow.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }]}>
      <View style={[styles.actionIc, { backgroundColor: colors.primarySoft }]}><Icon name={icon} size={22} color="icon" /></View>
      <View style={{ flex: 1 }}><Txt weight="bold">{title}</Txt><Txt variant="small" color="textSecondary">{detail}</Txt></View>
      <Icon name="right" size={20} raw={colors.border} />
    </Pressable>
  );
}

/** Empty crate + bell: invitation to act, not decoration. */
export function EmptyState({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingHorizontal: gutter, paddingTop: space.xxl, gap: space.s }}>
      <Svg width={132} height={112} viewBox="0 0 132 112">
        <Ellipse cx={66} cy={102} rx={52} ry={7} fill={colors.border} />
        <Path d="M18 46h96l-8 52H26z" fill={colors.primarySoft} stroke={colors.textPrimary} strokeWidth={3} strokeLinejoin="round" />
        <Path d="M22 66h88M25 82h82" stroke={colors.textPrimary} strokeWidth={2} opacity={0.25} />
        <Circle cx={98} cy={28} r={18} fill={colors.active} />
        <Path d="M91 33v-6a7 7 0 0 1 14 0v6l1.5 2h-17z" fill="#fff" />
      </Svg>
      <Txt variant="heading" align="center">{title}</Txt>
      <Txt color="textSecondary" align="center" style={{ maxWidth: 320 }}>{body}</Txt>
      {children ? <View style={{ alignSelf: 'stretch', gap: space.s, marginTop: space.m }}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  railHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingHorizontal: gutter, marginBottom: space.s + 2 },
  reliab: { flexDirection: 'row', gap: space.s, padding: space.m, borderRadius: 14, marginTop: space.xs },
  action: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: 14, borderRadius: radius.card, borderWidth: 1 },
  actionIc: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
