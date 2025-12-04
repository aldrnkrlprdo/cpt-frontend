"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MemberManagementForm = ({ member, onSubmit, onClose, loading = false }) => {
    const [form, setForm] = (0, react_1.useState)({
        firstName: '',
        lastName: '',
        email: '',
        role: 'user',
        status: 'active'
    });
    (0, react_1.useEffect)(() => {
        if (member) {
            setForm({
                firstName: member.firstName,
                lastName: member.lastName,
                email: member.email,
                role: member.role,
                status: member.status
            });
        }
        else {
            setForm({ firstName: '', lastName: '', email: '', role: 'user', status: 'active' });
        }
    }, [member]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!loading)
            onSubmit(form);
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg w-full max-w-md", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-xl font-bold mb-4", children: member ? 'Edit Member' : 'Add New Member' }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSubmit, className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)("input", { name: "firstName", value: form.firstName, onChange: handleChange, className: "nbs-input", placeholder: "First name", required: true }), (0, jsx_runtime_1.jsx)("input", { name: "lastName", value: form.lastName, onChange: handleChange, className: "nbs-input", placeholder: "Last name", required: true })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("input", { name: "email", type: "email", value: form.email, onChange: handleChange, className: "nbs-input", placeholder: "Email" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm mb-1", children: "Role" }), (0, jsx_runtime_1.jsxs)("select", { name: "role", value: form.role, onChange: handleChange, className: "nbs-input", children: [(0, jsx_runtime_1.jsx)("option", { value: "user", children: "User" }), (0, jsx_runtime_1.jsx)("option", { value: "admin", children: "Admin" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm mb-1", children: "Status" }), (0, jsx_runtime_1.jsxs)("select", { name: "status", value: form.status, onChange: handleChange, className: "nbs-input", children: [(0, jsx_runtime_1.jsx)("option", { value: "active", children: "Active" }), (0, jsx_runtime_1.jsx)("option", { value: "inactive", children: "Inactive" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-2 mt-4", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClose, className: "px-4 py-2 border rounded-md", disabled: loading, children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "nbs-button", disabled: loading, children: loading ? (member ? 'Updating...' : 'Creating...') : (member ? 'Update' : 'Create') })] })] })] }) }));
};
exports.default = MemberManagementForm;
