import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import { Pill, radius, useTheme } from '@freetogo/ui';

export interface Pin { id: string; x: number; y: number; label: string; walk: boolean; dim?: boolean; selected?: boolean }

/** Simulated map: the map provider is chosen later (licensing, free-tier and privacy review). */
export function MapSim({ pins, height = 420, onPin, radiusPx, home }: { pins: Pin[]; height?: number; onPin?: (id: string) => void; radiusPx?: number; home?: boolean }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const W = 360;
  const H = height;
  return (
    <View style={{ height, borderRadius: radius.card, overflow: 'hidden', backgroundColor: '#ECE8F1' }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" accessibilityLabel={t('sim_map')}>
        <Rect width={W} height={H} fill="#EEF0F2" />
        <Path d="M0 0 H230 C210 40 150 70 90 74 C50 76 20 92 0 110z" fill="#CFE0EE" />
        <Path d={`M150 72 C160 160 170 240 140 ${H}`} stroke="#CFE0EE" strokeWidth={16} fill="none" />
        <Path d={`M250 ${H - 140} h110 v140 h-130 z`} fill="#DCEAD7" />
        {Array.from({ length: 9 }, (_, i) => <Path key={`h${i}`} d={`M0 ${90 + i * 46} L${W} ${70 + i * 46}`} stroke="#FFFFFF" strokeWidth={i % 3 ? 5 : 9} />)}
        {Array.from({ length: 7 }, (_, i) => <Path key={`v${i}`} d={`M${30 + i * 56} 60 L${50 + i * 56} ${H}`} stroke="#FFFFFF" strokeWidth={i % 3 ? 5 : 9} />)}
        {radiusPx ? <Circle cx={180} cy={H / 2} r={radiusPx} fill={colors.primarySoft} fillOpacity={0.55} stroke={colors.active} strokeWidth={1.5} strokeDasharray="5 5" /> : null}
        {home ? <G x={168} y={H / 2 - 12}><Rect width={24} height={24} rx={8} fill={colors.textPrimary} /><Path d="M6 12l6-5 6 5v6h-4v-4h-4v4H6z" fill="#fff" /></G> : null}
        {pins.map((p) => (
          <G key={p.id} x={p.x * W} y={p.y * H} scale={p.selected ? 1.18 : 1} onPress={() => onPin?.(p.id)}>
            <Path d="M0 0 C-14 -16 -18 -24 -18 -32 a18 18 0 0 1 36 0 c0 8 -4 16 -18 32z" fill={p.walk ? colors.surface : p.dim ? '#B8C0C7' : colors.active} stroke={p.walk ? colors.badgeText : p.selected ? colors.textPrimary : '#fff'} strokeWidth={p.selected ? 3 : 2.5} strokeDasharray={p.walk ? '4 3' : undefined} />
            <SvgText x={0} y={-27} fontSize={12} fontWeight="700" textAnchor="middle" fill={p.walk ? colors.badgeText : colors.onActive}>{p.label}</SvgText>
          </G>
        ))}
      </Svg>
      <View style={{ position: 'absolute', left: 10, top: 10 }}><Pill tone="light" icon="map" label={t('sim_map')} /></View>
    </View>
  );
}
