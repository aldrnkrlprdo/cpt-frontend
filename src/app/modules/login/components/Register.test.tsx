
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import axios from 'axios';

// Mock dependencies
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Register Component', () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    // Clear all mocks before each test
    mockedAxios.post.mockClear();
    mockedNavigate.mockClear();
    (jest.requireMock('react-toastify').toast.success as jest.Mock).mockClear();
    (jest.requireMock('react-toastify').toast.error as jest.Mock).mockClear();
  });

  it('should render the registration form correctly', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/last name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should show an error if passwords do not match', async () => {
    renderComponent();
    
    await userEvent.type(screen.getByPlaceholderText(/first name/i), 'John');
    await userEvent.type(screen.getByPlaceholderText(/last name/i), 'Doe');
    await userEvent.type(screen.getByPlaceholderText(/username/i), 'testuser');
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'test@test.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
    await userEvent.type(screen.getByPlaceholderText(/confirm password/i), 'password456');
  
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
  
    await waitFor(() => {
      expect(jest.requireMock('react-toastify').toast.error).toHaveBeenCalledWith(
        'Please fill required fields and ensure passwords match'
      );
    });
  });

  it('should successfully register a user and show a success message', async () => {
    renderComponent();
  
    mockedAxios.post.mockResolvedValue({ status: 200, data: { message: 'Success' } });
  
    await userEvent.type(screen.getByPlaceholderText(/first name/i), 'John');
    await userEvent.type(screen.getByPlaceholderText(/last name/i), 'Doe');
    await userEvent.type(screen.getByPlaceholderText(/username/i), 'johndoe');
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'john.doe@example.com');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password123');
    await userEvent.type(screen.getByPlaceholderText(/confirm password/i), 'password123');
    await userEvent.selectOptions(screen.getByLabelText(/role/i), 'user');
    await userEvent.selectOptions(screen.getByLabelText(/status/i), 'active');
  
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));
  
    // Wait for the primary async action (the API call) to complete.
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
      
    // Now that the API call has been made, we can synchronously assert its details
    // and the side effects that followed.
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String), // URL
      expect.objectContaining({ // Data payload
        username: 'johndoe',
        email: 'john.doe@example.com',
        role: 'user',
        status: 'active'
      }),
      expect.any(Object) // Axios config object
    );

    // Assert the success toast was shown.
    expect(jest.requireMock('react-toastify').toast.success).toHaveBeenCalledWith(
      'Registration successful. Please sign in.'
    );

    // Assert navigation was triggered.
    expect(mockedNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});
