import * as Location from 'expo-location';
import { nearestCity, type CityId } from '@freetogo/core';

/** Foreground-only, one-off position. No background tracking. */
export async function locateOnce(): Promise<{ status: 'granted'; city: CityId; km: number } | { status: 'denied' } | { status: 'error' }> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return { status: 'denied' };
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
    const n = nearestCity(pos.coords.latitude, pos.coords.longitude);
    return { status: 'granted', city: n.city, km: n.km };
  } catch {
    return { status: 'error' };
  }
}
