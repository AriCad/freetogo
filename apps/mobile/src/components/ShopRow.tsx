import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { Store } from '@freetogo/core';
import { Icon, Txt, space, useTheme } from '@freetogo/ui';
import { StoreLogo } from './OfferCard';
import { useStore } from '../state/AppStore';
import { useActions } from '../state/useActions';
import { cityName, km } from '../format';

/** Shop row with the two distinct controls: heart (favourite) and bell (shop alerts). */
export function ShopRow({ store, detail }: { store: Store; detail?: string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state } = useStore();
  const { toggleFav, toggleShopBell } = useActions();
  const fav = state.favorites.includes(store.id);
  const bell = state.bells.includes(store.id);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 64, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Pressable accessibilityRole="button" onPress={() => router.push(`/store/${store.id}`)} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 56 }}>
        <StoreLogo store={store} size={40} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Txt weight="semibold" numberOfLines={1}>{store.name}</Txt>
          <Txt variant="small" color="textSecondary" numberOfLines={1}>{detail ?? `${t(`kind.${store.kind}`)} · ${cityName(store.city)} · ${t('km', { d: km(store.km) })}`}</Txt>
        </View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={t('heart_label')} accessibilityState={{ selected: fav }} onPress={() => toggleFav(store.id)} style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <Icon name={fav ? 'heartFill' : 'heart'} size={22} color={fav ? 'accent' : 'textPrimary'} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={t('bell_label')} accessibilityState={{ selected: bell }} onPress={() => void toggleShopBell(store.id)} style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: bell ? colors.active : colors.background }}>
        <Icon name={bell ? 'bellFill' : 'bell'} size={22} raw={bell ? colors.onActive : colors.textPrimary} />
      </Pressable>
    </View>
  );
}
