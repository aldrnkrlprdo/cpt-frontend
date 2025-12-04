export type MemberRole = 'user' | 'admin';
export type MemberStatus = 'active' | 'inactive';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  dateCreated: string;
}