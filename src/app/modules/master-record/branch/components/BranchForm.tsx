import React, { useState, useEffect } from 'react';
import { Branch } from '../../types/MasterRecord.types';

interface BranchFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Branch, 'createdAt' | 'updatedAt'>) => void;
    initialData: Branch | null;
}

const BranchForm: React.FC<BranchFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [branchCode, setBranchCode] = useState('');
    const [branchName, setBranchName] = useState('');

    useEffect(() => {
        if (initialData) {
            setBranchCode(initialData.branchCode);
            setBranchName(initialData.branchName || '');
        } else {
            setBranchCode('');
            setBranchName('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!branchCode || !branchName) {
            // Basic validation
            alert('Please fill in all fields.');
            return;
        }
        onSubmit({ branchCode, branchName });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{initialData ? 'Edit Branch' : 'Add New Branch'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="branchCode" className="block text-sm font-medium text-gray-700 mb-1">Branch Code</label>
                        <input
                            type="text"
                            id="branchCode"
                            value={branchCode}
                            onChange={(e) => setBranchCode(e.target.value)}
                            className="w-full nbs-input"
                            required
                            autoFocus
                            disabled={!!initialData}
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                        <input
                            type="text"
                            id="branchName"
                            value={branchName}
                            onChange={(e) => setBranchName(e.target.value)}
                            className="w-full nbs-input"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="nbs-button-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="nbs-button">
                            {initialData ? 'Save Changes' : 'Create Branch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BranchForm;