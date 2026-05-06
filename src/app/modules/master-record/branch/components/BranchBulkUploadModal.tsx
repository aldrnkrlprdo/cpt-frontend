import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { Branch } from '../../types/MasterRecord.types';
import { MasterRecordService } from '../../services/MasterRecord.service';
import { selectBranches } from '../../redux/masterRecordSlice';
import { useSelector } from 'react-redux';
import { DownloadIcon } from '../../../../shared/components/icons';

interface ParsedBranch extends Partial<Branch> {
  rowNumber?: number;
}

interface ValidationResult {
  valid: ParsedBranch[];
  invalid: {
    member: ParsedBranch;
    errors: string[];
  }[];
}

interface BulkUploadProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
}

interface BulkUploadResult {
  success: Branch[];
  failed: {
    member: ParsedBranch;
    error: string;
  }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BranchBulkUploadModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);
  const [uploadResults, setUploadResults] = useState<BulkUploadResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<BulkUploadProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0
  });
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing branches from Redux store
  const branches = useSelector(selectBranches);

  if (!isOpen) return null;

  const clearUpload = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploadProgress({ total: 0, processed: 0, successful: 0, failed: 0 });
    setValidationResults(null);
    setUploadResults(null);
    setShowResults(false);
    setIsProcessing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
        toast.error('Please upload a CSV or Excel file');
        return;
      }
      setFile(selectedFile);
      setValidationResults(null);
      setShowResults(false);
    }
  };

  const parseFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      const parsed: ParsedBranch[] = jsonData.map((row: any, index: number) => ({
        rowNumber: index + 2,
        branchCode: row['Branch Code']?.toString().trim() || '',
        branchName: row['Branch Name']?.toString().trim() || '',
      }));

      await validateData(parsed);

      toast.success(`Successfully parsed ${parsed.length} records`);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse file. Please check the file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateData = async (data: ParsedBranch[]) => {
    const valid: ParsedBranch[] = [];
    const invalid: { member: ParsedBranch; errors: string[] }[] = [];

    // Track duplicates within the file
    const branchNamesInFile = new Set<string>();
    const branchCodesInFile = new Set<string>();

    for (const branch of data) {
      const errors: string[] = [];

      // Validate required fields
      if (!branch.branchName || branch.branchName.trim() === '') {
        errors.push('Branch name is required');
      }

      // Check if branch name already exists in the system
      if (branch.branchName && branch.branchName.trim() !== '') {
        const normalizedBranchName = branch.branchName.trim().toLowerCase();

        // Check against existing branches in the system
        const existingBranchWithName = branches.find(
          b => b.branchName.toLowerCase() === normalizedBranchName
        );
        if (existingBranchWithName) {
          errors.push('Branch name already exists in the system');
        }

        // Check for duplicate branch names within the file
        if (branchNamesInFile.has(normalizedBranchName)) {
          errors.push('Duplicate branch name found in upload file');
        } else {
          branchNamesInFile.add(normalizedBranchName);
        }
      }

      // Validate branchCode if provided
      if (branch.branchCode && branch.branchCode.trim() !== '') {
        const normalizedBranchCode = branch.branchCode.trim().toLowerCase();

        // Check against existing branches in the system
        const existingBranchWithCode = branches.find(
          b => b.branchCode.toLowerCase() === normalizedBranchCode
        );
        if (existingBranchWithCode) {
          errors.push('Branch code already exists in the system');
        }

        // Check for duplicate branch codes within the file
        if (branchCodesInFile.has(normalizedBranchCode)) {
          errors.push('Duplicate branch code found in upload file');
        } else {
          branchCodesInFile.add(normalizedBranchCode);
        }

        // Validate branch code format (alphanumeric, no special characters except hyphen and underscore)
        const branchCodeRegex = /^[a-zA-Z0-9_-]+$/;
        if (!branchCodeRegex.test(branch.branchCode)) {
          errors.push('Branch code can only contain letters, numbers, hyphens, and underscores');
        }
      }

      // Validate branch name format
      if (branch.branchName && branch.branchName.trim() !== '') {
        // Check minimum length
        if (branch.branchName.trim().length < 2) {
          errors.push('Branch name must be at least 2 characters long');
        }

        // Check maximum length
        if (branch.branchName.length > 100) {
          errors.push('Branch name must not exceed 100 characters');
        }

        // Validate that branch name doesn't contain only numbers
        if (/^\d+$/.test(branch.branchName.trim())) {
          errors.push('Branch name cannot contain only numbers');
        }
      }

      if (errors.length > 0) {
        invalid.push({ member: branch, errors });
      } else {
        valid.push(branch);
      }
    }

    setValidationResults({ valid, invalid });
  };

  const handleUpload = async () => {
    if (!validationResults || validationResults.valid.length === 0) {
      toast.error('No valid records to upload');
      return;
    }

    setIsProcessing(true);
    setUploadProgress({
      total: validationResults.valid.length,
      processed: 0,
      successful: 0,
      failed: 0
    });

    try {
      // Process branches in batches
      const batchSize = 50; // Process 50 branches at a time
      const batches: ParsedBranch[][] = [];

      for (let i = 0; i < validationResults.valid.length; i += batchSize) {
        batches.push(validationResults.valid.slice(i, i + batchSize));
      }

      const allSuccessful: Branch[] = [];
      const allFailed: { member: ParsedBranch; error: string }[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        try {
          const batchResults = await MasterRecordService.bulkUploadBranches(batch);

          allSuccessful.push(...batchResults.success);
          allFailed.push(...batchResults.failed);

          // Update progress
          setUploadProgress(prev => ({
            ...prev,
            processed: Math.min((i + 1) * batchSize, validationResults.valid.length),
            successful: allSuccessful.length,
            failed: allFailed.length
          }));

        } catch (error) {
          console.error(`Error uploading batch ${i + 1}:`, error);
          // Mark all items in this batch as failed
          batch.forEach(branch => {
            allFailed.push({
              member: branch,
              error: 'Batch upload failed'
            });
          });
        }
      }

      const results: BulkUploadResult = {
        success: allSuccessful,
        failed: allFailed
      };

      setUploadResults(results);
      setUploadProgress({
        total: validationResults.valid.length,
        processed: validationResults.valid.length,
        successful: results.success.length,
        failed: results.failed.length
      });
      setShowResults(true);

      if (results.success.length > 0) {
        toast.success(`Successfully uploaded ${results.success.length} branch(es)`);
        if (results.failed.length === 0) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      }

      if (results.failed.length > 0) {
        toast.warning(`${results.failed.length} record(s) failed to upload`);
      }
    } catch (error) {
      console.error('Error uploading branches:', error);
      toast.error('Failed to upload branches');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Branch Code': '000001',
        'Branch Name': 'Ali Mall',
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);

    // Make header row bold
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
        font: {
          bold: true,
          sz: 12
        },
        fill: {
          fgColor: { rgb: "4472C4" }
        },
        alignment: {
          horizontal: "center",
          vertical: "center"
        }
      };
    }

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Branch Code
      { wch: 30 }, // Branch Name
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'branch_upload_template.xlsx', { cellStyles: true });
    toast.success('Template downloaded successfully');
  };

  const downloadErrors = () => {
    if (!validationResults?.invalid || validationResults.invalid.length === 0) return;

    const errorData = validationResults.invalid.map(item => ({
      'Row Number': item.member.rowNumber,
      'Branch Code': item.member.branchCode,
      'Branch Name': item.member.branchName,
      'Errors': item.errors.join('; ')
    }));

    const ws = XLSX.utils.json_to_sheet(errorData);

    // Make header row bold
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!ws[cellAddress]) continue;

      ws[cellAddress].s = {
        font: {
          bold: true,
          sz: 12
        },
        fill: {
          fgColor: { rgb: "C00000" }
        },
        alignment: {
          horizontal: "center",
          vertical: "center"
        }
      };
    }

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Row Number
      { wch: 15 }, // Branch Code
      { wch: 30 }, // Branch Name
      { wch: 50 }  // Errors
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Validation Errors');
    XLSX.writeFile(wb, 'branch_validation_errors.xlsx', { cellStyles: true });
    toast.success('Error report downloaded');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bulk Upload Branches</h2>
          <button onClick={() => { clearUpload(); onClose(); }} className="text-gray-600 hover:text-gray-900" disabled={isProcessing}>
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Download the template file to see the required format</li>
            <li>Fill in your branch data following the template structure</li>
            <li>Required fields: Branch Name</li>
            <li>Optional fields: Branch Code (must be unique if provided)</li>
            <li>Branch Code: 2-20 characters, alphanumeric with hyphens and underscores allowed</li>
            <li>Branch Name: 2-100 characters, cannot be only numbers</li>
            <li>Upload your completed file (CSV or Excel format)</li>
            <li>Review validation results and fix any errors</li>
            <li>Click "Upload Branches" to complete the process</li>
          </ol>
        </div>

        {/* Template Download */}
        <div className="mb-6">
          <button
            onClick={downloadTemplate}
            className="nbs-button-secondary underline"
            disabled={isProcessing}
          >
            📥 Download Template
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
              disabled={isProcessing}
            />
            <button
              onClick={parseFile}
              disabled={!file || isProcessing}
              className="nbs-button"
            >
              {isProcessing ? 'Processing...' : 'Validate File'}
            </button>
          </div>
          {file && (
            <p className="text-sm text-gray-600 mt-2">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* Validation Results */}
        {validationResults && (
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm text-blue-700 font-medium mb-1">Total Records</div>
                <div className="text-3xl font-bold text-blue-600">{validationResults.valid.length + validationResults.invalid.length}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-700 font-medium mb-1">Valid Records</div>
                <div className="text-3xl font-bold text-green-600">{validationResults.valid.length}</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-red-700 font-medium mb-1">Invalid Records</div>
                <div className="text-3xl font-bold text-red-600">{validationResults.invalid.length}</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm text-purple-700 font-medium mb-1">
                  {showResults ? 'Upload Status' : 'Ready to Upload'}
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {showResults ? `${uploadProgress?.successful}/${uploadProgress?.total}` : '✓'}
                </div>
              </div>
            </div>

            {/* Invalid Records Table */}
            {validationResults.invalid.length > 0 && (
              <div className="border border-red-200 rounded-lg overflow-hidden">
                <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex justify-between items-center">
                  <h3 className="font-semibold text-red-900">
                    Validation Errors ({validationResults.invalid.length})
                  </h3>
                  <button
                    onClick={downloadErrors}
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
                        <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Errors</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-red-100">
                      {validationResults.invalid.map((error, index) => (
                        <tr key={index} className="hover:bg-red-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{error.member.rowNumber}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{error.member.branchCode || '-'}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{error.member.branchName}</td>
                          <td className="px-4 py-2 text-sm text-red-600">
                            {error.errors?.join('; ') || error.errors}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {isProcessing && uploadProgress.total > 0 && (
          <div className="mb-6">
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading branches...</span>
                <span>{uploadProgress.processed} / {uploadProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(uploadProgress.processed / uploadProgress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Upload Results */}
        {showResults && uploadResults && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3">Upload Results</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Successfully Uploaded</p>
                <p className="text-2xl font-bold text-green-600">{uploadResults.success.length}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{uploadResults.failed.length}</p>
              </div>
            </div>

            {/* Failed Records */}
            {uploadResults.failed.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 mb-2">Failed Records</h4>
                <div className="max-h-60 overflow-y-auto border rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Branch Code</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Branch Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Error</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uploadResults.failed.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.member.branchCode || '-'}</td>
                          <td className="px-4 py-2 text-sm">{item.member.branchName}</td>
                          <td className="px-4 py-2 text-sm text-red-600">{item.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Success Records Preview */}
            {uploadResults.success.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-green-600 mb-2">
                  Successfully Uploaded ({uploadResults.success.length} records)
                </h4>
                <div className="max-h-60 overflow-y-auto border rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Branch Code</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Branch Name</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uploadResults.success.map((branch, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{branch.branchCode}</td>
                          <td className="px-4 py-2 text-sm">{branch.branchName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => { clearUpload(); onClose(); }}
            className="nbs-button-secondary"
            disabled={isProcessing}
          >
            {showResults && uploadResults?.success.length ? 'Close' : 'Cancel'}
          </button>
          {validationResults && validationResults.valid.length > 0 && !showResults && (
            <button
              onClick={handleUpload}
              className="nbs-button"
              disabled={isProcessing}
            >
              {isProcessing ? 'Uploading...' : `Upload ${validationResults.valid.length} Branch(es)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchBulkUploadModal;