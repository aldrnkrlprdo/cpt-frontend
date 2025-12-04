import React, { useEffect, useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Member } from '../types/MemberManagement.types';
import MemberManagementForm from './MemberManagementForm';
import { MemberManagementService } from '../services/MemberManagement.service';
import { toast } from 'react-toastify';

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

  const handleSubmit = async (data: Omit<Member, 'id' | 'dateCreated'>) => {
    setLoading(true);
    try {
      if (selectedMember) {
        await MemberManagementService.updateMember(selectedMember.id, data);
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

  const columnDefs: ColDef[] = [
    { field: 'firstName', headerName: 'First Name', sortable: true, filter: true },
    { field: 'lastName', headerName: 'Last Name', sortable: true, filter: true },
    { field: 'email', headerName: 'Email', sortable: true, filter: true },
    {
      field: 'role',
      headerName: 'Role',
      sortable: true,
      filter: true,
      valueFormatter: params => params.value ? String(params.value).charAt(0).toUpperCase() + String(params.value).slice(1) : ''
    },
    {
      field: 'status',
      headerName: 'Status',
      sortable: true,
      filter: true,
      valueFormatter: params => params.value ? String(params.value).charAt(0).toUpperCase() + String(params.value).slice(1) : ''
    },
    { field: 'dateCreated', headerName: 'Date Created', sortable: true, filter: true },
    {
      headerName: 'Actions',
      cellRenderer: (params: any) => (
        <div className="flex gap-2">
          <button onClick={() => handleEdit(params.data)} className="text-blue-600">Edit</button>
          <button onClick={() => handleDelete(params.data.id)} className="text-red-600">Delete</button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Member Management</h1>
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