import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { RootState } from '../redux/RootReducer';

const PublicRoute: React.FC = () => {
  const isAuthorized = useSelector<RootState, boolean>(({ auth }) => auth.loggedIn, shallowEqual);

  if (isAuthorized) {
    // Redirect them to the main page if they are already logged in
    return <Navigate to="/payment-management" />;
  }

  return <Outlet />;
};

export default PublicRoute;