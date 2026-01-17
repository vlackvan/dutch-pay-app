import apiClient from './client';
import type {
  GroupCreate,
  GroupResponse,
  GroupListResponse,
  GroupDetailResponse,
  GroupMemberResponse,
  JoinGroupRequest,
  InviteCodeResponse,
  SettlementResponse,
  GroupSettlementResults,
} from '@/types/api.types';

export const groupsApi = {
  create: async (data: GroupCreate): Promise<GroupResponse> => {
    const response = await apiClient.post<GroupResponse>('/groups', data);
    return response.data;
  },

  getMyGroups: async (): Promise<GroupListResponse[]> => {
    const response = await apiClient.get<GroupListResponse[]>('/groups');
    return response.data;
  },

  getGroup: async (groupId: number): Promise<GroupDetailResponse> => {
    const response = await apiClient.get<GroupDetailResponse>(`/groups/${groupId}`);
    return response.data;
  },

  getMembers: async (groupId: number): Promise<GroupMemberResponse[]> => {
    const response = await apiClient.get<GroupMemberResponse[]>(`/groups/${groupId}/members`);
    return response.data;
  },

  getInviteCode: async (groupId: number): Promise<InviteCodeResponse> => {
    const response = await apiClient.post<InviteCodeResponse>(`/groups/${groupId}/invite`);
    return response.data;
  },

  join: async (data: JoinGroupRequest): Promise<GroupResponse> => {
    const response = await apiClient.post<GroupResponse>('/groups/join', data);
    return response.data;
  },

  getSettlements: async (groupId: number): Promise<SettlementResponse[]> => {
    const response = await apiClient.get<SettlementResponse[]>(`/groups/${groupId}/settlements`);
    return response.data;
  },

  getSettlementResults: async (groupId: number): Promise<GroupSettlementResults> => {
    const response = await apiClient.get<GroupSettlementResults>(`/groups/${groupId}/results`);
    return response.data;
  },
};

export default groupsApi;
