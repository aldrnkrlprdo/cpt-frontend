import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Routes } from './setup/routing/Routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './setup/redux/Store';
import { fetchMasterRecords } from './modules/master-record/redux/masterRecordSlice';
import { AppDispatch } from './setup/redux/Store';
import AuthInit from './setup/auth/AuthInit';

type Props = {
  basename: string;
};

const App: React.FC<Props> = ({ basename }) => {
  const isAuthenticated = useSelector<RootState, boolean>(({ auth }) => auth.loggedIn);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMasterRecords() as any);
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter basename={basename}>
        <AuthInit>
          <Routes />
        </AuthInit>
        <ToastContainer />
      </BrowserRouter>
    </Suspense>
  );
};

export { App };
