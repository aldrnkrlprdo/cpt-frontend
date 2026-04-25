import React, { useEffect, useState } from 'react';
import { Loan } from '../../loan-management/types/LoanManagement.types';
import { selectLoanTypes } from '../../master-record/redux/masterRecordSlice';
import { useSelector } from 'react-redux';
import { PaymentManagementService } from '../services/PaymentManagement.service';
import { toast } from 'react-toastify';
import { Member } from '../../member-management/types/MemberManagement.types';
import { Payment } from '../types/PaymentManagement.types';
import { PaymentFormData } from '../types/PaymentManagement.types';

interface Props {
  member: Member;
  onSubmit: (payment: PaymentFormData) => void;
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
  const [paymentCategory, setPaymentCategory] = useState<'Loan' | 'Contribution'>('Contribution');
  const [isFullPayment, setIsFullPayment] = useState<boolean>(false);
  const [interestRebate, setInterestRebate] = useState<number>(0);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const loanTypes = useSelector(selectLoanTypes);

  useEffect(() => {
    if (paymentToEdit) {
      setAmountPaid(paymentToEdit.amountPaid.toFixed(2));
      setPaymentDate(new Date(paymentToEdit.paymentDate).toISOString().slice(0, 16));
      setLoanId(paymentToEdit.loanId);
      setLoanType(paymentToEdit.paymentType);
      setPaymentId(paymentToEdit.paymentId);
      
      // Determine payment category based on payment type
      if (paymentToEdit.paymentType === 'Contribution') {
        setPaymentCategory('Contribution');
      } else {
        setPaymentCategory('Loan');
        // Set selected loan if loans are already loaded
        if (loans.length > 0 && paymentToEdit.loanId) {
          const loan = loans.find(l => l.loanId === paymentToEdit.loanId);
          if (loan) {
            setSelectedLoan(loan);
          }
        }
        // Set full payment and interest rebate flags
        if (paymentToEdit.isFullPayment) {
          setIsFullPayment(true);
          setInterestRebate(paymentToEdit.interestRebate || 0);
        }
      }
    }
  }, [paymentToEdit, loans]);

  useEffect(() => {
    const fetchLoans = async () => {
      if (!member.employeeId || paymentCategory !== 'Loan') {
        setLoansLoading(false);
        return;
      }
      setLoansLoading(true);
      try {
        const memberLoans = await PaymentManagementService.getLoansForMember(member.employeeId);

        const processedLoans = memberLoans.map((loan: any) => ({
          ...loan,
          loanType: loanTypes.find(lt => lt.loanTypeCode === loan.loanType)?.loanTypeName || loan.loanType,
        }));
        
        setLoans(processedLoans);
        
        // Set selected loan based on paymentToEdit or first loan
        if (paymentToEdit && paymentToEdit.loanId) {
          const loan = processedLoans.find((l: Loan) => l.loanId === paymentToEdit.loanId);
          if (loan) {
            setSelectedLoan(loan);
          }
        } else if (processedLoans.length > 0 && loanId === '') {
          setLoanId(processedLoans[0].loanId);
          setSelectedLoan(processedLoans[0]);
        }
      } catch (error) {
        toast.error('Failed to fetch member loans.');
        console.error(error);
      } finally {
        setLoansLoading(false);
      }
    };
    fetchLoans();
  }, [member.employeeId, loanTypes, paymentCategory, loanId, paymentToEdit]);

  useEffect(() => {
    const calculateFullPayment = () => {
      if (!selectedLoan) return;
  
      const remainingBalance = selectedLoan.remainingBalance || 0;
      const monthlyPayment = selectedLoan.monthlyPayment || 0;
      const loanTerm = selectedLoan.loanTerm || 0;
      const totalPayable = selectedLoan.totalPayable || 0;
      
      // Calculate how many payments have been made
      const paymentsMade = Math.round((totalPayable - remainingBalance) / monthlyPayment);
      const paymentsRemaining = loanTerm - paymentsMade;
  
      // Calculate interest rebate
      const principal = selectedLoan.loanAmount;
      const totalInterest = totalPayable - principal;
      const interestPerPayment = totalInterest / loanTerm;
      const rebate = interestPerPayment * paymentsRemaining;
  
      setInterestRebate(rebate);
      setAmountPaid((remainingBalance - rebate).toFixed(2));
    };
  
    if (isFullPayment && selectedLoan && selectedLoan.status !== "Paid") {
      calculateFullPayment();
    }
  }, [isFullPayment, selectedLoan]);

  const handleFullPaymentChange = (checked: boolean) => {
    setIsFullPayment(checked);
    if (!checked) {
      setAmountPaid('');
      setInterestRebate(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amountPaid) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (paymentCategory === 'Loan' && !loanId) {
      toast.error('Please select a loan.');
      return;
    }

    const paymentData: PaymentFormData = {
      employeeId: member.employeeId,
      paymentDate,
      amountPaid: parseFloat(amountPaid),
      loanId: paymentCategory === 'Loan' ? loanId : '',
      paymentId: paymentId ?? '',
      paymentType: paymentCategory === 'Contribution' ? 'Contribution' : (loanType ?? ''),
      isFullPayment: paymentCategory === 'Loan' ? isFullPayment : undefined,
      interestRebate: paymentCategory === 'Loan' && isFullPayment ? interestRebate : undefined,
    };

    onSubmit(paymentData);
  };

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value && !isFullPayment) {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        setAmountPaid(parsedValue.toFixed(2));
      }
    }
  };

  const handleLoanChange = (e: string) => {
    const loan = loans.find(l => l.loanId === e);
    if (loan) {
      setSelectedLoan(loan);
      setLoanType(loan.loanType);
    }
    setLoanId(e);
    setIsFullPayment(false);
    setInterestRebate(0);
    setAmountPaid('');
  };

  const handlePaymentCategoryChange = (category: 'Loan' | 'Contribution') => {
    setPaymentCategory(category);
    setLoanId('');
    setLoanType('');
    setAmountPaid('');
    setIsFullPayment(false);
    setInterestRebate(0);
    setSelectedLoan(null);
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

          {/* Payment Category Radio Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Category</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentCategory"
                  value="Contribution"
                  checked={paymentCategory === 'Contribution'}
                  onChange={() => handlePaymentCategoryChange('Contribution')}
                  className="w-4 h-4 text-blue-600"
                  disabled={!!paymentToEdit}
                />
                <span className="text-sm">Capital Build/Contribution</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="paymentCategory"
                  value="Loan"
                  checked={paymentCategory === 'Loan'}
                  onChange={() => handlePaymentCategoryChange('Loan')}
                  className="w-4 h-4 text-blue-600"
                  disabled={!!paymentToEdit}
                />
                <span className="text-sm">Loan Payment</span>
              </label>
            </div>
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

          {/* Loan Payment Fields */}
          {paymentCategory === 'Loan' && (
            <>
              <div>
                <label htmlFor="loanId" className="block text-sm font-medium text-gray-700 mb-1">Loan</label>
                <select
                  id="loanId"
                  value={loanId}
                  onChange={(e) => handleLoanChange(e.target.value)}
                  className="nbs-input"
                  disabled={loansLoading || loans.length === 0 || !!paymentToEdit}
                  required
                >
                  <option value=""></option>
                  {loansLoading ? (
                    <option>Loading loans...</option>
                  ) : loans.length === 0 ? (
                    <option>No active loans found</option>
                  ) : (
                    (!paymentToEdit ? loans.filter(lt => lt.status !== 'Paid') : loans).map((loan) => (
                      <option key={loan.loanId} value={loan.loanId}>
                        {loan.loanType} - (ID: {loan.loanId}) - Balance: ₱{loan.remainingBalance?.toFixed(2) || '0.00'}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              {/* Full Payment Checkbox */}
              {selectedLoan && selectedLoan.remainingBalance > 0 && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
                  <input
                    type="checkbox"
                    id="fullPayment"
                    checked={isFullPayment}
                    onChange={(e) => handleFullPaymentChange(e.target.checked)}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="fullPayment" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Full Payment (with interest rebate)
                  </label>
                </div>
              )}

              {/* Interest Rebate Display */}
              {isFullPayment && interestRebate > 0 && (
                <div className="p-3 bg-green-50 rounded-md">
                  <p className="text-sm text-green-700">
                    <span className="font-semibold">Interest Rebate:</span> ₱{interestRebate.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    This amount will be deducted from the remaining balance
                  </p>
                </div>
              )}
            </>
          )}

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
              disabled={isFullPayment || selectedLoan?.status === "Paid"}
            />
            {paymentCategory === 'Loan' && selectedLoan && selectedLoan.monthlyPayment && !isFullPayment && (
              <p className="text-xs text-gray-500 mt-1">
                Monthly payment: ₱{selectedLoan.monthlyPayment.toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md" disabled={loading}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="nbs-button" 
              disabled={loading || (paymentCategory === 'Loan' && (loansLoading || loans.length === 0))}
            >
              {loading ? 'Submitting...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberPaymentForm;