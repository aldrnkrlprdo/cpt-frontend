import { shallowEqual, useSelector } from 'react-redux';
import React from 'react';
import { Navigate, Route, Routes as Switch } from 'react-router-dom'
import MasterLayout from '../../modules/master-layout/MasterLayout';
import { RootState } from '../redux/RootReducer';

const Login = React.lazy(() => import('../../modules/login/components/Login'));
const Main = React.lazy(() => import('../../modules/main/components/Main'));
const UsersManagement = React.lazy(() => import('../../modules/user-management/components/UserManagement'));
const Register = React.lazy(() => import('../../modules/login/components/Register'));

const Routes: React.FC = () => {
    const isAuthorized = useSelector<RootState>(({ auth }) => auth.loggedIn, shallowEqual)

    return (
        <React.Suspense fallback={null}>
            <Switch>
                {/* Public route - not wrapped by MasterLayout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes - wrapped by MasterLayout */}
                {isAuthorized ? (
                    <Route element={<MasterLayout />}>
                        <Route path="/" element={<Main />} />
                        <Route path="/users" element={<UsersManagement />} />
                        {/* add other protected routes here as nested children */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                ) : (
                    /* redirect any non-login route to login when not authorized */
                    <Route path="*" element={<Navigate to="/login" replace />} />
                )}
            </Switch>
        </React.Suspense>
    )
}

export { Routes };