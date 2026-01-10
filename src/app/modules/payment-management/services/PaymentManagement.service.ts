
import { api } from '../../../core/services/api.service';
import { Member } from '../../member-management/types/MemberManagement.types';

// Mock loan data for demonstration
const mockLoans = [
    { id: 'LN001', employeeId: 'EMP001', loanType: 'Personal Loan', amount: 5000 },
    { id: 'LN002', employeeId: 'EMP002', loanType: 'Housing Loan', amount: 150000 },
    { id: 'LN003', employeeId: 'EMP001', loanType: 'Emergency Loan', amount: 1000 },
];

const getMembers = async (by?: string, text?: string): Promise<Member[]> => {
    try {
      let url = `/members`;
      if (by && text) {
        url += `?${by}=${text}`;
      }
      const response = await api.get(url);
      // The backend might return _id, so we map it to id for consistency on the frontend.
      return response.data.map((member: any) => ({ ...member, id: member._id || member.id }));
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  };

const getLoansForMember = async (employeeId: string) => {
    console.log(`Fetching loans for employee ID: ${employeeId}`);
    // In a real app, you would make an API call:
    // const response = await api.get(`/loans?employeeId=${employeeId}`);
    // return response.data;

    // For now, return mock data filtered by employeeId
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return mockLoans.filter(loan => loan.employeeId === employeeId);
};

export const PaymentManagementService = {
    getMembers,
    getLoansForMember,
};
