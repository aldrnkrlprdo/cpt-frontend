"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementService = void 0;
const api_service_1 = require("../../../core/services/api.service");
exports.UserManagementService = {
    getUsers: async () => {
        const response = await api_service_1.api.get('/users');
        return response.data;
    },
    createUser: async (userData) => {
        const response = await api_service_1.api.post('/users', userData);
        return response.data;
    },
    updateUser: async (id, userData) => {
        const response = await api_service_1.api.put(`/users/${id}`, userData);
        return response.data;
    },
    deleteUser: async (id) => {
        const response = await api_service_1.api.delete(`/users/${id}`);
        return response.data;
    }
};
