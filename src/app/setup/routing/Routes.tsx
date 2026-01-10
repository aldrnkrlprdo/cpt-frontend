import PrivateRoute from './PrivateRoute';
import { authService } from '../../core/services/auth.service';
import { Navigate, Route, Routes as Switch } from 'react-router-dom'
import React, { Suspense, lazy } from 'react';

const Login = lazy(() => import('../../modules/login/components/Login'));
const Register = lazy(() => import('../../modules/login/components/Register'));
const Main = lazy(() => import('../../modules/main/components/Main'));
const MemberManagement = lazy(() => import('../../modules/member-management/components/MemberManagement'));
const PaymentManagement = lazy(() => import('../../modules/payment-management/components/PaymentManagement'));
const LoanManagement = lazy(() => import('../../modules/loan-management/components/LoanManagement'));
const UserManagement = lazy(() => import('../../modules/user-management/components/UserManagement'));
const Profile = lazy(() => import('../../modules/profile/components/Profile'));

export const Routes: React.FC = () => {

    return (
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
        <Switch>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Main />}>
              <Route index element={<Navigate to="/payment-management" />} />
              <Route path="members" element={<MemberManagement />} />
              <Route path="payment-management" element={<PaymentManagement />} />
              <Route path="loan-management" element={<LoanManagement />} />
              {authService.isAdmin() && (
                <Route path="user-management" element={<UserManagement />} />
              )}
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Switch>
      </Suspense>
  );
}