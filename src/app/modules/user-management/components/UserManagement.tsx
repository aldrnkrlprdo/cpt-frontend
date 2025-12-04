import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { User } from '../types/UserManagement.types';
import UserManagementForm from './UserManagementForm';
import { UserManagementService } from '../services/UserManagement.service';
import { toast } from 'react-toastify';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await UserManagementService.getUsers();
            setUsers(data);
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const columnDefs: ColDef[] = [
        { field: 'firstName', headerName: 'First Name', sortable: true, filter: true },
        { field: 'lastName', headerName: 'Last Name', sortable: true, filter: true },
        { field: 'username', headerName: 'Username', sortable: true, filter: true }, // added
        { field: 'email', headerName: 'Email', sortable: true, filter: true },
        {
            field: 'role',
            headerName: 'Role',
            sortable: true,
            filter: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: ['user', 'admin'] },
            valueFormatter: params => (params.value ? String(params.value).charAt(0).toUpperCase() + String(params.value).slice(1) : ''),
            width: 150
        },
        {
            field: 'status',
            headerName: 'Status',
            sortable: true,
            filter: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: ['active', 'inactive'] },
            valueFormatter: params => (params.value ? String(params.value).charAt(0).toUpperCase() + String(params.value).slice(1) : ''),
            width: 150
        },
        { field: 'createdAt', headerName: 'Date Created', sortable: true, filter: true },
        {
            headerName: 'Actions',
            cellRenderer: (params: any) => (
                <div className="flex gap-3 items-center justify-left h-full">
                    <button 
                        onClick={() => handleEdit(params.data)}
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="Edit user"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button 
                        onClick={() => handleDelete(params.data.id)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete user"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ),
            width: 150
        }
    ];

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                setLoading(true);
                await UserManagementService.deleteUser(id);
                toast.success('User deleted successfully');
                fetchUsers(); // Refresh the list
            } catch (error) {
                toast.error('Failed to delete user');
                console.error('Error deleting user:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (userData: Omit<User, 'id' | 'dateCreated'>) => {
        try {
            setLoading(true);
            if (selectedUser) {
                await UserManagementService.updateUser(selectedUser.id, userData);
                toast.success('User updated successfully');
            } else {
                await UserManagementService.createUser(userData);
                toast.success('User created successfully');
            }
            fetchUsers(); // Refresh the list
            setIsModalOpen(false);
            setSelectedUser(null);
        } catch (error) {
            toast.error(selectedUser ? 'Failed to update user' : 'Failed to create user');
            console.error('Error saving user:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">User Management</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="nbs-button"
                    disabled={loading}
                >
                    Add New User
                </button>
            </div>

            <div className="ag-theme-alpine h-[600px] w-full">
                <AgGridReact
                    rowData={users}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={10}
                    loadingOverlayComponent={'Loading...'}
                    overlayLoadingTemplate={
                        '<span class="ag-overlay-loading-center">Loading...</span>'
                    }
                />
            </div>

            {isModalOpen && (
                <UserManagementForm
                    user={selectedUser}
                    onSubmit={handleSubmit}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedUser(null);
                    }}
                    loading={loading}
                />
            )}
        </div>
    );
};

export default UserManagement;