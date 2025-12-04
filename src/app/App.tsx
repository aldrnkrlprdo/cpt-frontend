import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Routes } from './setup/routing/Routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Props = {
  basename: string;
};

const App: React.FC<Props> = ({ basename }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter basename={basename}>
        <Routes />
        <ToastContainer />
      </BrowserRouter>
    </Suspense>
  );
};

export { App };
