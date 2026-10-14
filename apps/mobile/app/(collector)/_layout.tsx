import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { myActive } from '@freetogo/core';
import { useSettings } from '../../src/settings/Settings';
import { useStore } from '../../src/state/AppStore';
import { tabOptions, useTabBarStyle } from '../../src/components/TabIcon';

export default function CollectorTabs() {
  const { role } = useSettings();
  const { state } = useStore();
  const { t } = useTranslation();
  const bar = useTabBarStyle();
  if (role === 'merchant') return <Redirect href="/publish" />;
  return (
    <Tabs screenOptions={bar}>
      <Tabs.Screen name="index" options={tabOptions(t('tab_discover'), 'discover')} />
      <Tabs.Screen name="favorites" options={tabOptions(t('tab_favorites'), 'heart', 'heartFill')} />
      <Tabs.Screen name="pickups" options={tabOptions(t('tab_pickups'), 'bag', 'bag', myActive(state) ? 1 : undefined)} />
      <Tabs.Screen name="profile" options={tabOptions(t('tab_profile'), 'user')} />
    </Tabs>
  );
}
