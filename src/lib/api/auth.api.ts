import apiClient from './client';
import type { SignUpRequest, LoginRequest, TokenResponse, UserResponse } from '@/types/api.types';

export const authApi = {
  signup: async (data: SignUpRequest): Promise<UserResponse> => {
    const response = await apiClient.post<UserResponse>('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/login', data);
    return response.data;
  },

  kakaoLogin: async (code: string): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>('/auth/kakao', { code });
    return response.data;
  },
};

export default authApi;
