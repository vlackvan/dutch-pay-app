// Auth Types
export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// User Types
export interface AvatarResponse {
  id: number;
  user_id: number;
  head: string;
  face: string;
  hat: string | null;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  payment_method: string | null;
  payment_account: string | null;
  avatar: AvatarResponse | null;
  created_at: string;
}

export interface BadgeResponse {
  id: number;
  name: string;
  description: string;
  icon: string;
  badge_type: 'monthly' | 'cumulative' | 'special';
}

export interface UserBadgeResponse {
  id: number;
  badge: BadgeResponse;
  group_id: number | null;
  earned_at: string;
}

export interface UserProfileResponse extends UserResponse {
  badges: UserBadgeResponse[];
}

export interface UpdateUserRequest {
  name?: string;
  payment_method?: string;
  payment_account?: string;
}

export interface UpdateAvatarRequest {
  head?: string;
  face?: string;
  hat?: string | null;
}

// Group Types
export interface GroupCreate {
  name: string;
  description?: string;
  icon?: string;
}

export interface GroupMemberResponse {
  id: number;
  user_id: number;
  nickname: string | null;
  is_admin: boolean;
  joined_at: string;
  user_name: string;
  user_avatar: AvatarResponse | null;
}

export interface GroupResponse {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  invite_code: string;
  owner_id: number;
  created_at: string;
}

export interface GroupListResponse extends GroupResponse {
  unsettled_amount: number;
  member_count: number;
}

export interface GroupDetailResponse extends GroupResponse {
  members: GroupMemberResponse[];
}

export interface JoinGroupRequest {
  invite_code: string;
  nickname?: string;
}

export interface InviteCodeResponse {
  invite_code: string;
}

// Settlement Types
export type SplitType = 'EQUAL' | 'AMOUNT' | 'RATIO';

export interface ParticipantInput {
  user_id: number;
  amount?: number;
  ratio?: number;
}

export interface SettlementCreate {
  group_id: number;
  title: string;
  description?: string;
  total_amount: number;
  split_type: SplitType;
  icon?: string;
  participants: ParticipantInput[];
}

export interface ParticipantResponse {
  id: number;
  user_id: number;
  amount_owed: number;
  is_paid: boolean;
  paid_at: string | null;
  user_name: string;
}

export interface SettlementResponse {
  id: number;
  group_id: number;
  payer_id: number;
  title: string;
  description: string | null;
  total_amount: number;
  split_type: SplitType;
  icon: string | null;
  receipt_image: string | null;
  is_settled: boolean;
  created_at: string;
  payer_name: string;
  participants: ParticipantResponse[];
}

export interface SettlementUpdate {
  title?: string;
  description?: string;
  total_amount?: number;
  split_type?: SplitType;
  icon?: string;
  participants?: ParticipantInput[];
}

export interface SettlementResultResponse {
  id: number;
  debtor_id: number;
  creditor_id: number;
  amount: number;
  is_completed: boolean;
  completed_at: string | null;
  debtor_name: string;
  creditor_name: string;
  creditor_payment_method: string | null;
  creditor_payment_account: string | null;
}

export interface GroupSettlementResults {
  group_id: number;
  results: SettlementResultResponse[];
  total_transactions: number;
}

// Game Types
export type GameType = 'PINBALL_ROULETTE' | 'BOMB';

export interface GameResultCreate {
  group_id: number;
  game_type: GameType;
  participants: number[];
  loser_id: number;
  amount: number;
  game_data?: Record<string, unknown>;
}

export interface GameResultResponse {
  id: number;
  group_id: number;
  game_type: GameType;
  participants: number[];
  loser_id: number;
  amount: number;
  settlement_id: number | null;
  game_data: Record<string, unknown> | null;
  created_at: string;
  loser_name: string;
}

// API Error
export interface ApiError {
  detail: string;
}
