// src/pages/profile/components/avatar/AvatarCanvas.tsx
import type { AvatarConfig } from './avatar.types';
import styles from './AvatarCanvas.module.css';

const BASE = 512;

// ✅ Figma 기준 좌표 (너가 잡은 값)
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
      {/* body */}
      <img
        className={styles.body}
        src={`/avatar/body/${config.body}.png`}
        alt=""
        draggable={false}
      />

      {/* eyes */}
      <img
        className={styles.eyes}
        src={`/avatar/eyes/${config.eyes}.png`}
        alt=""
        draggable={false}
        style={{
          left: EYES.x * scale,
          top: EYES.y * scale,
          width: EYES.w * scale,
          height: EYES.h * scale,
        }}
      />

      {/* mouth */}
      <img
        className={styles.mouth}
        src={`/avatar/mouth/${config.mouth}.png`}
        alt=""
        draggable={false}
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
