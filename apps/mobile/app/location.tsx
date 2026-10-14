import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CITIES, setLocation } from '@freetogo/core';
import { ActionCard } from '../src/components/Blocks';
import { Block, Button, Callout, Icon, Txt, radius, space, useTheme } from '@freetogo/ui';
import { useStore } from '../src/state/AppStore';
import { useActions } from '../src/state/useActions';
import { Screen } from '../src/components/Screen';
import { cityName } from '../src/format';

const KMS = [1, 2, 5, 10, 20];

export default function LocationModal() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state, run } = useStore();
  const { useGps, pickCity } = useActions();
  const L = state.location;
  return (
    <Screen back title={t('loc_sheet_title')} footer={<Button label={t('loc_done')} onPress={() => { if (L.mode === 'unset') pickCity('tampere'); router.back(); }} />}>
      {L.gps === 'denied' ? (
        <Callout tone="brand" icon="nav" title={t('loc_denied_title')}>{t('loc_denied_body')}</Callout>
      ) : (
        <ActionCard icon="nav" title={t('loc_use_gps')} detail={t('loc_use_gps_s')} onPress={() => void useGps()} />
      )}
      <Txt variant="heading" style={{ marginTop: space.s }}>{t('loc_pick_city')}</Txt>
      <Block style={{ paddingVertical: 0 }}>
        {CITIES.map((c) => {
          const on = L.mode !== 'unset' && L.city === c;
          return (
            <Pressable key={c} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => pickCity(c)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 52 }}>
              <Icon name="city" size={22} color="icon" />
              <Txt weight="semibold" style={{ flex: 1 }}>{cityName(c)}</Txt>
              {on ? <Icon name="check" size={22} color="active" /> : null}
            </Pressable>
          );
        })}
      </Block>
      <Txt variant="heading" style={{ marginTop: space.s }}>{t('loc_radius')}</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>
        {KMS.map((k) => {
          const on = L.km === k;
          return (
            <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => run((s) => setLocation(s, { km: k }))}
              style={{ minHeight: 40, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1, justifyContent: 'center', borderColor: on ? colors.selected : colors.border, backgroundColor: on ? colors.selected : colors.surface }}>
              <Txt variant="small" weight="semibold" style={{ color: on ? colors.onSelected : colors.textPrimary }}>{k} km</Txt>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
