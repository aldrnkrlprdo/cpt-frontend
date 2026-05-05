import React, { useEffect, useState } from 'react';
import { Member } from '../types/MemberManagement.types';
import { useSelector } from 'react-redux';
import { selectBranches } from '../../master-record/redux/masterRecordSlice';

interface Props {
  member: Member | null;
  onSubmit: (data: Omit<Member, 'dateOfJoining'>) => void;
  onClose: () => void;
  loading: boolean;
  isViewer?: boolean;
}

const MemberManagementForm: React.FC<Props> = ({ member, onSubmit, onClose, loading, isViewer = false }) => {
  const branches = useSelector(selectBranches);
  const [form, setForm] = useState<Omit<Member, 'dateOfJoining'> & { dateOfJoining: Date | string }>({
    employeeId: '',
    firstName: '',
    middleName: '',
    lastName: '',
    branch: '',
    email: '',
    phoneNumber: '',
    address: '',
    civilStatus: 'Single',
    membershipStatus: 'Active',
    dateOfJoining: new Date(),
  });

  useEffect(() => {
    if (member) {
      setForm({
        ...member,
        dateOfJoining: member.dateOfJoining ? new Date(member.dateOfJoining).toISOString().split('T')[0] : '',
      });
    }
  }, [member]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-bold text-gray-800">
            {member ? (isViewer ? 'View Member' : 'Edit Member') : 'Add New Member'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700 mb-2">
              Employee ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="employeeId"
              name="employeeId"
              value={form.employeeId}
              onChange={handleChange}
              required
              disabled={!!member || isViewer}
              placeholder="Enter employee ID"
              className="nbs-input w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                disabled={isViewer}
                placeholder="Enter first name"
                className="nbs-input w-full"
              />
            </div>

            <div>
              <label htmlFor="middleName" className="block text-sm font-medium text-gray-700 mb-2">
                Middle Name
              </label>
              <input
                type="text"
                id="middleName"
                name="middleName"
                value={form.middleName}
                onChange={handleChange}
                disabled={isViewer}
                placeholder="Enter middle name"
                className="nbs-input w-full"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                disabled={isViewer}
                placeholder="Enter last name"
                className="nbs-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                id="branch"
                name="branch"
                value={form.branch}
                onChange={handleChange}
                required
                disabled={isViewer}
                className="nbs-input w-full"
              >
                <option value="">Select branch</option>
                {branches.map(branch => (
                  <option key={branch.branchCode} value={branch.branchName}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="civilStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Civil Status <span className="text-red-500">*</span>
              </label>
              <select
                id="civilStatus"
                name="civilStatus"
                value={form.civilStatus}
                onChange={handleChange}
                required
                disabled={isViewer}
                className="nbs-input w-full"
              >
                <option value="">Select civil status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={isViewer}
                placeholder="Enter email address"
                className="nbs-input w-full"
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                disabled={isViewer}
                placeholder="Enter phone number"
                className="nbs-input w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              disabled={isViewer}
              placeholder="Enter complete address"
              rows={3}
              className="nbs-input w-full resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dateOfJoining" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Joining <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dateOfJoining"
                name="dateOfJoining"
                value={form.dateOfJoining instanceof Date ? form.dateOfJoining.toISOString().split('T')[0] : form.dateOfJoining}
                onChange={handleChange}
                required
                disabled={isViewer}
                className="nbs-input w-full"
              />
            </div>

            <div>
              <label htmlFor="membershipStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Membership Status <span className="text-red-500">*</span>
              </label>
              <select
                id="membershipStatus"
                name="membershipStatus"
                value={form.membershipStatus}
                onChange={handleChange}
                required
                disabled={isViewer}
                className="nbs-input w-full"
              >
                <option value="Active">Active</option>
                <option value="Promoted">Promoted</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="nbs-button-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            {!isViewer && (
              <button
                type="submit"
                className="nbs-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : member ? 'Update Member' : 'Add Member'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberManagementForm;