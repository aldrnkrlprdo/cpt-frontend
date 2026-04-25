
import { api } from '../../../core/services/api.service';
import { Member } from '../../member-management/types/MemberManagement.types';
import { PaymentFormData } from '../types/PaymentManagement.types';
import { Payment } from '../types/PaymentManagement.types';

const createPayment = async (payment: PaymentFormData) => {
  try {
    const response = await api.post('/payments', payment);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

const updatePayment = async (paymentId: string, payment: PaymentFormData) => {
  try {
    const response = await api.post(`/payments/${paymentId}`, payment);
    return response.data;
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

const deletePayment = async (paymentId: string) => {
  try {
    const response = await api.delete(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};

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

const getPaymentsByEmployeeId = async (employeeId: string): Promise<Payment[]> => {
  try {
    const response = await api.get(`/payments/employee/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching payments by employee ID:', error);
    throw error;
  }
};

const getLoansForMember = async (employeeId: string) => {
  try {
    const response = await api.get(`/loans/employee/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching loans for member:', error);
    throw error;
  }
};

export const PaymentManagementService = {
  getMembers,
  getLoansForMember,
  getPaymentsByEmployeeId,
  createPayment,
  updatePayment,
  deletePayment,
};
