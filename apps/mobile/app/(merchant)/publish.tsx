import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { storeById } from '@freetogo/core';
import { Block, Button, Icon, Txt, radius, space, useTheme } from '@freetogo/ui';
import { useStore } from '../../src/state/AppStore';
import { Screen } from '../../src/components/Screen';
import { MerchantHeader } from '../../src/components/MerchantHeader';

export default function Publish() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state } = useStore();
  const s = storeById(state, state.merchantStoreId)!;
  const card = (mode: 'RESERVED' | 'WALK_IN') => {
    const walk = mode === 'WALK_IN';
    return (
      <Pressable key={mode} accessibilityRole="button" onPress={() => router.push(`/merchant/draft?mode=${mode}`)}
        style={({ pressed }) => [{ borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.card, overflow: 'hidden', backgroundColor: colors.surface, opacity: pressed ? 0.9 : 1 }]}>
        <View style={{ height: walk ? 0 : 8, backgroundColor: colors.active }} />
        {walk ? <View style={{ marginTop: 8, marginHorizontal: space.l, borderTopWidth: 3, borderStyle: 'dashed', borderColor: colors.badgeText }} /> : null}
        <View style={{ padding: space.l, gap: 4 }}>
          <Txt variant="heading">{t(walk ? 'm_mode_walkin_t' : 'm_mode_reserved_t')}</Txt>
          <Txt variant="small" color="textSecondary">{t(walk ? 'm_mode_walkin_s' : 'm_mode_reserved_s')}</Txt>
          <Txt variant="small">• {t(walk ? 'm_mode_walkin_l1' : 'm_mode_reserved_l1')}</Txt>
          <Txt variant="small">• {t(walk ? 'm_mode_walkin_l2' : 'm_mode_reserved_l2')}</Txt>
        </View>
      </Pressable>
    );
  };
  return (
    <Screen>
      <MerchantHeader store={s} />
      <Txt variant="title" accessibilityRole="header">{t('m_publish_title')}</Txt>
      <Txt variant="heading" style={{ marginTop: space.s }}>{t('m_repeat_t')}</Txt>
      <Txt variant="small" color="textSecondary">{t('m_repeat_s')}</Txt>
      {(['RESERVED', 'WALK_IN'] as const).map((mode) => (
        <Block key={mode} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
          <View style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: mode === 'RESERVED' ? colors.primarySoft : colors.surface, borderWidth: mode === 'RESERVED' ? 0 : 1.5, borderStyle: 'dashed', borderColor: colors.badgeText }}>
            <Icon name="repeat" size={22} color="icon" />
          </View>
          <View style={{ flex: 1 }}>
            <Txt weight="bold" numberOfLines={1}>{mode === 'RESERVED' ? `5 × ${t('surprise_bag').toLowerCase()}` : t('walkin_badge')}</Txt>
            <Txt variant="small" color="textSecondary" numberOfLines={1}>{mode === 'RESERVED' ? [t('cat.produce'), t('cat.dairy'), t('cat.bread')].join(', ') : 'Laatikollinen mandariineja'}</Txt>
          </View>
          <Button size="small" block={false} kind={mode === 'RESERVED' ? 'primary' : 'secondary'} label={t('m_use_template')} onPress={() => router.push(`/merchant/draft?mode=${mode}&tpl=1`)} />
        </Block>
      ))}
      <Txt variant="heading" style={{ marginTop: space.s }}>{t('m_new')}</Txt>
      {card('RESERVED')}
      {card('WALK_IN')}
    </Screen>
  );
}
