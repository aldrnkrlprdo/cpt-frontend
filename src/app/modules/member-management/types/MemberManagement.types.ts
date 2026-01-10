export type MembershipStatus = 'active' | 'inactive' | 'suspended' | 'resigned';

export interface Member {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  membershipStatus: MembershipStatus;
  dateOfJoining: Date;
  address: string;
  phoneNumber?: string;
}