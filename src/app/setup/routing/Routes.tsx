import React, { Suspense, lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute'; // Import PublicRoute

const Login = lazy(() => import('../../modules/login/components/Login'));
const Register = lazy(() => import('../../modules/login/components/Register'));
const Main = lazy(() => import('../../modules/main/components/Main'));
const MemberManagement = lazy(() => import('../../modules/member-management/components/MemberManagement'));
const PaymentManagement = lazy(() => import('../../modules/payment-management/components/PaymentManagement'));
const LoanManagement = lazy(() => import('../../modules/loan-management/components/LoanManagement'));
const UserManagement = lazy(() => import('../../modules/user-management/components/UserManagement'));
const Profile = lazy(() => import('../../modules/profile/components/Profile'));
const LoanTypeManagement = lazy(() => import('../../modules/master-record/loan-type/components/LoanTypeManagement'));
const BranchManagement = lazy(() => import('../../modules/master-record/branch/components/BranchManagement'));
const ReportsPage = lazy(() => import('../../modules/reports/components/ReportsPage'));

export const Routes: React.FC = () => {
  const routes = useRoutes([
    {
      path: '/',
      element: <PublicRoute />,
      children: [
        { path: 'login', element: <Login /> },
        { path: 'register', element: <Register /> },
        { path: '/', element: <Navigate to="/login" /> },
      ],
    },
    {
      path: '/*',
      element: <PrivateRoute />,
      children: [
        {
          path: '',
          element: <Main />,
          children: [
            { path: 'profile', element: <Profile /> },
            { path: 'members', element: <MemberManagement /> },
            { path: 'payment-management', element: <PaymentManagement /> },
            { path: 'loan-management', element: <LoanManagement /> },
            { path: 'user-management', element: <UserManagement /> },
            { path: 'master-record/loan-types', element: <LoanTypeManagement /> },
            { path: 'master-record/branches', element: <BranchManagement /> },
            { path: 'reports', element: <ReportsPage /> },
            { path: '*', element: <Navigate to="/payment-management" /> },
          ]
        }
      ],
    },
    {
      path: '*',
      element: <Navigate to="/login" />,
    },
  ]);

  return <Suspense fallback={<div>Loading...</div>}>{routes}</Suspense>;
};