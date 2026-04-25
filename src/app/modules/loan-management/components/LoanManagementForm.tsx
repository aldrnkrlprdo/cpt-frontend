import { useSelector } from 'react-redux';
import { selectBranches, selectLoanTypes } from '../../master-record/redux/masterRecordSlice';
import { Loan } from '../types/LoanManagement.types';
import React, { useEffect, useState } from 'react';
import AnimatedInput from '../../../shared/components/AnimatedInput';
import AnimatedSelect from '../../../shared/components/AnimatedSelect';

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
    remainingBalance: 0,
  });
  const [enableStatus, setEnableStatus] = useState<boolean>(true);

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
        remainingBalance: loan.remainingBalance,
      });
      setEnableStatus(false);
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
        remainingBalance: 0,
      });
      setEnableStatus(true);
    }
  }, [member, loan]);

  useEffect(() => {
    const principal = parseFloat(form.loanAmount as string);
    const term = parseInt(form.loanTerm as string, 10);
    const monthlyInterestRate = parseFloat(form.interest as string) / 100;

    if (principal > 0 && term > 0 && monthlyInterestRate > 0) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <AnimatedInput
              id="employeeId"
              name="employeeId"
              label="Employee ID"
              value={form.employeeId}
              className="bg-gray-100"
              disabled
            />
            <AnimatedSelect
              name="status"
              id="status"
              label="Status"
              value={form.status || ''}
              onChange={handleChange}
              disabled={enableStatus}
            >
              <option value="" disabled></option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </AnimatedSelect>
            <AnimatedSelect
              id="branch"
              name="branch"
              label="Branch"
              value={form.branch}
              onChange={handleChange}
              required
            >
              <option value="" disabled></option>
              {branches.map(branch => (
                <option key={branch.branchCode} value={branch.branchName}>
                  {branch.branchName}
                </option>
              ))}
            </AnimatedSelect>
            <AnimatedSelect
              id="loanType"
              name="loanType"
              label="Loan Type"
              value={form.loanType}
              onChange={handleChange}
              required
            >
              <option value="" disabled></option>
              {loanTypes.map(loanType => (
                <option key={loanType.loanTypeCode} value={loanType.loanTypeCode}>
                  {loanType.loanTypeName}
                </option>
              ))}
            </AnimatedSelect>
            <AnimatedInput
              id="loanDate"
              name="loanDate"
              label="Loan Date"
              type="date"
              value={form.loanDate}
              onChange={handleChange}
              required
            />
            <AnimatedInput
              id="loanAmount"
              name="loanAmount"
              label="Loan Amount"
              type="text"
              value={form.loanAmount}
              onChange={handleChange}
              onBlur={handleAmountBlur}
              placeholder="0.00"
              required
            />
            <AnimatedInput
              id="maturityDate"
              name="maturityDate"
              label="Maturity Date"
              type="date"
              value={form.maturityDate}
              onChange={handleChange}
              required
            />
            <AnimatedInput
              id="loanTerm"
              name="loanTerm"
              label="Loan Term (months)"
              type="text"
              value={form.loanTerm}
              onChange={handleChange}
              placeholder="0"
              required
            />
            <AnimatedInput
              id="interest"
              name="interest"
              label="Monthly Interest (%)"
              type="text"
              value={form.interest}
              onChange={handleChange}
              onBlur={handleAmountBlur}
              placeholder="0"
              required
            />
            <AnimatedInput
              id="totalPayable"
              name="totalPayable"
              label="Total Payable"
              value={form.totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              className="bg-gray-100"
              disabled
            />
            <AnimatedInput
              id="monthlyPayment"
              name="monthlyPayment"
              label="Monthly Payment"
              value={form.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              className="bg-gray-100"
              disabled
            />
            {
              loan && <AnimatedInput
                id="remainingBalance"
                name="remainingBalance"
                label="Remaining Balance"
                value={form.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                className="bg-gray-100"
                disabled
              />
            }
          </div>
          <p className="text-sm text-red-500 italic">
            Total Payable and Monthly Payment are auto-computed.
          </p>
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={onClose} className="nbs-button-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="nbs-button" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanManagementForm;