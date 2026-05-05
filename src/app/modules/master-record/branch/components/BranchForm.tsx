import React, { useState, useEffect } from 'react';

interface BranchFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { branchCode: string; branchName: string }) => void;
    initialData?: { branchCode: string; branchName: string } | null;
    loading?: boolean;
    isViewer?: boolean;
}

const BranchForm: React.FC<BranchFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    loading = false,
    isViewer = false
}) => {
    const [form, setForm] = useState({
        branchCode: '',
        branchName: '',
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                branchCode: initialData.branchCode,
                branchName: initialData.branchName,
            });
        } else {
            setForm({
                branchCode: '',
                branchName: '',
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!loading) {
            onSubmit(form);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">
                    {initialData ? (isViewer ? 'View Branch' : 'Edit Branch') : 'Add New Branch'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="branchCode" className="block text-sm font-medium text-gray-700 mb-2">
                            Branch Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="branchCode"
                            name="branchCode"
                            value={form.branchCode}
                            onChange={handleChange}
                            required
                            disabled={!!initialData || isViewer}
                            placeholder="Enter branch code"
                            className="nbs-input w-full"
                        />
                    </div>

                    <div>
                        <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 mb-2">
                            Branch Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="branchName"
                            name="branchName"
                            value={form.branchName}
                            onChange={handleChange}
                            required
                            disabled={isViewer}
                            placeholder="Enter branch name"
                            className="nbs-input w-full"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="nbs-button-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        {!isViewer && (
                            <button
                                type="submit"
                                className="nbs-button"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : initialData ? 'Update' : 'Save'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BranchForm;