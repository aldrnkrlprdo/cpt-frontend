import React, { useEffect, useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Member } from '../types/MemberManagement.types';
import MemberManagementForm from './MemberManagementForm';
import { MemberManagementService } from '../services/MemberManagement.service';
import { toast } from 'react-toastify';
import { formatLocalStringDate, upperFirstLetter } from '../../../shared/components/helper';
import { EditIcon, TrashIcon } from '../../../shared/components/icons';

const MemberManagement: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await MemberManagementService.getMembers();
      setMembers(data);
    } catch (err) {
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleEdit = (m: Member) => { setSelectedMember(m); setIsModalOpen(true); };
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Delete member?');
    if (!confirmDelete) return;
    try {
      await MemberManagementService.deleteMember(id);
      toast.success('Member deleted');
      fetchMembers();
    } catch {
      toast.error('Failed to delete member');
    }
  };

  const handleSubmit = async (data: Omit<Member, 'dateOfJoining'>) => {
    setLoading(true);
    try {
      if (selectedMember) {
        await MemberManagementService.updateMember(selectedMember.employeeId, data);
        toast.success('Member updated');
      } else {
        await MemberManagementService.createMember(data);
        toast.success('Member created');
      }
      setIsModalOpen(false);
      setSelectedMember(null);
      fetchMembers();
    } catch {
      toast.error('Failed to save member');
    } finally {
      setLoading(false);
    }
  };

  const ActionsCellRenderer = (props: { data: Member }) => {
    return (
      <div className="flex items-center justify-center h-full space-x-2">
        <button onClick={() => handleEdit(props.data)} title="Edit user" className="text-blue-600 hover:text-blue-800 transition">
          <EditIcon className="w-5 h-5" />
        </button>
        <button onClick={() => handleDelete(props.data.employeeId)} title="Delete user" className="text-red-600 hover:text-red-800 transition">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Actions',
      pinned: 'left',
      width: 100,
      resizable: false,
      cellRenderer: ActionsCellRenderer
    },
    { field: 'employeeId', headerName: 'Employee ID', sortable: true, filter: true },
    { field: 'firstName', headerName: 'First Name', sortable: true, filter: true },
    { field: 'middleName', headerName: 'Middle Name', sortable: true, filter: true },
    { field: 'lastName', headerName: 'Last Name', sortable: true, filter: true },
    { field: 'branch', headerName: 'Branch', sortable: true, filter: true },
    { field: 'email', headerName: 'Email', sortable: true, filter: true },
    { field: 'phoneNumber', headerName: 'Phone Number', sortable: true, filter: true },
    { field: 'address', headerName: 'Address', sortable: true, filter: true },
    {
      field: 'membershipStatus',
      headerName: 'Status',
      sortable: true,
      filter: true,
      valueFormatter: params => params.value ? upperFirstLetter(params.value) : ''
    },
    {
      field: 'dateOfJoining',
      headerName: 'Employment Date',
      sortable: true,
      filter: true,
      valueFormatter: (params) => params.value ? formatLocalStringDate(params.value) : ''
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <button onClick={() => { setSelectedMember(null); setIsModalOpen(true); }} className="nbs-button" disabled={loading}>Add New Member</button>
      </div>

      <div className="ag-theme-alpine h-[600px] w-full">
        <AgGridReact rowData={members} columnDefs={columnDefs} pagination paginationPageSize={10} />
      </div>

      {isModalOpen && (
        <MemberManagementForm member={selectedMember} onSubmit={handleSubmit} onClose={() => { setIsModalOpen(false); setSelectedMember(null); }} loading={loading} />
      )}
    </div>
  );
};

export default MemberManagement;