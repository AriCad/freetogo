import React from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CATEGORIES, DEFAULT_FILTER, discoverOffers } from '@freetogo/core';
import { Block, Button, Check, Segmented, SwitchRow, Txt, radius, space, useTheme } from '@freetogo/ui';
import { useStore } from '../src/state/AppStore';
import { Screen } from '../src/components/Screen';

export default function Filters() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state, now, filter, setFilter } = useStore();
  const n = discoverOffers(state, filter, now).length;
  const sorts = [['distance', t('sort_distance')], ['time', t('pickup_time')], ['rating', t('ratings_title')]] as const;
  return (
    <Screen back title={t('filters')} footer={<><Button label={t('results_n', { n })} onPress={() => router.back()} /><Button kind="quiet" label={t('clear_filters')} onPress={() => setFilter({ ...DEFAULT_FILTER, query: filter.query })} /></>}>
      <Txt weight="bold">{t('m_groups')}</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>
        {CATEGORIES.map((c) => (
          <Check key={c} label={t(`cat.${c}`)} checked={filter.categories.includes(c)} onPress={() => setFilter({ ...filter, categories: filter.categories.includes(c) ? filter.categories.filter((x) => x !== c) : [...filter.categories, c] })} />
        ))}
      </View>
      <Txt weight="bold" style={{ marginTop: space.s }}>{t('pickup_time')}</Txt>
      <Segmented value={filter.when} onChange={(when) => setFilter({ ...filter, when })} options={[{ value: 'any', label: t('mode_all') }, { value: 'now', label: t('when_now') }, { value: 'later', label: t('when_later') }]} />
      <Txt weight="bold" style={{ marginTop: space.s }}>{t('sort_title')}</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>
        {sorts.map(([k, label]) => {
          const on = filter.sort === k;
          return (
            <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setFilter({ ...filter, sort: k })}
              style={{ minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, justifyContent: 'center', borderColor: on ? colors.selected : colors.border, backgroundColor: on ? colors.selected : colors.surface }}>
              <Txt variant="small" weight="semibold" style={{ color: on ? colors.onSelected : colors.textPrimary }}>{label}</Txt>
            </Pressable>
          );
        })}
      </View>
      <Block style={{ paddingVertical: 4, marginTop: space.s }}>
        <SwitchRow title={t('sold_out_title')} detail={t('show_sold_s')} value={filter.showSoldOut} onChange={(v) => setFilter({ ...filter, showSoldOut: v })} />
      </Block>
    </Screen>
  );
}
