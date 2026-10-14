import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { isGone, offerState, storeById } from '@freetogo/core';
import { Block, Icon, Txt, gutter, radius, space, useTheme, type IconName } from '@freetogo/ui';
import { useStore } from '../../src/state/AppStore';
import { useActions } from '../../src/state/useActions';
import { PHOTOS } from '../../src/photos';
import { OfferCard, StoreLogo } from '../../src/components/OfferCard';
import { RatingBlock } from '../../src/components/Blocks';
import { cityName } from '../../src/format';

export default function StorePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, now } = useStore();
  const { toggleFav, toggleShopBell } = useActions();
  const s = storeById(state, id ?? '');
  if (!s) return <View style={{ flex: 1, paddingTop: insets.top + 40, alignItems: 'center' }}><Txt>{t('not_found')}</Txt></View>;
  const offers = state.offers.filter((o) => o.storeId === s.id && !isGone(offerState(o, now)));
  const fav = state.favorites.includes(s.id);
  const bell = state.bells.includes(s.id);
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: space.xxxl }}>
      <View style={{ height: 200, overflow: 'hidden' }}>
        <Image source={PHOTOS[s.photo]} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <Pressable accessibilityRole="button" accessibilityLabel={t('back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={[styles.back, { top: insets.top + 6 }]}>
          <Icon name="left" size={22} />
        </Pressable>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={{ flexDirection: 'row', gap: space.m, alignItems: 'center' }}>
          <StoreLogo store={s} size={56} />
          <View style={{ flex: 1 }}>
            <Txt variant="heading" accessibilityRole="header">{s.name}</Txt>
            <Txt variant="small" color="textSecondary">{t(`kind.${s.kind}`)} · {s.address}</Txt>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: space.s, marginTop: space.l }}>
          <Toggle icon={fav ? 'heartFill' : 'heart'} on={fav} title={t('heart_label')} detail={fav ? t('heart_on_s') : t('heart_off_s')} onPress={() => toggleFav(s.id)} />
          <Toggle icon={bell ? 'bellFill' : 'bell'} on={bell} strong a11y={t('bell_label')} title={t('notif_title')} detail={bell ? t('bell_on_s') : t('bell_off_s')} onPress={() => void toggleShopBell(s.id)} />
        </View>
      </View>
      <View style={{ paddingHorizontal: gutter, gap: space.m }}>
        <Txt variant="heading">{t('today')}</Txt>
        {offers.length ? offers.map((o) => <OfferCard key={o.id} offer={o} store={s} />) : (
          <Block style={{ alignItems: 'center', gap: space.xs }}>
            <Txt weight="bold">{t('fav_no_offer')}</Txt>
            <Txt variant="small" color="textSecondary" align="center">{t('participating_s')}</Txt>
          </Block>
        )}
        <RatingBlock store={s} />
        <Txt variant="tiny" color="textSecondary">{cityName(s.city)}</Txt>
      </View>
    </ScrollView>
  );
}

function Toggle({ icon, on, title, detail, onPress, strong, a11y }: { icon: IconName; on: boolean; title: string; detail: string; onPress: () => void; strong?: boolean; a11y?: string }) {
  const { colors } = useTheme();
  const bg = on ? (strong ? colors.active : colors.primarySoft) : colors.surface;
  const fg = on && strong ? colors.onActive : colors.textPrimary;
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: on }} accessibilityLabel={a11y ?? title} onPress={onPress}
      style={[styles.toggle, { backgroundColor: bg, borderColor: on ? (strong ? colors.active : colors.accent) : colors.border }]}>
      <Icon name={icon} size={24} raw={on ? (strong ? colors.onActive : colors.accent) : colors.textPrimary} />
      <View style={{ flex: 1 }}>
        <Txt variant="small" weight="bold" style={{ color: fg }}>{title}</Txt>
        <Txt variant="tiny" style={{ color: fg, opacity: 0.8 }}>{detail}</Txt>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: { position: 'absolute', left: gutter, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
  card: { marginTop: -24, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: gutter, paddingTop: space.xl, marginBottom: space.m },
  toggle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 60, padding: space.m, borderRadius: radius.control, borderWidth: 1 },
});
