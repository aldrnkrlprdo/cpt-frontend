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
exports.Routes = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_redux_1 = require("react-redux");
const react_1 = __importDefault(require("react"));
const react_router_dom_1 = require("react-router-dom");
const MasterLayout_1 = __importDefault(require("../../modules/master-layout/MasterLayout"));
const Login = react_1.default.lazy(() => Promise.resolve().then(() => __importStar(require('../../modules/login/components/Login'))));
const Main = react_1.default.lazy(() => Promise.resolve().then(() => __importStar(require('../../modules/main/components/Main'))));
const MemberManagement = react_1.default.lazy(() => Promise.resolve().then(() => __importStar(require('../../modules/member-management/components/MemberManagement'))));
const Register = react_1.default.lazy(() => Promise.resolve().then(() => __importStar(require('../../modules/login/components/Register'))));
const UserManagement = react_1.default.lazy(() => Promise.resolve().then(() => __importStar(require('../../modules/user-management/components/UserManagement'))));
const Profile = react_1.default.lazy(() => Promise.resolve().then(() => __importStar(require('../../modules/profile/components/Profile'))));
const Routes = () => {
    const isAuthorized = (0, react_redux_1.useSelector)(({ auth }) => auth.loggedIn, react_redux_1.shallowEqual);
    return ((0, jsx_runtime_1.jsx)(react_1.default.Suspense, { fallback: null, children: (0, jsx_runtime_1.jsxs)(react_router_dom_1.Routes, { children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/login", element: (0, jsx_runtime_1.jsx)(Login, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/register", element: (0, jsx_runtime_1.jsx)(Register, {}) }), isAuthorized && ((0, jsx_runtime_1.jsxs)(react_router_dom_1.Route, { element: (0, jsx_runtime_1.jsx)(MasterLayout_1.default, {}), children: [(0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/", element: (0, jsx_runtime_1.jsx)(Main, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/members", element: (0, jsx_runtime_1.jsx)(MemberManagement, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/users", element: (0, jsx_runtime_1.jsx)(UserManagement, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "/profile", element: (0, jsx_runtime_1.jsx)(Profile, {}) }), (0, jsx_runtime_1.jsx)(react_router_dom_1.Route, { path: "*", element: (0, jsx_runtime_1.jsx)(react_router_dom_1.Navigate, { to: "/", replace: true }) })] }))] }) }));
};
exports.Routes = Routes;
