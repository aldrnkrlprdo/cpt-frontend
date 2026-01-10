import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Member } from '../../member-management/types/MemberManagement.types';
import { PaymentManagementService } from '../../payment-management/services/PaymentManagement.service';
import { EyeIcon, PlusCircleIcon } from '../../../shared/components/icons';
import LoanManagementForm from './LoanManagementForm';
import { Loan } from '../types/LoanManagement.types';
import { upperFirstLetter } from '../../../shared/components/helper';

const LoanManagement: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [formLoading, setFormLoading] = useState<boolean>(false);

    const mountedRef = useRef(true);
    const [searchBy, setSearchBy] = useState('lastName');
    const [searchText, setSearchText] = useState('');

    const loadMembers = useCallback(async () => {
        if (!mountedRef.current) return;
        setLoading(true);
        try {
            const data = await PaymentManagementService.getMembers(searchBy, searchText);
            if (mountedRef.current) {
                setMembers(data);
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

    useEffect(() => {
        mountedRef.current = true;
        loadMembers();

        return () => {
            mountedRef.current = false;
        };
    }, [loadMembers]);

    const handleAddLoanClick = (member: Member) => {
        setSelectedMember(member);
        setIsFormOpen(true);
    };

    const handleViewLoansClick = (member: Member) => {
        // Placeholder for viewing payments. This could navigate to a new page or open another modal.
        toast.info(`Viewing payments for ${member.firstName} ${member.lastName}`);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedMember(null);
    };

    const handleFormSubmit = async (data: Omit<Loan, 'loanId' | 'dateCreated' | 'employee' | 'totalPayable' | 'monthlyPayment'>) => {
        setFormLoading(true);
        try {
            // Assuming a service method to create a payment
            // await PaymentManagementService.createPayment(data);
            toast.success(`Payment added for ${selectedMember?.firstName}`);
            handleFormClose();
            // Optionally, you might want to refresh some data here
        } catch (error) {
            toast.error('Failed to add payment.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadMembers();
    };

    const ActionsCellRenderer = (props: { data: Member }) => {
        return (
            <div className="flex items-center justify-center h-full space-x-2">
                <button onClick={() => handleAddLoanClick(props.data)} title="Add Payment" className="text-green-600 hover:text-green-800">
                    <PlusCircleIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleViewLoansClick(props.data)} title="View Payments" className="text-blue-600 hover:text-blue-800">
                    <EyeIcon className="w-5 h-5" />
                </button>
            </div>
        );
    };

    const columnDefs: ColDef[] = [
        {
            headerName: 'Actions',
            pinned: 'left',
            cellRenderer: ActionsCellRenderer,
            width: 100,
            resizable: false,
            sortable: false,
            filter: false,
        },
        { headerName: 'Employee ID', field: 'employeeId', sortable: true, filter: true },
        { headerName: 'First Name', field: 'firstName', sortable: true, filter: true },
        { headerName: 'Last Name', field: 'lastName', sortable: true, filter: true },
        { headerName: 'Email', field: 'email', sortable: true, filter: true },
        { headerName: 'Status', field: 'membershipStatus', sortable: true, filter: true, valueFormatter: (params) => params.data.membershipStatus ? upperFirstLetter(params.data.membershipStatus) : params.data.membershipStatus },
    ];

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Loan Management</h1>
            </div>

            <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
                <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)} className="nbs-input">
                    <option value="firstName">First Name</option>
                    <option value="lastName">Last Name</option>
                    <option value="employeeId">Employee ID</option>
                    <option value="email">Email</option>
                    <option value="status">Status</option>
                </select>
                <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="nbs-input flex-grow"
                    placeholder={`Search by ${searchBy.charAt(0).toUpperCase() + searchBy.slice(1)}`}
                />
                <button type="submit" className="nbs-button" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            <div className="ag-theme-alpine h-[600px] w-full">
                <AgGridReact
                    rowData={members}
                    columnDefs={columnDefs}
                    defaultColDef={{ sortable: true, filter: true, resizable: true }}
                    pagination={true}
                    paginationPageSize={15}
                    suppressRowClickSelection={true}
                    overlayLoadingTemplate='<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>'
                    animateRows={true}
                />
            </div>
            {isFormOpen && selectedMember && (
                <LoanManagementForm
                    member={selectedMember}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                    loading={formLoading}
                />
            )}
        </div>
    );
};

export default LoanManagement;
