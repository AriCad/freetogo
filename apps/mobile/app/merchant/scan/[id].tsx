import React, { useRef, useState } from 'react';
import { Platform, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { confirmPickup, offerById } from '@freetogo/core';
import { Block, Button, Callout, Txt, radius, space, useTheme } from '@freetogo/ui';
import { useStore } from '../../../src/state/AppStore';
import { Screen } from '../../../src/components/Screen';

/** Merchant verifies a pickup by scanning the collector's QR (or typing the code). */
export default function Scan() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { state, run, showToast } = useStore();
  const [perm, requestPerm] = useCameraPermissions();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const lastScan = useRef<string>('');
  const o = offerById(state, id ?? '');
  const waiting = state.reservations.filter((r) => r.offerId === id && r.status === 'confirmed');

  const check = (value: string) => {
    const r = run((s) => confirmPickup(s, id ?? '', value));
    if (r.ok) {
      setMsg({ ok: true, text: t('m_scan_ok', { c: r.value?.code ?? value }) });
      showToast(t('m_scan_ok', { c: r.value?.code ?? value }));
      setCode('');
    } else {
      setMsg({ ok: false, text: r.error === 'already_collected' ? t('scan_already') : r.error === 'not_valid' ? t('scan_not_valid') : t('scan_invalid') });
    }
  };

  if (!o) return <Screen back><Txt>{t('not_found')}</Txt></Screen>;
  return (
    <Screen back title={t('m_scan_t')}>
      {Platform.OS !== 'web' ? (
        perm?.granted ? (
          <View style={{ height: 260, borderRadius: radius.card, overflow: 'hidden' }}>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={({ data }) => {
                if (!data || data === lastScan.current) return;
                lastScan.current = data;
                check(data);
              }}
            />
          </View>
        ) : (
          <Callout tone="brand" icon="camera" title={t('scan_camera')}>
            <View style={{ marginTop: space.s }}><Button size="small" block={false} label={t('m_take_photo')} onPress={() => void requestPerm()} /></View>
          </Callout>
        )
      ) : <Callout icon="info">{t('m_scan_s')}</Callout>}
      {msg ? <Callout tone={msg.ok ? 'ok' : 'danger'} icon={msg.ok ? 'check' : 'alert'}>{msg.text}</Callout> : null}
      <Txt weight="bold" style={{ marginTop: space.s }}>{t('scan_manual')}</Txt>
      <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="FTG-1234" placeholderTextColor={colors.textSecondary} accessibilityLabel={t('scan_manual')}
        style={{ minHeight: 52, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.control, paddingHorizontal: space.m, fontFamily: 'Figtree_700Bold', fontSize: 20, letterSpacing: 2, color: colors.textPrimary }} />
      <Button label={t('scan_check')} disabled={!code.trim()} onPress={() => check(code)} />
      <Block style={{ gap: space.s, marginTop: space.s }}>
        <Txt weight="bold">{t('st_confirmed')} ({waiting.length})</Txt>
        {waiting.length ? waiting.map((r) => <Txt key={r.id} variant="small">{r.code}{r.userId === state.userId ? ' · Aino K.' : ''}</Txt>) : <Txt variant="small" color="textSecondary">{t('m_scan_none')}</Txt>}
      </Block>
    </Screen>
  );
}
