
import { api } from '../../../core/services/api.service';
import { Loan } from '../types/LoanManagement.types';

const BASE = '/loans';

export const LoanManagementService = {
  getLoans: async (): Promise<Loan[]> => {
    const resp = await api.get(BASE);
    return resp.data;
  },

  getLoansByEmployeeId: async (id: string): Promise<Loan[]> => {
    const resp = await api.get(`${BASE}/employee/${id}`);
    return resp.data;
  },

  createLoan: async (payload: Omit<Loan, 'loanId' | 'dateCreated' | 'employee' >): Promise<Loan> => {
    const resp = await api.post(BASE, payload);
    return resp.data;
  },

  updateLoan: async (id: string, payload: Partial<Loan>): Promise<Loan> => {
    const resp = await api.put(`${BASE}/${id}`, payload);
    return resp.data;
  },

  deleteLoan: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  }
};
