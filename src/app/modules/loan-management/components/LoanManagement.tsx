import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { upperFirstLetter } from '../../../shared/components/helper';
import { Member } from '../../member-management/types/MemberManagement.types';
import { EditIcon, EyeIcon, PlusCircleIcon, TrashIcon, UploadIcon } from '../../../shared/components/icons';
import { RootState } from '../../../setup/redux/RootReducer';
import { PaymentManagementService } from '../../payment-management/services/PaymentManagement.service';
import { Loan } from '../types/LoanManagement.types';
import { selectLoanTypes } from '../../master-record/redux/masterRecordSlice';
import { LoanManagementService } from '../services/LoanManagement.service';
import LoanManagementForm from './LoanManagementForm';
import LoanBulkUpload from './LoanBulkUpload';

const LoanManagement: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [formLoading, setFormLoading] = useState<boolean>(false);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loansLoading, setLoansLoading] = useState<boolean>(false);
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    const mountedRef = useRef(true);
    const [searchBy, setSearchBy] = useState('lastName');
    const [searchText, setSearchText] = useState('');

    const loanTypes = useSelector(selectLoanTypes);
    const role = useSelector<RootState, string | undefined>(({ auth }) => auth.role);
    const isViewer = role?.toLowerCase() === 'user';

    const loadMembers = useCallback(async () => {
        if (!mountedRef.current) return;
        setLoading(true);
        try {
            const data = await PaymentManagementService.getMembers(searchBy, searchText);
            if (mountedRef.current) {
                setMembers(data.filter(members => members.membershipStatus === 'Active'));
            }
        } catch (error) {
            console.error('Failed to fetch members:', error);
            toast.error('Failed to fetch members.');
        } finally {
            if (mountedRef.current) {
                setLoading(false);
            }
        }
    }, [searchBy, searchText]);

    const loadLoansForMember = useCallback(async (employeeId: string) => {
        setLoansLoading(true);
        try {
            const memberLoans = await LoanManagementService.getLoansByEmployeeId(employeeId);
            const processedLoans = memberLoans.map((loan) => ({
                ...loan,
                loanType: loanTypes.find(lt => lt.loanTypeCode === loan.loanType)?.loanTypeName || loan.loanType,
            }));
            setLoans(processedLoans);
        } catch (error) {
            console.error('Failed to fetch loans:', error);
            toast.error('Failed to fetch loans for this member.');
            setLoans([]);
        } finally {
            setLoansLoading(false);
        }
    }, [loanTypes]);

    useEffect(() => {
        mountedRef.current = true;
        loadMembers();

        return () => {
            mountedRef.current = false;
        };
    }, [loadMembers]);

    useEffect(() => {
        if (selectedMember) {
            loadLoansForMember(selectedMember.employeeId);
        }
    }, [selectedMember, loadLoansForMember]);

    const handleMemberSelect = (member: Member) => {
        setSelectedMember(member);
        setSelectedLoan(null);
    };

    const handleAddLoanClick = () => {
        if (!selectedMember) {
            toast.warning('Please select a member first.');
            return;
        }
        setSelectedLoan(null);
        setIsFormOpen(true);
    };

    const handleEditLoanClick = (loan: Loan) => {
        setSelectedLoan(loan);
        setIsFormOpen(true);
    };

    const handleDeleteLoanClick = async (loanId: string) => {
        if (window.confirm('Are you sure you want to delete this loan?')) {
            try {
                await LoanManagementService.deleteLoan(loanId);
                toast.success('Loan deleted successfully!');
                if (selectedMember) {
                    loadLoansForMember(selectedMember.employeeId);
                }
            } catch (error) {
                toast.error('Failed to delete loan');
                console.error('Error deleting loan:', error);
            }
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedLoan(null);
    };

    const handleFormSubmit = async (data: Omit<Loan, 'loanId' | 'dateCreated' | 'employee'>) => {
        setFormLoading(true);
        try {
            if (selectedLoan) {
                await LoanManagementService.updateLoan(selectedLoan.loanId, data as Loan);
                toast.success('Loan updated successfully!');
            } else {
                await LoanManagementService.createLoan(data);
                toast.success(`Loan added for ${selectedMember?.firstName}`);
            }
            handleFormClose();
            if (selectedMember) {
                loadLoansForMember(selectedMember.employeeId);
            }
        } catch (error) {
            toast.error(selectedLoan ? 'Failed to update loan.' : 'Failed to add loan.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadMembers();
    };

    const handleBulkUploadSuccess = () => {
        // Reload members to reflect any new loans
        loadMembers();
    };

    const LoanActionsCellRenderer = (props: { data: Loan }) => {
        if (isViewer) {
            return (
                <div className="flex items-center justify-center h-full">
                    <button
                        onClick={() => handleEditLoanClick(props.data)}
                        title="View Loan"
                        className="text-blue-600 hover:text-blue-800"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                </div>
            );
        }
        return (
            <div className="flex items-center justify-center h-full space-x-2">
                <button
                    onClick={() => handleEditLoanClick(props.data)}
                    title="Edit Loan"
                    className="text-blue-600 hover:text-blue-800"
                >
                    <EditIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => handleDeleteLoanClick(props.data.loanId)}
                    title="Delete Loan"
                    className="text-red-600 hover:text-red-800"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        );
    };

    const memberColumnDefs: ColDef[] = [
        { headerName: 'Employee ID', field: 'employeeId', sortable: true, filter: true, width: 120 },
        {
            headerName: 'Full Name',
            valueGetter: (params) => `${params.data.firstName} ${params.data.middleName || ''} ${params.data.lastName}`.trim(),
            sortable: true,
            filter: true,
            flex: 1,
        },
    ];

    const loanColumnDefs: ColDef[] = [
        {
            headerName: 'Actions',
            field: 'actions',
            width: 120,
            cellRenderer: LoanActionsCellRenderer,
            sortable: false,
            filter: false,
            pinned: 'left',
        },
        { headerName: 'Loan ID', field: 'loanId', width: 150 },
        { headerName: 'Loan Type', field: 'loanType', width: 150 },
        {
            headerName: 'Loan Amount',
            field: 'loanAmount',
            width: 150,
            valueFormatter: (params) =>
                `₱${params.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
        {
            headerName: 'Monthly Payment',
            field: 'monthlyPayment',
            width: 150,
            valueFormatter: (params) =>
                `₱${params.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
        {
            headerName: 'Remaining Balance',
            field: 'remainingBalance',
            width: 160,
            valueFormatter: (params) =>
                `₱${params.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
        {
            headerName: 'Total Payable',
            field: 'totalPayable',
            width: 140,
            valueFormatter: (params) =>
                `₱${params.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
        { headerName: 'Loan Term', field: 'loanTerm', width: 110 },
        {
            headerName: 'Interest',
            field: 'interest',
            width: 100,
            valueFormatter: (params) => `${params.value}%`,
        },
        { headerName: 'Status', field: 'status', width: 120 },
        {
            headerName: 'Loan Date',
            field: 'loanDate',
            width: 180,
            valueFormatter: (params) => params.value.split('T')[0],
        },
        {
            headerName: 'Maturity Date',
            field: 'maturityDate',
            width: 180,
            valueFormatter: (params) => params.value.split('T')[0],
        },
    ];

    return (
        <div className="h-full flex flex-col p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Loan Management</h1>
                {!isViewer && (
                    <button
                        onClick={() => setShowBulkUpload(true)}
                        className="nbs-button flex items-center gap-2"
                        title="Bulk Upload Loans"
                    >
                        <UploadIcon className="w-5 h-5" />
                        Bulk Upload
                    </button>
                )}
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left Panel - Members List */}
                <div className="w-1/3 flex flex-col border-2 rounded-lg bg-white shadow">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold mb-4">Members</h2>
                        <form onSubmit={handleSearch} className="flex flex-col gap-3">
                            <select
                                value={searchBy}
                                onChange={(e) => setSearchBy(e.target.value)}
                                className="nbs-input"
                            >
                                <option value="employeeId">Employee ID</option>
                                <option value="firstName">First Name</option>
                                <option value="lastName">Last Name</option>
                            </select>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder={`Search by ${searchBy}...`}
                                    className="nbs-input flex-grow"
                                />
                                <button type="submit" className="nbs-button" disabled={loading}>
                                    {loading ? 'Searching...' : 'Search'}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="flex-1 overflow-hidden p-2">
                        <div className="ag-theme-alpine h-full w-full">
                            <AgGridReact
                                rowData={members}
                                columnDefs={memberColumnDefs}
                                defaultColDef={{ sortable: true, filter: true, resizable: true }}
                                pagination={true}
                                paginationPageSize={20}
                                paginationPageSizeSelector={[10, 20, 50, 100]}
                                suppressRowClickSelection={true}
                                overlayLoadingTemplate='<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>'
                                animateRows={true}
                                onRowClicked={(event) => handleMemberSelect(event.data)}
                                rowSelection="single"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Panel - Member Details and Loan History */}
                <div className="flex-1 flex flex-col border-2 rounded-lg bg-white shadow overflow-hidden">
                    {selectedMember ? (
                        <>
                            {/* Member Details Section */}
                            <div className="p-6 bg-gray-50">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-lg font-semibold">Member Details</h2>
                                    {!isViewer && (
                                        <button
                                            onClick={handleAddLoanClick}
                                            className="nbs-button flex items-center gap-2"
                                        >
                                            <PlusCircleIcon className="w-5 h-5" />
                                            Add Loan
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-600">Employee ID</p>
                                        <p className="font-medium">{selectedMember.employeeId}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Full Name</p>
                                        <p className="font-medium">
                                            {selectedMember.firstName} {selectedMember.middleName || ''} {selectedMember.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Email</p>
                                        <p className="font-medium">{selectedMember.email || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Branch</p>
                                        <p className="font-medium">{selectedMember.branch}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-medium">
                                            {upperFirstLetter(selectedMember.membershipStatus)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Contact Number</p>
                                        <p className="font-medium">{selectedMember.phoneNumber || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Loan History Section */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold">Loan History</h2>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    {loansLoading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-gray-500">Loading loans...</p>
                                        </div>
                                    ) : loans.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <p className="text-gray-500 mb-2">No loans found for this member.</p>
                                                <button
                                                    onClick={handleAddLoanClick}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Add a loan to get started
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="ag-theme-alpine h-full w-full p-2">
                                            <AgGridReact
                                                rowData={loans}
                                                columnDefs={loanColumnDefs}
                                                defaultColDef={{ sortable: true, filter: true, resizable: true }}
                                                pagination={true}
                                                paginationPageSize={10}
                                                paginationPageSizeSelector={[10, 20, 50, 100]}
                                                suppressRowClickSelection={true}
                                                overlayLoadingTemplate='<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>'
                                                animateRows={true}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500">
                                <p className="text-lg mb-2">No member selected</p>
                                <p className="text-sm">Select a member from the left panel to view details and loan history</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Loan Form Modal */}
            {isFormOpen && selectedMember && (
                <LoanManagementForm
                    member={selectedMember}
                    loan={selectedLoan || undefined}
                    onSubmit={handleFormSubmit}
                    onClose={handleFormClose}
                    loading={formLoading}
                    isViewer={isViewer}
                />
            )}

            {/* Bulk Upload Modal */}
            {showBulkUpload && (
                <LoanBulkUpload
                    onClose={() => setShowBulkUpload(false)}
                    onSuccess={handleBulkUploadSuccess}
                />
            )}
        </div>
    );
};

export default LoanManagement;