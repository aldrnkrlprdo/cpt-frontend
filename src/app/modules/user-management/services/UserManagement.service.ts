import { api } from '../../../core/services/api.service';
import { User } from '../types/UserManagement.types';

export const UserManagementService = {
    getUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    createUser: async (userData: Omit<User, 'id' | 'dateCreated'>) => {
        const response = await api.post('/users', userData);
        return response.data;
    },

    updateUser: async (id: string, userData: Partial<User>) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data;
    },

    deleteUser: async (id: string) => {
        const response = await api.delete(`/users/${id}`);
        return response.data;
    }
};