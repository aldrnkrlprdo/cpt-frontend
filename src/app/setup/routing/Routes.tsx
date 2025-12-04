import { shallowEqual, useSelector } from 'react-redux';
import React from 'react';
import { Navigate, Route, Routes as Switch } from 'react-router-dom'
import MasterLayout from '../../modules/master-layout/MasterLayout';
import { RootState } from '../redux/RootReducer';

const Login = React.lazy(() => import('../../modules/login/components/Login'));
const Main = React.lazy(() => import('../../modules/main/components/Main'));
const MemberManagement = React.lazy(() => import('../../modules/member-management/components/MemberManagement'));
const Register = React.lazy(() => import('../../modules/login/components/Register'));
const UserManagement = React.lazy(() => import('../../modules/user-management/components/UserManagement'));
const Profile = React.lazy(() => import('../../modules/profile/components/Profile'));

const Routes: React.FC = () => {
    const isAuthorized = useSelector<RootState, boolean>(({ auth }) => auth.loggedIn, shallowEqual)

    return (
        <React.Suspense fallback={null}>
            <Switch>
                {isAuthorized ? (
                    <>
                        {/* Protected routes - wrapped by MasterLayout */}
                        <Route element={<MasterLayout />}>
                            <Route path="/" element={<Main />} />
                            <Route path="/members" element={<MemberManagement />} />
                            <Route path="/users" element={<UserManagement />} />
                            <Route path="/profile" element={<Profile />} />
                            {/* add other protected routes here as nested children */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </>
                ) : (
                    <>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        {/* Redirect all other paths to login */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </>
                )}
            </Switch>
        </React.Suspense>
    )
}

export { Routes }