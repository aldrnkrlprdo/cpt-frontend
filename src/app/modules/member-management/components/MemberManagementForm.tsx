import React, { useEffect, useState } from 'react';
import { Member } from '../types/MemberManagement.types';
import { useSelector } from 'react-redux';
import { selectBranches } from '../../master-record/redux/masterRecordSlice';
import AnimatedInput from '../../../shared/components/AnimatedInput';
import AnimatedSelect from '../../../shared/components/AnimatedSelect';
import AnimatedTextarea from '../../../shared/components/AnimatedTextarea';

interface Props {
  member: Member | null;
  onSubmit: (data: Omit<Member, 'dateOfJoining'>) => void;
  onClose: () => void;
  loading: boolean;
}

const MemberManagementForm: React.FC<Props> = ({ member, onSubmit, onClose, loading }) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{member ? 'Edit Member' : 'Add New Member'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatedInput
            id="employeeId"
            name="employeeId"
            label="Employee ID"
            value={form.employeeId}
            onChange={handleChange}
            required
            disabled={!!member}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnimatedInput
              id="firstName"
              name="firstName"
              label="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <AnimatedInput
              id="middleName"
              name="middleName"
              label="Middle Name"
              value={form.middleName}
              onChange={handleChange}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatedSelect
              id="branch"
              name="branch"
              label="Branch"
              value={form.branch}
              onChange={handleChange}
              required
            >
              <option value=""></option>
              {branches.map(branch => (
                <option key={branch.branchCode} value={branch.branchName}>{branch.branchName}</option>
              ))}
            </AnimatedSelect>
            <AnimatedSelect
              id="civilStatus"
              name="civilStatus"
              label="Civil Status"
              value={form.civilStatus}
              onChange={handleChange}
              required
            >
              <option value=""></option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
            </AnimatedSelect>
          </div>

          <AnimatedInput
            id="email"
            name="email"
            type="email"
            label="Email"
            value={form.email}
            onChange={handleChange}
          />

          <AnimatedInput
            id="phoneNumber"
            name="phoneNumber"
            label="Phone Number"
            value={form.phoneNumber}
            onChange={handleChange}
          />

          <AnimatedTextarea
            id="address"
            name="address"
            label="Address"
            value={typeof form.address === 'string' ? form.address : ''}
            onChange={handleChange}
            rows={2}
          />

          <AnimatedInput
            id="dateOfJoining"
            name="dateOfJoining"
            type="date"
            label="Date of Joining"
            value={typeof form.dateOfJoining === 'string' ? form.dateOfJoining : new Date(form.dateOfJoining).toISOString().split('T')[0]}
            onChange={handleChange}
            required
          />

          <AnimatedSelect
            id="membershipStatus"
            name="membershipStatus"
            label="Membership Status"
            value={form.membershipStatus}
            onChange={handleChange}
            required
          >
            <option value="Active">Active</option>
            <option value="Promoted">Promoted</option>
            <option value="Resigned">Resigned</option>
          </AnimatedSelect>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="nbs-button-secondary" disabled={loading}>Cancel</button>
            <button type="submit" className="nbs-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberManagementForm;