import apiClient from './client';
import type {
  SignUpRequest,
  LoginRequest,
  TokenResponse,
  UserResponse,
  GoogleCompleteProfileRequest,
  GoogleLoginRequest,
} from '@/types/api.types';

export const authApi = {
  signup: async (data: SignUpRequest): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/login', data);
    return response.data;
  },

  googleLogin: async (data: GoogleLoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/google', data);
    return response.data;
  },

  completeGoogleProfile: async (data: GoogleCompleteProfileRequest): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>('/auth/google/complete-profile', data);
    return response.data;
  },
};

export default authApi;
