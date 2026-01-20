import apiClient from './client';
import type {
  UserResponse,
  UserProfileResponse,
  UpdateUserRequest,
  UpdateAvatarRequest,
  AvatarResponse,
  UserBadgeResponse,
} from '@/types/api.types';

export const usersApi = {
  getMe: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/users/me');
    return response.data;
  },

  getMyProfile: async (): Promise<UserProfileResponse> => {
    const response = await apiClient.get<UserProfileResponse>('/users/me/profile');
    return response.data;
  },

  updateMe: async (data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await apiClient.patch<UserResponse>('/users/me', data);
    return response.data;
  },

  updateAvatar: async (data: UpdateAvatarRequest): Promise<AvatarResponse> => {
    const response = await apiClient.patch<AvatarResponse>('/users/me/avatar', data);
    return response.data;
  },

  getMyBadges: async (): Promise<UserBadgeResponse[]> => {
    const response = await apiClient.get<UserBadgeResponse[]>('/users/me/badges');
    return response.data;
  },

  uploadAvatar: async (
    file: Blob,
    avatarConfig: { body: string; eyes: string; mouth: string },
    fullBodyBlob?: Blob
  ): Promise<UserResponse> => {
    const formData = new FormData();
    formData.append('file', file, 'avatar.png');
    if (fullBodyBlob) {
      formData.append('full_body_file', fullBodyBlob, 'full_avatar.png');
    }
    formData.append('body', avatarConfig.body);
    formData.append('eyes', avatarConfig.eyes);
    formData.append('mouth', avatarConfig.mouth);

    const response = await apiClient.post<UserResponse>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default usersApi;
