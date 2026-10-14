import React from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { offerById, storeById } from '@freetogo/core';
import { Button, Callout, Icon, Pill, Txt, space, useTheme } from '@freetogo/ui';
import { useStore } from '../../../src/state/AppStore';
import { Screen } from '../../../src/components/Screen';
import { OfferCard } from '../../../src/components/OfferCard';

export default function Published() {
  const { id, secs } = useLocalSearchParams<{ id: string; secs?: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state } = useStore();
  const o = offerById(state, id ?? '');
  const s = o && storeById(state, o.storeId);
  if (!o || !s) return <Screen back><Txt>{t('not_found')}</Txt></Screen>;
  return (
    <Screen footer={<><Button label={t('m_go_manage')} onPress={() => router.replace(`/merchant/offer/${o.id}`)} /><Button kind="quiet" label={t('m_publish_another')} onPress={() => router.replace('/publish')} /></>}>
      <View style={{ alignItems: 'center', gap: space.s, paddingTop: space.xxl }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.okSoft, alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={44} raw={colors.ok} /></View>
        <Txt variant="title" accessibilityRole="header">{t('m_published')}</Txt>
        {secs ? <Pill tone="dark" icon="clock" label={t('m_published_in', { n: secs })} /> : null}
      </View>
      <OfferCard offer={o} store={s} />
      <Callout tone="ok" icon="bell">{t('m_auto_notify')}</Callout>
    </Screen>
  );
}
