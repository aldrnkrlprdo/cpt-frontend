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
        { field: 'email', headerName: 'Email', sortable: true, filter: true },
        { field: 'role', headerName: 'Role', sortable: true, filter: true },
        { field: 'status', headerName: 'Status', sortable: true, filter: true },
        { field: 'dateCreated', headerName: 'Date Created', sortable: true, filter: true },
        {
            headerName: 'Actions',
            cellRenderer: (params: any) => (
                <div className="flex gap-2">
                    <button 
                        onClick={() => handleEdit(params.data)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Edit
                    </button>
                    <button 
                        onClick={() => handleDelete(params.data.id)}
                        className="text-red-600 hover:text-red-800"
                    >
                        Delete
                    </button>
                </div>
            )
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