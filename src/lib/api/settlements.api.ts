import apiClient from './client';
import type {
  SettlementCreate,
  SettlementResponse,
  SettlementUpdate,
  ParticipantResponse,
} from '@/types/api.types';

export const settlementsApi = {
  create: async (data: SettlementCreate): Promise<SettlementResponse> => {
    const response = await apiClient.post<SettlementResponse>('/settlements', data);
    return response.data;
  },

  createWithReceipt: async (formData: FormData): Promise<SettlementResponse> => {
    const response = await apiClient.post<SettlementResponse>('/settlements/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  get: async (settlementId: number): Promise<SettlementResponse> => {
    const response = await apiClient.get<SettlementResponse>(`/settlements/${settlementId}`);
    return response.data;
  },

  update: async (settlementId: number, data: SettlementUpdate): Promise<SettlementResponse> => {
    const response = await apiClient.put<SettlementResponse>(`/settlements/${settlementId}`, data);
    return response.data;
  },

  markPaid: async (detailId: number): Promise<ParticipantResponse> => {
    const response = await apiClient.patch<ParticipantResponse>(`/settlements/pay/${detailId}`);
    return response.data;
  },

  delete: async (settlementId: number): Promise<void> => {
    await apiClient.delete(`/settlements/${settlementId}`);
  },
};

export default settlementsApi;
