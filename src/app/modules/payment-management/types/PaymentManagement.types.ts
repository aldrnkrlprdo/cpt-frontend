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

export interface ValidationError {
    row: number;
    employeeId?: string;
    loanId?: string;
    paymentId?: string;
    errors?: string[];
    message?: string;
}

export interface ParsedPayment {
    employeeId: string;
    loanId: string;
    paymentId: string;
    paymentDate: string;
    amountPaid: number;
    paymentType: string;
    isFullPayment: boolean;
    interestRebate: number;
    notes?: string;
}

export interface BulkPaymentUploadData {
    employeeId: string;
    loanId: string;
    paymentId: string;
    paymentDate: string;
    amountPaid: number;
    paymentType: string;
    isFullPayment: boolean;
    interestRebate?: number;
    notes?: string;
}

export interface BulkUploadError {
    row: number;
    employeeId?: string;
    loanId?: string;
    paymentId?: string;
    amountPaid?: number;
    paymentType?: string;
    message: string;
}

export interface BulkUploadResult {
    success: number;
    failed: number;
    errors: any[];
}

export interface ProgressUploadResult extends BulkUploadResult {
    total: number;
    processed: number;
}