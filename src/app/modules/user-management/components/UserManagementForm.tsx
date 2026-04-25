import { User, UserRole, UserStatus } from '../types/UserManagement.types';
import React, { useEffect, useState } from 'react';
import AnimatedInput from '../../../shared/components/AnimatedInput';
import AnimatedSelect from '../../../shared/components/AnimatedSelect';

interface Props {
  user?: User | null;
  onSubmit: (data: Omit<User, 'dateCreated'>) => void;
  onClose: () => void;
  loading?: boolean;
}

const roleOptions: UserRole[] = ['User', 'Admin'];
const statusOptions: UserStatus[] = ['Active', 'Inactive'];

const UserManagementForm: React.FC<Props> = ({ user, onSubmit, onClose, loading = false }) => {
  const [form, setForm] = useState<Omit<User, 'dateCreated'> & { password?: string; confirmPassword?: string }>({
    id: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'User',
    status: 'Active',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      console.log('UserManagementForm: user is defined ', user, user.id);
      setForm({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } else {
      setForm({
        id: '',
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        role: 'User',
        status: 'Active',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (!loading) onSubmit(form);
  };

  const roleSelectOptions = roleOptions.map(role => ({
    value: role.toLowerCase(),
    label: role
  }));

  const statusSelectOptions = statusOptions.map(status => ({
    value: status.toLowerCase(),
    label: status
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{user ? 'Edit User' : 'Add New User'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <AnimatedInput
              id="firstName"
              name="firstName"
              label="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <AnimatedInput
              id="lastName"
              name="lastName"
              label="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <AnimatedInput
            id="username"
            name="username"
            label="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <AnimatedInput
            id="email"
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <div className="space-y-3">
            <label className="block text-sm font-medium">{user ? 'Change Password (optional)' : 'Password'}</label>
            <div className="grid grid-cols-2 gap-3">
              <AnimatedInput
                id="password"
                name="password"
                label="New Password"
                type="password"
                value={form.password || ''}
                onChange={handleChange}
                required={!user}
              />
              <AnimatedInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={form.confirmPassword || ''}
                onChange={handleChange}
                required={!user}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AnimatedSelect
              id="role"
              name="role"
              label="Role"
              value={form.role.toLowerCase()}
              onChange={handleChange}
              options={roleSelectOptions}
              required
            />

            <AnimatedSelect
              id="status"
              name="status"
              label="Status"
              value={form.status.toLowerCase()}
              onChange={handleChange}
              options={statusSelectOptions}
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md" disabled={loading}>Cancel</button>
            <button type="submit" className="nbs-button" disabled={loading}>
              {loading ? (user ? 'Updating...' : 'Creating...') : (user ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementForm;