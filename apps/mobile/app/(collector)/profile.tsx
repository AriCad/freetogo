import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { storeById } from '@freetogo/core';
import { Block, Button, Pill, Row, THEMES, Txt, space, useTheme } from '@freetogo/ui';
import { useStore } from '../../src/state/AppStore';
import { useSettings } from '../../src/settings/Settings';
import { Screen } from '../../src/components/Screen';
import { Sheet } from '../../src/components/Sheet';

export default function Profile() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state } = useStore();
  const settings = useSettings();
  const [info, setInfo] = useState<null | 'privacy' | 'help'>(null);
  const merchant = storeById(state, state.merchantStoreId);
  const switchTo = (role: 'collector' | 'merchant') => {
    settings.update({ role });
    router.replace(role === 'merchant' ? '/publish' : '/');
  };
  return (
    <Screen>
      <Txt variant="title" style={{ marginTop: space.l }} accessibilityRole="header">{t('profile_title')}</Txt>
      <Block style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.active, alignItems: 'center', justifyContent: 'center' }}><Txt weight="bold" style={{ color: colors.onActive }}>AK</Txt></View>
        <View style={{ flex: 1 }}><Txt variant="lead" weight="bold">Aino K.</Txt><Txt variant="small" color="textSecondary">aino.k@example.fi</Txt></View>
        <View style={{ alignItems: 'center' }}><Txt variant="title" color="link">{state.impact}</Txt><Txt variant="tiny" color="textSecondary">{t('saved_impact')}</Txt></View>
      </Block>
      <Txt variant="heading" style={{ marginTop: space.s }}>{t('roles')}</Txt>
      <Block style={{ paddingVertical: 4 }}>
        <Row icon="bag" title={t('role_collector')} detail={t('role_collector_s')} trailing={settings.role === 'collector' ? <Pill tone="ok" label={t('active_role')} /> : <Button size="small" kind="secondary" block={false} label={t('use_role')} onPress={() => switchTo('collector')} />} />
        <Row icon="store" title={t('role_merchant')} detail={t('role_merchant_s', { store: merchant?.name ?? '' })} trailing={settings.role === 'merchant' ? <Pill tone="ok" label={t('active_role')} /> : <Button size="small" kind="secondary" block={false} label={t('use_role')} onPress={() => switchTo('merchant')} />} />
      </Block>
      <Block style={{ paddingVertical: 4 }}>
        <Row icon="bell" title={t('p_alerts')} onPress={() => router.push('/alerts')} />
        <Row icon="pin" title={t('p_location')} onPress={() => router.push('/location')} />
        <Row icon="sliders" title={`${t('theme_title')} · ${t('theme_n', { n: settings.theme })} ${THEMES[settings.theme].name}`} onPress={() => router.push('/theme')} />
        <Row icon="globe" title={`${t('p_language')} · ${settings.lang === 'en' ? 'English' : 'Suomi'}`} onPress={() => router.push('/language')} />
        <Row icon="lock" title={t('p_privacy')} onPress={() => setInfo('privacy')} />
        <Row icon="help" title={t('p_help')} onPress={() => setInfo('help')} />
        <Row icon="info" title={t('demo_title')} onPress={() => router.push('/demo')} />
      </Block>
      <Txt variant="tiny" color="textSecondary" align="center" style={{ marginTop: space.l }}>Free To Go 0.1.0</Txt>
      <Sheet visible={!!info} title={info === 'privacy' ? t('p_privacy') : t('p_help')} onClose={() => setInfo(null)}>
        <Txt color="textSecondary">{info === 'privacy' ? t('privacy_body') : t('help_body')}</Txt>
        <Button label={t('close')} onPress={() => setInfo(null)} />
      </Sheet>
    </Screen>
  );
}
