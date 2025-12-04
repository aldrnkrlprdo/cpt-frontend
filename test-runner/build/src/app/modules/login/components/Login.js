"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const axios_1 = __importDefault(require("axios"));
const react_redux_1 = require("react-redux");
const auth = __importStar(require("../redux/loginReducer"));
const react_router_dom_1 = require("react-router-dom");
const react_toastify_1 = require("react-toastify");
const LOGIN_URL = `${process.env.REACT_APP_BASE_API_URL}auth/login`;
const Login = () => {
    const [username, setUsername] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const dispatch = (0, react_redux_1.useDispatch)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    // Prevent state updates after unmount
    const mountedRef = (0, react_1.useRef)(true);
    (0, react_1.useEffect)(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);
    const handleLogin = async (e) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        if (e)
            e.preventDefault();
        if (!username.trim() || !password) {
            react_toastify_1.toast.error("Please enter username and password");
            return;
        }
        setLoading(true);
        const controller = new AbortController();
        try {
            const resp = await axios_1.default.post(LOGIN_URL, { username: username.trim(), password });
            const data = (_a = resp === null || resp === void 0 ? void 0 : resp.data) !== null && _a !== void 0 ? _a : {};
            // normalize token / user shapes
            const token = (data === null || data === void 0 ? void 0 : data.token) ||
                (data === null || data === void 0 ? void 0 : data.accessToken) ||
                ((_b = data === null || data === void 0 ? void 0 : data.data) === null || _b === void 0 ? void 0 : _b.token) ||
                ((_c = data === null || data === void 0 ? void 0 : data.data) === null || _c === void 0 ? void 0 : _c.accessToken);
            const user = (data === null || data === void 0 ? void 0 : data.user) ||
                ((_d = data === null || data === void 0 ? void 0 : data.data) === null || _d === void 0 ? void 0 : _d.user) ||
                (data === null || data === void 0 ? void 0 : data.data) ||
                data;
            if (!token) {
                const message = (data === null || data === void 0 ? void 0 : data.message) || "Authentication failed: token not returned";
                throw new Error(message);
            }
            // persist token (used by api service interceptors)
            localStorage.setItem("token", token);
            const payload = {
                loggedIn: true,
                userId: ((_f = (_e = user === null || user === void 0 ? void 0 : user.id) !== null && _e !== void 0 ? _e : user === null || user === void 0 ? void 0 : user.userId) !== null && _f !== void 0 ? _f : "1").toString(),
                fullName: ((_g = user === null || user === void 0 ? void 0 : user.fullName) !== null && _g !== void 0 ? _g : `${(_h = user === null || user === void 0 ? void 0 : user.firstName) !== null && _h !== void 0 ? _h : ""} ${(_j = user === null || user === void 0 ? void 0 : user.lastName) !== null && _j !== void 0 ? _j : ""}`).trim() || username,
                accessToken: token
            };
            dispatch(auth.login(payload));
            react_toastify_1.toast.success("Logged in");
            navigate("/", { replace: true });
        }
        catch (err) {
            if (axios_1.default.isCancel(err)) {
                // request cancelled — ignore
                return;
            }
            const message = ((_l = (_k = err === null || err === void 0 ? void 0 : err.response) === null || _k === void 0 ? void 0 : _k.data) === null || _l === void 0 ? void 0 : _l.message) || (err === null || err === void 0 ? void 0 : err.message) || "Login failed";
            react_toastify_1.toast.error(message);
            console.error("Login error:", err);
        }
        finally {
            if (mountedRef.current)
                setLoading(false);
            controller.abort();
        }
    };
    return ((0, jsx_runtime_1.jsx)("div", { className: "min-h-screen flex items-center justify-center bg-nbs-gray", children: (0, jsx_runtime_1.jsxs)("div", { className: "bg-white p-8 rounded-lg shadow-lg w-full max-w-md", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center mb-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-16 h-16 bg-nbs-red rounded-lg mx-auto flex items-center justify-center mb-3", children: (0, jsx_runtime_1.jsx)("span", { className: "text-white font-display font-bold text-2xl", children: "NB" }) }), (0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-display font-bold text-nbs-text", children: "Sign in" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 text-sm", children: "Cooperative Payment Tracker" })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleLogin, className: "space-y-4", "aria-labelledby": "login-form", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "username", className: "block text-sm font-medium text-gray-700 mb-1", children: "Username" }), (0, jsx_runtime_1.jsx)("input", { id: "username", name: "username", type: "text", className: "nbs-input", value: username, onChange: (e) => setUsername(e.target.value), disabled: loading, autoComplete: "username", required: true })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }), (0, jsx_runtime_1.jsx)("input", { id: "password", name: "password", type: "password", className: "nbs-input", value: password, onChange: (e) => setPassword(e.target.value), disabled: loading, autoComplete: "current-password", required: true })] }), (0, jsx_runtime_1.jsx)("button", { type: "submit", className: "nbs-button w-full flex items-center justify-center gap-2", disabled: loading, "aria-busy": loading, children: loading ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("svg", { className: "animate-spin h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", "aria-hidden": "true", children: [(0, jsx_runtime_1.jsx)("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), (0, jsx_runtime_1.jsx)("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" })] }), "Signing in..."] })) : 'Sign In' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center mt-4", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm text-gray-600", children: "Don't have an account? " }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/register", className: "text-nbs-red font-semibold hover:underline ml-1", children: "Register" })] })] }) }));
};
exports.default = Login;
