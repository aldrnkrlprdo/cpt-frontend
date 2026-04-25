import React, { useState, useEffect } from 'react';
import { LoanType } from '../../types/MasterRecord.types';
import AnimatedInput from '../../../../shared/components/AnimatedInput';

interface LoanTypeFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<LoanType, 'createdAt' | 'updatedAt'>) => void;
    initialData: LoanType | null;
}

const LoanTypeForm: React.FC<LoanTypeFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [loanTypeName, setLoanType] = useState('');
    const [loanTypeCode, setLoanTypeCode] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setLoanType(initialData.loanTypeName);
                setLoanTypeCode(initialData.loanTypeCode || '');
            } else {
                setLoanType('');
                setLoanTypeCode('');
            }
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ loanTypeName, loanTypeCode });
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{initialData ? 'Edit Loan Type' : 'Add New Loan Type'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <AnimatedInput
                            id="loanTypeCode"
                            label="Loan Type Code"
                            value={loanTypeCode}
                            onChange={(e) => setLoanTypeCode(e.target.value)}
                            required
                            disabled={!!initialData}
                        />
                    </div>
                    <div className="mb-4">
                        <AnimatedInput
                            id="loanTypeName"
                            label="Loan Type"
                            value={loanTypeName}
                            onChange={(e) => setLoanType(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" className="nbs-button">
                            {initialData ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoanTypeForm;