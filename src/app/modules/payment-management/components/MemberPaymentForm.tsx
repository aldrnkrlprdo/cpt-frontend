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
  isViewer?: boolean;
}

const MemberPaymentForm: React.FC<Props> = ({ member, onSubmit, onClose, loading, paymentToEdit, isViewer = false }) => {
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
  const [notes, setNotes] = useState<string>('');

  const loanTypes = useSelector(selectLoanTypes);

  useEffect(() => {
    if (paymentToEdit) {
      setAmountPaid(paymentToEdit.amountPaid.toFixed(2));
      setPaymentDate(new Date(paymentToEdit.paymentDate).toISOString().slice(0, 16));
      setLoanId(paymentToEdit.loanId);
      setLoanType(paymentToEdit.paymentType);
      setPaymentId(paymentToEdit.paymentId);
      setNotes(paymentToEdit.notes || '');

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
      setAmountPaid(remainingBalance.toFixed(2));
    };

    if (isFullPayment && selectedLoan) {
      calculateFullPayment();
    } else if (!isFullPayment && selectedLoan) {
      setAmountPaid(selectedLoan.monthlyPayment?.toFixed(2) || '');
      setInterestRebate(0);
    }
  }, [isFullPayment, selectedLoan]);

  useEffect(() => {
    if (selectedLoan && !isFullPayment) {
      setAmountPaid(selectedLoan.monthlyPayment?.toFixed(2) || '');
    }
  }, [selectedLoan, isFullPayment]);

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
          setLoanType(loan.loanType); // Add this line
        }
      } else if (processedLoans.length > 0 && loanId === '') {
        setLoanId(processedLoans[0].loanId);
        setSelectedLoan(processedLoans[0]);
        setLoanType(processedLoans[0].loanType); // Add this line
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

  const handleLoanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLoanId = e.target.value;
    setLoanId(selectedLoanId);
    const loan = loans.find(l => l.loanId === selectedLoanId);
    setSelectedLoan(loan || null);

    // Set the loan type when a loan is selected
    if (loan) {
      setLoanType(loan.loanType);
    } else {
      setLoanType('');
    }

    setIsFullPayment(false);
    setInterestRebate(0);
  };

  const handlePaymentCategoryChange = (category: 'Loan' | 'Contribution') => {
    setPaymentCategory(category);
    setLoanId('');
    setLoanType('');
    setSelectedLoan(null);
    setIsFullPayment(false);
    setInterestRebate(0);
    setAmountPaid('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    if (paymentCategory === 'Loan' && !loanId) {
      toast.error('Please select a loan.');
      return;
    }

    const paymentData: PaymentFormData = {
      employeeId: member.employeeId,
      amountPaid: parseFloat(amountPaid),
      paymentDate: new Date(paymentDate).toISOString(),
      paymentType: paymentCategory === 'Contribution' ? 'Contribution' : loanType,
      loanId: paymentCategory === 'Loan' ? loanId : '',
      paymentId: paymentId ?? '',
      isFullPayment: paymentCategory === 'Loan' ? isFullPayment : false,
      interestRebate: paymentCategory === 'Loan' && isFullPayment ? interestRebate : 0,
      notes: notes.trim(),
    };

    onSubmit(paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isViewer ? 'View Payment' : paymentToEdit ? 'Edit Payment' : 'Add Payment'}
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900" disabled={loading}>
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {isViewer && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You are viewing this payment in read-only mode.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Member Information */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Member Information</h3>
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

          {/* Payment Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Category <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Contribution"
                  checked={paymentCategory === 'Contribution'}
                  onChange={() => handlePaymentCategoryChange('Contribution')}
                  className="mr-2"
                  disabled={isViewer || !!paymentToEdit}
                />
                Contribution
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Loan"
                  checked={paymentCategory === 'Loan'}
                  onChange={() => handlePaymentCategoryChange('Loan')}
                  className="mr-2"
                  disabled={isViewer || !!paymentToEdit}
                />
                Loan Payment
              </label>
            </div>
          </div>

          {/* Loan Selection - Only show if Loan category is selected */}
          {paymentCategory === 'Loan' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Loan <span className="text-red-500">*</span>
              </label>
              {loansLoading ? (
                <p className="text-sm text-gray-500">Loading loans...</p>
              ) : loans.length === 0 ? (
                <p className="text-sm text-red-500">No active loans found for this member.</p>
              ) : (
                <select
                  value={loanId}
                  onChange={handleLoanChange}
                  className="nbs-input w-full"
                  required
                  disabled={isViewer || !!paymentToEdit}
                >
                  <option value="">Select a loan</option>
                  {loans.map((loan) => (
                    <option key={loan.loanId} value={loan.loanId}>
                      {loan.loanType} - {loan.loanId} (Balance: ₱{loan.remainingBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Loan Details - Show when a loan is selected */}
          {selectedLoan && paymentCategory === 'Loan' && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-sm">Loan Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Loan Amount:</span>
                  <span className="ml-2 font-medium">
                    ₱{selectedLoan.loanAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Monthly Payment:</span>
                  <span className="ml-2 font-medium">
                    ₱{selectedLoan.monthlyPayment?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Remaining Balance:</span>
                  <span className="ml-2 font-medium">
                    ₱{selectedLoan.remainingBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Loan Term:</span>
                  <span className="ml-2 font-medium">{selectedLoan.loanTerm} months</span>
                </div>
              </div>
            </div>
          )}

          {/* Full Payment Checkbox - Only for loan payments */}
          {paymentCategory === 'Loan' && selectedLoan && (
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isFullPayment}
                  onChange={(e) => setIsFullPayment(e.target.checked)}
                  className="mr-2"
                  disabled={isViewer}
                />
                <span className="text-sm font-medium text-gray-700">
                  Full Payment (Pay off entire remaining balance)
                </span>
              </label>
              {isFullPayment && interestRebate > 0 && (
                <p className="text-sm text-green-600 mt-2">
                  Interest Rebate: ₱{interestRebate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          )}

          {/* Payment Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="nbs-input w-full"
              required
              disabled={isViewer}
            />
          </div>

          {/* Amount Paid */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Paid <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="nbs-input w-full pl-8"
                placeholder="0.00"
                required
                disabled={isViewer || (paymentCategory === 'Loan' && isFullPayment)}
              />
            </div>
            {paymentCategory === 'Loan' && isFullPayment && (
              <p className="text-xs text-gray-500 mt-1">
                Amount is automatically calculated for full payment
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="nbs-input w-full"
              rows={3}
              placeholder="Add any additional notes about this payment..."
              disabled={isViewer}
            />
          </div>

          {/* Payment Summary */}
          {amountPaid && parseFloat(amountPaid) > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold mb-2 text-sm">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Type:</span>
                  <span className="font-medium">
                    {paymentCategory === 'Contribution' ? 'Contribution' : selectedLoan?.loanType || 'Loan'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    ₱{parseFloat(amountPaid).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {paymentCategory === 'Loan' && isFullPayment && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Interest Rebate:</span>
                      <span className="font-medium">
                        -₱{interestRebate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="font-semibold">Net Amount:</span>
                      <span className="font-semibold">
                        ₱{(parseFloat(amountPaid) - interestRebate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              {isViewer ? 'Close' : 'Cancel'}
            </button>
            {!isViewer && (
              <button
                type="submit"
                className="nbs-button"
                disabled={loading || (paymentCategory === 'Loan' && loans.length === 0)}
              >
                {loading ? 'Processing...' : paymentToEdit ? 'Update Payment' : 'Add Payment'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberPaymentForm;