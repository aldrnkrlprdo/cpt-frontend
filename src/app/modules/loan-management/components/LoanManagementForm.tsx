import React, { useEffect, useState } from 'react';
import { Member } from '../../member-management/types/MemberManagement.types';
import { Loan } from '../types/LoanManagement.types';
import { selectLoanTypes } from '../../master-record/redux/masterRecordSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

interface Props {
  member: Member;
  loan?: Loan;
  onSubmit: (data: Omit<Loan, 'loanId' | 'dateCreated' | 'employee'>) => void;
  onClose: () => void;
  loading?: boolean;
  isViewer?: boolean;
}

const LoanManagementForm: React.FC<Props> = ({ member, loan, onSubmit, onClose, loading = false, isViewer = false }) => {
  const [loanType, setLoanType] = useState<string>('');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [loanTerm, setLoanTerm] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [loanDate, setLoanDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [maturityDate, setMaturityDate] = useState<string>('');
  const [status, setStatus] = useState<string>('Not Started');
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalPayable, setTotalPayable] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [enableStatus, setEnableStatus] = useState<boolean>(true);

  const loanTypes = useSelector(selectLoanTypes);

  useEffect(() => {
    if (loan) {
      const loanTypeCode = loanTypes.find(lt => lt.loanTypeName === loan.loanType)?.loanTypeCode || loan.loanType;
      setLoanType(loanTypeCode);
      setLoanAmount(loan.loanAmount.toString());
      setLoanTerm(loan.loanTerm.toString());
      setInterestRate(loan.interest.toString());
      setLoanDate(new Date(loan.loanDate).toISOString().slice(0, 10));
      setMaturityDate(new Date(loan.maturityDate).toISOString().slice(0, 10));
      setStatus(loan.status);
      setEnableStatus(false);
    }
  }, [loan, loanTypes]);

  // Calculate maturity date based on loan date and term
  useEffect(() => {
    if (loanDate && loanTerm) {
      const startDate = new Date(loanDate);
      const term = parseInt(loanTerm);
      if (!isNaN(term) && term > 0) {
        const maturity = new Date(startDate);
        maturity.setMonth(maturity.getMonth() + term);
        setMaturityDate(maturity.toISOString().slice(0, 10));
      }
    }
  }, [loanDate, loanTerm]);

  useEffect(() => {
    if (loanAmount && loanTerm && interestRate) {
      const principal = parseFloat(loanAmount);
      const rate = parseFloat(interestRate) / 100; // monthly rate
      const term = parseInt(loanTerm);

      if (principal > 0 && rate >= 0 && term > 0) {
        const interest = principal * rate * term;
        const total = principal + interest;
        const monthly = total / term;

        setTotalInterest(interest);
        setTotalPayable(total);
        setMonthlyPayment(monthly);
      }
    }
  }, [loanAmount, loanTerm, interestRate]);

  const handleLoanTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    setLoanType(selectedCode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!loanType || !loanAmount || !loanTerm || !interestRate) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (parseFloat(loanAmount) <= 0) {
      toast.error('Loan amount must be greater than zero.');
      return;
    }

    if (parseInt(loanTerm) <= 0) {
      toast.error('Loan term must be greater than zero.');
      return;
    }

    if (parseFloat(interestRate) < 0) {
      toast.error('Interest rate cannot be negative.');
      return;
    }

    const loanData = {
      employeeId: member.employeeId,
      branch: member.branch,
      loanType: loanType,
      loanAmount: parseFloat(loanAmount),
      loanTerm: parseInt(loanTerm),
      interest: parseFloat(interestRate),
      monthlyPayment: monthlyPayment,
      remainingBalance: loan ? loan.remainingBalance : totalPayable,
      totalPayable: totalPayable,
      loanDate: new Date(loanDate).toISOString(),
      maturityDate: new Date(maturityDate).toISOString(),
      status: status,
    };

    onSubmit(loanData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isViewer ? 'View Loan' : loan ? 'Edit Loan' : 'Add Loan'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900" disabled={loading}>
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {isViewer && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You are viewing this loan in read-only mode.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Member Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3 text-gray-800">Member Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Employee ID:</span>
                <span className="ml-2 font-medium">{member.employeeId}</span>
              </div>
              <div>
                <span className="text-gray-600">Name:</span>
                <span className="ml-2 font-medium">
                  {member.firstName} {member.middleName || ''} {member.lastName}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Branch:</span>
                <span className="ml-2 font-medium">{member.branch}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-medium">{member.email}</span>
              </div>
            </div>
          </div>

          {/* Loan Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Type <span className="text-red-500">*</span>
            </label>
            <select
              value={loanType}
              onChange={handleLoanTypeChange}
              className="nbs-input w-full"
              required
              disabled={isViewer}
            >
              <option value="">Select a loan type</option>
              {loanTypes.map((lt) => (
                <option key={lt.loanTypeCode} value={lt.loanTypeCode}>
                  {lt.loanTypeName}
                </option>
              ))}
            </select>
          </div>

          {/* Loan Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="nbs-input w-full pl-8"
                placeholder="0.00"
                required
                disabled={isViewer}
              />
            </div>
          </div>

          {/* Loan Term and Interest Rate */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Term (months) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="nbs-input w-full"
                placeholder="12"
                required
                disabled={isViewer}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="nbs-input w-full"
                placeholder="5.00"
                required
                disabled={isViewer}
              />
            </div>
          </div>

          {/* Loan Date and Maturity Date */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
                className="nbs-input w-full"
                required
                disabled={isViewer}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maturity Date
              </label>
              <input
                type="date"
                value={maturityDate}
                className="nbs-input w-full bg-gray-100"
                disabled
              />
            </div>
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="nbs-input w-full"
              required
              disabled={isViewer || enableStatus}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {/* Calculated Fields */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-3 text-gray-800">Loan Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Interest:</span>
                <span className="ml-2 font-medium">
                  ₱{totalInterest.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Total Payable:</span>
                <span className="ml-2 font-medium">
                  ₱{totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Monthly Payment:</span>
                <span className="ml-2 font-medium">
                  ₱{monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {loan && (
                <div>
                  <span className="text-gray-600">Remaining Balance:</span>
                  <span className="ml-2 font-medium">
                    ₱{loan.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              {isViewer ? 'Close' : 'Cancel'}
            </button>
            {!isViewer && (
              <button
                type="submit"
                className="nbs-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : loan ? 'Update Loan' : 'Add Loan'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanManagementForm;