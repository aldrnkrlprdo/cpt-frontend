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

export interface BulkUploadResult {
  success: Member[];
  failed: {
    member: Partial<Member>;
    error: string;
  }[];
}

export interface ValidationResult {
  valid: Partial<Member>[];
  invalid: {
    member: Partial<Member>;
    errors: string[];
  }[];
}

export interface BulkUploadProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
}