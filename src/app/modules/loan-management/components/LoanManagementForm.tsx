import { Loan } from '../types/LoanManagement.types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectBranches, selectLoanTypes } from '../../master-record/redux/masterRecordSlice';

interface Props {
  member: { employeeId: string } | null;
  loan?: Loan;
  onSubmit: (data: any) => void;
  onClose: () => void;
  loading?: boolean;
}

const LoanManagementForm: React.FC<Props> = ({ member, loan, onSubmit, onClose, loading = false }) => {
  const [form, setForm] = useState({
    employeeId: '',
    branch: '',
    loanType: '',
    loanDate: '',
    loanAmount: '' as number | '',
    maturityDate: '',
    loanTerm: '' as number | '',
    interest: '' as number | '',
    totalPayable: 0,
    monthlyPayment: 0,
    status: 'Not Started',
  });
  
  const branches = useSelector(selectBranches);
  const loanTypes = useSelector(selectLoanTypes);

  useEffect(() => {
    if (loan) {
      setForm({
        employeeId: loan.employeeId,
        branch: loan.branch,
        loanType: loan.loanType,
        loanDate: loan.loanDate.split('T')[0], // Format for date input
        loanAmount: loan.loanAmount,
        maturityDate: loan.maturityDate.split('T')[0], // Format for date input
        loanTerm: loan.loanTerm,
        interest: loan.interest,
        totalPayable: loan.totalPayable,
        monthlyPayment: loan.monthlyPayment,
        status: loan.status,
      });
    } else if (member) {
      // Reset form for new entry and pre-fill employeeId
      setForm({
        employeeId: member.employeeId,
        branch: '',
        loanType: '',
        loanDate: '',
        loanAmount: '',
        maturityDate: '',
        loanTerm: '',
        interest: '',
        totalPayable: 0,
        monthlyPayment: 0,
        status: 'Not Started',
      });
    }
  }, [member, loan]);

  useEffect(() => {
    const principal = parseFloat(form.loanAmount as string);
    const term = parseInt(form.loanTerm as string, 10);
    const annualInterestRate = parseFloat(form.interest as string);

    if (principal > 0 && term > 0 && annualInterestRate > 0) {
      const monthlyInterestRate = annualInterestRate / 100 / 12;
      const monthlyPayment =
        (principal * monthlyInterestRate) /
        (1 - Math.pow(1 + monthlyInterestRate, -term));

      const totalPayable = monthlyPayment * term;

      if (isFinite(monthlyPayment) && isFinite(totalPayable)) {
        setForm(prev => ({
          ...prev,
          monthlyPayment: monthlyPayment,
          totalPayable: totalPayable,
        }));
      }
    } else {
      setForm(prev => ({
        ...prev,
        monthlyPayment: 0,
        totalPayable: 0,
      }));
    }
  }, [form.loanAmount, form.loanTerm, form.interest]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) {
      const { ...payload } = form;
      onSubmit({
        ...payload,
        loanAmount: parseFloat(form.loanAmount as string) || 0,
        loanTerm: parseInt(form.loanTerm as string, 10) || 0,
        interest: parseFloat(form.interest as string) || 0,
      });
    }
  };

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value) {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        setForm(prev => ({
          ...prev,
          [name]: parsedValue.toFixed(2),
        }));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">{loan ? 'Edit Loan' : 'Add New Loan'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
              <input id="employeeId" name="employeeId" value={form.employeeId} className="nbs-input bg-gray-100" disabled />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" id="status" value={form.status || ''} onChange={handleChange} className="nbs-input" disabled>
                <option value="" disabled>Select a status</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select id="branch" name="branch" value={form.branch} onChange={handleChange} className="nbs-input" required>
                <option value="" disabled>Select a branch</option>
                {branches.map(branch => (
                  <option key={branch.branchCode} value={branch.branchName}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
              <select id="loanType" name="loanType" value={form.loanType} onChange={handleChange} className="nbs-input" required>
                <option value="" disabled>Select a loan type</option>
                {loanTypes.map(loanType => (
                  <option key={loanType.loanTypeCode} value={loanType.loanTypeCode}>
                    {loanType.loanTypeName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="loanDate" className="block text-sm font-medium text-gray-700 mb-1">Loan Date</label>
              <input id="loanDate" name="loanDate" type="date" value={form.loanDate} onChange={handleChange} className="nbs-input" required />
            </div>
            <div>
              <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">Loan Amount</label>
              <input id="loanAmount" name="loanAmount" type="text" value={form.loanAmount} onChange={handleChange} onBlur={handleAmountBlur} className="nbs-input" placeholder="0.00" required />
            </div>
            <div>
              <label htmlFor="maturityDate" className="block text-sm font-medium text-gray-700 mb-1">Maturity Date</label>
              <input id="maturityDate" name="maturityDate" type="date" value={form.maturityDate} onChange={handleChange} className="nbs-input" required />
            </div>
            <div>
              <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 mb-1">Loan Term (months)</label>
              <input id="loanTerm" name="loanTerm" type="text" value={form.loanTerm} onChange={handleChange} className="nbs-input" placeholder="0" required />
            </div>
            <div>
              <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-1">Interest (%)</label>
              <input id="interest" name="interest" type="text" value={form.interest} onChange={handleChange} onBlur={handleAmountBlur} className="nbs-input" placeholder="0" required />
            </div>
            <div>
              <label htmlFor="totalPayable" className="block text-sm font-medium text-gray-700 mb-1">Total Payable</label>
              <input id="totalPayable" name="totalPayable" value={form.totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} className="nbs-input bg-gray-100" disabled />
            </div>
            <div>
              <label htmlFor="monthlyPayment" className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment</label>
              <input id="monthlyPayment" name="monthlyPayment" value={form.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} className="nbs-input bg-gray-100" disabled />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-100" disabled={loading}>Cancel</button>
            <button type="submit" className="nbs-button" disabled={loading}>
              {loading ? (loan ? 'Updating...' : 'Creating...') : (loan ? 'Update Loan' : 'Create Loan')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanManagementForm;