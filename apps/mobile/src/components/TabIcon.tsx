import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, Txt, useTheme, type IconName } from '@freetogo/ui';

export function tabOptions(title: string, icon: IconName, activeIcon: IconName = icon, badge?: number) {
  return {
    title,
    tabBarAccessibilityLabel: title,
    tabBarIcon: ({ focused }: { focused: boolean }) => <TabGlyph name={focused ? activeIcon : icon} focused={focused} badge={badge} />,
  };
}

function TabGlyph({ name, focused, badge }: { name: IconName; focused: boolean; badge?: number }) {
  const { colors } = useTheme();
  return (
    <View>
      <Icon name={name} size={24} raw={focused ? colors.active : colors.textSecondary} />
      {badge ? (
        <View style={{ position: 'absolute', top: -4, right: -10, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 5, backgroundColor: colors.active, alignItems: 'center', justifyContent: 'center' }}>
          <Txt variant="tiny" weight="bold" style={{ color: colors.onActive, fontSize: 11, lineHeight: 14 }}>{badge}</Txt>
        </View>
      ) : null}
    </View>
  );
}

export function useTabBarStyle() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return {
    headerShown: false,
    tabBarActiveTintColor: colors.active,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 62 + insets.bottom, paddingTop: 6, paddingBottom: insets.bottom + 6 },
    tabBarLabelStyle: { fontFamily: 'Figtree_600SemiBold', fontSize: 12 },
  };
}
