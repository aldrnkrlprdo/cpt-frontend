import React, { useState, useEffect, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { User } from '../types/UserManagement.types';
import UserManagementForm from './UserManagementForm';
import { UserManagementService } from '../services/UserManagement.service';
import { toast } from 'react-toastify';
import { formatLocalStringDateAndTime, upperFirstLetter } from '../../../shared/components/helper';
import { EditIcon, TrashIcon } from '../../../shared/components/icons';

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await UserManagementService.getUsers();
            const mappedUsers = data.map((u: any) => ({ ...u, id: u._id || u.id }));
            setUsers(mappedUsers);
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const ActionsCellRenderer = (props: { data: User }) => {
        return (
            <div className="flex items-center justify-center h-full space-x-2">
                <button onClick={() => handleEdit(props.data)} title="Edit user" className="text-blue-600 hover:text-blue-800 transition">
                    <EditIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(props.data.id)} title="Delete user" className="text-red-600 hover:text-red-800 transition">
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
            cellRenderer: ActionsCellRenderer,
        },
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
            valueFormatter: params => (params.value ? upperFirstLetter(params.value) : ''),
            width: 150
        },
        {
            field: 'status',
            headerName: 'Status',
            sortable: true,
            filter: true,
            cellEditor: 'agSelectCellEditor',
            cellEditorParams: { values: ['active', 'inactive'] },
            valueFormatter: params => (params.value ? upperFirstLetter(params.value) : ''),
            width: 150
        },
        {
            field: 'createdAt',
            headerName: 'Date Created',
            sortable: true,
            filter: true,
            valueFormatter: params => formatLocalStringDateAndTime(params.value)
        }
    ];

    const handleEdit = (user: User) => {
        console.log('Edit user:', user);
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

    const handleSubmit = async (userData: Omit<User, 'dateCreated'>) => {
        console.log('Submit user:', userData);
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