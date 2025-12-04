"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
require("ag-grid-community/styles/ag-grid.css");
require("ag-grid-community/styles/ag-theme-quartz.css");
require("ag-grid-community/styles/ag-theme-balham.css");
require("ag-grid-community/styles/ag-theme-quartz.css");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const Routes_1 = require("./setup/routing/Routes");
const react_toastify_1 = require("react-toastify");
require("react-toastify/dist/ReactToastify.css");
const App = ({ basename }) => {
    return ((0, jsx_runtime_1.jsx)(react_1.Suspense, { fallback: (0, jsx_runtime_1.jsx)("div", { children: "Loading..." }), children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.BrowserRouter, { basename: basename, children: [(0, jsx_runtime_1.jsx)(Routes_1.Routes, {}), (0, jsx_runtime_1.jsx)(react_toastify_1.ToastContainer, {})] }) }));
};
exports.App = App;
