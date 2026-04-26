export interface Payment {
    paymentId: string;
    employeeId: string;
    loanId: string;
    paymentDate: string;
    amountPaid: number;
    paymentType: string;
    notes?: string;
    dateCreated: string;
    isFullPayment?: boolean;
    interestRebate?: number;
}

export interface PaymentFormData {
    employeeId: string;
    paymentDate: string;
    amountPaid: number;
    loanId: string;
    paymentId: string;
    paymentType: string;
    notes?: string;
    isFullPayment?: boolean;
    interestRebate?: number;
}