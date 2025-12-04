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
const MemberManagementForm_1 = __importDefault(require("./MemberManagementForm"));
const MemberManagement_service_1 = require("../services/MemberManagement.service");
const react_toastify_1 = require("react-toastify");
const MemberManagement = () => {
    const [members, setMembers] = (0, react_1.useState)([]);
    const [selectedMember, setSelectedMember] = (0, react_1.useState)(null);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const fetchMembers = (0, react_1.useCallback)(async () => {
        setLoading(true);
        try {
            const data = await MemberManagement_service_1.MemberManagementService.getMembers();
            setMembers(data);
        }
        catch (err) {
            react_toastify_1.toast.error('Failed to fetch members');
        }
        finally {
            setLoading(false);
        }
    }, []);
    (0, react_1.useEffect)(() => { fetchMembers(); }, [fetchMembers]);
    const handleEdit = (m) => { setSelectedMember(m); setIsModalOpen(true); };
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm('Delete member?');
        if (!confirmDelete)
            return;
        try {
            await MemberManagement_service_1.MemberManagementService.deleteMember(id);
            react_toastify_1.toast.success('Member deleted');
            fetchMembers();
        }
        catch {
            react_toastify_1.toast.error('Failed to delete member');
        }
    };
    const handleSubmit = async (data) => {
        setLoading(true);
        try {
            if (selectedMember) {
                await MemberManagement_service_1.MemberManagementService.updateMember(selectedMember.id, data);
                react_toastify_1.toast.success('Member updated');
            }
            else {
                await MemberManagement_service_1.MemberManagementService.createMember(data);
                react_toastify_1.toast.success('Member created');
            }
            setIsModalOpen(false);
            setSelectedMember(null);
            fetchMembers();
        }
        catch {
            react_toastify_1.toast.error('Failed to save member');
        }
        finally {
            setLoading(false);
        }
    };
    const columnDefs = [
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
            cellRenderer: (params) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => handleEdit(params.data), className: "text-blue-600", children: "Edit" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDelete(params.data.id), className: "text-red-600", children: "Delete" })] }))
        }
    ];
    return ((0, jsx_runtime_1.jsxs)("div", { className: "p-6", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between mb-4", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-bold", children: "Member Management" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setSelectedMember(null); setIsModalOpen(true); }, className: "nbs-button", disabled: loading, children: "Add New Member" })] }), (0, jsx_runtime_1.jsx)("div", { className: "ag-theme-alpine h-[600px] w-full", children: (0, jsx_runtime_1.jsx)(ag_grid_react_1.AgGridReact, { rowData: members, columnDefs: columnDefs, pagination: true, paginationPageSize: 10 }) }), isModalOpen && ((0, jsx_runtime_1.jsx)(MemberManagementForm_1.default, { member: selectedMember, onSubmit: handleSubmit, onClose: () => { setIsModalOpen(false); setSelectedMember(null); }, loading: loading }))] }));
};
exports.default = MemberManagement;
