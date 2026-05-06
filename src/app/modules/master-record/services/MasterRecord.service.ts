import { api } from '../../../core/services/api.service';
import { LoanType, Branch } from '../types/MasterRecord.types';

const LOAN_TYPE_BASE = '/loan-types';
const BRANCH_BASE = '/branches';

export const MasterRecordService = {
  // Loan Type Endpoints
  getLoanTypes: async (): Promise<LoanType[]> => {
    const resp = await api.get(LOAN_TYPE_BASE);
    return resp.data;
  },
  createLoanType: async (payload: Omit<LoanType, 'id'>): Promise<LoanType> => {
    const resp = await api.post(LOAN_TYPE_BASE, payload);
    return resp.data;
  },
  updateLoanType: async (id: string, payload: Partial<LoanType>): Promise<LoanType> => {
    const resp = await api.put(`${LOAN_TYPE_BASE}/${id}`, payload);
    return resp.data;
  },
  deleteLoanType: async (id: string): Promise<void> => {
    await api.delete(`${LOAN_TYPE_BASE}/${id}`);
  },

  // Branch Endpoints
  getBranches: async (): Promise<Branch[]> => {
    const resp = await api.get(BRANCH_BASE);
    return resp.data;
  },
  createBranch: async (payload: Omit<Branch, 'id'>): Promise<Branch> => {
    const resp = await api.post(BRANCH_BASE, payload);
    return resp.data;
  },
  updateBranch: async (id: string, payload: Partial<Branch>): Promise<Branch> => {
    const resp = await api.put(`${BRANCH_BASE}/${id}`, payload);
    return resp.data;
  },
  deleteBranch: async (id: string): Promise<void> => {
    await api.delete(`${BRANCH_BASE}/${id}`);
  },

  bulkUploadBranches: async (branches: Partial<Branch>[]): Promise<{ 
    success: Branch[], 
    failed: { member: Partial<Branch>, error: string }[] 
  }> => {
    const resp = await api.post(`${BRANCH_BASE}/bulk`, { branches });
    return resp.data;
  },
};