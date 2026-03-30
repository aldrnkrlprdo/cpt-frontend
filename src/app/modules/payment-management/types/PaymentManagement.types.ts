export interface Payment {
    paymentId: string;
    employeeId: string;
    loanId: string;
    paymentDate: string;
    amountPaid: number;
    paymentType: string;
    notes?: string;
    dateCreated: string;
}