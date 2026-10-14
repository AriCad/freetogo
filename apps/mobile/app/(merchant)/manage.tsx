import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { isGone, offerState, storeById, walkSignal, type Offer } from '@freetogo/core';
import { Button, Pill, Txt, radius, shadow, space, useTheme } from '@freetogo/ui';
import { useStore } from '../../src/state/AppStore';
import { Screen } from '../../src/components/Screen';
import { EmptyState } from '../../src/components/Blocks';
import { MerchantHeader } from '../../src/components/MerchantHeader';
import { statusLabel } from '../../src/components/OfferCard';
import { ago, time } from '../../src/format';

export default function Manage() {
  const { t } = useTranslation();
  const { state, now } = useStore();
  const s = storeById(state, state.merchantStoreId)!;
  const mine = state.offers.filter((o) => o.storeId === s.id);
  const active = mine.filter((o) => !isGone(offerState(o, now)));
  const past = mine.filter((o) => isGone(offerState(o, now)));
  return (
    <Screen>
      <MerchantHeader store={s} />
      <Txt variant="title" accessibilityRole="header">{t('tab_manage')}</Txt>
      {!active.length ? (
        <EmptyState title={t('m_none_active_t')} body={t('m_none_active_s')}>
          <Button icon="plus" label={t('tab_publish')} onPress={() => router.push('/publish')} />
        </EmptyState>
      ) : (
        <><Txt variant="heading">{t('m_active')}</Txt>{active.map((o) => <ManageCard key={o.id} o={o} />)}</>
      )}
      {past.length ? <><Txt variant="heading" style={{ marginTop: space.m }}>{t('m_past')}</Txt>{past.map((o) => <ManageCard key={o.id} o={o} />)}</> : null}
    </Screen>
  );
}

function ManageCard({ o }: { o: Offer }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state, now } = useStore();
  const st = offerState(o, now);
  const walk = o.distributionMode === 'WALK_IN';
  const res = state.reservations.filter((r) => r.offerId === o.id);
  const reserved = (o.qtyTotal ?? 0) - (o.qtyLeft ?? 0);
  const sig = walkSignal(o, now);
  const status = statusLabel(t, st);
  return (
    <Pressable accessibilityRole="button" onPress={() => router.push(`/merchant/offer/${o.id}`)} style={[shadow.card, { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden', opacity: isGone(st) ? 0.7 : 1 }]}>
      <View style={walk ? { borderTopWidth: 3, borderStyle: 'dashed', borderColor: colors.badgeText } : { height: 6, backgroundColor: colors.active }} />
      <View style={{ padding: space.l, gap: space.s }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s, flexWrap: 'wrap' }}>
          {walk ? <Pill tone="walk" label={t('walkin_badge')} /> : <Pill tone="badge" label={t('reserve_badge')} />}
          {status ? <Pill tone="dark" label={status} /> : null}
          <View style={{ flex: 1 }} />
          <Txt variant="small" weight="bold">{time(o.start)}–{time(o.end)}</Txt>
        </View>
        <Txt weight="bold" numberOfLines={1}>{walk ? o.what : o.categories.map((c) => t(`cat.${c}`)).join(', ')}</Txt>
        {walk ? (
          <>
            {!isGone(st) && o.expiresAt ? <Txt variant="small">{t('m_expires_in', { n: Math.max(0, Math.round((o.expiresAt - now) / 60000)) })}</Txt> : null}
            {sig.last ? <Txt variant="small" color="textSecondary">{t('latest_report', { r: t(`r_${sig.last.level}`), a: ago(sig.last.at, now) })}</Txt> : null}
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt variant="small" weight="bold">{t('m_reserved_of', { r: reserved, t: o.qtyTotal ?? 0 })}</Txt>
              <Txt variant="small" color="textSecondary">{t('m_collected_n', { n: res.filter((r) => r.status === 'collected').length })}</Txt>
            </View>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.primarySoft, overflow: 'hidden' }}><View style={{ height: 10, width: `${(reserved / (o.qtyTotal || 1)) * 100}%`, backgroundColor: colors.active }} /></View>
          </>
        )}
      </View>
    </Pressable>
  );
}
