"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const axios_1 = __importDefault(require("axios"));
const react_router_dom_1 = require("react-router-dom");
const react_toastify_1 = require("react-toastify");
const REGISTER_URL = `${process.env.REACT_APP_BASE_API_URL}auth/register`;
const Register = () => {
    const [firstName, setFirstName] = (0, react_1.useState)("");
    const [lastName, setLastName] = (0, react_1.useState)("");
    const [username, setUsername] = (0, react_1.useState)("");
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [confirmPassword, setConfirmPassword] = (0, react_1.useState)("");
    const [role, setRole] = (0, react_1.useState)("user"); // added
    const [status, setStatus] = (0, react_1.useState)("active"); // added
    const [loading, setLoading] = (0, react_1.useState)(false);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const mountedRef = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);
    const handleRegister = async (e) => {
        var _a, _b;
        if (e)
            e.preventDefault();
        if (!username.trim() || !password || password !== confirmPassword) {
            react_toastify_1.toast.error("Please fill required fields and ensure passwords match");
            return;
        }
        setLoading(true);
        const controller = new AbortController();
        try {
            const resp = await axios_1.default.post(REGISTER_URL, {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                username: username.trim(),
                email: email.trim(),
                password,
                role, // included
                status // included
            }, {
                signal: controller.signal,
                headers: { "Content-Type": "application/json" }
            });
            if (resp.status === 200) {
                react_toastify_1.toast.success("Registration successful. Please sign in.");
                navigate("/login", { replace: true });
            }
        }
        catch (err) {
            const message = ((_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || (err === null || err === void 0 ? void 0 : err.message) || "Registration failed";
            react_toastify_1.toast.error(message);
            console.error("Register error:", err);
        }
        finally {
            if (mountedRef.current)
                setLoading(false);
            controller.abort();
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-nbs-gray", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-8 rounded-lg shadow-lg w-full max-w-md", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center mb-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-16 h-16 bg-nbs-red rounded-lg mx-auto flex items-center justify-center mb-3", children: (0, jsx_runtime_1.jsx)("span", { className: "text-white font-display font-bold text-2xl", children: "NB" }) }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-display font-bold text-nbs-text", children: "Create account" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm", children: "Cooperative Payment Tracker" })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleRegister, className: "space-y-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsx)("input", { className: "nbs-input", placeholder: "First name", value: firstName, onChange: e => setFirstName(e.target.value), required: true }), (0, jsx_runtime_1.jsx)("input", { className: "nbs-input", placeholder: "Last name", value: lastName, onChange: e => setLastName(e.target.value), required: true })] }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("input", { className: "nbs-input", placeholder: "Username", value: username, onChange: e => setUsername(e.target.value), required: true }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("input", { type: "email", className: "nbs-input", placeholder: "Email", value: email, onChange: e => setEmail(e.target.value), required: true }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("input", { type: "password", className: "nbs-input", placeholder: "Password", value: password, onChange: e => setPassword(e.target.value), required: true }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("input", { type: "password", className: "nbs-input", placeholder: "Confirm password", value: confirmPassword, onChange: e => setConfirmPassword(e.target.value), required: true }) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-2 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Role" }), (0, jsx_runtime_1.jsxs)("select", { className: "nbs-input", value: role, onChange: e => setRole(e.target.value), "aria-label": "Role", children: [(0, jsx_runtime_1.jsx)("option", { value: "user", children: "User" }), (0, jsx_runtime_1.jsx)("option", { value: "admin", children: "Admin" })] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium mb-1", children: "Status" }), (0, jsx_runtime_1.jsxs)("select", { className: "nbs-input", value: status, onChange: e => setStatus(e.target.value), "aria-label": "Status", children: [(0, jsx_runtime_1.jsx)("option", { value: "active", children: "Active" }), (0, jsx_runtime_1.jsx)("option", { value: "inactive", children: "Inactive" })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-end gap-2 mt-4", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => navigate("/login"), className: "px-4 py-2 border rounded-md hover:bg-gray-100", disabled: loading, children: "Back to Sign in" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "nbs-button", disabled: loading, children: loading ? "Creating..." : "Create account" })] })] })] }) }));
};
exports.default = Register;
