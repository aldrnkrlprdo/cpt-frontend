"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_router_dom_1 = require("react-router-dom");
const links = [
    { to: "/", label: "Dashboard", icon: ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" }) })) },
    { to: "/members", label: "Members", icon: ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M16 11c1.657 0 3-1.343 3-3S17.657 5 16 5s-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3zM8 13c-2.667 0-8 1.333-8 4v2h16v-2c0-2.667-5.333-4-8-4zM16 13c-.29 0-.577.02-.86.06 1.58.89 2.86 2.19 2.86 3.94v2h6v-2c0-2.667-5.333-4-8-4z" }) })) },
    { to: "/payments", label: "Payments", icon: ((0, jsx_runtime_1.jsx)("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", children: (0, jsx_runtime_1.jsx)("path", { d: "M21 8V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v1M3 12h18M7 16h.01M11 16h6" }) })) },
];
const Sidebar = () => {
    return ((0, jsx_runtime_1.jsx)("aside", { className: "hidden md:block md:w-72 lg:w-80 border-r border-gray-200", style: { background: "rgb(249 250 251 / var(--tw-bg-opacity, 1))" }, children: (0, jsx_runtime_1.jsx)("div", { className: "mt-10 ml-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "shadow-md overflow-hidden h-[calc(100vh-8rem)] flex flex-col", children: [(0, jsx_runtime_1.jsxs)("nav", { className: "pt-12 pb-12 overflow-auto flex-1", children: [" ", (0, jsx_runtime_1.jsx)("ul", { className: "space-y-3", children: links.map((l) => ((0, jsx_runtime_1.jsx)("li", { className: "w-full", children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.NavLink, { to: l.to, end: l.to === '/', className: ({ isActive }) => `flex items-center px-4 gap-4 py-3 text-sm font-medium transition w-full ${ /* removed px-4, rounded-lg; added justify-center */isActive ? 'bg-nbs-red/10 text-nbs-red' : 'text-gray-700 hover:bg-gray-50'}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "text-gray-400 flex-shrink-0", children: l.icon }), (0, jsx_runtime_1.jsx)("span", { children: l.label })] }) }, l.to))) })] }), (0, jsx_runtime_1.jsx)("div", { className: "h-6 flex-shrink-0" })] }) }) }));
};
exports.default = Sidebar;
