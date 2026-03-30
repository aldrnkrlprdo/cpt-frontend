import React, { useEffect, useState } from 'react';
import { Member } from '../types/MemberManagement.types';
import { useSelector } from 'react-redux';
import { selectBranches } from '../../master-record/redux/masterRecordSlice';

interface Props {
  member?: Member | null;
  onSubmit: (data: Member) => void;
  onClose: () => void;
  loading?: boolean;
}

const MemberManagementForm: React.FC<Props> = ({ member, onSubmit, onClose, loading = false }) => {
  const branches = useSelector(selectBranches);
  const [form, setForm] = useState<Member>({
    employeeId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    branch: '',
    email: '',
    phoneNumber: '',
    membershipStatus: 'active',
    address: '',
    dateOfJoining: new Date()
  });

  useEffect(() => {
    if (member) {
      setForm({
        employeeId: member.employeeId,
        firstName: member.firstName,
        middleName: member.middleName || '',
        lastName: member.lastName,
        branch: member.branch || '',
        email: member.email,
        phoneNumber: member.phoneNumber || '',
        membershipStatus: member.membershipStatus,
        address: member.address,
        dateOfJoining: member.dateOfJoining,
      });
    } else {
      setForm({ employeeId: '', firstName: '', middleName: '', lastName: '', branch: '', email: '', phoneNumber: '', membershipStatus: 'active', address: '', dateOfJoining: new Date() });
    }
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'dateOfJoining') {
      setForm(prev => ({ ...prev, [name]: new Date(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
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
          <div>
            <input name="employeeId" value={form.employeeId} onChange={handleChange} className="nbs-input" placeholder="Employee ID" required disabled={!!member} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="firstName" value={form.firstName} onChange={handleChange} className="nbs-input" placeholder="First name" required />
            <input name="middleName" value={form.middleName} onChange={handleChange} className="nbs-input" placeholder="Middle name" />
            <input name="lastName" value={form.lastName} onChange={handleChange} className="nbs-input" placeholder="Last name" required />
            <select name="branch" value={form.branch} onChange={handleChange} className="nbs-input">
              <option value="">Select Branch</option>
              {branches.map(branch => (
                <option key={branch.branchCode} value={branch.branchName}>{branch.branchName}</option>
              ))}
            </select>
          </div>
          <div>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="nbs-input" placeholder="Email" />
          </div>

          <div>
            <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="nbs-input" placeholder="Phone Number" />
          </div>

          <div>
            <textarea name="address" value={typeof form.address === 'string' ? form.address : ''} onChange={handleChange} className="nbs-input" placeholder="Address" rows={3}></textarea>
          </div>

          <div>
            <input name="dateOfJoining" type="date" value={form.dateOfJoining ? new Date(form.dateOfJoining).toLocaleDateString('en-CA') : ''} onChange={handleChange} className="nbs-input" placeholder="Date of Joining" />
          </div>

          <div>
            <label className="block text-sm mb-1">Status</label>
            <select name="membershipStatus" value={form.membershipStatus} onChange={handleChange} className="nbs-input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="resigned">Resigned</option>
            </select>
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