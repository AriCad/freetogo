import React, { useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, TextInput, View, type LayoutChangeEvent } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import {
  CATEGORIES, MINUTE, RULES, atTime, hhmm, makeDraftOffer, publish, roundUp, storeById, validateDraft,
  type CategoryKey, type Draft, type DraftError, type Photo,
} from '@freetogo/core';
import { Button, Callout, Check, Field, Icon, Pill, Txt, radius, space, useTheme } from '@freetogo/ui';
import { useStore } from '../../src/state/AppStore';
import { Screen } from '../../src/components/Screen';
import { OfferCard } from '../../src/components/OfferCard';
import { photoSource } from '../../src/photos';

function initial(mode: 'RESERVED' | 'WALK_IN', tpl: boolean, now: number): Draft {
  if (mode === 'WALK_IN') {
    const start = Math.floor(now / (5 * MINUTE)) * 5 * MINUTE;
    return { mode, qty: 1, categories: tpl ? ['produce'] : [], start: hhmm(start), end: hhmm(start + 75 * MINUTE), description: '', what: tpl ? 'Laatikollinen mandariineja' : '', photo: null };
  }
  const start = roundUp(now + 10 * MINUTE, 15);
  return {
    mode, qty: 5, categories: tpl ? ['produce', 'dairy', 'bread', 'dry'] : [], start: hhmm(start), end: hhmm(start + 90 * MINUTE),
    description: tpl ? 'Hedelmiä, vihanneksia ja maitotuotteita.' : '', what: '', photo: tpl ? { kind: 'example', asset: 'pihlaja' } : null,
  };
}

export default function DraftForm() {
  const p = useLocalSearchParams<{ mode?: string; tpl?: string }>();
  const mode = p.mode === 'WALK_IN' ? 'WALK_IN' : 'RESERVED';
  const tpl = p.tpl === '1';
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state, now, run } = useStore();
  const [tried, setTried] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const pos = useRef<Record<string, number>>({});
  const startedAt = useRef(Date.now());
  const [d, setD] = useState<Draft>(() => initial(mode, tpl, Date.now()));
  const [cameraNote, setCameraNote] = useState<string | null>(null);
  const walk = mode === 'WALK_IN';
  const errors = validateDraft(d, now);
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const shift = (key: 'start' | 'end', delta: number) => set({ [key]: hhmm(atTime(now, d[key]) + delta * MINUTE) } as Partial<Draft>);

  const takePhoto = async () => {
    setCameraNote(null);
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) { setCameraNote(t('camera_denied')); return; }
      // Camera only: a walk-in must show today's actual goods, so the photo library is never offered.
      const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: false });
      if (!res.canceled && res.assets[0]) set({ photo: { kind: 'current', uri: res.assets[0].uri, takenAt: Date.now() } });
    } catch {
      setCameraNote(t('demo_photo_s'));
    }
  };
  const demoPhoto: Photo = { kind: 'current', asset: walk ? 'aurinko' : 'pihlaja', takenAt: Date.now() };
  const cameraUnavailable = Platform.OS === 'web' || !!cameraNote;

  // Which field each validation error belongs to (for inline red highlighting).
  const FIELD: Record<DraftError, string> = { need_photo: 'photo', need_what: 'what', need_groups: 'groups', bad_qty: 'qty', end_before_start: 'time', end_past: 'time' };
  const MSG: Record<DraftError, string> = { need_photo: t('m_need_photo'), need_what: t('m_need_what'), need_groups: t('m_need_groups'), bad_qty: t('m_bags_hint'), end_before_start: t('m_end_before_start'), end_past: t('m_end_past') };
  // Errors show after the first publish attempt; an end time before the start is shown immediately.
  const err = (field: string): string | null => {
    const e = errors.find((x) => FIELD[x] === field && (tried > 0 || x === 'end_before_start'));
    return e ? MSG[e] : null;
  };
  const at = (field: string) => (e: LayoutChangeEvent) => { pos.current[field] = e.nativeEvent.layout.y; };

  const doPublish = () => {
    if (errors.length) {
      setTried((n) => n + 1);
      const ys = errors.map((x) => pos.current[FIELD[x]]).filter((y): y is number => typeof y === 'number');
      if (ys.length) scrollRef.current?.scrollTo({ y: Math.max(0, Math.min(...ys) - 12), animated: true });
      return;
    }
    const r = run((s, n) => publish(s, d, n));
    if (r.ok && r.value) router.replace(`/merchant/published/${r.value.id}?secs=${Math.max(1, Math.round((Date.now() - startedAt.current) / 1000))}`);
  };

  const preview = makeDraftOffer(state, d, now);
  const src = d.photo ? photoSource(d.photo) : null;

  return (
    <Screen
      back
      title={t(walk ? 'm_form_walkin' : 'm_form_reserved')}
      right={tpl ? <Pill tone="dark" icon="clock" label={t('publish_target')} /> : undefined}
      scrollRef={scrollRef}
      footer={<>
        <Button label={walk ? t('m_publish_walkin') : t('m_publish_n', { n: d.qty })} onPress={doPublish} />
        {tried > 0 && errors.length ? (
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', marginTop: space.xs }}>
            <Icon name="alert" size={16} raw={colors.danger} />
            <Txt variant="small" weight="semibold" style={{ color: colors.danger }}>{t('m_fix_errors')}</Txt>
          </View>
        ) : null}
      </>}
    >
      {tpl ? <Callout tone="brand" icon="repeat">{t('m_check_banner')}</Callout> : null}
      {walk ? <Callout tone="brand" icon="alert" title={t('walkin_label')} /> : null}

      {!walk ? (
        <Field title={t('m_bags')} hint={t('m_bags_hint')} error={err('qty')} shake={tried} onLayout={at('qty')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.l }}>
            <StepBtn icon="minus" label="-1" onPress={() => set({ qty: Math.max(1, d.qty - 1) })} />
            <Txt variant="display" style={{ minWidth: 60, textAlign: 'center' }} accessibilityLiveRegion="polite">{d.qty}</Txt>
            <StepBtn icon="plus" label="+1" onPress={() => set({ qty: Math.min(RULES.maxBags, d.qty + 1) })} />
          </View>
        </Field>
      ) : null}

      {walk ? (
        <Field title={`${t('m_photo')} *`} hint={t('m_photo_req')} error={err('photo')} shake={tried} onLayout={at('photo')}>
          {src ? (
            <View style={styles.photo}>
              <Image source={src} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <View style={{ position: 'absolute', left: 10, bottom: 10 }}><Pill tone="light" icon="camera" label={t('photo_today', { t: hhmm(d.photo?.takenAt ?? now) })} /></View>
              <View style={{ position: 'absolute', right: 10, bottom: 10 }}><Button size="small" kind="secondary" block={false} icon="camera" label={t('m_retake')} onPress={() => void takePhoto()} /></View>
            </View>
          ) : <Button icon="camera" label={t('m_take_photo_now')} onPress={() => void takePhoto()} />}
          {cameraUnavailable && !src ? <><Txt variant="small" color="textSecondary">{cameraNote ?? t('demo_photo_s')}</Txt><Button kind="soft" size="small" label={t('demo_photo')} onPress={() => set({ photo: demoPhoto })} /></> : null}
        </Field>
      ) : null}
      {walk ? (
        <Field title={`${t('m_what')} *`} error={err('what')} shake={tried} onLayout={at('what')}>
          <TextInput value={d.what} onChangeText={(what) => set({ what })} placeholder={t('m_what_ph')} placeholderTextColor={colors.textSecondary} maxLength={RULES.descriptionMax} multiline style={[styles.input, { borderColor: err('what') ? colors.danger : colors.border, backgroundColor: colors.surface, color: colors.textPrimary }]} accessibilityLabel={t('m_what')} />
        </Field>
      ) : null}

      <Field title={`${t('m_groups')}${walk ? '' : ' *'}`} hint={walk ? t('m_groups_walkin_hint') : t('m_groups_hint')} error={err('groups')} shake={tried} onLayout={at('groups')}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>
          {CATEGORIES.map((c: CategoryKey) => (
            <Check key={c} label={t(`cat.${c}`)} checked={d.categories.includes(c)} onPress={() => set({ categories: d.categories.includes(c) ? d.categories.filter((x) => x !== c) : [...d.categories, c] })} />
          ))}
        </View>
      </Field>

      <Field title={`${t('m_time')} *`} hint={walk ? t('m_expiry_note') : undefined} error={err('time')} shake={tried} onLayout={at('time')}>
        {(['start', 'end'] as const).map((k) => (
          <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
            <Txt weight="semibold" style={{ width: 80 }}>{t(k === 'start' ? 'm_start' : 'm_end')}</Txt>
            <StepBtn icon="minus" label="-15 min" onPress={() => shift(k, -15)} />
            <Txt variant="heading" style={{ minWidth: 70, textAlign: 'center', color: err('time') && (k === 'end' || errors.includes('end_past')) ? colors.danger : colors.textPrimary }}>{d[k]}</Txt>
            <StepBtn icon="plus" label="+15 min" onPress={() => shift(k, 15)} />
          </View>
        ))}
      </Field>

      {!walk ? (
        <Field title={t('m_photo')} hint={t('m_photo_opt')}>
          {src ? (
            <View style={styles.photo}>
              <Image source={src} style={StyleSheet.absoluteFill} resizeMode="cover" />
              <View style={{ position: 'absolute', left: 10, bottom: 10 }}>{d.photo?.kind === 'example' ? <Pill tone="dark" icon="info" label={t('photo_example')} /> : <Pill tone="light" icon="camera" label={t('photo_today', { t: hhmm(d.photo?.takenAt ?? now) })} />}</View>
              <View style={{ position: 'absolute', right: 10, bottom: 10 }}><Button size="small" kind="secondary" block={false} label={t('m_remove')} onPress={() => set({ photo: null })} /></View>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', gap: space.s }}>
              <View style={{ flex: 1 }}><Button kind="secondary" icon="camera" label={t('m_take_photo')} onPress={() => void takePhoto()} /></View>
              <View style={{ flex: 1 }}><Button kind="secondary" label={t('m_use_example')} onPress={() => set({ photo: { kind: 'example', asset: 'pihlaja' } })} /></View>
            </View>
          )}
          <Txt variant="small" color="textSecondary">{t('m_example_note')}</Txt>
        </Field>
      ) : null}
      {!walk ? (
        <Field title={`${t('m_desc')} · ${t('m_desc_opt')}`}>
          <TextInput value={d.description} onChangeText={(description) => set({ description })} placeholder={t('m_desc_ph')} placeholderTextColor={colors.textSecondary} maxLength={RULES.descriptionMax} multiline style={[styles.input, { borderColor: colors.border, color: colors.textPrimary }]} accessibilityLabel={t('m_desc')} />
        </Field>
      ) : null}

      <Txt variant="heading" style={{ marginTop: space.s }}>{t('m_preview')}</Txt>
      <View pointerEvents="none"><OfferCard offer={preview} store={storeById(state, state.merchantStoreId)!} preview /></View>
    </Screen>
  );
}

function StepBtn({ icon, label, onPress }: { icon: 'plus' | 'minus'; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={{ width: 52, height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  photo: { height: 170, borderRadius: radius.card, overflow: 'hidden' },
  input: { minHeight: 84, borderWidth: 1.5, borderRadius: radius.control, padding: space.m, fontFamily: 'Figtree_400Regular', fontSize: 16, textAlignVertical: 'top' },
});
