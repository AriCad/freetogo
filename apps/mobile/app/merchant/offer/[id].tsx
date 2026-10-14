import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  MINUTE, editOffer, extendWalkIn, hhmm, isGone, merchantAllGone, merchantCancel, merchantStillFood, offerById, offerState, stopReservations,
  type MerchantCancelReason,
} from '@freetogo/core';
import { Block, Button, Callout, Check, DisabledWhy, Divider, Icon, Pill, Txt, radius, space, useTheme } from '@freetogo/ui';
import { useStore } from '../../../src/state/AppStore';
import { Screen } from '../../../src/components/Screen';
import { Sheet } from '../../../src/components/Sheet';
import { statusLabel } from '../../../src/components/OfferCard';
import { ago, time } from '../../../src/format';

export default function MerchantOffer() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state, now, run, showToast } = useStore();
  const [sheet, setSheet] = useState<null | 'edit' | 'cancel' | 'extend'>(null);
  const [reason, setReason] = useState<MerchantCancelReason | null>(null);
  const [confirmFood, setConfirmFood] = useState(false);
  const o = offerById(state, id ?? '');
  const [qty, setQty] = useState(o?.qtyTotal ?? 1);
  const [end, setEnd] = useState(o ? hhmm(o.end) : '18:00');
  if (!o || o.storeId !== state.merchantStoreId) return <Screen back><Txt>{t('not_found')}</Txt></Screen>;
  const st = offerState(o, now);
  const gone = isGone(st);
  const walk = o.distributionMode === 'WALK_IN';
  const res = state.reservations.filter((r) => r.offerId === o.id);
  const open = res.filter((r) => r.status === 'confirmed');
  const reserved = (o.qtyTotal ?? 0) - (o.qtyLeft ?? 0);
  const status = statusLabel(t, st);
  const noneUsers = new Set(o.reports.filter((r) => r.level === 'NONE' && !r.merchant).map((r) => r.by)).size;
  const stKey: Record<string, string> = { confirmed: 'st_confirmed', collected: 'st_collected', cancelled_user: 'st_cancelled_user', cancelled_merchant: 'st_cancelled_merchant', not_received: 'st_not_received', expired: 'st_expired' };

  return (
    <Screen back title={t(walk ? 'm_form_walkin' : 'm_form_reserved')}>
      <View style={{ flexDirection: 'row', gap: space.s, flexWrap: 'wrap' }}>
        {walk ? <Pill tone="walk" label={t('walkin_badge')} /> : <Pill tone="badge" label={t('reserve_badge')} />}
        {status ? <Pill tone="dark" label={status} /> : null}
        <Pill tone="badge" icon="clock" label={`${time(o.start)}–${time(o.end)}`} />
      </View>
      <Txt variant="heading">{walk ? o.what : o.categories.map((c) => t(`cat.${c}`)).join(', ')}</Txt>

      {walk ? (
        <>
          {!gone && (st === 'review' || st === 'possiblyGone') ? (
            <Callout tone="danger" icon="alert" title={t('m_review_prompt_t')}>
              <Txt variant="small" style={{ color: colors.danger }}>{t('m_review_prompt_s', { n: noneUsers })}</Txt>
              <View style={{ flexDirection: 'row', gap: space.s, marginTop: space.s }}>
                <View style={{ flex: 1 }}><Button size="small" label={t('m_all_gone')} onPress={() => { run((s, n) => merchantAllGone(s, o.id, n)); showToast(t('m_closed_toast')); }} /></View>
                <View style={{ flex: 1 }}><Button size="small" kind="secondary" label={t('m_still_food')} onPress={() => { run((s, n) => merchantStillFood(s, o.id, n)); showToast(t('m_still_food_toast')); }} /></View>
              </View>
            </Callout>
          ) : null}
          {!gone ? (
            <>
              <Pressable accessibilityRole="button" accessibilityLabel={t('m_all_gone')} onPress={() => { run((s, n) => merchantAllGone(s, o.id, n)); showToast(t('m_closed_toast')); }}
                style={{ minHeight: 72, borderRadius: 20, backgroundColor: colors.active, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: space.s, marginTop: space.s }}>
                <Icon name="hand" size={28} raw={colors.onActive} />
                <Txt variant="heading" style={{ color: colors.onActive }}>{t('m_all_gone')}</Txt>
              </Pressable>
              <Txt variant="small" color="textSecondary" align="center">{t('m_all_gone_s')}</Txt>
              <Block style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
                <View style={{ flex: 1 }}>
                  <Txt weight="bold">{t('m_expires_in', { n: Math.max(0, Math.round(((o.expiresAt ?? now) - now) / MINUTE)) })}</Txt>
                  <Txt variant="small" color="textSecondary">{t('m_expiry_note')}</Txt>
                </View>
                <Button size="small" kind="secondary" block={false} label={t('m_extend')} onPress={() => { setConfirmFood(false); setSheet('extend'); }} />
              </Block>
            </>
          ) : <Callout icon="check">{st === 'closed' ? t('closed_t') : t('expired_t')}</Callout>}
          <Block style={{ gap: space.s }}>
            <Txt weight="bold">{t('m_reports')}</Txt>
            {o.reports.length ? [...o.reports].reverse().map((r, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: space.s, alignItems: 'center' }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: r.level === 'MANY' ? colors.ok : r.level === 'LOW' ? colors.accent : colors.danger }} />
                <Txt variant="small" style={{ flex: 1 }}><Txt variant="small" weight="bold">{t(`r_${r.level}`)}</Txt> · {ago(r.at, now)} · {r.merchant ? t('merchant_confirmed') : t('unverified')}</Txt>
              </View>
            )) : <Txt variant="small" color="textSecondary">{t('m_reports_none')}</Txt>}
          </Block>
        </>
      ) : (
        <>
          <Block style={{ gap: space.s }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt weight="bold">{t('m_reserved_of', { r: reserved, t: o.qtyTotal ?? 0 })}</Txt>
              <Txt variant="small" color="textSecondary">{t('m_free_n', { n: o.qtyLeft ?? 0 })}</Txt>
            </View>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.primarySoft, overflow: 'hidden' }}><View style={{ height: 10, width: `${(reserved / (o.qtyTotal || 1)) * 100}%`, backgroundColor: colors.active }} /></View>
          </Block>
          {!gone ? <Button icon="qr" label={t('m_scan')} onPress={() => router.push(`/merchant/scan/${o.id}`)} /> : null}
          <Block style={{ gap: space.s }}>
            <Txt weight="bold">{t('m_reservations')}</Txt>
            {res.length ? res.map((r) => (
              <View key={r.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 36 }}>
                <Txt variant="small">{r.code}{r.userId === state.userId ? ' · Aino K.' : ''}</Txt>
                <Pill tone={r.status === 'collected' ? 'ok' : r.status === 'cancelled_merchant' || r.status === 'not_received' ? 'danger' : 'badge'} label={t(stKey[r.status] ?? 'st_expired')} />
              </View>
            )) : <Txt variant="small" color="textSecondary">{t('m_no_reservations')}</Txt>}
          </Block>
          {!gone ? (
            <>
              <View style={{ flexDirection: 'row', gap: space.s }}>
                <View style={{ flex: 1 }}><Button kind="secondary" icon="edit" label={t('m_edit')} onPress={() => { setQty(o.qtyTotal ?? 1); setEnd(hhmm(o.end)); setSheet('edit'); }} /></View>
                <View style={{ flex: 1 }}><Button kind="secondary" label={t('m_stop')} disabled={!o.reservationsOpen} onPress={() => { run((s) => stopReservations(s, o.id)); showToast(t('m_stopped')); }} /></View>
              </View>
              {o.reservationsOpen ? <Txt variant="tiny" color="textSecondary">{t('m_stop_s')}</Txt> : <DisabledWhy text={t('m_stopped')} />}
              <Button kind="danger" label={t('m_cancel_all')} disabled={!open.length} onPress={() => { setReason(null); setSheet('cancel'); }} />
              {!open.length ? <DisabledWhy text={t('m_scan_none')} /> : null}
            </>
          ) : null}
        </>
      )}

      <Sheet visible={sheet === 'edit'} title={t('m_edit_t')} onClose={() => setSheet(null)}>
        <Txt weight="bold">{t('m_bags')}</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.l }}>
          <Step icon="minus" onPress={() => setQty(Math.max(Math.max(1, reserved), qty - 1))} />
          <Txt variant="display">{qty}</Txt>
          <Step icon="plus" onPress={() => setQty(Math.min(50, qty + 1))} />
        </View>
        {qty <= reserved ? <DisabledWhy text={t('m_edit_min', { n: reserved })} /> : null}
        <Txt weight="bold">{t('m_end')}</Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.l }}>
          <Step icon="minus" onPress={() => { const [h, m] = end.split(':').map(Number); const d = new Date(now); d.setHours(h ?? 0, (m ?? 0) - 15, 0, 0); setEnd(hhmm(d.getTime())); }} />
          <Txt variant="heading">{end}</Txt>
          <Step icon="plus" onPress={() => { const [h, m] = end.split(':').map(Number); const d = new Date(now); d.setHours(h ?? 0, (m ?? 0) + 15, 0, 0); setEnd(hhmm(d.getTime())); }} />
        </View>
        <Button label={t('m_save')} onPress={() => { const r = run((s, n) => editOffer(s, o.id, { qtyTotal: qty, end }, n)); if (r.ok) { setSheet(null); showToast(t('m_saved')); } else showToast(r.error === 'need_time' ? t('m_need_time') : t('m_edit_min', { n: reserved })); }} />
      </Sheet>
      <Sheet visible={sheet === 'cancel'} title={t('m_cancel_t')} onClose={() => setSheet(null)}>
        <Txt variant="small" color="textSecondary">{t('m_cancel_s')}</Txt>
        <Txt weight="bold">{t('m_cancel_reason')}</Txt>
        {(['out', 'closing', 'other'] as const).map((k) => (
          <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: reason === k }} onPress={() => setReason(k)}
            style={{ flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: space.m, borderRadius: 12, borderWidth: 1.5, borderColor: reason === k ? colors.active : colors.border, backgroundColor: reason === k ? colors.primarySoft : colors.surface }}>
            <Txt weight="semibold" style={{ flex: 1 }}>{t(`mc_${k}`)}</Txt>
            {reason === k ? <Icon name="check" size={20} color="active" /> : null}
          </Pressable>
        ))}
        <Button label={t('m_cancel_do', { n: open.length })} disabled={!reason} onPress={() => { if (!reason) return; const r = run((s, n) => merchantCancel(s, o.id, reason, n)); setSheet(null); showToast(t('m_cancelled', { n: r.value ?? 0 })); }} />
        {!reason ? <DisabledWhy text={t('choose_reason')} /> : null}
      </Sheet>
      <Sheet visible={sheet === 'extend'} title={t('m_extend_t')} onClose={() => setSheet(null)}>
        <Check label={t('m_extend_confirm')} checked={confirmFood} onPress={() => setConfirmFood(!confirmFood)} />
        <Button label={t('m_extend')} disabled={!confirmFood} onPress={() => { run((s, n) => extendWalkIn(s, o.id, n)); setSheet(null); showToast(t('m_extended')); }} />
        {!confirmFood ? <DisabledWhy text={t('m_extend_confirm')} /> : null}
      </Sheet>
      <Divider />
    </Screen>
  );
}

function Step({ icon, onPress }: { icon: 'plus' | 'minus'; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={icon === 'plus' ? '+' : '-'} onPress={onPress} style={{ width: 52, height: 52, borderRadius: radius.control, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={22} />
    </Pressable>
  );
}
