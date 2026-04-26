
import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { Member } from '../types/MemberManagement.types';
import { MemberManagementService } from '../services/MemberManagement.service';
import * as XLSX from 'xlsx';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedMember extends Partial<Member> {
  rowNumber: number;
}

const BulkUploadModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedMember[]>([]);
  const [validationResults, setValidationResults] = useState<{
    valid: ParsedMember[];
    invalid: { member: ParsedMember; errors: string[] }[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ total: 0, processed: 0, successful: 0, failed: 0 });
  const [showResults, setShowResults] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: Member[];
    failed: { member: Partial<Member>; error: string }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension || '')) {
        toast.error('Please upload a CSV or Excel file');
        return;
      }
      setFile(selectedFile);
      setParsedData([]);
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

      const parsed: ParsedMember[] = jsonData.map((row: any, index: number) => ({
        rowNumber: index + 2, // +2 because Excel rows start at 1 and we have a header
        employeeId: row['Employee ID']?.toString().trim() || '',
        firstName: row['First Name']?.toString().trim() || '',
        middleName: row['Middle Name']?.toString().trim() || '',
        lastName: row['Last Name']?.toString().trim() || '',
        branch: row['Branch']?.toString().trim() || '',
        email: row['Email']?.toString().trim() || '',
        phoneNumber: row['Phone Number']?.toString().trim() || '',
        membershipStatus: (row['Membership Status']?.toString().trim() || 'Active') as 'Active' | 'Resigned' | 'Promoted',
        civilStatus: (row['Civil Status']?.toString().trim() || 'Single') as 'Single' | 'Married' | 'Divorced' | 'Widowed',
        address: row['Address']?.toString().trim() || '',
        dateOfJoining: row['Date of Joining']?.toString().trim() || '',
      }));

      setParsedData(parsed);
      
      // Validate the parsed data
      await validateData(parsed);
      
      toast.success(`Successfully parsed ${parsed.length} records`);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Failed to parse file. Please check the file format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const validateData = async (data: ParsedMember[]) => {
    setIsProcessing(true);
    try {
      const results = await MemberManagementService.validateBulkUpload(data);
      setValidationResults({
        valid: results.valid as ParsedMember[],
        invalid: results.invalid.map(item => ({
          ...item,
          member: item.member as ParsedMember
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
      const results = await MemberManagementService.bulkUploadMembers(validationResults.valid);
      
      setUploadResults(results);
      setUploadProgress({
        total: validationResults.valid.length,
        processed: validationResults.valid.length,
        successful: results.success.length,
        failed: results.failed.length
      });
      setShowResults(true);

      if (results.success.length > 0) {
        toast.success(`Successfully uploaded ${results.success.length} members`);
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
      console.error('Error uploading members:', error);
      toast.error('Failed to upload members');
    } finally {
      setIsProcessing(false);
    }
  };

  
  const downloadTemplate = () => {
    const template = [
      {
        'Employee ID': 'EMP001',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        'Branch': 'Main Branch',
        'Email': 'john.doe@example.com',
        'Phone Number': '09123456789',
        'Membership Status': 'Active',
        'Civil Status': 'Single',
        'Address': '123 Main St, City',
        'Date of Joining': '2020-01-01'
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
      { wch: 15 }, // Employee ID
      { wch: 15 }, // First Name
      { wch: 15 }, // Middle Name
      { wch: 15 }, // Last Name
      { wch: 20 }, // Branch
      { wch: 25 }, // Email
      { wch: 15 }, // Phone Number
      { wch: 18 }, // Membership Status
      { wch: 15 }, // Civil Status
      { wch: 30 }, // Address
      { wch: 18 }  // Date of Joining
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'member_upload_template.xlsx', { cellStyles: true });
    toast.success('Template downloaded successfully');
  };

  const downloadErrors = () => {
    if (!validationResults?.invalid || validationResults.invalid.length === 0) return;

    const errorData = validationResults.invalid.map(item => ({
      'Row Number': item.member.rowNumber,
      'Employee ID': item.member.employeeId,
      'First Name': item.member.firstName,
      'Last Name': item.member.lastName,
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
      { wch: 15 }, // Employee ID
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 50 }  // Errors
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Validation Errors');
    XLSX.writeFile(wb, 'validation_errors.xlsx', { cellStyles: true });
    toast.success('Error report downloaded');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bulk Upload Members</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900" disabled={isProcessing}>
            <span className="text-2xl">&times;</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Download the template file to see the required format</li>
            <li>Fill in your member data following the template structure</li>
            <li>Required fields: Employee ID, First Name, Last Name, Branch, Date of Joining</li>
            <li>Membership Status options: Active, Resigned, Promoted (default: Active)</li>
            <li>Civil Status options: Single, Married, Divorced, Widowed (default: Single)</li>
            <li>Date format: YYYY-MM-DD (e.g., 2020-01-01)</li>
            <li>Upload your completed file (CSV or Excel format)</li>
            <li>Review validation results and fix any errors</li>
            <li>Click "Upload Members" to complete the process</li>
          </ol>
        </div>

        {/* Template Download */}
        <div className="mb-6">
          <button
            onClick={downloadTemplate}
            className="nbs-button-secondary"
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
              {isProcessing ? 'Processing...' : 'Parse File'}
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
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Valid Records</p>
                <p className="text-2xl font-bold text-green-600">{validationResults.valid.length}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Invalid Records</p>
                <p className="text-2xl font-bold text-red-600">{validationResults.invalid.length}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-blue-600">{parsedData.length}</p>
              </div>
            </div>

            {/* Invalid Records Table */}
            {validationResults.invalid.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-red-600">Validation Errors</h3>
                  <button
                    onClick={downloadErrors}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    📥 Download Error Report
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto border rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Row</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Employee ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Errors</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {validationResults.invalid.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.member.rowNumber}</td>
                          <td className="px-4 py-2 text-sm">{item.member.employeeId}</td>
                          <td className="px-4 py-2 text-sm">
                            {item.member.firstName} {item.member.lastName}
                          </td>
                          <td className="px-4 py-2 text-sm text-red-600">
                            <ul className="list-disc list-inside">
                              {item.errors.map((error, errIndex) => (
                                <li key={errIndex}>{error}</li>
                              ))}
                            </ul>
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
                <span>Uploading members...</span>
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
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Employee ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Error</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uploadResults.failed.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{item.member.employeeId}</td>
                          <td className="px-4 py-2 text-sm">
                            {item.member.firstName} {item.member.lastName}
                          </td>
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
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Employee ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Branch</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {uploadResults.success.slice(0, 10).map((member, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{member.employeeId}</td>
                          <td className="px-4 py-2 text-sm">
                            {member.firstName} {member.lastName}
                          </td>
                          <td className="px-4 py-2 text-sm">{member.email}</td>
                          <td className="px-4 py-2 text-sm">{member.branch}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {uploadResults.success.length > 10 && (
                    <div className="p-2 text-center text-sm text-gray-500 bg-gray-50">
                      ... and {uploadResults.success.length - 10} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
            disabled={isProcessing}
          >
            {showResults && uploadResults?.failed.length === 0 ? 'Close' : 'Cancel'}
          </button>
          {validationResults && validationResults.valid.length > 0 && !showResults && (
            <button
              onClick={handleUpload}
              className="nbs-button"
              disabled={isProcessing}
            >
              {isProcessing ? 'Uploading...' : `Upload ${validationResults.valid.length} Members`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;