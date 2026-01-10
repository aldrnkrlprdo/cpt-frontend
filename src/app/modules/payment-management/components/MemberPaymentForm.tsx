
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Member } from '../../member-management/types/MemberManagement.types';
import { PaymentManagementService } from '../services/PaymentManagement.service';

// A placeholder for the Loan type, adjust as needed
interface Loan {
  id: string;
  loanType: string;
  amount: number;
}

export interface PaymentFormData {
  employeeId: string;
  paymentDate: string;
  amountPaid: number;
  loanId: string;
}

interface Props {
  member: Member;
  onSubmit: (data: PaymentFormData) => void;
  onClose: () => void;
  loading: boolean;
}

const MemberPaymentForm: React.FC<Props> = ({ member, onSubmit, onClose, loading }) => {
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [loanId, setLoanId] = useState<string>('');
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loansLoading, setLoansLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLoans = async () => {
      if (!member.employeeId) return;
      setLoansLoading(true);
      try {
        // Assuming a service method to get loans by employee ID
        const memberLoans = await PaymentManagementService.getLoansForMember(member.employeeId);
        setLoans(memberLoans);
        if (memberLoans.length > 0) {
          setLoanId(memberLoans[0].id); // Default to the first loan
        }
      } catch (error) {
        toast.error('Failed to fetch member loans.');
        console.error(error);
      } finally {
        setLoansLoading(false);
      }
    };

    fetchLoans();
  }, [member.employeeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountPaid || !loanId) {
      toast.error('Please fill in all required fields.');
      return;
    }
    onSubmit({
      employeeId: member.employeeId,
      paymentDate,
      amountPaid: parseFloat(amountPaid),
      loanId,
    });
  };

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
              onChange={(e) => setLoanId(e.target.value)}
              className="nbs-input"
              disabled={loansLoading || loans.length === 0}
              required
            >
              {loansLoading ? (
                <option>Loading loans...</option>
              ) : loans.length === 0 ? (
                <option>No active loans found</option>
              ) : (
                loans.map((loan) => (
                  <option key={loan.id} value={loan.id}>
                    {loan.loanType} - (ID: {loan.id})
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
