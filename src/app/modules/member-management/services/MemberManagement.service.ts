import { api } from "../../../core/services/api.service";
import { Member } from "../types/MemberManagement.types";

const getMembers = async (query: string = ''): Promise<Member[]> => {
  const endpoint = `/members${query ? `?${query}` : ''}`;
  const { data } = await api.get(endpoint);
  return data;
};

const getMemberById = async (id: string): Promise<Member> => {
  const { data } = await api.get(`/members/${id}`);
  return data;
};

const createMember = async (payload: Partial<Member>): Promise<Member> => {
  const resp = await api.post('/members', payload);
  return resp.data;
};

const updateMember = async (employeeId: string, payload: Partial<Member>): Promise<Member> => {
  const resp = await api.put(`/members/${employeeId}`, payload);
  return resp.data;
};

const deleteMember = async (employeeId: string): Promise<void> => {
  await api.delete(`/members/${employeeId}`);
};

const bulkUploadMembers = async (members: Partial<Member>[]): Promise<{ 
  success: Member[], 
  failed: { member: Partial<Member>, error: string }[] 
}> => {
  const resp = await api.post('/members/bulk', { members });
  return resp.data;
};

export const MemberManagementService = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  bulkUploadMembers,
};
