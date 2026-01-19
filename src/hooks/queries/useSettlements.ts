import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settlementsApi } from '@/lib/api';
import type { SettlementCreate, SettlementUpdate } from '@/types/api.types';
import { groupKeys } from './useGroups';
import { userKeys } from './useUser';

export const settlementKeys = {
  all: ['settlements'] as const,
  detail: (id: number) => [...settlementKeys.all, 'detail', id] as const,
};

export function useSettlement(settlementId: number) {
  return useQuery({
    queryKey: settlementKeys.detail(settlementId),
    queryFn: () => settlementsApi.get(settlementId),
    enabled: !!settlementId,
  });
}

export function useCreateSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SettlementCreate) => settlementsApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.settlements(variables.group_id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.results(variables.group_id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}

export function useCreateSettlementWithReceipt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => settlementsApi.createWithReceipt(formData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.settlements(data.group_id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.results(data.group_id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.list() });
    },
  });
}

export function useUpdateSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ settlementId, data }: { settlementId: number; data: SettlementUpdate }) =>
      settlementsApi.update(settlementId, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.detail(variables.settlementId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.settlements(data.group_id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.results(data.group_id) });
    },
  });
}

export function useMarkPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (detailId: number) => settlementsApi.markPaid(detailId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.invalidateQueries({ queryKey: settlementKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
      queryClient.invalidateQueries({ queryKey: userKeys.badges() });
    },
  });
}

export function useDeleteSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settlementId: number) => settlementsApi.delete(settlementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.invalidateQueries({ queryKey: settlementKeys.all });
    },
  });
}
