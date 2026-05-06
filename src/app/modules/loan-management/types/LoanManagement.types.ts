
export interface Loan {
  loanId: string; // Loan_ID
  employeeId: string; // Employee_ID
  branch: string; // Branch
  loanType: string; // Loan_Type
  loanDate: string; // Loan_Date
  loanAmount: number; // Loan_Amount
  maturityDate: string; // Maturity_Date
  loanTerm: number; // Loan_Term
  interest: number; // Interest
  totalPayable: number; // Total_Payable
  monthlyPayment: number; // Monthly_Payment
  dateCreated?: string;
  employee?: {
    firstName: string;
    lastName: string;
  };
  status: string;
  remainingBalance: number;
}
export interface BulkLoanUploadData {
  loanId?: string; // Add optional loanId field
  employeeId: string;
  branch: string;
  loanType: string;
  loanDate: string;
  loanAmount: number;
  maturityDate: string;
  loanTerm: number;
  interest: number;
  status?: string;
}

export interface BulkUploadResult {
  message: string;
  successCount: number;
  failedCount: number;
  failed: Array<{
    loan: BulkLoanUploadData;
    error: BulkUploadError;
  }>;
}

export interface BulkUploadError {
  row: number;
  employeeId: string;
  loanId: string;
  message: string;
}

export interface ValidationError {
  row: number;
  message: string;
  loanId?: string;
  employeeId?: string;
  errors?: string[];
}

export interface ParsedLoan {
  loanId: string;
  employeeId: string;
  branch: string;
  loanType: string;
  loanDate: string;
  loanAmount: number;
  maturityDate: string;
  loanTerm: number;
  interest: number;
  principalBalance?: number;
  interestBalance?: number;
  totalBalance?: number;
  amountPaid?: number;
  status?: string;
  notes?: string;
}

export interface ProgressUploadResult extends BulkUploadResult {
  total: number;
  processed: number;
}