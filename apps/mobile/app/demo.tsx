import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { confirmPickup, demoOtherReport, demoOthersReserve, demoPublish, isGone, myActive, offerState, storeById, type AppState } from '@freetogo/core';
import { Block, Button, Callout, Txt, space } from '@freetogo/ui';
import { useStore } from '../src/state/AppStore';
import { Screen } from '../src/components/Screen';
import { time } from '../src/format';

/** Demo-only tools so one phone can play the other parties. Not part of the product. */
export default function Demo() {
  const { t } = useTranslation();
  const { state, now, run, reset, showToast } = useStore();
  const walk = state.offers.find((o) => o.distributionMode === 'WALK_IN' && !isGone(offerState(o, now)));
  const pihlaja = state.offers.find((o) => o.storeId === 'pihlaja' && o.distributionMode === 'RESERVED' && offerState(o, now) === 'active');
  const mine = myActive(state);
  const nothing = () => showToast(t('demo_nothing'));
  return (
    <Screen back title={t('demo_title')}>
      <Callout tone="brand" icon="info">{t('demo_s')}</Callout>
      <Block style={{ gap: space.s }}>
        {['kaneli', 'pihlaja', 'kumo', 'harju'].map((id) => (
          <Button key={id} kind="secondary" size="small" label={t('demo_publish', { store: storeById(state, id)?.name ?? id })} onPress={() => run((s, n) => demoPublish(s, id, n))} />
        ))}
        <Button kind="secondary" size="small" label={t('demo_others')} onPress={() => (pihlaja ? run((s, n) => demoOthersReserve(s, pihlaja.id, n)) : nothing())} />
        <Button kind="secondary" size="small" label={t('demo_other_none')} onPress={() => (walk ? run((s, n) => demoOtherReport(s, walk.id, 'NONE', n)) : nothing())} />
        <Button kind="secondary" size="small" label={t('demo_scan')} onPress={() => {
          if (!mine) return nothing();
          const r = run((s: AppState) => {
            const x = confirmPickup({ ...s, merchantStoreId: mine.storeId }, mine.offerId, mine.code);
            return { ...x, state: { ...x.state, merchantStoreId: s.merchantStoreId } };
          });
          if (r.ok) showToast(t('collected_t'));
        }} />
        <Button kind="danger" size="small" label={t('demo_reset')} onPress={() => { reset(); showToast(t('demo_reset_done')); }} />
      </Block>
      <Txt variant="heading" style={{ marginTop: space.s }}>{t('demo_log')}</Txt>
      <Block style={{ gap: space.s }}>
        {state.log.length ? state.log.map((l, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: space.s }}>
            <Txt variant="small" weight="bold">{time(l.at)}</Txt>
            <Txt variant="small" style={{ flex: 1 }}>{t(l.key, l.vars)}</Txt>
          </View>
        )) : <Txt variant="small" color="textSecondary">—</Txt>}
      </Block>
    </Screen>
  );
}
