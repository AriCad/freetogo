import React from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { isGone, offerState, storeById } from '@freetogo/core';
import { Button, Txt, space } from '@freetogo/ui';
import { useStore } from '../../src/state/AppStore';
import { Screen } from '../../src/components/Screen';
import { ActionCard, EmptyState } from '../../src/components/Blocks';
import { ShopRow } from '../../src/components/ShopRow';

export default function Favorites() {
  const { t } = useTranslation();
  const { state, now } = useStore();
  const N = state.notif;
  const sources = (N.favorites ? 1 : 0) + (state.bells.length ? 1 : 0) + (N.radius ? 1 : 0) + N.cities.length;
  const favs = state.favorites.map((id) => storeById(state, id)).filter((s) => !!s);
  const bellsOnly = state.bells.filter((b) => !state.favorites.includes(b)).map((id) => storeById(state, id)).filter((s) => !!s);
  const hasOffer = (id: string) => state.offers.some((o) => o.storeId === id && !isGone(offerState(o, now)));
  return (
    <Screen>
      <Txt variant="title" style={{ marginTop: space.l }} accessibilityRole="header">{t('fav_title')}</Txt>
      <ActionCard
        icon={N.permission === 'denied' ? 'bellOff' : 'bellFill'}
        title={t('alerts_card_t')}
        detail={N.permission === 'denied' ? t('perm_denied') : sources && N.permission === 'granted' ? t('alerts_summary', { n: sources }) : t('alerts_summary_off')}
        onPress={() => router.push('/alerts')}
      />
      {!favs.length ? (
        <EmptyState title={t('fav_empty_t')} body={t('fav_empty_s')}>
          <Button label={t('find_food')} onPress={() => router.push('/')} />
        </EmptyState>
      ) : (
        <>
          <Txt variant="heading" style={{ marginTop: space.m }}>{t('fav_title')}</Txt>
          {favs.map((s) => <ShopRow key={s!.id} store={s!} detail={hasOffer(s!.id) ? `● ${t('fav_has_offer')}` : t('fav_no_offer')} />)}
        </>
      )}
      {bellsOnly.length ? (
        <>
          <Txt variant="heading" style={{ marginTop: space.m }}>{t('n_bell_t')}</Txt>
          {bellsOnly.map((s) => <ShopRow key={s!.id} store={s!} />)}
        </>
      ) : null}
    </Screen>
  );
}
