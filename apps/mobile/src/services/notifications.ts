import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Permission } from '@freetogo/core';

/**
 * Local notifications only: no push server exists yet (zero-cost policy). On a device the alert
 * appears as a real system notification; tapping it opens the offer. Web shows the in-app banner only.
 */
const native = Platform.OS === 'ios' || Platform.OS === 'android';

if (native) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
  });
}

export async function getPermission(): Promise<Permission> {
  if (!native) return 'unknown';
  const p = await Notifications.getPermissionsAsync();
  return p.granted ? 'granted' : p.canAskAgain ? 'unknown' : 'denied';
}

export async function requestPermission(): Promise<Permission> {
  if (!native) return 'granted';
  const p = await Notifications.requestPermissionsAsync();
  return p.granted ? 'granted' : 'denied';
}

export async function notify(title: string, body: string, data: Record<string, string>): Promise<boolean> {
  if (!native) return false;
  await Notifications.scheduleNotificationAsync({ content: { title, body, data }, trigger: null });
  return true;
}

/** Calls back with the notification payload when the user taps one. */
export function onNotificationTap(cb: (data: Record<string, unknown>) => void): () => void {
  if (!native) return () => undefined;
  const sub = Notifications.addNotificationResponseReceivedListener((r) => cb(r.notification.request.content.data ?? {}));
  return () => sub.remove();
}
