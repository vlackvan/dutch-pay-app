import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import type { UpdateUserRequest, UpdateAvatarRequest } from '@/types/api.types';

export const userKeys = {
  all: ['user'] as const,
  me: () => [...userKeys.all, 'me'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  badges: () => [...userKeys.all, 'badges'] as const,
};

export function useMe() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: usersApi.getMe,
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: usersApi.getMyProfile,
  });
}

export function useMyBadges() {
  return useQuery({
    queryKey: userKeys.badges(),
    queryFn: usersApi.getMyBadges,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => usersApi.updateMe(data),
    onSuccess: (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAvatarRequest) => usersApi.updateAvatar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}
