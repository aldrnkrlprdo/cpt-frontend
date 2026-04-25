import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Member } from '../../member-management/types/MemberManagement.types';
import { Payment } from '../types/PaymentManagement.types';
import { PaymentManagementService } from '../services/PaymentManagement.service';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import MemberPaymentForm from './MemberPaymentForm';
import { EditIcon, TrashIcon } from '../../../shared/components/icons';
import { PaymentFormData } from '../types/PaymentManagement.types';

interface Props {
    member: Member;
    onClose: () => void;
}

const ViewPaymentsModal: React.FC<Props> = ({ member, onClose }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPayments = useCallback(async () => {
        setLoading(true);
        try {
            const memberPayments = await PaymentManagementService.getPaymentsByEmployeeId(member.employeeId);
            setPayments(memberPayments);
        } catch (error) {
            console.error('Failed to fetch payment data:', error);
            toast.error('Failed to fetch payment data for this member.');
        } finally {
            setLoading(false);
        }
    }, [member.employeeId]);

    useEffect(() => {
        fetchPayments();
    }, [member.employeeId, fetchPayments]);

    const handleEditPaymentClick = (payment: Payment) => {
        setEditingPayment(payment);
    };

    const handleDeletePaymentClick = async (paymentId: string) => {
        if (window.confirm('Are you sure you want to delete this payment?')) {
            try {
                await PaymentManagementService.deletePayment(paymentId);
                toast.success('Payment deleted successfully!');
                fetchPayments(); // Refresh the list
            } catch (error) {
                toast.error('Failed to delete payment.');
                console.error('Delete payment error:', error);
                setLoading(false);
            }
        }
    };

    const handleUpdatePayment = async (formData: PaymentFormData) => {
        if (!editingPayment?.paymentId) return;
        setIsSubmitting(true);
        try {
            await PaymentManagementService.updatePayment(editingPayment.paymentId, formData);
            toast.success('Payment updated successfully!');
            setEditingPayment(null);
            fetchPayments(); // Refresh the list
        } catch (error) {
            toast.error('Failed to update payment.');
            console.error('Update payment error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const ActionsCellRenderer: React.FC<ICellRendererParams> = ({ data }) => (
        <div className="flex items-center justify-center h-full gap-2">
            <div className="flex items-center justify-center h-full space-x-2">
                <button onClick={() => handleEditPaymentClick(data)} title="Edit Payment" className="text-green-600 hover:text-green-800">
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleDeletePaymentClick(data.paymentId)} title="Delete Payment" className="text-blue-600 hover:text-blue-800">
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

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
        { headerName: 'Payment ID', field: 'paymentId', sortable: true, filter: true },
        {
            headerName: 'Payment Date',
            field: 'paymentDate',
            sortable: true,
            filter: true,
            valueFormatter: params => new Date(params.value).toLocaleDateString()
        },
        {
            headerName: 'Amount',
            field: 'amountPaid',
            sortable: true,
            filter: 'agNumberColumnFilter',
            valueFormatter: params => params.value.toFixed(2)
        },
        { headerName: 'Payment Type', field: 'paymentType', sortable: true, filter: true },
        { headerName: 'Reference No', field: 'loanId', sortable: true, filter: true },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl z-50 w-full max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Payments for {member.firstName} {member.lastName}</h2>
                    <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                {loading ? (
                    <p>Loading payments...</p>
                ) : (
                    <div className="ag-theme-alpine h-[60vh] w-full">
                        <AgGridReact
                            rowData={payments}
                            columnDefs={columnDefs}
                            pagination={true}
                            paginationPageSize={20}
                            suppressRowClickSelection={true}
                            overlayLoadingTemplate='<span class="ag-overlay-loading-center">Loading...</span>'
                            noRowsOverlayComponent={() => 'No payments found for this member.'}
                        />
                    </div>
                )}
                {editingPayment && (
                    <MemberPaymentForm
                        member={member}
                        paymentToEdit={editingPayment}
                        onSubmit={handleUpdatePayment}
                        onClose={() => setEditingPayment(null)}
                        loading={isSubmitting}
                    />
                )}
            </div>
        </div>
    );
};

export default ViewPaymentsModal;