import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { rate, storeById, type Scores } from '@freetogo/core';
import { Block, Button, Callout, DisabledWhy, Txt, space } from '@freetogo/ui';
import { useStore } from '../../src/state/AppStore';
import { Screen } from '../../src/components/Screen';
import { StarInput } from '../../src/components/Blocks';
import { StoreLogo } from '../../src/components/OfferCard';

export default function Rate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { state, run, showToast } = useStore();
  const [v, setV] = useState<Scores>({ quality: 0, quantity: 0, variety: 0, smoothness: 0 });
  const r = state.reservations.find((x) => x.id === id);
  const s = r && storeById(state, r.storeId);
  if (!r || !s) return <Screen back><Txt>{t('not_found')}</Txt></Screen>;
  const missing = Object.values(v).some((x) => !x);
  return (
    <Screen
      back
      title={t('rate_title')}
      footer={<><Button label={t('submit_rating')} disabled={missing} onPress={() => { const res = run((x) => rate(x, r.id, v)); if (res.ok) { showToast(t('rating_thanks')); router.back(); } }} />{missing ? <DisabledWhy text={t('rate_missing')} /> : null}</>}
    >
      <View style={{ flexDirection: 'row', gap: space.m, alignItems: 'center' }}>
        <StoreLogo store={s} size={56} />
        <View><Txt variant="heading">{s.name}</Txt><Txt variant="small" color="textSecondary">{t('surprise_bag')} · {t('st_collected')}</Txt></View>
      </View>
      <Txt variant="small" color="textSecondary">{t('rate_s')}</Txt>
      <Block style={{ gap: space.m }}>
        {(['quality', 'quantity', 'variety', 'smoothness'] as const).map((k) => (
          <View key={k} style={{ gap: 4 }}>
            <Txt weight="bold">{t(`rate_q_${k}`)}</Txt>
            <StarInput value={v[k]} onChange={(n) => setV({ ...v, [k]: n })} label={t(`rate_q_${k}`)} />
          </View>
        ))}
      </Block>
      <Callout icon="shield">{`${t('reliability')}: ${t('reliability_s', { ok: s.reliability.ok, f: s.reliability.fail })}`}</Callout>
    </Screen>
  );
}
