import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { Member } from '../../member-management/types/MemberManagement.types';
import { PaymentManagementService } from '../services/PaymentManagement.service';
import { EditIcon, EyeIcon, PlusCircleIcon, TrashIcon, UploadIcon } from '../../../shared/components/icons';
import MemberPaymentForm from './MemberPaymentForm';
import { Payment } from '../types/PaymentManagement.types';
import { upperFirstLetter } from '../../../shared/components/helper';
import { selectLoanTypes } from '../../master-record/redux/masterRecordSlice';
import { RootState } from '../../../setup/redux/RootReducer';
import PaymentBulkUpload from './PaymentBulkUpload';

const PaymentManagement: React.FC = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [formLoading, setFormLoading] = useState<boolean>(false);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [paymentsLoading, setPaymentsLoading] = useState<boolean>(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

    const mountedRef = useRef(true);
    const [searchBy, setSearchBy] = useState('employeeId');
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

    const loadPaymentsForMember = useCallback(async (employeeId: string) => {
        setPaymentsLoading(true);
        try {
            const memberPayments = await PaymentManagementService.getPaymentsByEmployeeId(employeeId);
            const processedPayments = memberPayments.map((payment) => ({
                ...payment,
                paymentType: loanTypes.find(lt => lt.loanTypeCode === payment.paymentType)?.loanTypeName || payment.paymentType,
            }));
            setPayments(processedPayments);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
            toast.error('Failed to fetch payments for this member.');
            setPayments([]);
        } finally {
            setPaymentsLoading(false);
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
            loadPaymentsForMember(selectedMember.employeeId);
        }
    }, [selectedMember, loadPaymentsForMember]);

    const handleMemberSelect = (member: Member) => {
        setSelectedMember(member);
        setSelectedPayment(null);
    };

    const handleAddPaymentClick = () => {
        if (!selectedMember) {
            toast.warning('Please select a member first.');
            return;
        }
        setSelectedPayment(null);
        setIsFormOpen(true);
    };

    const handleEditPaymentClick = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsFormOpen(true);
    };

    const handleDeletePaymentClick = async (paymentId: string) => {
        if (window.confirm('Are you sure you want to delete this payment?')) {
            try {
                await PaymentManagementService.deletePayment(paymentId);
                toast.success('Payment deleted successfully!');
                if (selectedMember) {
                    loadPaymentsForMember(selectedMember.employeeId);
                }
            } catch (error) {
                toast.error('Failed to delete payment');
                console.error('Error deleting payment:', error);
            }
        }
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setSelectedPayment(null);
    };

    const handleFormSubmit = async (data: any) => {
        setFormLoading(true);
        try {
            if (selectedPayment) {
                await PaymentManagementService.updatePayment(selectedPayment.paymentId, data);
                toast.success('Payment updated successfully!');
            } else {
                await PaymentManagementService.createPayment(data);
                toast.success(`Payment added for ${selectedMember?.firstName}`);
            }
            handleFormClose();
            if (selectedMember) {
                loadPaymentsForMember(selectedMember.employeeId);
            }
        } catch (error) {
            toast.error(selectedPayment ? 'Failed to update payment.' : 'Failed to add payment.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadMembers();
    };

    const PaymentActionsCellRenderer = (props: { data: Payment }) => {
        if (isViewer) {
            return <div className="flex items-center justify-center h-full space-x-2">
                <button
                    onClick={() => handleEditPaymentClick(props.data)}
                    title="View Payment"
                    className="text-blue-600 hover:text-blue-800"
                >
                    <EyeIcon className="w-5 h-5" />
                </button>
            </div>;
        }
        return (
            <div className="flex items-center justify-center h-full space-x-2">
                <button
                    onClick={() => handleEditPaymentClick(props.data)}
                    title="Edit Payment"
                    className="text-blue-600 hover:text-blue-800"
                >
                    <EditIcon className="w-5 h-5" />
                </button>
                <button
                    onClick={() => handleDeletePaymentClick(props.data.paymentId)}
                    title="Delete Payment"
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
            valueGetter: (params) => `${params.data.lastName}, ${params.data.firstName} ${params.data.middleName || ''}`.trim(),
            sortable: true,
            filter: true,
            flex: 1,
        },
    ];

    const paymentColumnDefs: ColDef[] = [

        {
            headerName: 'Actions',
            field: 'actions',
            width: 120,
            cellRenderer: PaymentActionsCellRenderer,
            sortable: false,
            filter: false,
            pinned: 'left',
        },
        { headerName: 'Payment ID', field: 'paymentId', width: 150 },
        { headerName: 'Loan ID', field: 'loanId', width: 150 },
        { headerName: 'Payment Type', field: 'paymentType', width: 150 },
        {
            headerName: 'Amount Paid',
            field: 'amountPaid',
            width: 150,
            valueFormatter: (params) =>
                `₱${params.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
        {
            headerName: 'Interest Rebate',
            field: 'interestRebate',
            width: 150,
            valueFormatter: (params) =>
                `₱${params.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
        {
            headerName: 'Notes',
            field: 'notes',
            width: 200,
            cellRenderer: (params: any) => (
                <div className="truncate" title={params.value || ''}>
                    {params.value || '-'}
                </div>
            ),
        },
        {
            headerName: 'Payment Date',
            field: 'paymentDate',
            width: 180,
            valueFormatter: (params) => params.value.split('T')[0],
        },
        {
            headerName: 'Date Created',
            field: 'createdAt',
            width: 180,
            valueFormatter: (params) => params.value.split('T')[0],
        },
    ];

    // Add handler function after handleFormSubmit
    const handleBulkUploadSuccess = () => {
        toast.success('Bulk upload completed successfully!');
        if (selectedMember) {
            loadPaymentsForMember(selectedMember.employeeId);
        }
    };

    return (
        <div className="h-full flex flex-col p-6 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Payment Management</h1>

                <button
                    onClick={() => setShowBulkUploadModal(true)}
                    className="nbs-button flex items-center gap-2"
                >
                    <UploadIcon className="w-5 h-5" /> Bulk Upload
                </button>
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
                                paginationPageSize={10}
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

                {/* Right Panel - Member Details and Payments */}
                <div className="flex-1 flex flex-col border-2 rounded-lg bg-white shadow overflow-hidden">
                    {selectedMember ? (
                        <>
                            {/* Member Details Section */}
                            <div className="p-6 bg-gray-50">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-lg font-semibold">Member Details</h2>
                                    <button
                                        onClick={handleAddPaymentClick}
                                        className="nbs-button flex items-center gap-2"
                                        disabled={isViewer}
                                    >
                                        <PlusCircleIcon className="w-5 h-5" />
                                        Add Payment
                                    </button>
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

                            {/* Payments List Section */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-lg font-semibold">Payment History</h2>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    {paymentsLoading ? (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-gray-500">Loading payments...</p>
                                        </div>
                                    ) : payments.length === 0 ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="text-center">
                                                <p className="text-gray-500 mb-2">No payments found for this member.</p>
                                                <button
                                                    onClick={handleAddPaymentClick}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Add a payment to get started
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="ag-theme-alpine h-full w-full p-2">
                                            <AgGridReact
                                                rowData={payments}
                                                columnDefs={paymentColumnDefs}
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
                                <p className="text-sm">Select a member from the left panel to view details and payment history</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Form Modal */}
            {isFormOpen && selectedMember && (
                <MemberPaymentForm
                    member={selectedMember}
                    paymentToEdit={selectedPayment}
                    onClose={handleFormClose}
                    onSubmit={handleFormSubmit}
                    loading={formLoading}
                    isViewer={isViewer}
                />
            )}

            {showBulkUploadModal && (
                <PaymentBulkUpload
                    onClose={() => setShowBulkUploadModal(false)}
                    onSuccess={handleBulkUploadSuccess}
                />
            )}
        </div>
    );
};

export default PaymentManagement;