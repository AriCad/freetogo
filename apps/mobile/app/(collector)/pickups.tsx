import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { cancelReservation, myReservations, offerById, reportNotReceived, storeById, type NotReceivedReason, type Reservation } from '@freetogo/core';
import { Block, Button, Callout, ErrorLine, Icon, Pill, Txt, radius, space, useTheme } from '@freetogo/ui';
import { useStore } from '../../src/state/AppStore';
import { Screen } from '../../src/components/Screen';
import { Sheet } from '../../src/components/Sheet';
import { EmptyState } from '../../src/components/Blocks';
import { PickupQR } from '../../src/components/PickupQR';
import { StoreLogo } from '../../src/components/OfferCard';
import { time } from '../../src/format';

const STATUS: Record<string, [string, 'ok' | 'danger' | 'badge' | 'dark']> = {
  collected: ['st_collected', 'ok'], cancelled_user: ['st_cancelled_user', 'badge'], cancelled_merchant: ['st_cancelled_merchant', 'danger'],
  not_received: ['st_not_received', 'danger'], expired: ['st_expired', 'badge'], confirmed: ['st_confirmed', 'badge'],
};

export default function Pickups() {
  const { t } = useTranslation();
  const { state } = useStore();
  const mine = myReservations(state);
  const active = mine.filter((r) => r.status === 'confirmed');
  const cancelled = mine.filter((r) => r.status === 'cancelled_merchant');
  const past = mine.filter((r) => r.status !== 'confirmed').reverse();
  return (
    <Screen>
      <Txt variant="title" style={{ marginTop: space.l }} accessibilityRole="header">{t('pickups_title')}</Txt>
      {cancelled.slice(-1).map((r) => (
        <Callout key={r.id} tone="danger" icon="alert" title={t('merchant_cancelled_t')}>
          {`${storeById(state, r.storeId)?.name ?? ''} – ${t('merchant_cancelled_s', { r: t(`mc_${r.cancelReason ?? 'other'}`) })}`}
        </Callout>
      ))}
      {!mine.length ? (
        <EmptyState title={t('no_pickups_t')} body={t('no_pickups_s')}>
          <Button label={t('find_food')} onPress={() => router.push('/')} />
        </EmptyState>
      ) : null}
      {active.map((r) => <Ticket key={r.id} r={r} />)}
      {past.length ? (
        <>
          <Txt variant="heading" style={{ marginTop: space.l }}>{t('history')}</Txt>
          <Block style={{ paddingVertical: 4 }}>
            {past.map((r) => {
              const s = storeById(state, r.storeId);
              const [k, tone] = STATUS[r.status] ?? ['st_expired', 'badge'];
              return (
                <View key={r.id} style={styles.histRow}>
                  {s ? <StoreLogo store={s} size={40} /> : null}
                  <View style={{ flex: 1 }}>
                    <Txt weight="semibold" numberOfLines={1}>{s?.name}</Txt>
                    <Txt variant="small" color="textSecondary">{t('surprise_bag')} · {r.code}</Txt>
                  </View>
                  {r.status === 'collected' && !r.rated ? <Button size="small" block={false} label={t('rate_cta')} onPress={() => router.push(`/rate/${r.id}`)} /> : <Pill tone={tone} label={r.status === 'collected' && r.rated ? t('rated') : t(k)} />}
                </View>
              );
            })}
          </Block>
        </>
      ) : null}
    </Screen>
  );
}

function Ticket({ r }: { r: Reservation }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state, now, run, showToast } = useStore();
  const [sheet, setSheet] = useState<null | 'cancel' | 'nr' | 'sent'>(null);
  const [reason, setReason] = useState<NotReceivedReason | null>(null);
  const [text, setText] = useState('');
  const [tried, setTried] = useState(false);
  const o = offerById(state, r.offerId);
  const s = storeById(state, r.storeId);
  if (!o || !s) return null;
  const open = now >= o.start;
  return (
    <View style={[styles.ticket, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={{ backgroundColor: colors.active, padding: space.l }}>
        <Txt variant="small" style={{ color: colors.onActive, opacity: 0.85 }}>{t('active_pickup')}</Txt>
        <Txt variant="heading" style={{ color: colors.onActive }}>{s.name}</Txt>
        <Txt variant="small" style={{ color: colors.onActive }}>{t('today')} {time(o.start)}–{time(o.end)} · {s.address}</Txt>
      </View>
      <View style={{ alignItems: 'center', paddingTop: space.xl, gap: space.s }}>
        <PickupQR code={r.code} size={200} />
        <Txt variant="title" style={{ letterSpacing: 2 }}>{r.code}</Txt>
        <Txt variant="small" color="textSecondary" align="center" style={{ paddingHorizontal: space.xl }}>{t('pickup_code_s')}</Txt>
      </View>
      <View style={[styles.perf, { borderColor: colors.border }]} />
      <View style={{ padding: space.l, paddingTop: 0, gap: space.m }}>
        <Callout tone={open ? 'ok' : 'info'} icon="clock">{open ? t('pickup_open_now', { t: time(o.end) }) : t('pickup_opens', { t: time(o.start) })}</Callout>
        <Button kind="danger" label={t('cancel_reservation')} onPress={() => setSheet('cancel')} />
        {open ? <Button kind="quiet" icon="alert" label={t('not_received')} onPress={() => setSheet('nr')} /> : <Txt variant="tiny" color="textSecondary" align="center">{t('not_received')}: {t('pickup_opens', { t: time(o.start) }).toLowerCase()}</Txt>}
      </View>
      <Sheet visible={sheet === 'cancel'} title={t('cancel_confirm_t')} onClose={() => setSheet(null)}>
        <Txt color="textSecondary">{t('cancel_confirm_s')}</Txt>
        <Button label={t('yes_cancel')} onPress={() => { run((x, n) => cancelReservation(x, r.id, n)); setSheet(null); showToast(t('st_cancelled_user')); }} />
        <Button kind="secondary" label={t('keep_reservation')} onPress={() => setSheet(null)} />
      </Sheet>
      <Sheet visible={sheet === 'nr'} title={t('not_received_t')} onClose={() => setSheet(null)}>
        <Txt color="textSecondary">{t('not_received_s')}</Txt>
        {(['out', 'closed', 'other'] as const).map((k) => (
          <Pressable key={k} accessibilityRole="radio" accessibilityState={{ checked: reason === k }} onPress={() => setReason(k)}
            style={[styles.option, { borderColor: reason === k ? colors.active : tried && !reason ? colors.danger : colors.border, backgroundColor: reason === k ? colors.primarySoft : colors.surface }]}>
            <Txt weight="semibold" style={{ flex: 1 }}>{t(`nr_${k}`)}</Txt>
            {reason === k ? <Icon name="check" size={20} color="active" /> : null}
          </Pressable>
        ))}
        {reason === 'other' ? <TextInput value={text} onChangeText={setText} placeholder={t('nr_other_ph')} placeholderTextColor={colors.textSecondary} multiline style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]} /> : null}
        {tried && !reason ? <ErrorLine text={t('choose_reason')} /> : null}
        <Button label={t('send_report')} onPress={() => { if (!reason) { setTried(true); return; } run((x) => reportNotReceived(x, r.id, reason, text)); setSheet('sent'); }} />
      </Sheet>
      <Sheet visible={sheet === 'sent'} title={t('nr_sent_t')} onClose={() => setSheet(null)}>
        <Txt color="textSecondary">{t('nr_sent_s')}</Txt>
        <Button label={t('done')} onPress={() => setSheet(null)} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  ticket: { borderRadius: radius.sheet, borderWidth: 1, overflow: 'hidden', marginTop: space.m },
  perf: { borderTopWidth: 2, borderStyle: 'dashed', marginHorizontal: space.l, marginVertical: space.l },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 64 },
  option: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: space.m, borderRadius: 12, borderWidth: 1.5 },
  input: { minHeight: 84, borderWidth: 1.5, borderRadius: radius.control, padding: space.m, fontFamily: 'Figtree_400Regular', fontSize: 16, textAlignVertical: 'top' },
});
