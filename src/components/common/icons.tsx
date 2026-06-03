import type { CSSProperties } from 'react';
import type { TokenColor } from '../../game/types';

interface IconProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/** A gem token icon, recolored per color (gold uses the coin shape). */
export function GemIcon({ color, size = 24 }: { color: TokenColor; size?: number }) {
  const shape = color === 'gold' ? 'coins' : 'diamond';
  return (
    <span
      className={`icon ${shape} gem gem-${color}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={color}
    />
  );
}

export function StarIcon({ size = 18, className = '', style }: IconProps) {
  return <span className={`icon star ${className}`} style={{ width: size, height: size, ...style }} />;
}

export function CrownIcon({ size = 24, className = '', style }: IconProps) {
  return <span className={`icon crown ${className}`} style={{ width: size, height: size, ...style }} />;
}
