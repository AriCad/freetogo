import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { offerState, overall, walkSignal, type Offer, type OfferState, type Store } from '@freetogo/core';
import { Icon, Pill, Txt, radius, shadow, space, useTheme } from '@freetogo/ui';
import { photoSource } from '../photos';
import { ago, km, num1, slot, time } from '../format';
import { useStore } from '../state/AppStore';
import { useActions } from '../state/useActions';

export function StoreLogo({ store, size = 48 }: { store: Store; size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }} accessibilityElementsHidden>
      <Txt variant={size > 44 ? 'small' : 'tiny'} weight="bold" color="link">{store.initials}</Txt>
    </View>
  );
}

export function PhotoTag({ offer }: { offer: Offer }) {
  const { t } = useTranslation();
  if (offer.photo.kind === 'none') return null;
  if (offer.photo.kind === 'example') return <Pill tone="dark" icon="info" label={t('photo_example')} />;
  return <Pill tone="light" icon="camera" label={t('photo_today', { t: time(offer.photo.takenAt ?? offer.publishedAt) })} />;
}

export function statusLabel(t: (k: string) => string, st: OfferState): string | null {
  return ({ soldout: t('soldout_badge'), stopped: t('soldout_badge'), ended: t('expired_badge'), expired: t('expired_t'), closed: t('closed_badge'), possiblyGone: t('possibly_gone_badge'), review: t('review_badge') } as Record<string, string>)[st] ?? null;
}

/** Offer card (approved v2 anatomy). `width` set → rail card; otherwise full width. */
export function OfferCard({ offer, store, width, compact }: { offer: Offer; store: Store; width?: number; compact?: boolean }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state, now } = useStore();
  const { toggleFav } = useActions();
  const st = offerState(offer, now);
  const walk = offer.distributionMode === 'WALK_IN';
  const fav = state.favorites.includes(store.id);
  const status = statusLabel(t, st);
  const dim = ['soldout', 'stopped', 'ended', 'expired', 'closed'].includes(st);
  const last = walk ? walkSignal(offer, now).last : null;
  const src = photoSource(offer.photo, store.photo);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${store.name}, ${walk ? t('walkin_badge') : t('reserve_badge')}, ${t('pickup_window', { s: time(offer.start), e: time(offer.end) })}`}
      onPress={() => router.push(`/offer/${offer.id}`)}
      style={({ pressed }) => [styles.card, shadow.card, { width, backgroundColor: colors.surface, borderColor: colors.border, opacity: dim ? 0.7 : pressed ? 0.92 : 1 }]}
    >
      <View style={[styles.photo, { height: compact ? 96 : 150, backgroundColor: colors.background }]}>
        <View style={[StyleSheet.absoluteFill, styles.clip]}>{src ? <Image source={src} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors /> : null}</View>
        <View style={styles.tl}>
          {status ? <Pill tone="dark" label={status} /> : walk ? <Pill tone="walk" label={t('walkin_badge')} /> : <Pill tone="light" label={t('left_n', { n: offer.qtyLeft ?? 0 })} />}
        </View>
        {store.ratings.n ? <View style={styles.tr}><Pill tone="light" icon="star" label={num1(overall(store.ratings))} /></View> : null}
        {!compact ? <View style={styles.br}><PhotoTag offer={offer} /></View> : null}
        <View style={styles.logo}><StoreLogo store={store} /></View>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Txt weight="bold" numberOfLines={1} style={{ flex: 1, fontSize: 16.5 }}>{store.name}</Txt>
          <Pressable accessibilityRole="button" accessibilityLabel={t('heart_label')} accessibilityState={{ selected: fav }} hitSlop={10} onPress={() => toggleFav(store.id)} style={styles.heart}>
            <Icon name={fav ? 'heartFill' : 'heart'} size={22} color={fav ? 'accent' : 'textPrimary'} />
          </Pressable>
        </View>
        <Txt variant="small" numberOfLines={1}>{walk ? offer.what : `${t('surprise_bag')} · ${offer.categories.map((c) => t(`cat.${c}`)).join(', ')}`}</Txt>
        <Txt variant="small" color="textSecondary" numberOfLines={1} style={{ marginTop: 2 }}>
          {t('pickup_window', { s: time(offer.start), e: time(offer.end) })}  |  {t('km', { d: km(store.km) })}
        </Txt>
        <View style={[styles.foot, { borderTopColor: colors.border }]}>
          <View style={styles.mode}>
            <Icon name={walk ? 'alert' : 'bag'} size={16} color="icon" />
            <Txt variant="small" color={walk ? 'textSecondary' : 'textPrimary'} weight={walk ? 'regular' : 'semibold'} numberOfLines={1} style={{ flex: 1 }}>
              {walk ? (last ? `${t(`r_${last.level}`)} · ${ago(last.at, now)}` : t('walkin_label')) : t('reserve_badge')}
            </Txt>
          </View>
          <Txt variant="lead" weight="bold">{t('free')}</Txt>
        </View>
      </View>
    </Pressable>
  );
}

export const cardSlot = slot;

const styles = StyleSheet.create({
  card: { borderRadius: radius.card, borderWidth: 1 },
  photo: { borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card },
  clip: { borderTopLeftRadius: radius.card - 1, borderTopRightRadius: radius.card - 1, overflow: 'hidden' },
  tl: { position: 'absolute', left: 10, top: 10 },
  tr: { position: 'absolute', right: 10, top: 10 },
  br: { position: 'absolute', right: 10, bottom: 10 },
  logo: { position: 'absolute', left: 12, bottom: -22 },
  body: { paddingHorizontal: 14, paddingTop: 28, paddingBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  heart: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: -6 },
  foot: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', gap: space.s },
  mode: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
});
