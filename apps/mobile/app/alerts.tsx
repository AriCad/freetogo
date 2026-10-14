import React from 'react';
import { Linking, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CITIES, setNotif, toggleCityAlert } from '@freetogo/core';
import { Block, Button, Callout, Divider, Icon, SwitchRow, Txt, radius, space, useTheme } from '@freetogo/ui';
import { useStore } from '../src/state/AppStore';
import { useActions } from '../src/state/useActions';
import { Screen } from '../src/components/Screen';
import { MapSim } from '../src/components/MapSim';
import { cityName } from '../src/format';

const KMS = [1, 2, 5, 10, 20];
const HOURS = ['20:00', '21:00', '22:00', '23:00'];
const ENDS = ['06:00', '07:00', '08:00', '09:00'];

export default function Alerts() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state, run } = useStore();
  const { ensurePermission } = useActions();
  const N = state.notif;
  const on = async (patch: Parameters<typeof setNotif>[1]) => {
    if (Object.values(patch).some((v) => v === true)) await ensurePermission();
    run((s) => setNotif(s, patch));
  };
  const chip = (label: string, selected: boolean, onPress: () => void) => (
    <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress}
      style={{ minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, justifyContent: 'center', borderColor: selected ? colors.selected : colors.border, backgroundColor: selected ? colors.selected : colors.surface, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Txt variant="small" weight="semibold" style={{ color: selected ? colors.onSelected : colors.textPrimary }}>{label}</Txt>
    </Pressable>
  );
  return (
    <Screen back title={t('notif_title')}>
      {N.permission === 'granted' ? <Callout tone="ok" icon="check" title={t('perm_granted')} /> : N.permission === 'denied' ? (
        <Callout tone="danger" icon="bellOff" title={t('perm_denied')}>
          <Txt variant="small" style={{ color: colors.danger }}>{t('perm_denied_s')}</Txt>
          <View style={{ marginTop: space.s }}><Button size="small" block={false} label={t('open_settings')} onPress={() => void Linking.openSettings()} /></View>
        </Callout>
      ) : (
        <Callout tone="brand" icon="bell" title={t('perm_unknown')}>
          <Txt variant="small">{t('perm_unknown_s')}</Txt>
          <View style={{ marginTop: space.s }}><Button size="small" block={false} label={t('allow_notifs')} onPress={() => void ensurePermission()} /></View>
        </Callout>
      )}
      <Txt variant="heading" style={{ marginTop: space.s }}>{t('notif_sources')}</Txt>
      <Block style={{ paddingVertical: 4 }}>
        <SwitchRow title={t('n_fav_t')} detail={t('n_fav_s', { n: state.favorites.length })} value={N.favorites} onChange={(v) => void on({ favorites: v })} />
        <Divider />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 56, paddingVertical: space.s }}>
          <View style={{ flex: 1 }}><Txt weight="semibold">{t('n_bell_t')}</Txt><Txt variant="small" color="textSecondary">{t('n_bell_s', { n: state.bells.length })}</Txt></View>
          <Button size="small" kind="secondary" block={false} label={t('n_bell_manage')} onPress={() => router.push('/shops')} />
        </View>
        <Divider />
        <SwitchRow title={t('n_radius_t')} detail={t('n_radius_s', { km: N.radiusKm, p: `${t('saved_place_home')} (${t('saved_place_addr')})` })} value={N.radius} onChange={(v) => void on({ radius: v })} />
        {N.radius ? (
          <View style={{ gap: space.s, paddingBottom: space.m }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>{KMS.map((k) => chip(`${k} km`, N.radiusKm === k, () => run((s) => setNotif(s, { radiusKm: k }))))}</View>
            <MapSim height={130} pins={[]} home radiusPx={10 + N.radiusKm * 6} />
          </View>
        ) : null}
        <Divider />
        <View style={{ gap: space.s, paddingVertical: space.m }}>
          <Txt weight="semibold">{t('n_city_t')}</Txt>
          <Txt variant="small" color="textSecondary">{t('n_city_s')}</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>
            {CITIES.map((c) => chip(cityName(c), N.cities.includes(c), async () => {
              if (!N.cities.includes(c)) await ensurePermission();
              run((s) => toggleCityAlert(s, c));
            }))}
          </View>
        </View>
      </Block>
      <Block style={{ paddingVertical: 4 }}>
        <SwitchRow title={t('quiet_t')} detail={t('quiet_s', { s: N.quietStart, e: N.quietEnd })} value={N.quiet} onChange={(v) => run((s) => setNotif(s, { quiet: v }))} />
        {N.quiet ? (
          <View style={{ gap: space.s, paddingBottom: space.m }}>
            <Txt variant="small" color="textSecondary">{t('m_start')}</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>{HOURS.map((h) => chip(h, N.quietStart === h, () => run((s) => setNotif(s, { quietStart: h }))))}</View>
            <Txt variant="small" color="textSecondary">{t('m_end')}</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>{ENDS.map((h) => chip(h, N.quietEnd === h, () => run((s) => setNotif(s, { quietEnd: h }))))}</View>
          </View>
        ) : null}
      </Block>
      <Txt variant="heading" style={{ marginTop: space.s }}>{t('other_notifs')}</Txt>
      <Block style={{ paddingVertical: 4 }}>
        <SwitchRow title={t('remind_t')} detail={t('remind_s')} value={N.reminders} onChange={(v) => run((s) => setNotif(s, { reminders: v }))} />
        <Divider />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 56, paddingVertical: space.s }}>
          <View style={{ flex: 1 }}><Txt weight="semibold">{t('cancel_alert_t')}</Txt><Txt variant="small" color="textSecondary">{t('cancel_alert_s')}</Txt></View>
          <Icon name="lock" size={20} color="textSecondary" />
        </View>
      </Block>
      <Block style={{ gap: space.xs }}>
        <Txt weight="bold">{t('how_alerts')}</Txt>
        {['how_alerts_1', 'how_alerts_2', 'how_alerts_3'].map((k) => <Txt key={k} variant="small" color="textSecondary">• {t(k)}</Txt>)}
      </Block>
    </Screen>
  );
}
