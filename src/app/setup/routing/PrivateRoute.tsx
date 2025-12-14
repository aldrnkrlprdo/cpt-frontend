
import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { RootState } from '../redux/RootReducer';

const PrivateRoute: React.FC = () => {
  const isAuthorized = useSelector<RootState, boolean>(({ auth }) => auth.loggedIn, shallowEqual);

  if (!isAuthorized) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they login.
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default PrivateRoute;
