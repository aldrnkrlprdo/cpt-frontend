"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const react_redux_1 = require("react-redux");
const ProfileModal_1 = __importDefault(require("../../profile/components/ProfileModal"));
const Header = () => {
    const [open, setOpen] = (0, react_1.useState)(false);
    const [profileOpen, setProfileOpen] = (0, react_1.useState)(false); // added
    const menuRef = (0, react_1.useRef)(null);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const dispatch = (0, react_redux_1.useDispatch)();
    const authState = (0, react_redux_1.useSelector)((s) => s.auth);
    const isAuthorized = Boolean(authState === null || authState === void 0 ? void 0 : authState.loggedIn);
    const fullName = (authState === null || authState === void 0 ? void 0 : authState.fullName) || "";
    const initials = fullName
        ? fullName.split(" ").map((n) => n.charAt(0)).slice(0, 2).join("")
        : "U";
    (0, react_1.useEffect)(() => {
        const onDocClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);
    const handleLogout = () => {
        localStorage.removeItem("token");
        dispatch({ type: "auth/logout" });
        navigate("/login", { replace: true });
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("header", { className: "h-16 bg-nbs-red text-white flex items-center px-4 shadow-sm", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 w-full", children: [(0, jsx_runtime_1.jsxs)(react_router_dom_1.Link, { to: "/", className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-10 h-10 bg-white rounded-sm flex items-center justify-center text-nbs-red font-bold", children: "NB" }), (0, jsx_runtime_1.jsx)("div", { className: "text-lg font-semibold", children: "National Bookstore \u2013 CPT" })] }), (0, jsx_runtime_1.jsx)("div", { className: "ml-auto flex items-center gap-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "relative", ref: menuRef, children: [(0, jsx_runtime_1.jsx)("button", { "aria-haspopup": "true", "aria-expanded": open, onClick: () => setOpen(v => !v), className: "flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md", title: isAuthorized ? fullName || "Profile" : "Menu", children: isAuthorized ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-full bg-white text-nbs-red font-semibold flex items-center justify-center", children: initials }), (0, jsx_runtime_1.jsx)("span", { className: "hidden sm:inline", children: fullName })] })) : ((0, jsx_runtime_1.jsx)("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: (0, jsx_runtime_1.jsx)("path", { strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", d: "M4 6h16M4 12h16M4 18h16" }) })) }), open && ((0, jsx_runtime_1.jsxs)("div", { className: "absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded shadow-lg z-50", children: [(0, jsx_runtime_1.jsx)("div", { className: "px-3 py-2 border-b text-sm text-gray-600", children: isAuthorized ? fullName : "Welcome" }), (0, jsx_runtime_1.jsx)("ul", { className: "flex flex-col", children: isAuthorized ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/", onClick: () => setOpen(false), className: "block px-3 py-2 hover:bg-gray-100", children: "Home" }) }), (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)("button", { onClick: () => { setOpen(false); setProfileOpen(true); }, className: "w-full text-left px-3 py-2 hover:bg-gray-100", children: "Profile" }) }), (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)("button", { onClick: handleLogout, className: "w-full text-left px-3 py-2 hover:bg-gray-100", children: "Logout" }) })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/login", onClick: () => setOpen(false), className: "block px-3 py-2 hover:bg-gray-100", children: "Sign in" }) }), (0, jsx_runtime_1.jsx)("li", { children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Link, { to: "/register", onClick: () => setOpen(false), className: "block px-3 py-2 hover:bg-gray-100", children: "Register" }) })] })) })] }))] }) })] }) }), (0, jsx_runtime_1.jsx)(ProfileModal_1.default, { isOpen: profileOpen, onClose: () => setProfileOpen(false) })] }));
};
exports.default = Header;
