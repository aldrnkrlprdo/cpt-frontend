"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ag_grid_react_1 = require("ag-grid-react");
require("ag-grid-community/styles/ag-grid.css");
require("ag-grid-community/styles/ag-theme-alpine.css");
const UserManagementForm_1 = __importDefault(require("./UserManagementForm"));
const UserManagement_service_1 = require("../services/UserManagement.service");
const react_toastify_1 = require("react-toastify");
const UserManagement = () => {
    const [users, setUsers] = (0, react_1.useState)([]);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [selectedUser, setSelectedUser] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await UserManagement_service_1.UserManagementService.getUsers();
            setUsers(data);
        }
        catch (error) {
            react_toastify_1.toast.error('Failed to fetch users');
            console.error('Error fetching users:', error);
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchUsers();
    }, []);
    const columnDefs = [
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
            cellRenderer: (params) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-3 items-center justify-left h-full", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleEdit(params.data), className: "text-blue-600 hover:text-blue-800 transition", title: "Edit user", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDelete(params.data.id), className: "text-red-600 hover:text-red-800 transition", title: "Delete user", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }) })] })),
            width: 150
        }
    ];
    const handleEdit = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                setLoading(true);
                await UserManagement_service_1.UserManagementService.deleteUser(id);
                react_toastify_1.toast.success('User deleted successfully');
                fetchUsers(); // Refresh the list
            }
            catch (error) {
                react_toastify_1.toast.error('Failed to delete user');
                console.error('Error deleting user:', error);
            }
            finally {
                setLoading(false);
            }
        }
    };
    const handleSubmit = async (userData) => {
        try {
            setLoading(true);
            if (selectedUser) {
                await UserManagement_service_1.UserManagementService.updateUser(selectedUser.id, userData);
                react_toastify_1.toast.success('User updated successfully');
            }
            else {
                await UserManagement_service_1.UserManagementService.createUser(userData);
                react_toastify_1.toast.success('User created successfully');
            }
            fetchUsers(); // Refresh the list
            setIsModalOpen(false);
            setSelectedUser(null);
        }
        catch (error) {
            react_toastify_1.toast.error(selectedUser ? 'Failed to update user' : 'Failed to create user');
            console.error('Error saving user:', error);
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold", children: "User Management" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setIsModalOpen(true), className: "nbs-button", disabled: loading, children: "Add New User" })] }), (0, jsx_runtime_1.jsx)("div", { className: "ag-theme-alpine h-[600px] w-full", children: (0, jsx_runtime_1.jsx)(ag_grid_react_1.AgGridReact, { rowData: users, columnDefs: columnDefs, pagination: true, paginationPageSize: 10, loadingOverlayComponent: 'Loading...', overlayLoadingTemplate: '<span class="ag-overlay-loading-center">Loading...</span>' }) }), isModalOpen && ((0, jsx_runtime_1.jsx)(UserManagementForm_1.default, { user: selectedUser, onSubmit: handleSubmit, onClose: () => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                }, loading: loading }))] }));
};
exports.default = UserManagement;
