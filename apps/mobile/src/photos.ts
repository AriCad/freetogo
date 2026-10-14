import type { ImageSourcePropType } from 'react-native';
import type { Photo, PhotoAsset } from '@freetogo/core';

export const PHOTOS: Record<PhotoAsset, ImageSourcePropType> = {
  pihlaja: require('../assets/photos/pihlaja.jpg'),
  marjapuoti: require('../assets/photos/marjapuoti.jpg'),
  aurinko: require('../assets/photos/aurinko.jpg'),
  omenat: require('../assets/photos/omenat.jpg'),
  lehti: require('../assets/photos/lehti.jpg'),
  juures: require('../assets/photos/juures.jpg'),
  sieni: require('../assets/photos/sieni.jpg'),
  sitrus: require('../assets/photos/sitrus.jpg'),
};

export function photoSource(p: Photo | null | undefined, fallback?: PhotoAsset): ImageSourcePropType | null {
  if (p?.uri) return { uri: p.uri };
  if (p?.asset) return PHOTOS[p.asset];
  return fallback ? PHOTOS[fallback] : null;
}
