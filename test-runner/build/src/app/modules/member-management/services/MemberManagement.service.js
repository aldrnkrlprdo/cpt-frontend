"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberManagementService = void 0;
const api_service_1 = require("../../../core/services/api.service");
const BASE = '/members'; // adjust to '/users' if backend expects that route
exports.MemberManagementService = {
    getMembers: async () => {
        const resp = await api_service_1.api.get(BASE);
        return resp.data;
    },
    createMember: async (payload) => {
        const resp = await api_service_1.api.post(BASE, payload);
        return resp.data;
    },
    updateMember: async (id, payload) => {
        const resp = await api_service_1.api.put(`${BASE}/${id}`, payload);
        return resp.data;
    },
    deleteMember: async (id) => {
        await api_service_1.api.delete(`${BASE}/${id}`);
    }
};
