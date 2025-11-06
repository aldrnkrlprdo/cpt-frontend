import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
// import AuthInit from './modules/auth/redux/AuthInit';
import { Routes } from './setup/routing/Routes';

type Props = {
  basename: string;
};

const App: React.FC<Props> = ({ basename }) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter basename={basename}>
        {/* <AuthInit> */}
        <Routes />
        {/* </AuthInit> */}
      </BrowserRouter>
    </Suspense>
  );
};

export { App };
