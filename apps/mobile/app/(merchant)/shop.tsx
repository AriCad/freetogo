import React from 'react';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { storeById } from '@freetogo/core';
import { Block, Button, Pill, Txt, space } from '@freetogo/ui';
import { useStore } from '../../src/state/AppStore';
import { useSettings } from '../../src/settings/Settings';
import { Screen } from '../../src/components/Screen';
import { MerchantHeader } from '../../src/components/MerchantHeader';
import { RatingBlock } from '../../src/components/Blocks';
import { KV } from '../../src/components/Bits';

export default function Shop() {
  const { t } = useTranslation();
  const { state } = useStore();
  const { update } = useSettings();
  const s = storeById(state, state.merchantStoreId)!;
  return (
    <Screen>
      <MerchantHeader store={s} />
      <Txt variant="title" accessibilityRole="header">{t('merchant_store_title')}</Txt>
      <Block style={{ gap: space.s }}>
        <Pill tone="ok" icon="shield" label={t('m_verified')} />
        <KV k={t('address')} v={s.address} />
        <KV k={t('m_hours')} v={t('m_hours_v')} />
        <KV k={t('m_staff')} v={t('m_staff_v')} />
      </Block>
      <Txt variant="heading" style={{ marginTop: space.s }}>{t('m_store_public')}</Txt>
      <Txt variant="small" color="textSecondary">{t('m_store_public_s')}</Txt>
      <RatingBlock store={s} />
      <Button kind="secondary" label={t('m_view_as')} onPress={() => { update({ role: 'collector' }); router.replace(`/store/${s.id}`); }} />
    </Screen>
  );
}
