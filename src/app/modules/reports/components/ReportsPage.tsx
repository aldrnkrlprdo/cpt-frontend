import React, { useState } from 'react';
import { ReportService } from '../services/Report.service';
import { toast } from 'react-toastify';
import ScheduleOfAccountsModal from './ScheduleOfAccountsModal';

type ReportType = 'loan' | 'member' | 'payment' | 'capital' | 'scheduleOfAccounts';

const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState({
    loan: false,
    member: false,
    payment: false,
    capital: false,
    scheduleOfAccounts: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerateReport = async (reportType: ReportType, options?: { startYear?: number; endYear?: number; format?: 'excel' | 'pdf' }) => {
    setLoading(prev => ({ ...prev, [reportType]: true }));

    try {
      let blob: Blob;
      let fileNamePrefix: string;
      let downloadFileName: string;
      const today = new Date().toISOString().split('T')[0];

      switch (reportType) {
        case 'loan':
          blob = await ReportService.getLoanReportData();
          fileNamePrefix = 'Loan_Report';
          downloadFileName = `${fileNamePrefix}_${today}.xlsx`;
          break;
        case 'member':
          blob = await ReportService.getMemberReportData();
          fileNamePrefix = 'Member_Report';
          downloadFileName = `${fileNamePrefix}_${today}.xlsx`;
          break;
        case 'payment':
          blob = await ReportService.getPaymentReportData();
          fileNamePrefix = 'Payment_Report';
          downloadFileName = `${fileNamePrefix}_${today}.xlsx`;
          break;
        case 'capital':
          blob = await ReportService.getCapitalShareReportData();
          fileNamePrefix = 'Capital_Share_Report';
          downloadFileName = `${fileNamePrefix}_${today}.xlsx`;
          break;
        case 'scheduleOfAccounts':
          if (!options?.startYear || !options?.endYear || !options?.format) {
            toast.error('Start year, end year, and format are required for this report.');
            return;
          }
          blob = await ReportService.generateScheduleOfAccounts(options.startYear, options.endYear, options.format);
          fileNamePrefix = 'Schedule_of_Accounts';
          downloadFileName = `${fileNamePrefix}_${options.startYear}-${options.endYear}_${today}.${options.format === 'pdf' ? 'pdf' : 'xlsx'}`;
          setIsModalOpen(false);
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
      a.download = downloadFileName;
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

        {/* Schedule of Accounts Report Card */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-lg font-bold mb-2">Schedule of Accounts</h2>
          <p className="text-gray-600 text-sm mb-4 flex-grow">
            Generate a schedule of accounts report for a specified year range.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="nbs-button w-full mt-auto"
            disabled={loading.scheduleOfAccounts}
          >
            {loading.scheduleOfAccounts ? 'Generating...' : 'Generate Schedule'}
          </button>
        </div>
      </div>
      <ScheduleOfAccountsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(startYear, endYear, format) => handleGenerateReport('scheduleOfAccounts', { startYear, endYear, format })}
        loading={loading.scheduleOfAccounts}
      />
    </div>
  );
};

export default ReportsPage;