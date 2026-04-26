import { AgGridReact } from 'ag-grid-react';
import { toast } from 'react-toastify';
import { Branch } from '../../types/MasterRecord.types';
import { PlusCircleIcon, EditIcon, TrashIcon, UploadIcon } from '../../../../shared/components/icons';
import { MasterRecordService } from '../../services/MasterRecord.service';
import React, { useState, useEffect, useCallback } from 'react';
import { ColDef } from 'ag-grid-community';
import BranchForm from './BranchForm';
import BranchBulkUploadModal from './BranchBulkUploadModal';

const BranchManagement: React.FC = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchBranches = useCallback(async () => {
        try {
            setLoading(true);
            const data = await MasterRecordService.getBranches();
            const mappedData = data.map((b: any) => ({ ...b, id: b._id || b.id }));
            setBranches(mappedData);
        } catch (error) {
            toast.error('Failed to fetch branches');
            console.error('Error fetching branches:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    const handleFormSubmit = async (formData: Omit<Branch, 'createdAt' | 'updatedAt'>) => {
        try {
            if (selectedBranch) {
                await MasterRecordService.updateBranch(selectedBranch.branchCode, formData);
                toast.success('Branch updated successfully!');
            } else {
                await MasterRecordService.createBranch(formData);
                toast.success('Branch created successfully!');
            }
            setIsModalOpen(false);
            setSelectedBranch(null);
            fetchBranches();
        } catch (error) {
            toast.error('Failed to save branch');
            console.error('Error saving branch:', error);
        }
    };

    const handleEdit = (branch: Branch) => {
        setSelectedBranch(branch);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this branch?')) {
            try {
                await MasterRecordService.deleteBranch(id);
                toast.success('Branch deleted successfully!');
                fetchBranches();
            } catch (error) {
                toast.error('Failed to delete branch');
                console.error('Error deleting branch:', error);
            }
        }
    };

    const handleBulkUploadSuccess = () => {
        fetchBranches();
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
        { field: 'branchCode', headerName: 'Branch Code', sortable: true, filter: true, flex: 1 },
        { field: 'branchName', headerName: 'Branch Name', sortable: true, filter: true, flex: 2 },
    ];

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Branch Management</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsBulkUploadOpen(true)}
                        className="flex items-center gap-2 nbs-button-secondary"
                    >
                        <UploadIcon className="w-5 h-5" /> Bulk Upload
                    </button>
                    <button
                        onClick={() => {
                            setSelectedBranch(null);
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 nbs-button"
                    >
                        <PlusCircleIcon className="w-5 h-5" />
                        Add New Branch
                    </button>
                </div>
            </div>
            <div className="ag-theme-alpine" style={{ height: 'calc(100vh - 300px)', width: '100%' }}>
                <AgGridReact
                    rowData={branches}
                    columnDefs={columnDefs}
                    defaultColDef={{
                        sortable: true,
                        filter: true,
                        resizable: true,
                    }}
                    pagination={true}
                    paginationPageSize={20}
                    suppressRowClickSelection={true}
                    onGridReady={fetchBranches}
                    overlayLoadingTemplate={loading ? '<span class="ag-overlay-loading-center">Loading...</span>' : ''}
                />
            </div>
            <BranchForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleFormSubmit}
                initialData={selectedBranch}
            />
            <BranchBulkUploadModal
                isOpen={isBulkUploadOpen}
                onClose={() => setIsBulkUploadOpen(false)}
                onSuccess={handleBulkUploadSuccess}
            />
        </div>
    );
};

export default BranchManagement;