import React, { useState } from 'react';
import { ReportService } from '../services/Report.service';
import { toast } from 'react-toastify';

type ReportType = 'loan' | 'member' | 'payment' | 'capital';

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState({
    loan: false,
    member: false,
    payment: false,
    capital: false,
  });

  const handleGenerateReport = async (reportType: ReportType) => {
    setLoading(prev => ({ ...prev, [reportType]: true }));
    
    try {
      let blob: Blob;
      let fileNamePrefix: string;

      switch (reportType) {
        case 'loan':
          blob = await ReportService.getLoanReportData();
          fileNamePrefix = 'Loan_Report';
          break;
        case 'member':
          blob = await ReportService.getMemberReportData();
          fileNamePrefix = 'Member_Report';
          break;
        case 'payment':
          blob = await ReportService.getPaymentReportData();
          fileNamePrefix = 'Payment_Report';
          break;
        case 'capital':
          blob = await ReportService.getCapitalShareReportData();
          fileNamePrefix = 'Capital_Share_Report';
          break;
        default:
          toast.error('Invalid report type specified.');
          setLoading(prev => ({ ...prev, [reportType]: false }));
          return;
      }

      if (!blob || blob.size === 0) {
        toast.info('No data available to generate the report.');
        return;
      }

      // Create a URL for the blob and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().split('T')[0];
      a.download = `${fileNamePrefix}_${today}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${fileNamePrefix.replace(/_/g, ' ')} generated successfully!`);

    } catch (error) {
      toast.error(`Failed to generate ${reportType} report.`);
    } finally {
      setLoading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Generate Reports</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Loan Report Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-lg font-bold mb-2">Loan Report</h2>
          <p className="text-gray-600 text-sm mb-4 flex-grow">Download a complete report of all member loans, including amounts, terms, and statuses.</p>
          <button onClick={() => handleGenerateReport('loan')} className="nbs-button w-full mt-auto" disabled={loading.loan}>
            {loading.loan ? 'Generating...' : 'Generate Loan Report'}
          </button>
        </div>

        {/* Member Report Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-lg font-bold mb-2">Member Report</h2>
          <p className="text-gray-600 text-sm mb-4 flex-grow">Export a comprehensive list of all cooperative members and their details.</p>
          <button onClick={() => handleGenerateReport('member')} className="nbs-button w-full mt-auto" disabled={loading.member}>
            {loading.member ? 'Generating...' : 'Generate Member Report'}
          </button>
        </div>

        {/* Payment Report Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-lg font-bold mb-2">Payment Report</h2>
          <p className="text-gray-600 text-sm mb-4 flex-grow">Generate a detailed report of all payments made by members for their loans.</p>
          <button onClick={() => handleGenerateReport('payment')} className="nbs-button w-full mt-auto" disabled={loading.payment}>
            {loading.payment ? 'Generating...' : 'Generate Payment Report'}
          </button>
        </div>

        {/* Capital Share Report Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-lg font-bold mb-2">Capital Share Report</h2>
          <p className="text-gray-600 text-sm mb-4 flex-grow">Download a report detailing the capital share contributions of all members.</p>
          <button onClick={() => handleGenerateReport('capital')} className="nbs-button w-full mt-auto" disabled={loading.capital}>
            {loading.capital ? 'Generating...' : 'Generate Capital Report'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReportsPage;