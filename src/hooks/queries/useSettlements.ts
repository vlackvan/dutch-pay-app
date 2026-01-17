import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settlementsApi } from '@/lib/api';
import type { SettlementCreate, SettlementUpdate } from '@/types/api.types';
import { groupKeys } from './useGroups';

export const settlementKeys = {
  all: ['settlements'] as const,
  detail: (id: number) => [...settlementKeys.all, 'detail', id] as const,
};

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

export function useUpdateSettlement(settlementId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SettlementUpdate) => settlementsApi.update(settlementId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: settlementKeys.detail(settlementId) });
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
