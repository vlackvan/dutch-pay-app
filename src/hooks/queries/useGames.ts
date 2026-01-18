import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gamesApi } from '@/lib/api';
import type { GameResultCreate } from '@/types/api.types';
import { groupKeys } from './useGroups';

export const gameKeys = {
  all: ['games'] as const,
  byGroup: (groupId: number) => [...gameKeys.all, 'group', groupId] as const,
  detail: (id: number) => [...gameKeys.all, 'detail', id] as const,
};

export function useGamesByGroup(groupId: number) {
  return useQuery({
    queryKey: gameKeys.byGroup(groupId),
    queryFn: () => gamesApi.getByGroup(groupId),
    enabled: !!groupId,
  });
}

export function useCreateGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GameResultCreate) => gamesApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.byGroup(variables.group_id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.settlements(variables.group_id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.results(variables.group_id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}
