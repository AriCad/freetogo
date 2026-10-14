import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { isGone, offerState } from '@freetogo/core';
import { useSettings } from '../../src/settings/Settings';
import { useStore } from '../../src/state/AppStore';
import { tabOptions, useTabBarStyle } from '../../src/components/TabIcon';

export default function MerchantTabs() {
  const { role } = useSettings();
  const { state, now } = useStore();
  const { t } = useTranslation();
  const bar = useTabBarStyle();
  if (role !== 'merchant') return <Redirect href="/" />;
  const active = state.offers.filter((o) => o.storeId === state.merchantStoreId && !isGone(offerState(o, now))).length;
  return (
    <Tabs screenOptions={bar}>
      <Tabs.Screen name="publish" options={tabOptions(t('tab_publish'), 'plus')} />
      <Tabs.Screen name="manage" options={tabOptions(t('tab_manage'), 'list', 'list', active || undefined)} />
      <Tabs.Screen name="shop" options={tabOptions(t('tab_store'), 'store')} />
    </Tabs>
  );
}
