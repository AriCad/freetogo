import React from 'react';
import { View } from 'react-native';
import { Txt, radius, space, useTheme } from '@freetogo/ui';

export function Tags({ items }: { items: string[] }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>
      {items.map((x) => <View key={x} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }}><Txt variant="small" weight="semibold">{x}</Txt></View>)}
    </View>
  );
}

export function KV({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.m }}>
      <Txt variant="small" color="textSecondary">{k}</Txt>
      <Txt variant="small" weight="bold" style={{ flexShrink: 1, textAlign: 'right' }}>{v}</Txt>
    </View>
  );
}

