
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
  success: number;
  failed: number;
  errors: BulkUploadError[];
}

export interface BulkUploadError {
  row: number;
  employeeId: string;
  error: string;
}