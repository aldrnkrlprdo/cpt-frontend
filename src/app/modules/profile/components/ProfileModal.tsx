import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../../core/services/api.service';

type Role = 'user' | 'admin';
type Status = 'active' | 'inactive';

interface ProfileData {
  id?: string;
  firstName: string;
  lastName: string;
  username: string; // added
  email?: string;
  role?: Role;
  status?: Status;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const parseTokenPayload = (token?: string) => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
};

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const mountedRef = useRef(true);
  const [data, setData] = useState<ProfileData>({ 
    firstName: '', 
    lastName: '', 
    username: '', // added
    email: '', 
    role: 'user', 
    status: 'active' 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    if (!isOpen) return;

    const load = async () => {
      setLoading(true);
      const token = localStorage.getItem('token') || undefined;
      const payload = parseTokenPayload(token);
      const id = payload?.id || payload?.userId;

      try {
        let resp;
        try {
          resp = await api.get('/auth/me');
        } catch (err) {
          if (id) resp = await api.get(`/users/${id}`);
          else throw err;
        }
        if (mountedRef.current && resp?.data) {
          setData({
            id: resp.data.id ?? resp.data.userId ?? id,
            firstName: resp.data.firstName ?? resp.data.first_name ?? '',
            lastName: resp.data.lastName ?? resp.data.last_name ?? '',
            username: resp.data.username ?? '', // added
            email: resp.data.email ?? '',
            role: resp.data.role ?? 'user',
            status: resp.data.status ?? 'active'
          });
        }
      } catch (err: any) {
        console.error('Failed to load profile', err);
        toast.error('Failed to load profile');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    load();
    return () => { mountedRef.current = false; };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      try {
        await api.put('/auth/me', {
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username, // added
          email: data.email,
          role: data.role,
          status: data.status
        });
      } catch {
        if (!data.id) throw new Error('No user id for update');
        await api.put(`/users/${data.id}`, {
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username, // added
          email: data.email,
          role: data.role,
          status: data.status
        });
      }
      toast.success('Profile updated');
      onClose();
    } catch (err: any) {
      console.error('Save profile failed', err);
      const msg = err?.response?.data?.message || err?.message || 'Update failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">First name</label>
              <input name="firstName" value={data.firstName} onChange={handleChange} className="nbs-input" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Last name</label>
              <input name="lastName" value={data.lastName} onChange={handleChange} className="nbs-input" required />
            </div>
          </div>

          {/* added username field */}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input name="username" value={data.username} onChange={handleChange} className="nbs-input" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input name="email" type="email" value={data.email} onChange={handleChange} className="nbs-input" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select name="role" value={data.role} onChange={handleChange} className="nbs-input">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select name="status" value={data.status} onChange={handleChange} className="nbs-input">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="nbs-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;