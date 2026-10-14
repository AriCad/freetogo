import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { offerById, storeById } from '@freetogo/core';
import { Block, Button, Icon, Txt, space, useTheme } from '@freetogo/ui';
import { useStore } from '../../src/state/AppStore';
import { Screen } from '../../src/components/Screen';
import { KV } from '../../src/components/Bits';
import { time } from '../../src/format';

export default function Reserved() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state } = useStore();
  const r = state.reservations.find((x) => x.id === id);
  const o = r && offerById(state, r.offerId);
  const s = o && storeById(state, o.storeId);
  if (!r || !o || !s) return <Screen back><Txt>{t('not_found')}</Txt></Screen>;
  return (
    <Screen
      footer={<><Button icon="qr" label={t('show_code')} onPress={() => router.replace('/pickups')} /><Button kind="quiet" label={t('back_discover')} onPress={() => router.replace('/')} /></>}
    >
      <View style={{ alignItems: 'center', gap: space.s, paddingTop: space.xxxl }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.active, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={44} raw={colors.onActive} /></View>
        <Txt variant="title" align="center" accessibilityRole="header">{t('reserved_title')}</Txt>
        <Txt color="textSecondary" align="center">{t('reserved_body', { store: s.name, s: time(o.start), e: time(o.end) })}</Txt>
      </View>
      <Block style={{ gap: 8, marginTop: space.l }}>
        <KV k={t('pickup_code')} v={r.code} />
        <KV k={t('pickup_time')} v={`${t('today')} ${time(o.start)}–${time(o.end)}`} />
        <KV k={t('address')} v={s.address} />
        <KV k={t('free_s')} v={t('free')} />
      </Block>
    </Screen>
  );
}
