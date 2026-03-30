import { api } from '../../../core/services/api.service';

const getLoanReportData = async () => {
  try {
    const response = await api.get('/reports/loans', { responseType: 'blob' });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch loan report data', error);
    throw error;
  }
};

const getMemberReportData = async () => {
  try {
    const response = await api.get('/reports/members', { responseType: 'blob' });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch member report data', error);
    throw error;
  }
};

const getPaymentReportData = async () => {
  try {
    const response = await api.get('/reports/payments', { responseType: 'blob' });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch payment report data', error);
    throw error;
  }
};

const getCapitalShareReportData = async () => {
  try {
    const response = await api.get('/reports/capital', { responseType: 'blob' });

    return response.data;
  } catch (error) {
    console.error('Failed to fetch capital share report data', error);
    throw error;
  }
};

export const ReportService = {
  getLoanReportData,
  getMemberReportData,
  getPaymentReportData,
  getCapitalShareReportData,
};