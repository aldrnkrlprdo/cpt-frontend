import { api } from '../../../core/services/api.service';
import { User } from '../types/UserManagement.types';

const BASE = '/users';

export const UserManagementService = {
  getUsers: async (): Promise<User[]> => {
    const resp = await api.get(BASE);
    return resp.data;
  },

  createUser: async (payload: Omit<User, 'id' | 'dateCreated'>): Promise<User> => {
    const resp = await api.post(BASE, payload);
    return resp.data;
  },

  updateUser: async (id: string, payload: Partial<User>): Promise<User> => {
    const resp = await api.put(`${BASE}/${id}`, payload);
    return resp.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  }
};