// Auth Types
export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
  payment_method: string;   // 추가: 'kakaopay' | 'toss' | 'bank'
  payment_account: string;  // 추가: 계좌번호 또는 빈 문자열
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  code: string;
  mode: 'login' | 'signup';
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  is_new_user?: boolean;
  requires_profile_completion?: boolean;
}

export interface GoogleCompleteProfileRequest {
  name: string;
  payment_method: string;
  payment_account?: string;
}

// User Types
export interface AvatarResponse {
  id: number;
  user_id: number;
  body: string;
  eyes: string;
  mouth: string;
}

export interface UserResponse {
  id: number;
  email: string;
  name: string;
  payment_method: string | null;
  payment_account: string | null;
  profile_photo_url: string | null;
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
  body?: string;
  eyes?: string;
  mouth?: string;
}

// Group Types
export interface GroupCreate {
  name: string;
  description?: string;
  icon?: string;
  participants: string[];
}

export interface GroupParticipantResponse {
  id: number;
  name: string;
  user_id: number | null;
  is_admin: boolean;
  joined_at: string;
  user_name: string | null;
  user_avatar: AvatarResponse | null;
  user_profile_photo_url: string | null;
  user_full_body_photo_url: string | null;
  is_claimed: boolean;
  badges?: UserBadgeResponse[];
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
  participants: GroupParticipantResponse[];
}

export interface JoinGroupRequest {
  invite_code: string;
  participant_id?: number;
  participant_name?: string;
}

export interface InviteCodeResponse {
  invite_code: string;
  group_id?: number;
  group_name?: string;
}

export interface InviteGroupResponse {
  invite_code: string;
  group_id: number;
  group_name: string;
  participants: GroupParticipantResponse[];
}

// Settlement Types
export type SplitType = 'equal' | 'amount' | 'ratio';

export interface ParticipantInput {
  participant_id: number;
  amount?: number;
  ratio?: number;
}

export interface SettlementCreate {
  group_id: number;
  payer_participant_id: number;
  title: string;
  description?: string;
  total_amount: number;
  split_type: SplitType;
  icon?: string;
  participants: ParticipantInput[];
  date?: string; // YYYY-MM-DD format
}

export interface ParticipantResponse {
  id: number;
  participant_id: number;
  amount_owed: number;
  is_paid: boolean;
  paid_at: string | null;
  participant_name: string | null;
  user_id: number | null;
  user_name: string | null;
}

export interface SettlementResponse {
  id: number;
  group_id: number;
  payer_participant_id: number;
  title: string;
  description: string | null;
  total_amount: number;
  split_type: SplitType;
  icon: string | null;
  receipt_image: string | null;
  is_settled: boolean;
  created_at: string;
  payer_name: string | null;
  payer_user_id: number | null;
  participants: ParticipantResponse[];
}

export interface SettlementUpdate {
  payer_participant_id?: number;
  title?: string;
  description?: string;
  total_amount?: number;
  split_type?: SplitType;
  icon?: string;
  participants?: ParticipantInput[];
  date?: string; // YYYY-MM-DD format
}

export interface SettlementResultResponse {
  id: number;
  debtor_participant_id: number;
  creditor_participant_id: number;
  amount: number;
  is_completed: boolean;
  completed_at: string | null;
  debtor_name: string;
  creditor_name: string;
  debtor_user_id: number | null;
  creditor_user_id: number | null;
  creditor_payment_method: string | null;
  creditor_payment_account: string | null;
}

export interface GroupSettlementResults {
  group_id: number;
  results: SettlementResultResponse[];
  total_transactions: number;
}

// Game Types
export type GameType = 'PINBALL_ROULETTE' | 'BOMB' | 'PSYCHOLOGICAL';

export interface GameResultCreate {
  group_id: number;
  game_type: GameType;
  participants: number[];
  loser_participant_id: number;
  amount: number;
  game_data?: Record<string, unknown>;
}

export interface GameResultResponse {
  id: number;
  group_id: number;
  game_type: GameType;
  participants: number[];
  loser_participant_id: number;
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
