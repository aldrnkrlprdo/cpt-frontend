export type MembershipStatus = 'active' | 'inactive' | 'suspended' | 'resigned';

export interface Member {
  employeeId: string;
  branch: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  membershipStatus: MembershipStatus;
  dateOfJoining: Date;
  address: string;
  phoneNumber?: string;
}