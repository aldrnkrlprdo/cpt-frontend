"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_toastify_1 = require("react-toastify");
const api_service_1 = require("../../../core/services/api.service");
const parseTokenPayload = (token) => {
    if (!token)
        return null;
    try {
        const parts = token.split('.');
        if (parts.length < 2)
            return null;
        return JSON.parse(atob(parts[1]));
    }
    catch {
        return null;
    }
};
const ProfileModal = ({ isOpen, onClose }) => {
    const mountedRef = (0, react_1.useRef)(true);
    const [data, setData] = (0, react_1.useState)({
        firstName: '',
        lastName: '',
        username: '', // added
        email: '',
        role: 'user',
        status: 'active'
    });
    const [loading, setLoading] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        mountedRef.current = true;
        if (!isOpen)
            return;
        const load = async () => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            setLoading(true);
            const token = localStorage.getItem('token') || undefined;
            const payload = parseTokenPayload(token);
            const id = (payload === null || payload === void 0 ? void 0 : payload.id) || (payload === null || payload === void 0 ? void 0 : payload.userId);
            try {
                let resp;
                try {
                    resp = await api_service_1.api.get('/auth/me');
                }
                catch (err) {
                    if (id)
                        resp = await api_service_1.api.get(`/users/${id}`);
                    else
                        throw err;
                }
                if (mountedRef.current && (resp === null || resp === void 0 ? void 0 : resp.data)) {
                    setData({
                        id: (_b = (_a = resp.data.id) !== null && _a !== void 0 ? _a : resp.data.userId) !== null && _b !== void 0 ? _b : id,
                        firstName: (_d = (_c = resp.data.firstName) !== null && _c !== void 0 ? _c : resp.data.first_name) !== null && _d !== void 0 ? _d : '',
                        lastName: (_f = (_e = resp.data.lastName) !== null && _e !== void 0 ? _e : resp.data.last_name) !== null && _f !== void 0 ? _f : '',
                        username: (_g = resp.data.username) !== null && _g !== void 0 ? _g : '', // added
                        email: (_h = resp.data.email) !== null && _h !== void 0 ? _h : '',
                        role: (_j = resp.data.role) !== null && _j !== void 0 ? _j : 'user',
                        status: (_k = resp.data.status) !== null && _k !== void 0 ? _k : 'active'
                    });
                }
            }
            catch (err) {
                console.error('Failed to load profile', err);
                react_toastify_1.toast.error('Failed to load profile');
            }
            finally {
                if (mountedRef.current)
                    setLoading(false);
            }
        };
        load();
        return () => { mountedRef.current = false; };
    }, [isOpen]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };
    const handleSave = async (e) => {
        var _a, _b;
        if (e)
            e.preventDefault();
        setLoading(true);
        try {
            try {
                await api_service_1.api.put('/auth/me', {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    username: data.username, // added
                    email: data.email,
                    role: data.role,
                    status: data.status
                });
            }
            catch {
                if (!data.id)
                    throw new Error('No user id for update');
                await api_service_1.api.put(`/users/${data.id}`, {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    username: data.username, // added
                    email: data.email,
                    role: data.role,
                    status: data.status
                });
            }
            react_toastify_1.toast.success('Profile updated');
            onClose();
        }
        catch (err) {
            console.error('Save profile failed', err);
            const msg = ((_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || (err === null || err === void 0 ? void 0 : err.message) || 'Update failed';
            react_toastify_1.toast.error(msg);
        }
        finally {
            setLoading(false);
        }
    };
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-6 rounded-lg w-full max-w-md shadow-lg", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center mb-4", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-2xl font-semibold", children: "Profile" }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) }) })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleSave, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "First name" }), (0, jsx_runtime_1.jsx)("input", { name: "firstName", value: data.firstName, onChange: handleChange, className: "nbs-input", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Last name" }), (0, jsx_runtime_1.jsx)("input", { name: "lastName", value: data.lastName, onChange: handleChange, className: "nbs-input", required: true })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Username" }), (0, jsx_runtime_1.jsx)("input", { name: "username", value: data.username, onChange: handleChange, className: "nbs-input", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Email" }), (0, jsx_runtime_1.jsx)("input", { name: "email", type: "email", value: data.email, onChange: handleChange, className: "nbs-input" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Role" }), (0, jsx_runtime_1.jsxs)("select", { name: "role", value: data.role, onChange: handleChange, className: "nbs-input", children: [(0, jsx_runtime_1.jsx)("option", { value: "user", children: "User" }), (0, jsx_runtime_1.jsx)("option", { value: "admin", children: "Admin" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Status" }), (0, jsx_runtime_1.jsxs)("select", { name: "status", value: data.status, onChange: handleChange, className: "nbs-input", children: [(0, jsx_runtime_1.jsx)("option", { value: "active", children: "Active" }), (0, jsx_runtime_1.jsx)("option", { value: "inactive", children: "Inactive" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-2 mt-6", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onClose, className: "px-4 py-2 border rounded-md", disabled: loading, children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "nbs-button", disabled: loading, children: loading ? 'Saving...' : 'Save' })] })] })] }) }));
};
exports.default = ProfileModal;
