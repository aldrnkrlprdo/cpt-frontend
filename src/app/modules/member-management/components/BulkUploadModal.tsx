
import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { Member } from '../types/MemberManagement.types';
import { MemberManagementService } from '../services/MemberManagement.service';
import * as XLSX from 'xlsx';
import { DownloadIcon } from '../../../shared/components/icons';

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


  const clearUpload = () => {
    setFile(null);
    setParsedData([]);
    setValidationResults(null);
    setUploadResults(null);
    setShowResults(false);
  }

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
      setUploadResults(null);
      setShowResults(false);
      setUploadProgress({ total: 0, processed: 0, successful: 0, failed: 0 });
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
    const valid: ParsedMember[] = [];
    const invalid: { member: ParsedMember; errors: string[] }[] = [];

    // Email tracking for duplicates within the file
    const emailsInFile = new Set<string>();
    const employeeIdsInFile = new Set<string>();

    for (const member of data) {
      const errors: string[] = [];

      // Validate required fields
      if (!member.firstName || member.firstName.trim() === '') {
        errors.push('First name is required');
      }
      if (!member.lastName || member.lastName.trim() === '') {
        errors.push('Last name is required');
      }
      if (!member.employeeId || member.employeeId.trim() === '') {
        errors.push('Employee ID is required');
      }
      if (!member.branch || member.branch.trim() === '') {
        errors.push('Branch is required');
      }

      // Validate email format if provided
      if (member.email && member.email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(member.email)) {
          errors.push('Invalid email format');
        }

        // Check for duplicate emails within the file
        if (emailsInFile.has(member.email.toLowerCase())) {
          errors.push('Duplicate email found in upload file');
        } else {
          emailsInFile.add(member.email.toLowerCase());
        }
      }

      // Validate employeeId for duplicates
      if (member.employeeId && member.employeeId.trim() !== '') {
        // Check for duplicate employee IDs within the file
        if (employeeIdsInFile.has(member.employeeId)) {
          errors.push('Duplicate Employee ID found in upload file');
        } else {
          employeeIdsInFile.add(member.employeeId);
        }
      }

      // Validate phone number format if provided
      if (member.phoneNumber && member.phoneNumber.trim() !== '') {
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (!phoneRegex.test(member.phoneNumber)) {
          errors.push('Invalid phone number format');
        }
        // Validate minimum length
        const digitsOnly = member.phoneNumber.replace(/\D/g, '');
        if (digitsOnly.length < 10) {
          errors.push('Phone number must have at least 10 digits');
        }
      }

      // Validate membership status
      const validStatuses = ['Active', 'Resigned', 'Promoted'];
      if (member.membershipStatus && !validStatuses.includes(member.membershipStatus)) {
        errors.push(`Invalid membership status. Must be one of: ${validStatuses.join(', ')}`);
      }

      // Validate civil status
      const validCivilStatuses = ['Single', 'Married', 'Widowed', 'Divorced', 'Separated'];
      if (member.civilStatus && !validCivilStatuses.includes(member.civilStatus)) {
        errors.push(`Invalid civil status. Must be one of: ${validCivilStatuses.join(', ')}`);
      }

      // Validate date format if provided
      if (member.dateOfJoining) {
        const dateStr = typeof member.dateOfJoining === 'string'
          ? member.dateOfJoining
          : member.dateOfJoining.toISOString().split('T')[0];

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateStr)) {
          errors.push('Date of joining must be in YYYY-MM-DD format');
        } else {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            errors.push('Invalid date of joining');
          } else {
            // Check if date is not in the future
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date > today) {
              errors.push('Date of joining cannot be in the future');
            }
          }
        }
      }

      // Validate name fields don't contain numbers or special characters
      const nameRegex = /^[a-zA-Z\s\-'.]+$/;
      if (member.firstName && !nameRegex.test(member.firstName)) {
        errors.push('First name can only contain letters, spaces, hyphens, apostrophes, and periods');
      }
      if (member.middleName && member.middleName.trim() !== '' && !nameRegex.test(member.middleName)) {
        errors.push('Middle name can only contain letters, spaces, hyphens, apostrophes, and periods');
      }
      if (member.lastName && !nameRegex.test(member.lastName)) {
        errors.push('Last name can only contain letters, spaces, hyphens, apostrophes, and periods');
      }

      // Validate address length if provided
      if (member.address && member.address.trim() !== '') {
        if (member.address.length < 5) {
          errors.push('Address must be at least 5 characters long');
        }
        if (member.address.length > 200) {
          errors.push('Address must not exceed 200 characters');
        }
      }

      if (errors.length > 0) {
        invalid.push({ member, errors });
      } else {
        valid.push(member);
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

    const BATCH_SIZE = 50; // Process 50 records at a time
    const batches: ParsedMember[][] = [];

    // Split valid records into batches
    for (let i = 0; i < validationResults.valid.length; i += BATCH_SIZE) {
      batches.push(validationResults.valid.slice(i, i + BATCH_SIZE));
    }

    const allSuccessful: Member[] = [];
    const allFailed: { member: Partial<Member>; error: string }[] = [];

    try {
      // Process each batch sequentially
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        try {
          const batchResults = await MemberManagementService.bulkUploadMembers(batch);

          allSuccessful.push(...batchResults.success);
          allFailed.push(...batchResults.failed);

          // Update progress
          setUploadProgress(prev => ({
            ...prev,
            processed: Math.min(prev.total, (i + 1) * BATCH_SIZE),
            successful: allSuccessful.length,
            failed: allFailed.length
          }));

          // Small delay between batches to prevent overwhelming the server
          if (i < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`Error processing batch ${i + 1}:`, error);
          // Mark remaining items in this batch as failed
          batch.forEach(member => {
            allFailed.push({
              member,
              error: 'Batch processing failed'
            });
          });
        }
      }

      // Set final results
      setUploadResults({
        success: allSuccessful,
        failed: allFailed
      });

      setUploadProgress({
        total: validationResults.valid.length,
        processed: validationResults.valid.length,
        successful: allSuccessful.length,
        failed: allFailed.length
      });

      setShowResults(true);

      if (allSuccessful.length > 0) {
        toast.success(`Successfully uploaded ${allSuccessful.length} member(s)`);
        if (allFailed.length === 0) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      }

      if (allFailed.length > 0) {
        toast.warning(`${allFailed.length} record(s) failed to upload`);
      }
    } catch (error: any) {
      console.error('Error uploading members:', error);
      toast.error(error.response?.data?.message || 'Failed to upload members');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewUpload = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setParsedData([]);
    setValidationResults(null);
    setUploadResults(null);
    setShowResults(false);
    setUploadProgress({ total: 0, processed: 0, successful: 0, failed: 0 });
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Employee ID': '000001',
        'First Name': 'John',
        'Middle Name': 'M',
        'Last Name': 'Doe',
        'Branch': 'Ali Mall',
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

  const downloadErrorReport = () => {
    if (!validationResults?.invalid || validationResults.invalid.length === 0) {
      toast.warning('No validation errors to download');
      return;
    }

    const errorData = validationResults.invalid.map(item => ({
      'Row': item.member.rowNumber || '-',
      'Employee ID': item.member.employeeId || '-',
      'First Name': item.member.firstName || '-',
      'Middle Name': item.member.middleName || '-',
      'Last Name': item.member.lastName || '-',
      'Branch': item.member.branch || '-',
      'Email': item.member.email || '-',
      'Phone Number': item.member.phoneNumber || '-',
      'Membership Status': item.member.membershipStatus || '-',
      'Civil Status': item.member.civilStatus || '-',
      'Date of Joining': item.member.dateOfJoining?.toString() || '-',
      'Errors': Array.isArray(item.errors) ? item.errors.join('; ') : item.errors
    }));

    const ws = XLSX.utils.json_to_sheet(errorData);

    // Set column widths
    ws['!cols'] = [
      { wch: 8 },   // Row
      { wch: 15 },  // Employee ID
      { wch: 15 },  // First Name
      { wch: 15 },  // Middle Name
      { wch: 15 },  // Last Name
      { wch: 20 },  // Branch
      { wch: 25 },  // Email
      { wch: 15 },  // Phone Number
      { wch: 18 },  // Membership Status
      { wch: 15 },  // Civil Status
      { wch: 15 },  // Date of Joining
      { wch: 60 }   // Errors
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Validation Errors');
    XLSX.writeFile(wb, 'member_validation_errors.xlsx');
    toast.success('Error report downloaded successfully');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Bulk Upload Members</h2>
          <button onClick={() => { clearUpload(); onClose(); }} className="text-gray-600 hover:text-gray-900" disabled={isProcessing}>
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
                <div className="text-3xl font-bold text-blue-600">{parsedData.length + validationResults.invalid.length}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-700 font-medium mb-1">Valid Records</div>
                <div className="text-3xl font-bold text-green-600">{parsedData.length}</div>
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
            {validationResults.invalid.length > 0 && !showResults && (
              <div className="space-y-6">
                {/* Validation Errors */}
                {validationResults.invalid.length > 0 && (
                  <div className="border border-red-200 rounded-lg overflow-hidden">
                    <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex justify-between items-center">
                      <h3 className="font-semibold text-red-900">
                        Validation Errors ({validationResults.invalid.length})
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
                            <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Employee ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-red-700 uppercase">Errors</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-red-100">
                          {validationResults.invalid.map((error, index) => (
                            <tr key={index} className="hover:bg-red-50">
                              <td className="px-4 py-2 text-sm text-gray-900">{error.member.rowNumber}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{error.member.employeeId || '-'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{`${error.member.firstName} ${error.member.lastName}` || '-'}</td>
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

                {/* Valid Member Preview */}
                {parsedData.length > 0 && (
                  <div className="border border-green-200 rounded-lg overflow-hidden">
                    <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                      <h3 className="font-semibold text-green-900">
                        Valid Member Preview ({parsedData.length})
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-auto">
                      <table className="min-w-full divide-y divide-green-200">
                        <thead className="bg-green-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Employee ID</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">First Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Middle Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Last Name</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Branch</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Phone Number</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Address</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-green-700 uppercase">Employment Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-green-100">
                          {parsedData.map((member, index) => (
                            <tr key={index} className="hover:bg-green-50">
                              <td className="px-4 py-2 text-sm text-gray-900">{member.employeeId}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{member.firstName}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{member.middleName}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{member.lastName}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{member.branch}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{member.email}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{member.phoneNumber}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{member.address}%</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{member.membershipStatus || 'Active'}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{member.dateOfJoining?.toString()}</td>
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
                      {uploadResults.success.map((member, index) => (
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
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            onClick={() => { clearUpload(); onClose(); }}
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
          {showResults && (
            <button
              onClick={handleNewUpload}
              className="nbs-button"
              disabled={isProcessing}
            >
              New Upload
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;