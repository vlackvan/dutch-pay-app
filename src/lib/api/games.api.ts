import apiClient from './client';
import type { GameResultCreate, GameResultResponse } from '@/types/api.types';

export const gamesApi = {
  create: async (data: GameResultCreate): Promise<GameResultResponse> => {
    const response = await apiClient.post<GameResultResponse>('/games', data);
    return response.data;
  },

  getByGroup: async (groupId: number): Promise<GameResultResponse[]> => {
    const response = await apiClient.get<GameResultResponse[]>(`/games/group/${groupId}`);
    return response.data;
  },

  get: async (gameId: number): Promise<GameResultResponse> => {
    const response = await apiClient.get<GameResultResponse>(`/games/${gameId}`);
    return response.data;
  },
};

export default gamesApi;
