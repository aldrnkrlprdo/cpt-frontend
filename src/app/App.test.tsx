import { App } from './App';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import store, { persistor } from './setup/redux/Store';
import { PersistGate } from 'redux-persist/integration/react';

const { PUBLIC_URL } = process.env;

test('renders login page for unauthenticated user', async () => {
  render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App basename={PUBLIC_URL} />
      </PersistGate>
    </Provider>
  );
  // The app should redirect to /login, so we check for an element on the login page.
  // The button text is "Sign In", not "Login".
  const loginButton = await screen.findByRole('button', { name: /sign in/i });
  expect(loginButton).toBeInTheDocument();
});
