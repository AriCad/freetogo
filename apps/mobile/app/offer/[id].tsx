import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  isGone, isStaleReport, myActive, offerById, offerState, reportWalkIn, reserve, saveWalkInQuality, storeById, walkSignal,
  type AlertReason, type ReportLevel,
} from '@freetogo/core';
import { Block, Button, Callout, DisabledWhy, ErrorLine, Icon, Pill, Txt, gutter, radius, space, useTheme, type IconName } from '@freetogo/ui';
import { useStore } from '../../src/state/AppStore';
import { useActions } from '../../src/state/useActions';
import { photoSource } from '../../src/photos';
import { PhotoTag, StoreLogo, statusLabel } from '../../src/components/OfferCard';
import { RatingBlock, StarInput } from '../../src/components/Blocks';
import { MapSim } from '../../src/components/MapSim';
import { Sheet } from '../../src/components/Sheet';
import { KV, Tags } from '../../src/components/Bits';
import { ago, cityName, km, time } from '../../src/format';

export default function OfferScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { state, now, run, showToast } = useStore();
  const { toggleFav, toggleShopBell } = useActions();
  const [checking, setChecking] = useState(from === 'alert');
  const [sheet, setSheet] = useState<null | 'confirm' | 'busy' | 'race' | 'gone' | 'safety'>(null);
  const [safetyKind, setSafetyKind] = useState<string | null>(null);
  const [safetyTried, setSafetyTried] = useState(false);
  const [quality, setQuality] = useState(0);

  // Deep link from an alert: recheck availability before showing the offer.
  useEffect(() => {
    if (from !== 'alert') return;
    const tm = setTimeout(() => setChecking(false), 700);
    return () => clearTimeout(tm);
  }, [from]);

  const o = offerById(state, id ?? '');
  const s = o ? storeById(state, o.storeId) : undefined;
  if (!o || !s) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Txt variant="heading">{t('not_found')}</Txt>
        <Button label={t('back_discover')} kind="soft" block={false} onPress={() => router.replace('/')} />
      </View>
    );
  }
  const st = offerState(o, now);
  const walk = o.distributionMode === 'WALK_IN';
  const gone = isGone(st);
  const fav = state.favorites.includes(s.id);
  const bell = state.bells.includes(s.id);
  const mine = myActive(state);
  const reasons = state.alertReasons[o.id];
  const src = photoSource(o.photo, s.photo);
  const status = statusLabel(t, st);

  const doReserve = () => {
    setSheet('busy');
    setTimeout(() => {
      const r = run((x, n) => reserve(x, o.id, n));
      if (r.ok && r.value) {
        setSheet(null);
        router.replace(`/reserved/${r.value.id}`);
      } else setSheet(r.error === 'ended' ? 'gone' : 'race');
    }, 700);
  };

  const reasonText = (rs: AlertReason[]) =>
    rs.map((r) => (r.kind === 'favorite' ? t('reason_favorite') : r.kind === 'bell' ? t('reason_bell') : r.kind === 'radius' ? t('reason_radius', { km: state.notif.radiusKm, place: t('saved_place_home') }) : t('reason_city', { c: cityName(r.city) }))).join(', ');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: space.xxl }}>
        <View style={[styles.hero, { backgroundColor: colors.primarySoft }]}>
          {src ? <Image source={src} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
          <View style={[styles.heroActions, { top: insets.top + 6 }]}>
            <RoundIcon icon="left" label={t('back')} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
            <View style={{ flexDirection: 'row', gap: space.s }}>
              <RoundIcon icon={fav ? 'heartFill' : 'heart'} tint={fav ? colors.accent : undefined} label={t('heart_label')} onPress={() => toggleFav(s.id)} />
              <RoundIcon icon={bell ? 'bellFill' : 'bell'} bg={bell ? colors.active : undefined} tint={bell ? colors.onActive : undefined} label={t('bell_label')} onPress={() => void toggleShopBell(s.id)} />
            </View>
          </View>
          <View style={styles.heroTag}><PhotoTag offer={o} /></View>
        </View>

        <View style={[styles.sheetCard, { backgroundColor: colors.surface }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
            <StoreLogo store={s} size={56} />
            <View style={{ flex: 1 }}>
              <Txt variant="heading" accessibilityRole="header">{s.name}</Txt>
              <Pressable onPress={() => router.push(`/store/${s.id}`)} accessibilityRole="link"><Txt variant="small" weight="semibold" color="link">{t(`kind.${s.kind}`)} · {t('open_store')}</Txt></Pressable>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Txt variant="title">{t('free')}</Txt>
              <Txt variant="tiny" color="textSecondary">{t('free_s')}</Txt>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: space.s, marginTop: space.m, flexWrap: 'wrap' }}>
            {walk ? <Pill tone="walk" icon="alert" label={t('walkin_badge')} /> : <Pill tone="badge" icon="bag" label={t('reserve_badge')} />}
            {status ? <Pill tone="dark" label={status} /> : !walk ? <Pill tone="badge" label={t('left_n', { n: o.qtyLeft ?? 0 })} /> : null}
          </View>
          {reasons ? <View style={{ marginTop: space.m }}><Callout tone="brand" icon="bell">{t('why_notified', { r: reasonText(reasons) })}</Callout></View> : null}
          {from === 'alert' && !checking && !gone ? <Txt variant="tiny" color="textSecondary" style={{ marginTop: space.s }}>{t('offer_rechecked')}</Txt> : null}
        </View>

        <View style={{ paddingHorizontal: gutter, gap: space.m }}>
          {walk ? <WalkInPanel offerId={o.id} /> : (
            <View style={[styles.modePanel, { backgroundColor: colors.primarySoft, borderColor: colors.border }]}>
              <View style={[styles.modeIc, { backgroundColor: colors.active }]}><Icon name="bag" size={20} raw={colors.onActive} /></View>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt weight="bold">{t('reserve_explain_t')}</Txt>
                <Txt variant="small" color="textSecondary">{t('reserve_explain_s')}</Txt>
                {!gone ? (
                  <>
                    <Txt variant="small" weight="bold" style={{ marginTop: space.s }}>{t('bags_left_of', { n: o.qtyLeft ?? 0, t: o.qtyTotal ?? 0 })}</Txt>
                    <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.surface, overflow: 'hidden' }}>
                      <View style={{ height: 10, width: `${((o.qtyLeft ?? 0) / (o.qtyTotal || 1)) * 100}%`, backgroundColor: colors.active }} />
                    </View>
                  </>
                ) : null}
              </View>
            </View>
          )}

          <Block style={{ gap: space.s }}>
            <InfoRow icon="clock" title={t('pickup_time')} detail={`${t('today')} ${time(o.start)}–${time(o.end)}${o.start > now ? ` · ${t('starts_at', { t: time(o.start) })}` : ''}`} />
            <InfoRow icon="pin" title={s.address} detail={t('km', { d: km(s.km) })} right={<Button size="small" kind="secondary" block={false} icon="nav" label={t('directions')} onPress={() => void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`)} />} />
            <MapSim height={130} pins={[{ id: o.id, x: 0.5, y: 0.62, walk, label: walk ? '?' : String(o.qtyLeft ?? 0) }]} />
          </Block>

          {walk ? (
            <Block style={{ gap: space.s }}>
              <Txt weight="bold">{t('walkin_available')}</Txt>
              <Txt>{o.what}</Txt>
              {o.categories.length ? <Tags items={o.categories.map((c) => t(`cat.${c}`))} /> : null}
            </Block>
          ) : (
            <Block style={{ gap: space.s }}>
              <Txt weight="bold">{t('possible_contents')}</Txt>
              <Tags items={o.categories.map((c) => t(`cat.${c}`))} />
              <View style={[styles.caveat, { backgroundColor: colors.background }]}><Txt variant="small">{t('contents_caveat')}</Txt></View>
              {o.description ? <><Txt weight="bold" style={{ marginTop: space.s }}>{t('from_shop')}</Txt><Txt color="textSecondary">{o.description}</Txt></> : null}
            </Block>
          )}

          {walk && !gone ? (
            <Block style={{ gap: space.s }}>
              <Txt weight="bold">{t('quality_optional_t')}</Txt>
              <Txt variant="small" color="textSecondary">{t('quality_optional_s')}</Txt>
              {state.myQuality[o.id]?.saved ? (
                <Callout tone="ok" icon="check">{t('quality_saved')}</Callout>
              ) : (
                <>
                  <StarInput value={quality} onChange={setQuality} label={t('quality_optional_t')} />
                  {quality ? <Button kind="secondary" size="small" block={false} label={t('save_rating')} onPress={() => { run((x) => saveWalkInQuality(x, o.id, quality)); showToast(t('quality_saved')); }} /> : null}
                </>
              )}
            </Block>
          ) : null}

          <RatingBlock store={s} />
          <Block style={{ gap: space.s }}>
            <Txt weight="bold">{t('good_to_know')}</Txt>
            <Txt variant="small" color="textSecondary">{t('allergen_note')}</Txt>
            <Txt variant="small" color="textSecondary">{t('bring_bag')}</Txt>
            <Button kind="quiet" icon="flag" label={t('safety_link')} onPress={() => setSheet('safety')} />
          </Block>
        </View>
      </ScrollView>

      <View style={[styles.cta, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom + space.m }]}>
        {walk ? (
          gone ? <><Button disabled label={t('cta_ended')} /><DisabledWhy text={t('cta_ended_why')} /></> : (
            <>
              <Button kind="soft" icon="nav" label={t('directions')} onPress={() => void Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`)} />
              <DisabledWhy text={t('no_reserve_needed')} />
            </>
          )
        ) : mine && mine.offerId === o.id ? (
          <Button icon="qr" label={t('view_my_pickup')} onPress={() => router.push('/pickups')} />
        ) : gone ? (
          <><Button disabled label={t('cta_ended')} /><DisabledWhy text={t('cta_ended_why')} /></>
        ) : st === 'soldout' || st === 'stopped' ? (
          <>
            <Button disabled label={t('cta_soldout')} />
            <DisabledWhy text={t('cta_soldout_why')} />
            {!bell ? <View style={{ marginTop: space.s }}><Button kind="secondary" icon="bell" label={t('turn_bell_on')} onPress={() => void toggleShopBell(s.id)} /></View> : null}
          </>
        ) : mine ? (
          <><Button disabled label={t('cta_has_active')} /><DisabledWhy text={t('cta_has_active_why')} /></>
        ) : (
          <>
            <View style={styles.ctaLine}>
              <Txt variant="small" weight="bold">{t('free')} · {t('left_n', { n: o.qtyLeft ?? 0 })}</Txt>
              <Txt variant="small" color="textSecondary">{t('today')} {time(o.start)}–{time(o.end)}</Txt>
            </View>
            <Button label={t('reserve_cta')} onPress={() => setSheet('confirm')} />
          </>
        )}
      </View>

      {checking ? (
        <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: colors.surface }]} accessibilityLiveRegion="polite">
          <ActivityIndicator size="large" color={colors.active} />
          <Txt variant="heading">{t('checking')}</Txt>
          <Txt color="textSecondary">{t('checking_s')}</Txt>
        </View>
      ) : null}
      {!checking && from === 'alert' && gone ? (
        <Sheet visible title={t('offer_gone_title')} onClose={() => router.replace('/')}>
          <Txt color="textSecondary">{t('offer_gone_body')}</Txt>
          <Button label={t('back_discover')} onPress={() => router.replace('/')} />
        </Sheet>
      ) : null}

      <Sheet visible={sheet === 'confirm'} title={t('confirm_title')} onClose={() => setSheet(null)}>
        <Block flat style={{ backgroundColor: colors.background, gap: 6 }}>
          <KV k={s.name} v={t('surprise_bag')} />
          <KV k={t('pickup_time')} v={`${t('today')} ${time(o.start)}–${time(o.end)}`} />
          <KV k={t('free_s')} v={t('free')} />
        </Block>
        <Txt variant="small" color="textSecondary">{t('confirm_body')}</Txt>
        <Button label={t('confirm_btn')} onPress={doReserve} />
        <Button kind="quiet" label={t('cancel')} onPress={() => setSheet(null)} />
      </Sheet>
      <Sheet visible={sheet === 'busy'} title={t('checking')} onClose={() => undefined} dismissable={false}>
        <ActivityIndicator size="large" color={colors.active} />
        <Txt color="textSecondary" align="center">{t('checking_s')}</Txt>
      </Sheet>
      <Sheet visible={sheet === 'race'} title={t('race_title')} onClose={() => setSheet(null)}>
        <Txt color="textSecondary">{t('race_body')}</Txt>
        {!bell ? <Button icon="bell" label={t('turn_bell_on')} onPress={() => { void toggleShopBell(s.id); setSheet(null); }} /> : null}
        <Button kind="secondary" label={t('back_discover')} onPress={() => { setSheet(null); router.replace('/'); }} />
      </Sheet>
      <Sheet visible={sheet === 'gone'} title={t('offer_gone_title')} onClose={() => setSheet(null)}>
        <Txt color="textSecondary">{t('offer_gone_body')}</Txt>
        <Button label={t('back_discover')} onPress={() => { setSheet(null); router.replace('/'); }} />
      </Sheet>
      <Sheet visible={sheet === 'safety'} title={t('safety_t')} onClose={() => setSheet(null)}>
        <Txt variant="small" color="textSecondary">{t('safety_s')}</Txt>
        {['sf_spoiled', 'sf_allergen', 'sf_other'].map((k) => (
          <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: safetyKind === k }} onPress={() => setSafetyKind(k)} style={[styles.option, { borderColor: safetyKind === k ? colors.active : safetyTried && !safetyKind ? colors.danger : colors.border, backgroundColor: safetyKind === k ? colors.primarySoft : colors.surface }]}>
            <Txt weight="semibold" style={{ flex: 1 }}>{t(k)}</Txt>
            {safetyKind === k ? <Icon name="check" size={20} color="active" /> : null}
          </Pressable>
        ))}
        <Callout tone="danger" icon="alert">{t('safety_urgent')}</Callout>
        {safetyTried && !safetyKind ? <ErrorLine text={t('choose_reason')} /> : null}
        <Button label={t('send_report')} onPress={() => { if (!safetyKind) { setSafetyTried(true); return; } setSheet(null); setSafetyKind(null); setSafetyTried(false); showToast(t('safety_sent')); }} />
      </Sheet>
    </View>
  );
}

function WalkInPanel({ offerId }: { offerId: string }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state, now, run, showToast } = useStore();
  const o = offerById(state, offerId)!;
  const st = offerState(o, now);
  const sig = walkSignal(o, now);
  const mine = state.myReports[o.id];
  const gone = isGone(st);
  const report = (level: ReportLevel) => {
    const r = run((x, n) => reportWalkIn(x, o.id, level, x.userId, n));
    if (r.ok) showToast(t('report_thanks'));
  };
  const icon: Record<ReportLevel, IconName> = { MANY: 'crateMany', LOW: 'crateLow', NONE: 'crateNone' };
  return (
    <>
      <View style={[styles.walkPanel, { borderColor: colors.badgeText, backgroundColor: colors.surface }]}>
        <View style={{ backgroundColor: colors.primarySoft, padding: space.m }}>
          <Txt variant="lead" weight="bold">{t('walkin_label')}</Txt>
        </View>
        <View style={{ padding: space.m, gap: space.xs }}>
          <Txt variant="small">{t('walkin_explain')}</Txt>
          <Txt variant="small" weight="bold">{t('published_ago', { a: ago(o.publishedAt, now) })}{o.photo.kind === 'current' ? ` · ${t('photo_today', { t: time(o.photo.takenAt ?? o.publishedAt) })}` : ''}</Txt>
        </View>
      </View>
      {st === 'closed' ? <Callout tone="danger" icon="hand" title={t('closed_t')}>{t('closed_s', { a: ago(o.closedAt ?? now, now) })}</Callout> : null}
      {st === 'expired' ? <Callout icon="clock" title={t('expired_t')}>{t('expired_s')}</Callout> : null}
      {st === 'review' ? <Callout tone="danger" icon="alert" title={t('review_t')}>{t('review_s')}</Callout> : null}
      {st === 'possiblyGone' && sig.last ? <Callout tone="brand" icon="alert" title={t('possibly_gone_t')}>{t('possibly_gone_s', { a: ago(sig.last.at, now) })}</Callout> : null}
      <Block style={{ gap: space.s }}>
        {!gone ? (
          <>
            <Txt weight="bold">{t('report_title')}</Txt>
            <Txt variant="small" color="textSecondary">{t('report_sub')}</Txt>
            <View style={{ flexDirection: 'row', gap: space.s }}>
              {(['MANY', 'LOW', 'NONE'] as const).map((l) => {
                const on = mine?.level === l;
                return (
                  <Pressable key={l} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={t(`r_${l}`)} onPress={() => report(l)}
                    style={[styles.reportBtn, { borderColor: on ? colors.selected : colors.border, backgroundColor: on ? colors.selected : colors.surface }]}>
                    <Icon name={icon[l]} size={36} raw={on ? colors.onSelected : colors.textPrimary} />
                    <Txt variant="small" weight="bold" align="center" style={{ color: on ? colors.onSelected : colors.textPrimary }}>{t(`r_${l}`)}</Txt>
                  </Pressable>
                );
              })}
            </View>
            {mine ? <Txt variant="small">{t('report_yours', { r: t(`r_${mine.level}`), a: ago(mine.at, now) })}</Txt> : null}
          </>
        ) : null}
        <Txt weight="bold" style={{ marginTop: space.s }}>{t('latest_reports')}</Txt>
        {!o.reports.length ? <Txt variant="small" color="textSecondary">{t('no_reports')}</Txt> : (
          [...o.reports].reverse().slice(0, 4).map((r, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space.s, alignItems: 'center' }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: r.level === 'MANY' ? colors.ok : r.level === 'LOW' ? colors.accent : colors.danger }} />
              <View style={{ flex: 1 }}>
                <Txt variant="small"><Txt variant="small" weight="bold">{t(`r_${r.level}`)}</Txt> · {ago(r.at, now)}</Txt>
                <Txt variant="tiny" color="textSecondary">{r.merchant ? t('merchant_confirmed') : `${r.by === state.userId ? `${t('you')} · ` : ''}${t('unverified')}`}{isStaleReport(r, now) ? ` · ${t('stale')}` : ''}</Txt>
              </View>
            </View>
          ))
        )}
      </Block>
    </>
  );
}

function RoundIcon({ icon, label, onPress, tint, bg }: { icon: IconName; label: string; onPress: () => void; tint?: string; bg?: string }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[styles.round, { backgroundColor: bg ?? 'rgba(255,255,255,0.96)' }]}>
      <Icon name={icon} size={22} raw={tint ?? colors.textPrimary} />
    </Pressable>
  );
}

function InfoRow({ icon, title, detail, right }: { icon: IconName; title: string; detail?: string; right?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: space.m, alignItems: 'center' }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={20} color="icon" /></View>
      <View style={{ flex: 1 }}><Txt weight="bold">{title}</Txt>{detail ? <Txt variant="small" color="textSecondary">{detail}</Txt> : null}</View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.m, padding: gutter },
  hero: { height: 260, overflow: 'hidden' },
  heroActions: { position: 'absolute', left: gutter, right: gutter, flexDirection: 'row', justifyContent: 'space-between' },
  heroTag: { position: 'absolute', left: gutter, bottom: 36 },
  round: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sheetCard: { marginTop: -24, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, padding: gutter, paddingTop: space.xl, marginBottom: space.m },
  modePanel: { flexDirection: 'row', gap: space.m, padding: space.l, borderRadius: radius.card, borderWidth: 1 },
  modeIc: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  walkPanel: { borderRadius: radius.card, borderWidth: 1.5, borderStyle: 'dashed', overflow: 'hidden' },
  caveat: { padding: space.m, borderRadius: 12 },
  cta: { paddingHorizontal: gutter, paddingTop: space.m, borderTopWidth: StyleSheet.hairlineWidth },
  ctaLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.s },
  reportBtn: { flex: 1, minHeight: 104, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: 6, padding: space.s },
  option: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: space.m, borderRadius: 12, borderWidth: 1.5 },
});
