// src/pages/profile/components/avatar/avatar.types.ts

export type BodyId =
  | 'brown_round'
  | 'darkgreen_round'
  | 'dress'
  | 'hawaiian'
  | 'light_blue'
  | 'pink'
  | 'purple'
  | 'purple_tri'
  | 'purpledress'
  | 'red'
  | 'red_short'
  | 'redshirt'
  | 'yellow_round';

export type EyesId =
  | 'confused'
  | 'happy'
  | 'love'
  | 'Mad'
  | 'original'
  | 'pretty'
  | 'sleepy'
  | 'surprised'
  | 'worry';

export type MouthId =
  | 'angry'
  | 'laugh'
  | 'original'
  | 'scared'
  | 'sing'
  | 'smile';

export type AvatarConfig = {
  body: BodyId;
  eyes: EyesId;
  mouth: MouthId;
};
