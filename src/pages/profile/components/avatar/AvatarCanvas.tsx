// src/pages/profile/components/avatar/AvatarCanvas.tsx
import type { AvatarConfig } from './avatar.types';
import styles from './AvatarCanvas.module.css';
import { BODY_COMPONENTS, EYES_COMPONENTS, MOUTH_COMPONENTS } from './AvatarAssets';

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

  // Get the appropriate components
  const BodyComponent = BODY_COMPONENTS[config.body];
  const EyesComponent = EYES_COMPONENTS[config.eyes];
  const MouthComponent = MOUTH_COMPONENTS[config.mouth];

  return (
    <div className={styles.stage} style={{ width: size, height: size }}>
      {/* body */}
      <div className={styles.body}>
        <BodyComponent size={BASE} />
      </div>

      {/* eyes */}
      <div
        className={styles.eyes}
        style={{
          left: EYES.x * scale,
          top: EYES.y * scale,
          width: EYES.w * scale,
          height: EYES.h * scale,
        }}
      >
        <EyesComponent size={EYES.w} />
      </div>

      {/* mouth */}
      <div
        className={styles.mouth}
        style={{
          left: MOUTH.x * scale,
          top: MOUTH.y * scale,
          width: MOUTH.w * scale,
          height: MOUTH.h * scale,
        }}
      >
        <MouthComponent size={MOUTH.w} />
      </div>
    </div>
  );
}
