import React, { useState, useRef } from 'react';
import { DownloadIcon, XIcon } from '../../../shared/components/icons';
import { LoanManagementService } from '../services/LoanManagement.service';
import { toast } from 'react-toastify';
import { ValidationError, ParsedLoan, BulkLoanUploadData, BulkUploadResult, BulkUploadError, ProgressUploadResult } from '../types/LoanManagement.types';
import * as XLSX from 'xlsx';
import { useSelector } from 'react-redux';
import { selectLoanTypes } from '../../master-record/redux/masterRecordSlice';

interface Props {
    onClose: () => void;
    onSuccess: () => void;
}

const LoanBulkUpload: React.FC<Props> = ({ onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [parsedLoans, setParsedLoans] = useState<ParsedLoan[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<ProgressUploadResult>({
        total: 0,
        processed: 0,
        successCount: 0,
        failedCount: 0,
        failed: [],
        message: '',
    });
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

    const parseFile = async (file: File): Promise<ParsedLoan[]> => {
        const errors: ValidationError[] = [];
        const loans: ParsedLoan[] = [];

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

            jsonData.forEach((row: any, index: number) => {
                const rowNumber = index + 2;
                const rowErrors: string[] = [];

                // Validate required fields
                if (!row['Loan ID'] || !row['Loan ID'].toString().trim()) {
                    rowErrors.push('Loan ID is required');
                }
                if (!row['Employee ID'] || !row['Employee ID'].toString().trim()) {
                    rowErrors.push('Employee ID is required');
                }
                if (!row['Branch'] || !row['Branch'].toString().trim()) {
                    rowErrors.push('Branch is required');
                }
                if (!row['Loan Type'] || !row['Loan Type'].toString().trim()) {
                    rowErrors.push('Loan Type is required');
                }
                if (!row['Loan Date'] || !row['Loan Date'].toString().trim()) {
                    rowErrors.push('Loan Date is required');
                }
                if (!row['Loan Amount'] || isNaN(parseFloat(row['Loan Amount']))) {
                    rowErrors.push('Valid Loan Amount is required');
                }
                if (!row['Loan Term'] || isNaN(parseInt(row['Loan Term']))) {
                    rowErrors.push('Valid Loan Term is required');
                }
                if (!row['Interest'] || isNaN(parseFloat(row['Interest']))) {
                    rowErrors.push('Valid Interest is required');
                }

                // Validate date formats
                const loanDateStr = row['Loan Date']?.toString().trim();
                if (loanDateStr && !/^\d{4}-\d{2}-\d{2}$/.test(loanDateStr)) {
                    rowErrors.push('Loan Date must be in YYYY-MM-DD format');
                }

                const maturityDateStr = row['Maturity Date']?.toString().trim();
                if (maturityDateStr && !/^\d{4}-\d{2}-\d{2}$/.test(maturityDateStr)) {
                    rowErrors.push('Maturity Date must be in YYYY-MM-DD format');
                }

                // Validate loan amount
                const loanAmount = parseFloat(row['Loan Amount']);
                if (!isNaN(loanAmount) && loanAmount <= 0) {
                    rowErrors.push('Loan Amount must be greater than 0');
                }

                // Validate loan term
                const loanTerm = parseInt(row['Loan Term']);
                if (!isNaN(loanTerm) && loanTerm <= 0) {
                    rowErrors.push('Loan Term must be greater than 0');
                }

                // Validate interest
                const interest = parseFloat(row['Interest']);
                if (!isNaN(interest) && interest < 0) {
                    rowErrors.push('Interest must be non-negative');
                }

                // Validate loan type
                const loanType = row['Loan Type']?.toString().trim();
                const validLoanType = loanTypes.find(lt =>
                    lt.loanTypeCode === loanType || lt.loanTypeName === loanType
                );
                if (loanType && !validLoanType) {
                    rowErrors.push(`Invalid Loan Type. Must be one of: ${loanTypes.map(lt => lt.loanTypeCode).join(', ')}`);
                }

                // Parse optional fields
                const principalBalance = parseFloat(row['Principal Balance'] || '0');
                const interestBalance = parseFloat(row['Interest Balance'] || '0');
                const totalBalance = parseFloat(row['Total Balance'] || '0');
                const amountPaid = parseFloat(row['Amount Paid'] || '0');

                // Validate optional numeric fields
                if (row['Principal Balance'] && (isNaN(principalBalance) || principalBalance < 0)) {
                    rowErrors.push('Principal Balance must be a non-negative number');
                }
                if (row['Interest Balance'] && (isNaN(interestBalance) || interestBalance < 0)) {
                    rowErrors.push('Interest Balance must be a non-negative number');
                }
                if (row['Total Balance'] && (isNaN(totalBalance) || totalBalance < 0)) {
                    rowErrors.push('Total Balance must be a non-negative number');
                }
                if (row['Amount Paid'] && (isNaN(amountPaid) || amountPaid < 0)) {
                    rowErrors.push('Amount Paid must be a non-negative number');
                }

                // If there are errors for this row, add them to validation errors
                if (rowErrors.length > 0) {
                    errors.push({
                        row: rowNumber,
                        message: rowErrors.join('; '),
                        loanId: row['Loan ID']?.toString().trim() || '-',
                        employeeId: row['Employee ID']?.toString().trim() || '-',
                        errors: rowErrors
                    });
                } else {
                    // If no errors, add to valid loans
                    loans.push({
                        loanId: row['Loan ID'].toString().trim(),
                        employeeId: row['Employee ID'].toString().trim(),
                        branch: row['Branch'].toString().trim(),
                        loanType: validLoanType?.loanTypeName || loanType,
                        loanDate: loanDateStr,
                        loanAmount: loanAmount,
                        maturityDate: maturityDateStr || '',
                        loanTerm: loanTerm,
                        interest: interest,
                        principalBalance: principalBalance || undefined,
                        interestBalance: interestBalance || undefined,
                        totalBalance: totalBalance || undefined,
                        amountPaid: amountPaid || undefined,
                        status: row['Status']?.toString().trim() || undefined,
                        notes: row['Notes']?.toString().trim() || undefined,
                    });
                }
            });

            setValidationErrors(errors);
            return loans;
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
            const loans = await parseFile(file);
            setParsedLoans(loans);
            setShowPreview(true);
            setUploading(false);

            if (validationErrors.length > 0) {
                toast.warning(`Found ${validationErrors.length} validation error(s). Please fix them before uploading.`);
            } else {
                toast.success(`Successfully parsed ${loans.length} loan(s)`);
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

        if (parsedLoans.length === 0) {
            toast.error('No valid loans to upload');
            return;
        }

        if (validationErrors.length > 0) {
            toast.error('Please fix all validation errors before uploading');
            return;
        }

        setUploading(true);
        setShowPreview(false);
        setUploadProgress({
            total: parsedLoans.length,
            processed: 0,
            successCount: 0,
            failedCount: 0,
            failed: [],
            message: '',
        });

        try {
            const loansData: BulkLoanUploadData[] = parsedLoans.map(loan => ({
                loanId: loan.loanId,
                employeeId: loan.employeeId,
                branch: loan.branch,
                loanType: loanTypes.find(lt => lt.loanTypeName === loan.loanType)?.loanTypeCode || loan.loanType,
                loanDate: loan.loanDate,
                loanAmount: loan.loanAmount,
                maturityDate: loan.maturityDate,
                loanTerm: loan.loanTerm,
                interest: loan.interest,
                principalBalance: loan.principalBalance,
                interestBalance: loan.interestBalance,
                totalBalance: loan.totalBalance,
                amountPaid: loan.amountPaid,
                status: loan.status,
                notes: loan.notes
            }));

            const result = await LoanManagementService.bulkUploadLoans(loansData, (progress) => {
                setUploadProgress(progress);
            });

            setUploadResults(result);
            setShowResults(true);

            if (result.successCount > 0) {
                toast.success(`Successfully uploaded ${result.successCount} loan(s)`);
                if (result.failedCount === 0) {
                    setTimeout(() => {
                        onSuccess();
                    }, 2000);
                }
            }

            if (result.failedCount > 0) {
                toast.warning(`${result.failed} loan(s) failed to upload. Check the error details below.`);
            }

        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload loans. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        const template = [
            {
                'Loan ID': 'L000001',
                'Employee ID': '000001',
                'Branch': 'Main Branch',
                'Loan Type': '1',
                'Loan Date': '2024-01-15',
                'Loan Amount': '50000.00',
                'Maturity Date': '2025-01-15',
                'Loan Term': '12',
                'Interest': '2.5',
                'Principal Balance': '50000.00',
                'Interest Balance': '0.00',
                'Total Balance': '50000.00',
                'Amount Paid': '0.00',
                'Status': 'Active',
                'Notes': 'Optional notes'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(template);

        ws['!cols'] = [
            { wch: 15 }, // Loan ID
            { wch: 15 }, // Employee ID
            { wch: 20 }, // Branch
            { wch: 15 }, // Loan Type
            { wch: 15 }, // Loan Date
            { wch: 15 }, // Loan Amount
            { wch: 15 }, // Maturity Date
            { wch: 12 }, // Loan Term
            { wch: 12 }, // Interest
            { wch: 18 }, // Principal Balance
            { wch: 18 }, // Interest Balance
            { wch: 15 }, // Total Balance
            { wch: 15 }, // Amount Paid
            { wch: 15 }, // Status
            { wch: 30 }  // Notes
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template');
        XLSX.writeFile(wb, 'loan_bulk_upload_template.xlsx');
        toast.success('Template downloaded successfully');
    };

    const downloadErrorReport = () => {
        const errorData = validationErrors.map(error => ({
            'Row': error.row,
            'Loan ID': error.loanId || '-',
            'Employee ID': error.employeeId || '-',
            'Errors': error.errors?.join('; ') || error.message
        }));
        const ws = XLSX.utils.json_to_sheet(errorData);

        ws['!cols'] = [
            { wch: 10 },
            { wch: 15 },
            { wch: 15 },
            { wch: 60 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Validation Errors');
        XLSX.writeFile(wb, 'loan_validation_errors.xlsx');
        toast.success('Error report downloaded successfully');
    };

    const downloadUploadErrorReport = () => {
        if (!uploadResults?.failed || uploadResults.failed.length === 0) return;

        const errorData = uploadResults.failed.map((item: { loan: BulkLoanUploadData; error: BulkUploadError }) => ({
            'Row': item.error.row,
            'Loan ID': item.loan.loanId || '-',
            'Employee ID': item.loan.employeeId || '-',
            'Error': item.error.message
        }));

        const ws = XLSX.utils.json_to_sheet(errorData);
        ws['!cols'] = [
            { wch: 10 },
            { wch: 15 },
            { wch: 15 },
            { wch: 60 }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Upload Errors');
        XLSX.writeFile(wb, 'loan_upload_errors.xlsx');
        toast.success('Upload error report downloaded successfully');
    };

    const clearUpload = () => {
        setShowPreview(false);
        setParsedLoans([]);
        setValidationErrors([]);
        setUploadProgress({
            total: parsedLoans.length,
            processed: 0,
            successCount: 0,
            failedCount: 0,
            failed: [],
            message: '',
        });
        setUploadResults(null);
        setFile(null);
        setUploading(false);
        setShowResults(false);
    };

    const handleNewUpload = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        clearUpload();
    };

    const totalRecords = parsedLoans.length + validationErrors.length;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Bulk Upload Loans</h2>
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
                            <li>Fill in your loan data following the template structure</li>
                            <li>Required fields: Loan ID, Employee ID, Branch, Loan Type, Loan Date, Loan Amount, Maturity Date, Loan Term, Interest</li>
                            <li>Date format: YYYY-MM-DD (e.g., 2024-01-15)</li>
                            <li>Loan Type: Use loan type codes (1, 2, etc.) as defined in master records</li>
                            <li>Interest: Monthly interest rate as a percentage (e.g., 2.5 for 2.5%)</li>
                            <li>Optional fields: Principal Balance, Interest Balance, Total Balance, Amount Paid, Status, Notes</li>
                            <li>Upload your completed file (CSV or Excel format)</li>
                            <li>Review validation results and fix any errors</li>
                            <li>Click "Upload Loans" to complete the process</li>
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
                                <div className="text-3xl font-bold text-green-600">{parsedLoans.length}</div>
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
                                    {showResults ? `${uploadProgress?.successCount}/${uploadProgress?.total}` : '✓'}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploading && !showPreview && (
                        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">Uploading loans...</span>
                                <span className="text-sm text-gray-600">
                                    {uploadProgress.processed} / {uploadProgress.total}
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${(uploadProgress.processed / uploadProgress.total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Preview Section */}
                    {showPreview && !showResults && (
                        <div className="space-y-6">
                            {/* Validation Errors */}
                            {validationErrors.length > 0 && (
                                <div className="border border-red-200 rounded-lg overflow-hidden">
                                    <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex justify-between items-center">
                                        <h3 className="font-semibold text-red-900">
                                            Validation Errors ({validationErrors.length})
                                        </h3>
                                        <button
                                            onClick={downloadErrorReport}
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
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Loan ID</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Employee ID</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Errors</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-red-100">
                                                {validationErrors.map((error, index) => (
                                                    <tr key={index} className="hover:bg-red-50">
                                                        <td className="px-4 py-2 text-sm text-gray-900">{error.row}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{error.loanId || '-'}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{error.employeeId || '-'}</td>
                                                        <td className="px-4 py-2 text-sm text-red-600">
                                                            {error.errors?.join('; ') || error.message}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Valid Loans Preview */}
                            {parsedLoans.length > 0 && (
                                <div className="border border-green-200 rounded-lg overflow-hidden">
                                    <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                                        <h3 className="font-semibold text-green-900">
                                            Valid Loans Preview ({parsedLoans.length})
                                        </h3>
                                    </div>
                                    <div className="max-h-96 overflow-auto">
                                        <table className="min-w-full divide-y divide-green-200">
                                            <thead className="bg-green-50 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Loan ID</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Employee ID</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Branch</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Loan Type</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Loan Date</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Amount</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Term</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Interest</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-green-100">
                                                {parsedLoans.map((loan, index) => (
                                                    <tr key={index} className="hover:bg-green-50">
                                                        <td className="px-4 py-2 text-sm text-gray-900">{loan.loanId}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{loan.employeeId}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{loan.branch}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{loan.loanType}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{loan.loanDate}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">
                                                            ₱{loan.loanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{loan.loanTerm} months</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{loan.interest}%</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{loan.status || 'Active'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
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
                                            <div className="text-3xl font-bold text-green-600">{uploadResults.successCount}</div>
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
                                            <div className="text-3xl font-bold text-red-600">{uploadResults.failedCount}</div>
                                        </div>
                                        <div className="text-red-500">
                                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Upload Errors */}
                            {uploadResults.failed && uploadResults.failed.length > 0 && (
                                <div className="border border-red-200 rounded-lg overflow-hidden">
                                    <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex justify-between items-center">
                                        <h3 className="font-semibold text-red-900">
                                            Upload Errors ({uploadResults.failed.length})
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
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Loan ID</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Employee ID</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Error</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-red-100">
                                                {uploadResults.failed.map((item: { loan: BulkLoanUploadData; error: BulkUploadError }, index: number) => (
                                                    <tr key={index} className="hover:bg-red-50">
                                                        <td className="px-4 py-2 text-sm text-gray-900">{item.error.row}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{item.error.loanId || '-'}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{item.error.employeeId || '-'}</td>
                                                        <td className="px-4 py-2 text-sm text-red-600">{item.error.message}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
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
                                    {parsedLoans.length > 0 && validationErrors.length === 0
                                        ? `Ready to upload ${parsedLoans.length} loan(s)`
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
                                    {showPreview && parsedLoans.length > 0 && (
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading || validationErrors.length > 0}
                                            className="nbs-button"
                                        >
                                            {uploading ? 'Uploading...' : `Upload ${parsedLoans.length} Loan(s)`}
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

export default LoanBulkUpload;