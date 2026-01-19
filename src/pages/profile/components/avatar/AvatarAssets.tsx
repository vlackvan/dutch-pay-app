// src/pages/profile/components/avatar/AvatarAssets.tsx
import type { BodyId, EyesId, MouthId } from './avatar.types';

// ============================================================================
// IMAGE PATH ARRAYS
// ============================================================================

export const BODY_IMAGES: readonly BodyId[] = [
  'brown_round',
  'darkgreen_round',
  'dress',
  'hawaiian',
  'light_blue',
  'pink',
  'purple',
  'purple_tri',
  'purpledress',
  'red',
  'red_short',
  'redshirt',
  'yellow_round',
];

export const EYES_IMAGES: readonly EyesId[] = [
  'confused',
  'happy',
  'love',
  'Mad',
  'original',
  'pretty',
  'roundglasses',
  'sleepy',
  'squareglasses',
  'surprised',
  'worry',
];

export const MOUTH_IMAGES: readonly MouthId[] = [
  'angry',
  'laugh',
  'original',
  'scared',
  'sing',
  'smile',
];

// ============================================================================
// IMAGE PATH HELPERS
// ============================================================================

export function getBodyImagePath(bodyId: BodyId): string {
  return `/avatar/body/${bodyId}.png`;
}

export function getEyesImagePath(eyesId: EyesId): string {
  return `/avatar/eyes/${eyesId}.png`;
}

export function getMouthImagePath(mouthId: MouthId): string {
  return `/avatar/mouth/${mouthId}.png`;
}
