import { api } from '../../../core/services/api.service';
import { Member } from '../types/MemberManagement.types';

const BASE = '/members'; // adjust to '/users' if backend expects that route

export const MemberManagementService = {
  getMembers: async (): Promise<Member[]> => {
    const resp = await api.get(BASE);
    return resp.data;
  },

  createMember: async (payload: Omit<Member, 'dateCreated'>): Promise<Member> => {
    const resp = await api.post(BASE, payload);
    return resp.data;
  },

  updateMember: async (id: string, payload: Partial<Member>): Promise<Member> => {
    const resp = await api.put(`${BASE}/${id}`, payload);
    return resp.data;
  },

  deleteMember: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  }
};