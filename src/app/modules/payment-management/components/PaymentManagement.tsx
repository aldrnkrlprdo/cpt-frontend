
import React, { useEffect, useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { toast } from 'react-toastify';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

import { Member } from '../../member-management/types/MemberManagement.types';
import { PaymentManagementService } from '../services/PaymentManagement.service';
import MemberPaymentForm, { PaymentFormData } from './MemberPaymentForm';
import { PlusCircleIcon, EyeIcon } from '../../../shared/components/icons';
import { upperFirstLetter } from '../../../shared/components/helper';
import ViewPaymentsModal from './ViewPaymentsModal';

const PaymentManagement: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [isViewPaymentsModalOpen, setIsViewPaymentsModalOpen] = useState<boolean>(false);

  const [searchBy, setSearchBy] = useState('lastName');
  const [searchText, setSearchText] = useState('');

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await PaymentManagementService.getMembers(searchBy, searchText);
      setMembers(data.filter(members => members.membershipStatus === 'active'));
    } catch (error) {
      toast.error('Failed to fetch members.');
    } finally {
      setLoading(false);
    }
  }, [searchBy, searchText]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleAddPaymentClick = (member: Member) => {
    setSelectedMember(member);
    setIsFormOpen(true);
  };

  const handleViewPaymentsClick = (member: Member) => {
    setSelectedMember(member);
    setIsViewPaymentsModalOpen(true);
  };

  const handleViewPaymentsModalClose = () => {
    setIsViewPaymentsModalOpen(false);
    setSelectedMember(null);
  }

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedMember(null);
  };

  const handleFormSubmit = async (data: PaymentFormData) => {
    setFormLoading(true);
    try {
      // Assuming a service method to create a payment
      await PaymentManagementService.createPayment(data);
      toast.success(`Payment added for ${selectedMember?.firstName}`);
      handleFormClose();
      // Optionally, you might want to refresh some data here
    } catch (error) {
      toast.error('Failed to add payment.');
    } finally {
      setFormLoading(false);
    }
  };

  const ActionsCellRenderer = (props: { data: Member }) => {
    return (
      <div className="flex items-center justify-center h-full space-x-2">
        <button onClick={() => handleAddPaymentClick(props.data)} title="Add Payment" className="text-green-600 hover:text-green-800">
          <PlusCircleIcon className="w-5 h-5" />
        </button>
        <button onClick={() => handleViewPaymentsClick(props.data)} title="View Payments" className="text-blue-600 hover:text-blue-800">
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
    { headerName: 'Middle Name', field: 'middleName', sortable: true, filter: true },
    { headerName: 'Last Name', field: 'lastName', sortable: true, filter: true },
    { headerName: 'Branch', field: 'branch', sortable: true, filter: true },
    { headerName: 'Email', field: 'email', sortable: true, filter: true },
    { headerName: 'Status', field: 'membershipStatus', sortable: true, filter: true, valueFormatter: (params) => params.data.membershipStatus ? upperFirstLetter(params.data.membershipStatus) : '' },
  ];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Payment Management</h1>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
        <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)} className="nbs-input">
          <option value="firstName">First Name</option>
          <option value="middleName">Middle Name</option>
          <option value="lastName">Last Name</option>
          <option value="employeeId">Employee ID</option>
          <option value="email">Email</option>
          <option value="branch">Branch</option>
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
        <MemberPaymentForm
          member={selectedMember}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          loading={formLoading}
        />
      )}

      {isViewPaymentsModalOpen && selectedMember && (
        <ViewPaymentsModal
          member={selectedMember}
          onClose={handleViewPaymentsModalClose}
        />
      )}
    </div>
  );
};

export default PaymentManagement;
