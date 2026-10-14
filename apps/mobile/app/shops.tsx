import React from 'react';
import { useTranslation } from 'react-i18next';
import { Txt } from '@freetogo/ui';
import { useStore } from '../src/state/AppStore';
import { Screen } from '../src/components/Screen';
import { ShopRow } from '../src/components/ShopRow';

export default function Shops() {
  const { t } = useTranslation();
  const { state } = useStore();
  const cities = new Set([state.location.city ?? 'tampere', ...state.notif.cities]);
  const stores = state.stores.filter((s) => cities.has(s.city));
  return (
    <Screen back title={t('n_bell_t')}>
      <Txt variant="small" color="textSecondary">{t('participating_s')}</Txt>
      {stores.map((s) => <ShopRow key={s.id} store={s} />)}
    </Screen>
  );
}
