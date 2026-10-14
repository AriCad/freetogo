import React, { useMemo } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import QRCode from 'qrcode';
import { useTheme } from '@freetogo/ui';

/** Real, scannable QR of the pickup code (merchant scans it with the camera). */
export function PickupQR({ code, size = 200 }: { code: string; size?: number }) {
  const { colors } = useTheme();
  const { n, d } = useMemo(() => {
    const qr = QRCode.create(code, { errorCorrectionLevel: 'M' });
    const count = qr.modules.size;
    let path = '';
    for (let y = 0; y < count; y++) for (let x = 0; x < count; x++) if (qr.modules.get(x, y)) path += `M${x} ${y}h1v1h-1z`;
    return { n: count, d: path };
  }, [code]);
  return (
    <Svg width={size} height={size} viewBox={`-2 -2 ${n + 4} ${n + 4}`} accessibilityLabel={code}>
      <Rect x={-2} y={-2} width={n + 4} height={n + 4} fill="#FFFFFF" />
      <Path d={d} fill={colors.textPrimary} />
    </Svg>
  );
}
