
import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { BulkLoanUploadData, BulkUploadResult } from '../types/LoanManagement.types';
import { LoanManagementService } from '../services/LoanManagement.service';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const BulkUploadModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        toast.error('Please upload a valid Excel file (.xlsx or .xls)');
        return;
      }
      setFile(selectedFile);
      setValidationErrors([]);
      setUploadResult(null);
    }
  };

  const validateLoanData = (data: any[]): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const requiredFields = [
      'employeeId',
      'branch',
      'loanType',
      'loanDate',
      'loanAmount',
      'maturityDate',
      'loanTerm',
      'interest'
    ];

    data.forEach((row, index) => {
      const rowNum = index + 2;

      requiredFields.forEach(field => {
        if (!row[field] || row[field] === '') {
          errors.push(`Row ${rowNum}: Missing required field '${field}'`);
        }
      });

      if (row.employeeId && typeof row.employeeId !== 'string' && typeof row.employeeId !== 'number') {
        errors.push(`Row ${rowNum}: Employee ID must be a valid value`);
      }

      if (row.loanAmount && (isNaN(parseFloat(row.loanAmount)) || parseFloat(row.loanAmount) <= 0)) {
        errors.push(`Row ${rowNum}: Loan Amount must be a positive number`);
      }

      if (row.loanTerm && (isNaN(parseInt(row.loanTerm)) || parseInt(row.loanTerm) <= 0)) {
        errors.push(`Row ${rowNum}: Loan Term must be a positive integer`);
      }

      if (row.interest && (isNaN(parseFloat(row.interest)) || parseFloat(row.interest) < 0)) {
        errors.push(`Row ${rowNum}: Interest must be a non-negative number`);
      }

      if (row.loanDate) {
        const loanDate = new Date(row.loanDate);
        if (isNaN(loanDate.getTime())) {
          errors.push(`Row ${rowNum}: Invalid Loan Date format`);
        }
      }

      if (row.maturityDate) {
        const maturityDate = new Date(row.maturityDate);
        if (isNaN(maturityDate.getTime())) {
          errors.push(`Row ${rowNum}: Invalid Maturity Date format`);
        }
      }

      if (row.loanDate && row.maturityDate) {
        const loanDate = new Date(row.loanDate);
        const maturityDate = new Date(row.maturityDate);
        if (maturityDate <= loanDate) {
          errors.push(`Row ${rowNum}: Maturity Date must be after Loan Date`);
        }
      }
    });

    return { valid: errors.length === 0, errors };
  };

  const parseExcelDate = (excelDate: any): string => {
    if (typeof excelDate === 'number') {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    } else if (typeof excelDate === 'string') {
      const date = new Date(excelDate);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    return excelDate;
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    setValidationErrors([]);
    setUploadResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error('The uploaded file is empty');
        setUploading(false);
        return;
      }

      const validation = validateLoanData(jsonData);
      if (!validation.valid) {
        setValidationErrors(validation.errors);
        toast.error(`Found ${validation.errors.length} validation error(s). Please fix them and try again.`);
        setUploading(false);
        return;
      }

      const loansData: BulkLoanUploadData[] = jsonData.map((row: any) => ({
        employeeId: String(row.employeeId).trim(),
        branch: String(row.branch).trim(),
        loanType: String(row.loanType).trim(),
        loanDate: parseExcelDate(row.loanDate),
        loanAmount: parseFloat(row.loanAmount),
        maturityDate: parseExcelDate(row.maturityDate),
        loanTerm: parseInt(row.loanTerm),
        interest: parseFloat(row.interest),
        status: row.status ? String(row.status).trim() : 'Not Started'
      }));

      const result = await LoanManagementService.bulkUploadLoans(loansData);
      setUploadResult(result);

      if (result.success > 0) {
        toast.success(`Successfully uploaded ${result.success} loan(s)`);
        if (result.failed === 0) {
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        }
      }

      if (result.failed > 0) {
        toast.warning(`${result.failed} loan(s) failed to upload. Check the error details below.`);
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload loans. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await LoanManagementService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'loan_upload_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Failed to download template');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileExtension = droppedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        toast.error('Please upload a valid Excel file (.xlsx or .xls)');
        return;
      }
      setFile(droppedFile);
      setValidationErrors([]);
      setUploadResult(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bulk Upload Loans</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={uploading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Download the template file below</li>
            <li>Fill in the loan details following the format</li>
            <li>Upload the completed file</li>
            <li>Review any errors and correct them if needed</li>
          </ol>
        </div>

        {/* Download Template Button */}
        <div className="mb-6">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Template
          </button>
        </div>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${
            file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {file ? (
            <div className="space-y-2">
              <svg className="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              <button
                onClick={() => {
                  setFile(null);
                  setValidationErrors([]);
                  setUploadResult(null);
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600">Drag and drop your Excel file here, or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Browse files
              </button>
              <p className="text-xs text-gray-500">Supported formats: .xlsx, .xls</p>
            </div>
          )}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 rounded-md border border-red-200 max-h-60 overflow-y-auto">
            <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Validation Errors ({validationErrors.length})
            </h3>
            <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Result */}
        {uploadResult && (
          <div className="mb-4 space-y-3">
            {/* Success Summary */}
            {uploadResult.success > 0 && (
              <div className="p-4 bg-green-50 rounded-md border border-green-200">
                <h3 className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Successfully Uploaded: {uploadResult.success} loan(s)
                </h3>
              </div>
            )}

            {/* Failed Summary */}
            {uploadResult.failed > 0 && uploadResult.errors.length > 0 && (
              <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200 max-h-60 overflow-y-auto">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Failed to Upload: {uploadResult.failed} loan(s)
                </h3>
                <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1 mt-2">
                  {uploadResult.errors.map((error, index) => (
                    <li key={index}>
                      Row {error.row} (Employee ID: {error.employeeId}): {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
            disabled={uploading}
          >
            {uploadResult && uploadResult.failed === 0 ? 'Close' : 'Cancel'}
          </button>
          <button
            onClick={handleUpload}
            className="nbs-button flex items-center gap-2"
            disabled={!file || uploading}
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Loans
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;