import React, { useEffect, useState } from 'react';
import { Loan } from '../types/LoanManagement.types';
import { Member } from '../../member-management/types/MemberManagement.types';

interface Props {
  member?: Member | null;
  loan?: Loan | null;
  onSubmit: (data: Omit<Loan, 'loanId' | 'dateCreated' | 'employee' | 'totalPayable' | 'monthlyPayment'>) => void;
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
  });

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
      });
    }
  }, [member, loan]);

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
      onSubmit({
        ...form,
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
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
              <select id="branch" name="branch" value={form.branch} onChange={handleChange} className="nbs-input" required>
                <option value="" disabled>Select a branch</option>
                <option value="Main">Main</option>
                <option value="North">North</option>
                <option value="East">East</option>
                <option value="West">West</option>
              </select>
            </div>
            <div>
              <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
              <select id="loanType" name="loanType" value={form.loanType} onChange={handleChange} className="nbs-input" required>
                <option value="" disabled>Select a loan type</option>
                <option value="Regular">Regular Loan</option>
                <option value="Emergency">Emergency Loan</option>
                <option value="Special">Special Loan</option>
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