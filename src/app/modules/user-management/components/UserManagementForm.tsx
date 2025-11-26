import React, { useEffect, useState } from 'react';
import { User, UserRole, UserStatus } from '../types/UserManagement.types';

interface Props {
  user?: User | null;
  onSubmit: (data: Omit<User, 'id' | 'dateCreated'>) => void;
  onClose: () => void;
  loading?: boolean;
}

const roleOptions: UserRole[] = ['user', 'admin'];
const statusOptions: UserStatus[] = ['active', 'inactive'];

const UserManagementForm: React.FC<Props> = ({ user, onSubmit, onClose, loading = false }) => {
  const [form, setForm] = useState<Omit<User, 'id' | 'dateCreated'>>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    role: 'user',
    status: 'active'
  });
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status
      });
    } else {
      setForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        role: 'user',
        status: 'active'
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{user ? 'Edit User' : 'Add New User'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">First Name</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} className="nbs-input" required />
          </div>

          <div>
            <label className="block text-sm mb-1">Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} className="nbs-input" required />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="nbs-input" required/>
          </div>

          <div>
            <label className="block text-sm mb-1">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="nbs-input">
              {roleOptions.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="nbs-input">
              {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
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