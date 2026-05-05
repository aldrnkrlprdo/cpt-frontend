import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import { Branch } from '../../types/MasterRecord.types';
import { MasterRecordService } from '../../services/MasterRecord.service';

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

  if (!isOpen) return null;

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
    setIsProcessing(true);
    try {
      const results = await MasterRecordService.validateBulkBranches(data);
      setValidationResults({
        valid: results.valid as ParsedBranch[],
        invalid: results.invalid.map(item => ({
          member: item.member as ParsedBranch,
          errors: item.errors
        }))
      });
    } catch (error) {
      console.error('Error validating data:', error);
      toast.error('Failed to validate data');
    } finally {
      setIsProcessing(false);
    }
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
      const results = await MasterRecordService.bulkUploadBranches(validationResults.valid);
      
      setUploadResults(results);
      setUploadProgress({
        total: validationResults.valid.length,
        processed: validationResults.valid.length,
        successful: results.success.length,
        failed: results.failed.length
      });
      setShowResults(true);

      if (results.success.length > 0) {
        toast.success(`Successfully uploaded ${results.success.length} branches`);
        if (results.failed.length === 0) {
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 2000);
        }
      }

      if (results.failed.length > 0) {
        toast.warning(`${results.failed.length} records failed to upload`);
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
      'Row Number': item.member.rowNumber || 'N/A',
      'Branch Code': item.member.branchCode || '',
      'Branch Name': item.member.branchName || '',
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
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900" disabled={isProcessing}>
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Download the template file to see the required format</li>
            <li>Fill in your branch data following the template structure</li>
            <li>Required fields: Branch Code, Branch Name</li>
            <li>Branch Code must be unique</li>
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Validation Results</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded">
                  <p className="text-sm text-gray-600">Valid Records</p>
                  <p className="text-2xl font-bold text-green-700">{validationResults.valid.length}</p>
                </div>
                <div className="bg-red-100 p-3 rounded">
                  <p className="text-sm text-gray-600">Invalid Records</p>
                  <p className="text-2xl font-bold text-red-700">{validationResults.invalid.length}</p>
                </div>
              </div>

              {validationResults.invalid.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-red-700">Validation Errors:</h4>
                    <button
                      onClick={downloadErrors}
                      className="text-sm nbs-button-secondary"
                    >
                      📥 Download Error Report
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto border rounded">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Row</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Branch Code</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Branch Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Errors</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {validationResults.invalid.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">{item.member.rowNumber || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm">{item.member.branchCode || ''}</td>
                            <td className="px-4 py-2 text-sm">{item.member.branchName || ''}</td>
                            <td className="px-4 py-2 text-sm text-red-600">
                              {item.errors.join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {validationResults.valid.length > 0 && (
                <button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="nbs-button w-full"
                >
                  {isProcessing ? 'Uploading...' : `Upload ${validationResults.valid.length} Valid Branch(es)`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isProcessing && uploadProgress.total > 0 && (
          <div className="mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Upload Progress</h3>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{uploadProgress.processed} / {uploadProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(uploadProgress.processed / uploadProgress.total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Successful: </span>
                  <span className="font-semibold text-green-600">{uploadProgress.successful}</span>
                </div>
                <div>
                  <span className="text-gray-600">Failed: </span>
                  <span className="font-semibold text-red-600">{uploadProgress.failed}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Results */}
        {showResults && uploadResults && (
          <div className="mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Upload Results</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded">
                  <p className="text-sm text-gray-600">Successfully Uploaded</p>
                  <p className="text-2xl font-bold text-green-700">{uploadResults.success.length}</p>
                </div>
                <div className="bg-red-100 p-3 rounded">
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-700">{uploadResults.failed.length}</p>
                </div>
              </div>

              {uploadResults.failed.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Failed Uploads:</h4>
                  <div className="max-h-60 overflow-y-auto border rounded">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Row</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Branch Code</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Branch Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Error</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {uploadResults.failed.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm">{item.member.rowNumber || 'N/A'}</td>
                            <td className="px-4 py-2 text-sm">{item.member.branchCode || ''}</td>
                            <td className="px-4 py-2 text-sm">{item.member.branchName || ''}</td>
                            <td className="px-4 py-2 text-sm text-red-600">{item.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="nbs-button-secondary"
            disabled={isProcessing}
          >
            {showResults && uploadResults?.failed.length === 0 ? 'Close' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchBulkUploadModal;