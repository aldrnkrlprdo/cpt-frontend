import React, { useEffect, useState } from 'react';
import { Member } from '../../member-management/types/MemberManagement.types';
import { Loan } from '../types/LoanManagement.types';
import { LoanManagementService } from '../services/LoanManagement.service';
import { toast } from 'react-toastify';

interface Props {
    member: Member;
    onClose: () => void;
    loanDetails?: Loan;
    loanTypes: { loanTypeCode: string; loanTypeName: string }[];
    branches: { branchCode: string; branchName: string }[];
}

const EditLoanModal: React.FC<Props> = ({ member, onClose, loanDetails, loanTypes, branches }) => {
    const [formData, setFormData] = useState<Partial<Loan>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (loanDetails) {
            setFormData({
                loanId: loanDetails.loanId,
                loanAmount: loanDetails.loanAmount,
                interest: loanDetails.interest,
                loanTerm: loanDetails.loanTerm,
                loanDate: new Date(loanDetails.loanDate).toISOString().split('T')[0],
                maturityDate: new Date(loanDetails.maturityDate).toISOString().split('T')[0],
                branch: loanDetails.branch,
                employeeId: loanDetails.employeeId,
                status: loanDetails.status,
            });
        }
    }, [loanDetails])

    useEffect(() => {
        const calculatePayments = () => {
            const loanAmount = parseFloat(String(formData.loanAmount));
            const interestRate = parseFloat(String(formData.interest)) / 100;
            const loanTerm = parseInt(String(formData.loanTerm), 10);

            if (!isNaN(loanAmount) && !isNaN(interestRate) && !isNaN(loanTerm) && loanTerm > 0) {
                const totalPayable = loanAmount * (1 + interestRate);
                const monthlyPayment = totalPayable / loanTerm;
                setFormData(prev => ({
                    ...prev,
                    totalPayable,
                    monthlyPayment,
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    totalPayable: 0,
                    monthlyPayment: 0,
                }));
            }
        };

        calculatePayments();
    }, [formData.loanAmount, formData.interest, formData.loanTerm]);

    const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (value) {
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue)) {
                setFormData(prev => ({
                    ...prev,
                    [name]: parsedValue.toFixed(2),
                }));
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loanDetails?.loanId) {
            toast.error("No loan selected to update.");
            return;
        }
        setIsSubmitting(true);
        try {
            // Assuming an updateLoan service method exists
            await LoanManagementService.updateLoan(loanDetails?.loanId, formData as Loan);
            toast.success("Loan updated successfully!");
            onClose();
        } catch (error) {
            console.error('Failed to update loan:', error);
            toast.error('Failed to update loan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col">
                <h2 className="text-xl font-bold mb-4">
                    Loans for {member.firstName} {member.lastName} (ID: {member.employeeId})
                </h2>
                <div className={`flex-grow overflow-y-auto flex ${loanDetails ? 'justify-center items-center min-h-[100px]' : ''}`}>
                    <form onSubmit={handleSubmit} className="space-y-4 w-full">
                            <div className="border p-4 rounded-lg mt-4">
                                <h3 className="font-semibold text-lg mb-4">{formData.loanType} Loan - (ID: {formData.loanId})</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                                        <input id="employeeId" name="employeeId" value={formData.employeeId} className="nbs-input bg-gray-100" disabled />
                                    </div>
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select name="status" id="status" value={formData.status || ''} onChange={handleInputChange} className="nbs-input">
                                            <option value="" disabled>Select a status</option>
                                            <option value="Not Started">Not Started</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="In Progress">Pending</option>
                                            <option value="Paid">Paid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                                        <select name="branch" id="branch" value={formData.branch || ''} onChange={handleInputChange} className="nbs-input">
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
                                        <select id="loanType" name="loanType" value={formData.loanType} onChange={handleInputChange} className="nbs-input" required>
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
                                        <input type="date" name="loanDate" id="loanDate" value={formData.loanDate || ''} onChange={handleInputChange} className="nbs-input" />
                                    </div>
                                    <div>
                                        <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-1">Loan Amount</label>
                                        <input type="text" name="loanAmount" id="loanAmount" value={formData.loanAmount || ''} onChange={handleInputChange} onBlur={handleAmountBlur} className="nbs-input" placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label htmlFor="maturityDate" className="block text-sm font-medium text-gray-700 mb-1">Maturity Date</label>
                                        <input type="date" name="maturityDate" id="maturityDate" value={formData.maturityDate || ''} onChange={handleInputChange} className="nbs-input" />
                                    </div>
                                    <div>
                                        <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700 mb-1">Loan Term (months)</label>
                                        <input type="text" name="loanTerm" id="loanTerm" value={formData.loanTerm || ''} onChange={handleInputChange} className="nbs-input" placeholder="0" />
                                    </div>
                                    <div>
                                        <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-1">Interest (%)</label>
                                        <input type="text" name="interest" id="interest" value={formData.interest || ''} onChange={handleInputChange} onBlur={handleAmountBlur} className="nbs-input" placeholder="0" />
                                    </div>
                                    <div>
                                        <label htmlFor="totalPayable" className="block text-sm font-medium text-gray-700 mb-1">Total Payable</label>
                                        <input id="totalPayable" name="totalPayable" value={formData.totalPayable?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} className="nbs-input bg-gray-100" disabled />
                                    </div>
                                    <div>
                                        <label htmlFor="monthlyPayment" className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment</label>
                                        <input id="monthlyPayment" name="monthlyPayment" value={formData.monthlyPayment?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} className="nbs-input bg-gray-100" disabled />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md" disabled={isSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="nbs-button" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                </div>
            </div>
        </div>
    );
};

export default EditLoanModal;