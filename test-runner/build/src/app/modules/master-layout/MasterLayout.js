"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const Header_1 = __importDefault(require("./components/Header"));
const Footer_1 = __importDefault(require("./components/Footer"));
const Sidebar_1 = __importDefault(require("./components/Sidebar"));
const react_router_dom_1 = require("react-router-dom");
const MasterLayout = () => {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "min-h-screen flex flex-col", children: [(0, jsx_runtime_1.jsx)(Header_1.default, {}), (0, jsx_runtime_1.jsxs)("div", { className: "flex flex-1", children: [(0, jsx_runtime_1.jsx)(Sidebar_1.default, {}), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-auto p-6 bg-gray-50", children: (0, jsx_runtime_1.jsx)("div", { className: "mx-auto", children: (0, jsx_runtime_1.jsx)(react_router_dom_1.Outlet, {}) }) })] }), (0, jsx_runtime_1.jsx)(Footer_1.default, {})] }));
};
exports.default = MasterLayout;
