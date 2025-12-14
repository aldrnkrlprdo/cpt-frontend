export type MemberStatus = 'active' | 'inactive';

export interface Member {
  membershipId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: MemberStatus;
  dateCreated: string;
}