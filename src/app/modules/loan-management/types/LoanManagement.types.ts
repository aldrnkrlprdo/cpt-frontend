
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
