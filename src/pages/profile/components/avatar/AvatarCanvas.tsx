// src/pages/profile/components/avatar/AvatarCanvas.tsx
import type { AvatarConfig } from './avatar.types';
import styles from './AvatarCanvas.module.css';
import { getBodyImagePath, getEyesImagePath, getMouthImagePath } from './AvatarAssets';

const BASE = 512;

// Figma reference coordinates for positioning
const EYES = { x: 238, y: 58, w: 137, h: 137 };
const MOUTH = { x: 256, y: 116, w: 108, h: 108 };

export function AvatarCanvas({
  config,
  size = 260,
}: {
  config: AvatarConfig;
  size?: number;
}) {
  const scale = size / BASE;

  return (
    <div className={styles.stage} style={{ width: size, height: size }}>
      {/* Body layer (bottom) - full size */}
      <img
        src={getBodyImagePath(config.body)}
        alt="avatar body"
        className={styles.body}
      />

      {/* Eyes layer (middle) - positioned */}
      <img
        src={getEyesImagePath(config.eyes)}
        alt="avatar eyes"
        className={styles.eyes}
        style={{
          left: EYES.x * scale,
          top: EYES.y * scale,
          width: EYES.w * scale,
          height: EYES.h * scale,
        }}
      />

      {/* Mouth layer (top) - positioned */}
      <img
        src={getMouthImagePath(config.mouth)}
        alt="avatar mouth"
        className={styles.mouth}
        style={{
          left: MOUTH.x * scale,
          top: MOUTH.y * scale,
          width: MOUTH.w * scale,
          height: MOUTH.h * scale,
        }}
      />
    </div>
  );
}
