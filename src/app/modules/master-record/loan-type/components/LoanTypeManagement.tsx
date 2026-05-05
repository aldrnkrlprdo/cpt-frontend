import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { toast } from 'react-toastify';
import { MasterRecordService } from '../../services/MasterRecord.service';
import { LoanType } from '../../types/MasterRecord.types';
import { PlusCircleIcon, EditIcon, TrashIcon } from '../../../../shared/components/icons';
import LoanTypeForm from './LoanTypeForm';

const LoanTypeManagement: React.FC = () => {
    const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchLoanTypes = useCallback(async () => {
        try {
            setLoading(true);
            const data = await MasterRecordService.getLoanTypes();
            const mappedData = data.map((lt: any) => ({ ...lt, id: lt._id || lt.id }));
            setLoanTypes(mappedData);
        } catch (error) {
            toast.error('Failed to fetch loan types');
            console.error('Error fetching loan types:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLoanTypes();
    }, [fetchLoanTypes]);

    const handleFormSubmit = async (formData: Omit<LoanType, 'createdAt' | 'updatedAt'>) => {
        try {
            if (selectedLoanType) {
                await MasterRecordService.updateLoanType(selectedLoanType.loanTypeCode, formData);
                toast.success('Loan type updated successfully!');
            } else {
                await MasterRecordService.createLoanType(formData);
                toast.success('Loan type created successfully!');
            }
            setIsModalOpen(false);
            setSelectedLoanType(null);
            fetchLoanTypes();
        } catch (error) {
            toast.error('Failed to save loan type');
            console.error('Error saving loan type:', error);
        }
    };

    const handleEdit = (loanTypeName: LoanType) => {
        setSelectedLoanType(loanTypeName);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this loan type?')) {
            try {
                await MasterRecordService.deleteLoanType(id);
                toast.success('Loan type deleted successfully!');
                fetchLoanTypes();
            } catch (error) {
                toast.error('Failed to delete loan type');
                console.error('Error deleting loan type:', error);
            }
        }
    };

    const columnDefs: ColDef[] = [
        {
            headerName: 'Actions',
            pinned: 'left',
            width: 120,
            cellRenderer: (params: any) => (
                <div className="flex gap-3 items-center justify-center h-full">
                    <button onClick={() => handleEdit(params.data)} title="Edit" className="text-blue-600 hover:text-blue-800">
                        <EditIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(params.data.id)} title="Delete" className="text-red-600 hover:text-red-800">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
            sortable: false,
            filter: false,
            resizable: false,
        },
        { field: 'loanTypeCode', headerName: 'Loan Type Code', sortable: true, filter: true, flex: 1 },
        { field: 'loanTypeName', headerName: 'Loan Type', sortable: true, filter: true, flex: 2 },
    ];

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Loan Types</h2>
                <button
                    onClick={() => {
                        setSelectedLoanType(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 nbs-button"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    Add New Loan Type
                </button>
            </div>
            <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 300px)', width: '100%' }}>
                <AgGridReact
                    rowData={loanTypes}
                    columnDefs={columnDefs}
                    defaultColDef={{
                        sortable: true,
                        filter: true,
                        resizable: true,
                    }}
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 20, 50, 100]}
                    suppressRowClickSelection={true}
                    onGridReady={() => fetchLoanTypes()}
                    overlayLoadingTemplate={loading ? '<span class="ag-overlay-loading-center">Loading...</span>' : ''}
                />
            </div>
            <LoanTypeForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedLoanType}
            />
        </div>
    );
};

export default LoanTypeManagement;