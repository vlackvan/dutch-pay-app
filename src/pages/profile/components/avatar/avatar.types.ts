// src/pages/profile/components/avatar/avatar.types.ts

export type BodyId =
  | 'brown_round'
  | 'darkgreen_round'
  | 'purple_tri'
  | 'yellow_round';

export type EyesId =
  | 'original'
  | 'sleepy'
  | 'worry';

export type MouthId =
  | 'original';

export type AvatarConfig = {
  body: BodyId;
  eyes: EyesId;
  mouth: MouthId;
};
