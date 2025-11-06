import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './app/App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store, { persistor } from './app/setup/redux/Store';
import { PersistGate } from 'redux-persist/integration/react';

const { PUBLIC_URL } = process.env;

const element = document.getElementById('root');

if (element) {
  const root = ReactDOM.createRoot(element as HTMLElement);

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          <App basename={PUBLIC_URL} />
        </PersistGate>
      </Provider>
    </React.StrictMode>
  );
}
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
