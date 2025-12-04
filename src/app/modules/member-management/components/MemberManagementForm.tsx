import React, { useEffect, useState } from 'react';
import { Member } from '../types/MemberManagement.types';

interface Props {
  member?: Member | null;
  onSubmit: (data: Omit<Member, 'id' | 'dateCreated'>) => void;
  onClose: () => void;
  loading?: boolean;
}

const MemberManagementForm: React.FC<Props> = ({ member, onSubmit, onClose, loading = false }) => {
  const [form, setForm] = useState<Omit<Member, 'id' | 'dateCreated'>>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    status: 'active'
  });

  useEffect(() => {
    if (member) {
      setForm({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        role: member.role,
        status: member.status
      });
    } else {
      setForm({ firstName: '', lastName: '', email: '', role: 'user', status: 'active' });
    }
  }, [member]);

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
        <h2 className="text-xl font-bold mb-4">{member ? 'Edit Member' : 'Add New Member'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="firstName" value={form.firstName} onChange={handleChange} className="nbs-input" placeholder="First name" required />
            <input name="lastName" value={form.lastName} onChange={handleChange} className="nbs-input" placeholder="Last name" required />
          </div>
          <div>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="nbs-input" placeholder="Email" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="nbs-input">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="nbs-input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md" disabled={loading}>Cancel</button>
            <button type="submit" className="nbs-button" disabled={loading}>{loading ? (member ? 'Updating...' : 'Creating...') : (member ? 'Update' : 'Create')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberManagementForm;