import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { Store } from '@freetogo/core';
import { Icon, Txt, radius, space, useTheme } from '@freetogo/ui';
import { useSettings } from '../settings/Settings';
import { StoreLogo } from './OfferCard';

export function MerchantHeader({ store }: { store: Store }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { update } = useSettings();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, marginTop: space.m }}>
      <StoreLogo store={store} size={40} />
      <View style={{ flex: 1 }}>
        <Txt weight="bold" numberOfLines={1}>{store.name}</Txt>
        <Txt variant="tiny" color="textSecondary">{t('m_mode')}</Txt>
      </View>
      <Pressable accessibilityRole="button" onPress={() => { update({ role: 'collector' }); router.replace('/'); }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.textPrimary }}>
        <Icon name="swap" size={16} raw={colors.surface} />
        <Txt variant="small" weight="bold" style={{ color: colors.surface }}>{t('switch_to_collector')}</Txt>
      </Pressable>
    </View>
  );
}
