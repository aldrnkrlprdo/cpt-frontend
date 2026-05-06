
import { api } from '../../../core/services/api.service';
import { Member } from '../../member-management/types/MemberManagement.types';
import { ProgressUploadResult, PaymentFormData } from '../types/PaymentManagement.types';
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


export const bulkUploadPayments = async (
  payments: any[],
  onProgress?: (progress: { total: number; processed: number; success: number; failed: number }) => void
): Promise<ProgressUploadResult> => {
  const BATCH_SIZE = 100; // Process 100 payments at a time to avoid timeout
  
  const aggregatedResults: ProgressUploadResult = {
    total: payments.length,
    processed: 0,
    success: 0,
    failed: 0,
    errors: []
  };

  const totalBatches = Math.ceil(payments.length / BATCH_SIZE);

  for (let i = 0; i < payments.length; i += BATCH_SIZE) {
    const batch = payments.slice(i, i + BATCH_SIZE);
    const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

    try {
      const response = await api.post('/payments/bulk-upload', { payments: batch });
      
      // Aggregate results
      aggregatedResults.processed += response.data.processed || batch.length;
      aggregatedResults.success += response.data.success || 0;
      aggregatedResults.failed += response.data.failed || 0;
      aggregatedResults.errors.push(...(response.data.errors || []));

      // Report progress if callback provided
      if (onProgress) {
        onProgress({
          total: aggregatedResults.total,
          processed: aggregatedResults.processed,
          success: aggregatedResults.success,
          failed: aggregatedResults.failed
        });
      }

      console.log(`Batch ${currentBatch}/${totalBatches} completed`);
    } catch (error: any) {
      console.error(`Batch ${currentBatch} failed:`, error);
      
      // Mark entire batch as failed
      aggregatedResults.processed += batch.length;
      aggregatedResults.failed += batch.length;
      aggregatedResults.errors.push({
        batch: currentBatch,
        message: error.message || 'Batch upload failed',
        payments: batch.map(p => p.employeeId)
      });

      // Report progress even on error
      if (onProgress) {
        onProgress({
          total: aggregatedResults.total,
          processed: aggregatedResults.processed,
          success: aggregatedResults.success,
          failed: aggregatedResults.failed
        });
      }
    }
  }

  return aggregatedResults;
};

export const PaymentManagementService = {
  getMembers,
  getLoansForMember,
  getPaymentsByEmployeeId,
  createPayment,
  updatePayment,
  deletePayment,
  bulkUploadPayments
};