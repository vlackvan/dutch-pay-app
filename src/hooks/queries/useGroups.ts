import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupsApi } from '@/lib/api';
import type { GroupCreate, JoinGroupRequest } from '@/types/api.types';

export const groupKeys = {
  all: ['groups'] as const,
  list: () => [...groupKeys.all, 'list'] as const,
  detail: (id: number) => [...groupKeys.all, 'detail', id] as const,
  members: (id: number) => [...groupKeys.all, 'members', id] as const,
  settlements: (id: number) => [...groupKeys.all, 'settlements', id] as const,
  results: (id: number) => [...groupKeys.all, 'results', id] as const,
};

export function useMyGroups() {
  return useQuery({
    queryKey: groupKeys.list(),
    queryFn: groupsApi.getMyGroups,
  });
}

export function useGroup(groupId: number) {
  return useQuery({
    queryKey: groupKeys.detail(groupId),
    queryFn: () => groupsApi.getGroup(groupId),
    enabled: !!groupId,
  });
}

export function useGroupMembers(groupId: number) {
  return useQuery({
    queryKey: groupKeys.members(groupId),
    queryFn: () => groupsApi.getMembers(groupId),
    enabled: !!groupId,
  });
}

export function useGroupSettlements(groupId: number) {
  return useQuery({
    queryKey: groupKeys.settlements(groupId),
    queryFn: () => groupsApi.getSettlements(groupId),
    enabled: !!groupId,
  });
}

export function useSettlementResults(groupId: number) {
  return useQuery({
    queryKey: groupKeys.results(groupId),
    queryFn: () => groupsApi.getSettlementResults(groupId),
    enabled: !!groupId,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GroupCreate) => groupsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JoinGroupRequest) => groupsApi.join(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}

export function useGetInviteCode(groupId: number) {
  return useMutation({
    mutationFn: () => groupsApi.getInviteCode(groupId),
  });
}

export function useGetInviteGroup() {
  return useMutation({
    mutationFn: (inviteCode: string) => groupsApi.getInviteGroup(inviteCode),
  });
}
