import { formatLocalStringDateAndTime, upperFirstLetter } from '../../../shared/components/helper';
import { AgGridReact } from 'ag-grid-react';
import { toast } from 'react-toastify';
import React, { useState, useEffect, useCallback } from 'react';
import { UserManagementService } from '../services/UserManagement.service';
import { EditIcon, TrashIcon } from '../../../shared/components/icons';
import UserManagementForm from './UserManagementForm';
import { User } from '../types/UserManagement.types';
import { ColDef } from 'ag-grid-community';
import { useSelector } from 'react-redux';
import { RootState } from '../../../setup/redux/RootReducer';
import { useNavigate } from 'react-router-dom';

const UserManagement: React.FC = () => {
    const navigate = useNavigate();
    const role = useSelector<RootState, string | undefined>(({ auth }) => auth.role);
    const isAdmin = role === 'admin';
    
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Redirect non-admin users
        if (role && !isAdmin) {
            toast.error('Access denied. Admin privileges required.');
            navigate('/payment-management');
        }
    }, [role, isAdmin, navigate]);

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
        if (isAdmin) {
            fetchUsers();
        }
    }, [fetchUsers, isAdmin]);

    const ActionsCellRenderer = (props: { data: User }) => {
        if (!isAdmin) return null;
        
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
        ...(isAdmin ? [{
            headerName: 'Actions',
            pinned: 'left' as const,
            width: 100,
            resizable: false,
            cellRenderer: ActionsCellRenderer,
        }] : []),
        { field: 'firstName', headerName: 'First Name', sortable: true, filter: true },
        { field: 'lastName', headerName: 'Last Name', sortable: true, filter: true },
        { field: 'username', headerName: 'Username', sortable: true, filter: true },
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
        if (!isAdmin) return;
        console.log('Edit user:', user);
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin) return;
        
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                setLoading(true);
                await UserManagementService.deleteUser(id);
                toast.success('User deleted successfully');
                fetchUsers();
            } catch (error) {
                toast.error('Failed to delete user');
                console.error('Error deleting user:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (userData: Omit<User, 'dateCreated'>) => {
        if (!isAdmin) return;
        
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
            fetchUsers();
            setIsModalOpen(false);
            setSelectedUser(null);
        } catch (error) {
            toast.error(selectedUser ? 'Failed to update user' : 'Failed to create user');
            console.error('Error saving user:', error);
        } finally {
            setLoading(false);
        }
    };

    // Don't render anything if not admin
    if (!isAdmin) {
        return null;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-bold">User Management</h1>
                {isAdmin && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="nbs-button"
                        disabled={loading}
                    >
                        Add New User
                    </button>
                )}
            </div>

            <div className="ag-theme-alpine h-[600px] w-full">
                <AgGridReact
                    rowData={users}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeSelector={[10, 20, 50, 100]}
                    loadingOverlayComponent={'Loading...'}
                    overlayLoadingTemplate={
                        '<span class="ag-overlay-loading-center">Loading...</span>'
                    }
                />
            </div>

            {isModalOpen && isAdmin && (
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