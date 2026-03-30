
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Member } from '../../member-management/types/MemberManagement.types';
import { PaymentManagementService } from '../services/PaymentManagement.service';
import { useSelector } from 'react-redux';
import { selectLoanTypes } from '../../master-record/redux/masterRecordSlice';
import { Loan } from '../../loan-management/types/LoanManagement.types';
import { Payment } from '../types/PaymentManagement.types';

export interface PaymentFormData {
  employeeId: string;
  paymentDate: string;
  amountPaid: number;
  loanId: string;
  paymentId?: string;
  paymentType: string;
}

interface Props {
  member: Member;
  onSubmit: (data: PaymentFormData) => void;
  onClose: () => void;
  loading: boolean;
  paymentToEdit?: Payment | null;
}

const MemberPaymentForm: React.FC<Props> = ({ member, onSubmit, onClose, loading, paymentToEdit }) => {
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [loanId, setLoanId] = useState<string>('');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loansLoading, setLoansLoading] = useState<boolean>(true);
  const [loanType, setLoanType] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');

  const loanTypes = useSelector(selectLoanTypes);

  useEffect(() => {
    if (paymentToEdit) {
      setAmountPaid(paymentToEdit.amountPaid.toFixed(2));
      setPaymentDate(new Date(paymentToEdit.paymentDate).toISOString().slice(0, 16));
      setLoanId(paymentToEdit.loanId);
      setLoanType(paymentToEdit.paymentType);
      setPaymentId(paymentToEdit.paymentId);
    }
  }, [paymentToEdit]);

  useEffect(() => {
    const fetchLoans = async () => {
      if (!member.employeeId) return;
      setLoansLoading(true);
      try {
        // Assuming a service method to get loans by employee ID
        const memberLoans = await PaymentManagementService.getLoansForMember(member.employeeId);

        const processedLoans = memberLoans.map((loan: any) => ({
          ...loan,
          loanType: loanTypes.find(lt => lt.loanTypeCode === loan.loanType)?.loanTypeName || loan.loanType,
        }));
        if (loanId === '') {
          setLoans(processedLoans);
        }
        if (memberLoans.length > 0 && loanId !== '') {
          setLoanId(memberLoans[0].loanId); // Default to the first loan
        }
      } catch (error) {
        toast.error('Failed to fetch member loans.');
        console.error(error);
      } finally {
        setLoansLoading(false);
      }
    };
    fetchLoans();
  }, [member.employeeId, loanTypes, loanId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountPaid) {
      toast.error('Please fill in all required fields.');
      return;
    }
    onSubmit({
      employeeId: member.employeeId,
      paymentDate,
      amountPaid: parseFloat(amountPaid),
      loanId: loanId ?? '',
      paymentId: paymentId ?? '',
      paymentType: loanType ?? '',
    });
  };

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value) {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        setAmountPaid(parsedValue.toFixed(2));
      }
    }
  };

  const handleLoanChange = (e: string) => {
    const loanType = getLoanTypeName(e);
    if (loanType) setLoanType(loanType);
    setLoanId(e);
  };

  const getLoanTypeName = (loanId: string) => {
    const loan = loans.find(l => l.loanId === loanId);
    return loan?.loanType || '';
  };

  console.log(loanId)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4">Member Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <input
              id="employeeId"
              type="text"
              value={member.employeeId}
              className="nbs-input bg-gray-100"
              disabled
            />
          </div>

          <div>
            <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
            <input
              id="paymentDate"
              type="datetime-local"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="nbs-input"
              required
            />
          </div>

          <div>
            <label htmlFor="loanId" className="block text-sm font-medium text-gray-700 mb-1">Loan</label>
            <select
              id="loanId"
              value={loanId}
              onChange={(e) => handleLoanChange(e.target.value)}
              className="nbs-input"
              disabled={loansLoading || loans.length === 0}
            >
              <option value="" disabled>Select a loan</option>
              {loansLoading ? (
                <option>Loading loans...</option>
              ) : loans.length === 0 ? (
                <option>No active loans found</option>
              ) : (
                loans.map((loan) => (
                  <option key={loan.loanId} value={loan.loanId}>
                    {loan.loanType} - (ID: {loan.loanId})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
            <input
              id="amountPaid"
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              onBlur={handleAmountBlur}
              className="nbs-input"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="nbs-button" disabled={loading || loansLoading || loans.length === 0}>
              {loading ? 'Submitting...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberPaymentForm;
