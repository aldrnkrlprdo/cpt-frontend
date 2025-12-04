export type UserRole = 'User' | 'Admin';
export type UserStatus = 'Active' | 'Inactive';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  dateCreated: string;
}