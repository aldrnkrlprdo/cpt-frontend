
import React, { useState, useRef } from 'react';
import { DownloadIcon, XIcon } from '../../../shared/components/icons';
import { PaymentManagementService } from '../services/PaymentManagement.service';
import { toast } from 'react-toastify';
import { ValidationError, ParsedPayment, BulkPaymentUploadData, BulkUploadResult, BulkUploadError } from '../types/PaymentManagement.types';
import * as XLSX from 'xlsx';
import { useSelector } from 'react-redux';
import { selectLoanTypes } from '../../master-record/redux/masterRecordSlice';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

const PaymentBulkUpload: React.FC<Props> = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [parsedPayments, setParsedPayments] = useState<ParsedPayment[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ total: 0, processed: 0, successful: 0, failed: 0 });
    const [showResults, setShowResults] = useState(false);
    const [uploadResults, setUploadResults] = useState<BulkUploadResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loanTypes = useSelector(selectLoanTypes);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        clearUpload();
        if (selectedFile) {
            const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
            if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
                toast.error('Please upload a CSV or Excel file');
                return;
            }
            setFile(selectedFile);
        }
    };

    const parseFile = async (file: File): Promise<ParsedPayment[]> => {
        const errors: ValidationError[] = [];
        const payments: ParsedPayment[] = [];

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

            jsonData.forEach((row: any, index: number) => {
                const rowNumber = index + 2;
                const rowErrors: string[] = [];

                // Validate required fields
                if (!row['Employee ID'] || !row['Employee ID'].toString().trim()) {
                    rowErrors.push('Employee ID is required');
                }
                if (!row['Payment Date'] || !row['Payment Date'].toString().trim()) {
                    rowErrors.push('Payment Date is required');
                }
                if (!row['Amount Paid'] || isNaN(parseFloat(row['Amount Paid']))) {
                    rowErrors.push('Valid Amount Paid is required');
                }
                if (!row['Payment Type'] || !row['Payment Type'].toString().trim()) {
                    rowErrors.push('Payment Type is required');
                }

                // Validate payment date format
                const dateStr = row['Payment Date']?.toString().trim();
                if (dateStr && !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                    rowErrors.push('Payment Date must be in YYYY-MM-DD format');
                }

                // Validate amount
                const amount = parseFloat(row['Amount Paid']);
                if (!isNaN(amount) && amount <= 0) {
                    rowErrors.push('Amount Paid must be greater than 0');
                }

                // Validate payment type
                const validPaymentTypes = ['1', '2'];
                const paymentType = row['Payment Type']?.toString().trim();
                const normalizedPaymentType = paymentType?.charAt(0).toUpperCase() + paymentType?.slice(1).toLowerCase();
                if (paymentType && !validPaymentTypes.includes(normalizedPaymentType) && normalizedPaymentType !== "Contribution" && normalizedPaymentType !== '0') {
                    rowErrors.push(`Payment Type must be one of: ${validPaymentTypes.join(', ')}`);
                }

                // Parse isFullPayment
                const isFullPaymentStr = row['Is Fullpayment?']?.toString().toLowerCase().trim();
                const isFullPayment = isFullPaymentStr === 'true' || isFullPaymentStr === 'yes' || isFullPaymentStr === '1';

                // Parse interestRebate
                const interestRebate = parseFloat(row['Interest Rebate'] || '0');
                if (isNaN(interestRebate) || interestRebate < 0) {
                    rowErrors.push('Interest Rebate must be a non-negative number');
                }

                // If there are errors for this row, add them to validation errors
                if (rowErrors.length > 0) {
                    errors.push({
                        row: rowNumber,
                        message: rowErrors.join('; '),
                        employeeId: row['Employee ID']?.toString().trim() || '-',
                        loanId: row['Loan ID']?.toString().trim() || '-',
                        paymentId: row['Payment ID']?.toString().trim() || '-',
                        errors: rowErrors
                    });
                } else {
                    // If no errors, add to valid payments
                    payments.push({
                        employeeId: row['Employee ID'].toString().trim(),
                        loanId: row['Loan ID']?.toString().trim() || '',
                        paymentId: row['Payment ID'].toString().trim(),
                        paymentDate: dateStr,
                        amountPaid: amount,
                        paymentType: normalizedPaymentType === '0' || normalizedPaymentType === "Contribution" ? "Contribution" : loanTypes.filter(x => x.loanTypeCode === normalizedPaymentType)[0].loanTypeName,
                        isFullPayment,
                        interestRebate,
                        notes: row['Notes']?.toString().trim() || undefined,
                    });
                }
            });

            setValidationErrors(errors);
            return payments;
        } catch (error) {
            console.error('Error parsing file:', error);
            throw new Error('Failed to parse file. Please check the file format.');
        }
    };

    const handlePreview = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setUploading(true);
        try {
            const payments = await parseFile(file);
            setParsedPayments(payments);
            setShowPreview(true);
            setUploading(false);

            if (validationErrors.length > 0) {
                toast.warning(`Found ${validationErrors.length} validation error(s). Please fix them before uploading.`);
            } else {
                toast.success(`Successfully parsed ${payments.length} payment(s)`);
            }
        } catch (error: any) {
            setUploading(false);
            toast.error(error.message || 'Failed to parse file');
            console.error(error);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file to upload');
            return;
        }

        if (parsedPayments.length === 0) {
            toast.error('No valid payments to upload');
            return;
        }

        if (validationErrors.length > 0) {
            toast.error('Please fix all validation errors before uploading');
            return;
        }

        setUploading(true);
        setShowPreview(false);
        setUploadProgress({
            total: parsedPayments.length,
            processed: 0,
            successful: 0,
            failed: 0
        });

        try {
            const paymentsData: BulkPaymentUploadData[] = parsedPayments.map(payment => ({
                employeeId: payment.employeeId,
                loanId: payment.loanId,
                paymentId: payment.paymentId,
                paymentDate: payment.paymentDate,
                amountPaid: payment.amountPaid,
                paymentType: payment.paymentType !== "Contribution" ? loanTypes.filter(x => x.loanTypeName === payment.paymentType)[0].loanTypeCode : payment.paymentType,
                isFullPayment: payment.isFullPayment,
                interestRebate: payment.interestRebate,
                notes: payment.notes
            }));

            // Simulate progress updates
            setUploadProgress(prev => ({ ...prev, processed: Math.floor(prev.total * 0.3) }));

            const result = await PaymentManagementService.bulkUploadPayments(paymentsData);

            setUploadProgress({
                total: parsedPayments.length,
                processed: parsedPayments.length,
                successful: result.success,
                failed: result.failed
            });

            setUploadResults(result);
            setShowResults(true);

            if (result.success > 0) {
                toast.success(`Successfully uploaded ${result.success} payment(s)`);
                if (result.failed === 0) {
                    setTimeout(() => {
                        onSuccess();
                    }, 2000);
                }
            }

            if (result.failed > 0) {
                toast.warning(`${result.failed} payment(s) failed to upload. Check the error details below.`);
            }

        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload payments. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                'Employee ID': '000001',
                'Loan ID': '000001',
                'Payment ID': '000001',
                'Payment Date': '2024-01-15',
                'Amount Paid': '5000.00',
                'Payment Type': 'Cash',
                'Is Fullpayment?': 'false',
                'Interest Rebate': '0',
                'Notes': 'Optional notes'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);

        ws['!cols'] = [
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 30 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'payment_bulk_upload_template.xlsx');
        toast.success('Template downloaded successfully');
    };

    const downloadErrorReport = () => {
        const errorData = validationErrors.map(error => ({
            'Row': error.row,
            'Employee ID': error.employeeId || '-',
            'Loan ID': error.loanId || '-',
            'Payment ID': error.paymentId || '-',
            'Errors': error.errors?.join('; ') || error.message
        }));
        const ws = XLSX.utils.json_to_sheet(errorData);

        ws['!cols'] = [
            { wch: 10 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 60 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Validation Errors');
        XLSX.writeFile(wb, 'payment_validation_errors.xlsx');
        toast.success('Error report downloaded successfully');
    };

    const downloadUploadErrorReport = () => {
        if (!uploadResults?.errors || uploadResults.errors.length === 0) return;

        const errorData = uploadResults.errors.map((error: BulkUploadError) => ({
            'Row': error.row,
            'Employee ID': error.employeeId || '-',
            'Loan ID': error.loanId || '-',
            'Payment ID': error.paymentId || '-',
            'Amount Paid': error.amountPaid || '-',
            'Payment Type': error.paymentType || '-',
            'Error': error.message
        }));

        const ws = XLSX.utils.json_to_sheet(errorData);
        ws['!cols'] = [
            { wch: 10 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 60 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Upload Errors');
        XLSX.writeFile(wb, 'payment_upload_errors.xlsx');
        toast.success('Upload error report downloaded successfully');
    };

    const clearUpload = () => {
        setShowPreview(false);
        setParsedPayments([]);
        setValidationErrors([]);
        setUploadProgress({ total: 0, processed: 0, successful: 0, failed: 0 });
        setUploadResults(null);
        setFile(null);
        setUploading(false);
        setShowResults(false);
    }

    const handleNewUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        clearUpload();
    }

    const totalRecords = parsedPayments.length + validationErrors.length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Bulk Upload Payments</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={uploading}
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Instructions */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                            <span className="mr-2">ℹ️</span>
                            Instructions
                        </h3>
                        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                            <li>Download the template file to see the required format</li>
                            <li>Fill in your payment data following the template structure</li>
                            <li>Required fields: Employee ID, Payment ID, Payment Date, Amount Paid, Payment Type</li>
                            <li>Payment Date format: YYYY-MM-DD (e.g., 2024-01-15)</li>
                            <li>Payment Type: Use loan type codes (1, 2, etc.) or "Contribution" for contributions</li>
                            <li>Is Fullpayment?: true/false (default: false)</li>
                            <li>Interest Rebate: Numeric value (default: 0)</li>
                            <li>Upload your completed file (CSV or Excel format)</li>
                            <li>Review validation results and fix any errors</li>
                            <li>Click "Upload Payments" to complete the process</li>
                        </ol>
                    </div>

                    {/* Template Download */}
                    <div className="mb-6">
                        <button
                            onClick={downloadTemplate}
                            className="nbs-button-secondary flex items-center gap-2"
                            disabled={uploading}
                        >
                            <DownloadIcon className="w-4 h-4" />
                            Download Template
                        </button>
                    </div>

                    {/* File Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload File (CSV or Excel)
                        </label>
                        <div className="flex gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={handleFileChange}
                                className="nbs-input flex-1"
                                disabled={uploading}
                            />
                            <button
                                onClick={handlePreview}
                                disabled={!file || uploading}
                                className="nbs-button"
                            >
                                {uploading ? 'Processing...' : 'Validate'}
                            </button>
                        </div>
                        {file && (
                            <p className="text-sm text-gray-600 mt-2">
                                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                            </p>
                        )}
                    </div>

                    {/* Summary Cards */}
                    {(showPreview || showResults) && (
                        <div className="grid grid-cols-4 gap-4 mb-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-sm text-blue-700 font-medium mb-1">Total Records</div>
                                <div className="text-3xl font-bold text-blue-600">{totalRecords}</div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="text-sm text-green-700 font-medium mb-1">Valid Records</div>
                                <div className="text-3xl font-bold text-green-600">{parsedPayments.length}</div>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="text-sm text-red-700 font-medium mb-1">Invalid Records</div>
                                <div className="text-3xl font-bold text-red-600">{validationErrors.length}</div>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="text-sm text-purple-700 font-medium mb-1">
                                    {showResults ? 'Upload Status' : 'Ready to Upload'}
                                </div>
                                <div className="text-3xl font-bold text-purple-600">
                                    {showResults ? `${uploadProgress.successful}/${uploadProgress.total}` : '✓'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Validation Errors */}
                    {validationErrors.length > 0 && showPreview && (
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-red-600 flex items-center">
                                    <span className="mr-2">⚠️</span>
                                    Validation Errors
                                </h3>
                                <button
                                    onClick={downloadErrorReport}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <DownloadIcon className="w-4 h-4" />
                                    Download Error Report
                                </button>
                            </div>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="max-h-60 overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Row</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Employee ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Loan ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Payment ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">Errors</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {validationErrors.map((error, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{error.row}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{error.employeeId}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{error.loanId}</td>
                                                    <td className="px-4 py-3 text-sm text-gray-700">{error.paymentId}</td>
                                                    <td className="px-4 py-3 text-sm text-red-600">
                                                        <ul className="list-disc list-inside">
                                                            {error.errors?.map((err, errIndex) => (
                                                                <li key={errIndex}>{err}</li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Preview Table */}
                    {showPreview && parsedPayments.length > 0 && (
                        <div className="border border-green-200 rounded-lg overflow-hidden">
                            <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                                <h3 className="font-semibold text-green-900">
                                    Valid Loans Preview ({parsedPayments.length})
                                </h3>
                            </div>
                            <div className="max-h-96 overflow-auto">
                                <table className="min-w-full divide-y divide-green-200">
                                    <thead className="bg-green-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Employee ID</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Loan ID</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Payment ID</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Payment Date</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Amount</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Type</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Full Payment</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Interest Rebate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-green-100">
                                        {parsedPayments.map((payment, index) => (
                                            <tr key={index} className="hover:bg-green-50">
                                                <td className="px-4 py-2 text-sm text-gray-900">{payment.employeeId}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{payment.loanId || '-'}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{payment.paymentId}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">{payment.paymentDate}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">
                                                    ₱{payment.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="ppx-4 py-2 text-sm text-gray-900">{payment.paymentType}</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.isFullPayment ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {payment.isFullPayment ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-gray-900">
                                                    ₱{payment.interestRebate?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploading && uploadProgress.total > 0 && (
                        <div className="mb-6">
                            <div className="mb-2">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span className="font-medium">Uploading payments...</span>
                                    <span className="font-semibold">{uploadProgress.processed} / {uploadProgress.total}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${(uploadProgress.processed / uploadProgress.total) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>Processing...</span>
                                <span>{Math.round((uploadProgress.processed / uploadProgress.total) * 100)}% Complete</span>
                            </div>
                        </div>
                    )}

                    {/* Upload Results */}
                    {showResults && uploadResults && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <span className="mr-2">📊</span>
                                Upload Results
                            </h3>

                            {/* Results Summary */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-green-700 font-medium mb-1">Successfully Uploaded</div>
                                            <div className="text-3xl font-bold text-green-600">{uploadResults.success}</div>
                                        </div>
                                        <div className="text-green-500">
                                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-red-700 font-medium mb-1">Failed</div>
                                            <div className="text-3xl font-bold text-red-600">{uploadResults.failed}</div>
                                        </div>
                                        <div className="text-red-500">
                                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Failed Records */}
                            {uploadResults.errors && uploadResults.errors.length > 0 && (
                                <div className="border border-red-200 rounded-lg overflow-hidden">
                                    <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex justify-between items-center">
                                        <h3 className="font-semibold text-red-900">
                                            Upload Errors ({uploadResults.failed})
                                        </h3>
                                        <button
                                            onClick={downloadUploadErrorReport}
                                            className="text-sm text-red-700 hover:text-red-900 flex items-center gap-1"
                                        >
                                            <DownloadIcon className="w-4 h-4" />
                                            Download Error Report
                                        </button>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        <table className="min-w-full divide-y divide-red-200">
                                            <thead className="bg-red-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Row</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Employee ID</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Loan ID</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Payment ID</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Amount Paid</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Payment Type</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Error</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {uploadResults.errors.map((error: BulkUploadError, index: number) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 text-sm text-gray-900">{error.row}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{error.employeeId || '-'}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{error.loanId || '-'}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{error.paymentId || '-'}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">
                                                            {error.amountPaid ? `₱${error.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{error.paymentType || '-'}</td>
                                                        <td className="px-4 py-2 text-sm text-red-600">{error.message}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {uploadResults.success > 0 && uploadResults.failed === 0 && (
                                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-green-800 font-medium">
                                            All payments uploaded successfully! The page will refresh automatically.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            {showPreview && !showResults && (
                                <span>
                                    {parsedPayments.length > 0 && validationErrors.length === 0
                                        ? `Ready to upload ${parsedPayments.length} loan(s)`
                                        : validationErrors.length > 0
                                            ? `Please fix ${validationErrors.length} error(s) before uploading`
                                            : 'No valid loans to upload'}
                                </span>
                            )}
                            {showResults && (
                                <span>Upload completed. You can close this dialog or start a new upload.</span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            {showResults ? (
                                <>
                                    <button
                                        onClick={handleNewUpload}
                                        className="nbs-button-secondary"
                                    >
                                        New Upload
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="nbs-button"
                                    >
                                        Close
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={onClose}
                                        className="nbs-button-secondary"
                                        disabled={uploading}
                                    >
                                        Cancel
                                    </button>
                                    {showPreview && parsedPayments.length > 0 && (
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading || validationErrors.length > 0}
                                            className="nbs-button"
                                        >
                                            {uploading ? 'Uploading...' : `Upload ${parsedPayments.length} Payment(s)`}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentBulkUpload;