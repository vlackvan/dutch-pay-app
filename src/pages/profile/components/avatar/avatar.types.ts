// src/pages/profile/components/avatar/avatar.types.ts

export type BodyId =
  | 'round'
  | 'square'
  | 'bean'
  | 'triangle'
  | 'hexagon';

export type EyesId =
  | 'round'
  | 'sleepy'
  | 'wide'
  | 'pixel'
  | 'shades';

export type MouthId =
  | 'smile'
  | 'frown'
  | 'open'
  | 'smirk'
  | 'teeth';

export type AvatarConfig = {
  body: BodyId;
  eyes: EyesId;
  mouth: MouthId;
};
