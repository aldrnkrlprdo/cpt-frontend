export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'inactive';

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