export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'member';
    status: 'active' | 'inactive';
    dateCreated: string;
}