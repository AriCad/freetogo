import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  activeFilterCount, discoverOffers, offerState, offersInArea, sectionOf, setLocation, setNotif, storeById, toggleCityAlert,
  type DiscoverSection, type Offer,
} from '@freetogo/core';
import { Icon, Segmented, Txt, gutter, radius, space, useTheme } from '@freetogo/ui';
import { useStore } from '../../src/state/AppStore';
import { useActions } from '../../src/state/useActions';
import { useSettings } from '../../src/settings/Settings';
import { OfferCard } from '../../src/components/OfferCard';
import { ActionCard, EmptyState, Rail } from '../../src/components/Blocks';
import { MapSim } from '../../src/components/MapSim';
import { ShopRow } from '../../src/components/ShopRow';
import { cityName } from '../../src/format';

export default function Discover() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, now, filter, setFilter, run, showToast } = useStore();
  const { update } = useSettings();
  const { useGps, ensurePermission } = useActions();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [pin, setPin] = useState<string | null>(null);
  const L = state.location;
  const label = (o: Offer) => o.categories.map((c) => t(`cat.${c}`)).join(' ');
  const list = useMemo(() => discoverOffers(state, filter, now, label), [state, filter, now]); // eslint-disable-line react-hooks/exhaustive-deps
  const area = useMemo(() => offersInArea(state, now), [state, now]);
  const nf = activeFilterCount(filter);
  const alertsOn = state.notif.permission === 'granted' && (state.notif.favorites || state.notif.radius || state.notif.cities.length > 0 || state.bells.length > 0);

  const switchRole = () => {
    update({ role: 'merchant' });
    router.replace('/publish');
  };

  const header = (
    <View style={{ paddingTop: insets.top }}>
      <View style={styles.locRow}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('loc_sheet_title')} onPress={() => router.push('/location')} style={styles.locBtn}>
          <View style={[styles.locIc, { backgroundColor: colors.primarySoft }]}><Icon name="pin" size={18} color="icon" /></View>
          <Txt numberOfLines={1} style={{ flexShrink: 1 }}>
            {L.mode === 'unset' || !L.city ? <Txt weight="bold">{t('loc_choose')}</Txt> : (
              <>
                <Txt weight="bold">{cityName(L.city)}</Txt>
                <Txt color="textSecondary"> · {L.mode === 'gps' ? `${t('loc_current').toLowerCase()} · ` : ''}{L.km} km</Txt>
              </>
            )}
          </Txt>
          <Icon name="down" size={20} />
        </Pressable>
        <RoundBtn icon="bell" label={t('notif_title')} onPress={() => router.push('/alerts')} dot={alertsOn} />
        <RoundBtn icon="swap" label={t('switch_to_merchant')} onPress={switchRole} />
      </View>
      <View style={styles.searchRow}>
        <View style={[styles.search, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Icon name="search" size={20} color="textSecondary" />
          <TextInput
            value={filter.query}
            onChangeText={(q) => setFilter({ ...filter, query: q })}
            placeholder={t('search_ph')}
            placeholderTextColor={colors.textSecondary}
            accessibilityLabel={t('search_ph')}
            style={[styles.input, { color: colors.textPrimary }]}
            returnKeyType="search"
          />
        </View>
        <SquareBtn icon="sliders" label={t('filters')} onPress={() => router.push('/filters')} badge={nf} />
        {L.mode !== 'unset' ? <SquareBtn icon={view === 'map' ? 'list' : 'map'} label={t(view === 'map' ? 'view_list' : 'view_map')} onPress={() => setView(view === 'map' ? 'list' : 'map')} /> : null}
      </View>
      <View style={{ paddingHorizontal: gutter, marginTop: space.m }}>
        <Segmented
          value={filter.mode}
          onChange={(mode) => setFilter({ ...filter, mode })}
          options={[{ value: 'all', label: t('mode_all') }, { value: 'reserved', label: t('mode_reserved') }, { value: 'walkin', label: t('mode_walkin') }]}
        />
      </View>
    </View>
  );

  const note = (
    <Txt variant="tiny" color="textSecondary" align="center" style={{ marginHorizontal: gutter, marginTop: space.xxl, marginBottom: space.xxl }}>
      {t('mock_banner')}{'\n'}{t('photo_credit')}
    </Txt>
  );

  let body: React.ReactNode;
  if (L.mode === 'unset' || !L.city) {
    body = (
      <EmptyState title={t('pick_location_title')} body={t('pick_location_body')}>
        <ActionCard icon="nav" title={t('loc_use_gps')} detail={t('loc_use_gps_s')} onPress={async () => { const r = await useGps(); if (r !== 'granted') router.push('/location'); }} />
        <ActionCard icon="city" title={t('loc_pick_city')} detail="Tampere, Jyväskylä, Turku, Helsinki…" onPress={() => router.push('/location')} />
      </EmptyState>
    );
  } else if (!area.length) {
    const stores = state.stores.filter((s) => s.city === L.city);
    body = (
      <>
        <EmptyState title={t('empty_title')} body={stores.length ? t('empty_body') : t('gps_none')}>
          {alertsOn ? (
            <ActionCard icon="bellFill" title={t('empty_alerts_on_t')} detail={t('empty_alerts_on_s')} onPress={() => router.push('/alerts')} />
          ) : (
            <ActionCard icon="bell" title={t('empty_alerts_t')} detail={t('empty_alerts_s')} onPress={async () => {
              await ensurePermission();
              run((s) => setNotif(s, { radius: true, favorites: true }));
              if (L.city && !state.notif.cities.includes(L.city)) run((s) => toggleCityAlert(s, L.city!));
              showToast(t('empty_alerts_on_t'));
            }} />
          )}
          {L.km < 20 ? <ActionCard icon="map" title={t('empty_radius_t')} detail={t('empty_radius_s', { km: L.km })} onPress={() => run((s) => setLocation(s, { km: L.km < 10 ? 10 : 20 }))} /> : null}
          {L.city !== 'tampere' ? <ActionCard icon="city" title="Tampere" detail={t('gps_none')} onPress={() => run((s) => setLocation(s, { mode: 'city', city: 'tampere' }))} /> : null}
        </EmptyState>
        {stores.length ? (
          <View style={{ paddingHorizontal: gutter, marginTop: space.xxl }}>
            <Txt variant="heading">{t('participating')}</Txt>
            <Txt variant="small" color="textSecondary" style={{ marginBottom: space.s }}>{t('participating_s')}</Txt>
            {stores.map((s) => <ShopRow key={s.id} store={s} />)}
          </View>
        ) : null}
      </>
    );
  } else if (!list.length) {
    body = (
      <EmptyState title={t('no_match_title')} body={t('no_match_body')}>
        <ActionCard icon="sliders" title={t('clear_filters')} detail={t('no_match_body')} onPress={() => setFilter({ ...filter, categories: [], when: 'any', showSoldOut: true, query: '', mode: 'all' })} />
      </EmptyState>
    );
  } else if (view === 'map') {
    const sel = list.find((o) => o.id === pin);
    body = (
      <View style={{ paddingHorizontal: gutter, marginTop: space.m }}>
        <MapSim
          height={430}
          radiusPx={150}
          onPin={setPin}
          pins={list.map((o) => {
            const s = storeById(state, o.storeId)!;
            const st = offerState(o, now);
            return { id: o.id, x: s.x, y: s.y, walk: o.distributionMode === 'WALK_IN', label: o.distributionMode === 'WALK_IN' ? '?' : String(o.qtyLeft ?? 0), dim: st !== 'active', selected: o.id === pin };
          })}
        />
        {sel ? <View style={{ marginTop: space.m }}><OfferCard offer={sel} store={storeById(state, sel.storeId)!} compact /></View> : null}
      </View>
    );
  } else {
    const groups: [DiscoverSection, string, string?][] = [['now', t('now_title')], ['walkin', t('walkin_now_title'), t('walkin_now_note')], ['later', t('later_title')], ['soldout', t('sold_out_title')]];
    body = groups.map(([key, title, sub]) => {
      const g = list.filter((o) => sectionOf(o, now) === key);
      if (!g.length) return null;
      return (
        <Rail key={key} title={title} note={sub} count={t('results_n', { n: g.length })}>
          {g.map((o) => <OfferCard key={o.id} offer={o} store={storeById(state, o.storeId)!} width={300} />)}
        </Rail>
      );
    });
  }

  return (
    <ScrollView style={{ backgroundColor: colors.surface }} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: space.l }}>
      {header}
      {body}
      {note}
    </ScrollView>
  );
}

function RoundBtn({ icon, label, onPress, dot }: { icon: 'bell' | 'swap'; label: string; onPress: () => void; dot?: boolean }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[styles.round, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Icon name={icon} size={21} color="icon" />
      {dot ? <View style={[styles.dot, { backgroundColor: colors.active, borderColor: colors.surface }]} /> : null}
    </Pressable>
  );
}

function SquareBtn({ icon, label, onPress, badge }: { icon: 'sliders' | 'map' | 'list'; label: string; onPress: () => void; badge?: number }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[styles.square, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <Icon name={icon} size={22} color="icon" />
      {badge ? <View style={[styles.badge, { backgroundColor: colors.active }]}><Txt variant="tiny" weight="bold" style={{ color: colors.onActive, fontSize: 10, lineHeight: 14 }}>{badge}</Txt></View> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  locRow: { flexDirection: 'row', alignItems: 'center', gap: space.s, paddingHorizontal: gutter, paddingTop: space.s },
  locBtn: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48 },
  locIc: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  round: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: 5, borderWidth: 2 },
  searchRow: { flexDirection: 'row', gap: space.s, paddingHorizontal: gutter, marginTop: space.s + 2 },
  search: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 14, borderRadius: radius.control, borderWidth: 1 },
  input: { flex: 1, minWidth: 0, fontFamily: 'Figtree_400Regular', fontSize: 15, paddingVertical: 0 },
  square: { width: 48, height: 48, borderRadius: radius.control, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: 5, right: 5, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
});
