
import { api } from '../../../core/services/api.service';
import { Loan, BulkLoanUploadData, ProgressUploadResult, BulkUploadError } from '../types/LoanManagement.types';

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

  createLoan: async (payload: Omit<Loan, 'loanId' | 'dateCreated' | 'employee'>): Promise<Loan> => {
    const resp = await api.post(BASE, payload);
    return resp.data;
  },

  updateLoan: async (id: string, payload: Partial<Loan>): Promise<Loan> => {
    const resp = await api.put(`${BASE}/${id}`, payload);
    return resp.data;
  },

  deleteLoan: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },

  bulkUploadLoans: async (
    loans: BulkLoanUploadData[],
    onProgress?: (progress: {
      total: number, processed: number, successCount: number, failedCount: number, failed: Array<{
        loan: BulkLoanUploadData;
        error: BulkUploadError;
      }>,
      message: string
    }) => void
  ): Promise<ProgressUploadResult> => {
    const BATCH_SIZE = 100;
    const aggregatedResults: ProgressUploadResult = {
      total: loans.length,
      processed: 0,
      successCount: 0,
      failedCount: 0,
      failed: [],
      message: "Batch upload started",
    };

    for (let i = 0; i < loans.length; i += BATCH_SIZE) {
      const batch = loans.slice(i, i + BATCH_SIZE);
      const currentBatch = Math.floor(i / BATCH_SIZE) + 1;

      try {
        const response = await api.post(`${BASE}/bulk-upload`, { loans: batch });
        const result: ProgressUploadResult = response.data;

        aggregatedResults.processed += result.processed || batch.length;
        aggregatedResults.successCount += result.successCount || 0;
        aggregatedResults.failedCount += result.failedCount || 0;
        aggregatedResults.failed.push(...(result.failed || []));

        if (onProgress) {
          onProgress({
            total: aggregatedResults.total,
            processed: aggregatedResults.processed,
            successCount: aggregatedResults.successCount,
            failedCount: aggregatedResults.failedCount,
            failed: aggregatedResults.failed || [],
            message: "Batch upload completed"
          });
        }
      } catch (err: any) {
        console.error(`Batch ${currentBatch} failed:`, err);
        aggregatedResults.processed += batch.length;
        aggregatedResults.failedCount += batch.length;

         const batchErrors: Array<{
          loan: BulkLoanUploadData;
          error: BulkUploadError;
        }> = batch.map((loan, index) => ({
          loan: loan,
          error: {
            row: (i + index + 2), // Assuming row number starts from 2 in the file
            employeeId: loan.employeeId,
            loanId: loan.loanId || '-',
            message: err.response?.data?.message || err.message || `Batch ${currentBatch} failed.`
          }
        }));
        aggregatedResults.failed.push(...batchErrors);

        if (onProgress) {
          onProgress({
            total: aggregatedResults.total,
            processed: aggregatedResults.processed,
            successCount: aggregatedResults.successCount,
            failedCount: aggregatedResults.failedCount,
            failed: aggregatedResults.failed,
            message: 'Batch upload failed'
          });
        }
      }
    }
    return aggregatedResults;
  },

  downloadTemplate: async (): Promise<Blob> => {
    const resp = await api.get(`${BASE}/template`, { responseType: 'blob' });
    return resp.data;
  }
};
