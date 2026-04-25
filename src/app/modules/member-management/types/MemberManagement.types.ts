export type MembershipStatus = 'active' | 'inactive' | 'suspended' | 'resigned';

export interface Member {
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  branch: string;
  email: string;
  phoneNumber?: string;
  membershipStatus: 'Active' | 'Resigned' | 'Promoted';
  civilStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  address: string;
  dateOfJoining: Date | string;
}