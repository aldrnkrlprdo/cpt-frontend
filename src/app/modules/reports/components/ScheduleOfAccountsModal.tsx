import React, { useState } from 'react';
import { toast } from 'react-toastify';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (startYear: number, endYear: number, format: 'excel' | 'pdf') => void;
  loading: boolean;
}

const ScheduleOfAccountsModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, loading }) => {
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState<number>(currentYear);
  const [endYear, setEndYear] = useState<number>(currentYear);

  if (!isOpen) return null;

  const handleGenerate = (format: 'excel' | 'pdf') => {
    if (startYear > endYear) {
      toast.error('Start year cannot be after end year.');
      return;
    }
    onSubmit(startYear, endYear, format);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Generate Schedule of Accounts</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900" disabled={loading}>
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        <div className="space-y-4">
          <div className="mb-4">
            <label htmlFor="startYear" className="block text-sm font-medium text-gray-700 mb-2">
              Start Year <span className="text-red-500">*</span>
            </label>
            <input
              id="startYear"
              type="number"
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
              className="nbs-input w-full"
              required
              disabled={loading}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="endYear" className="block text-sm font-medium text-gray-700 mb-2">
              End Year <span className="text-red-500">*</span>
            </label>
            <input
              id="endYear"
              type="number"
              value={endYear}
              onChange={(e) => setEndYear(parseInt(e.target.value, 10))}
              className="nbs-input w-full"
              required
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="nbs-button-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="button" onClick={() => handleGenerate('excel')} className="nbs-button" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Excel Report'}
            </button>
            <button type="button" onClick={() => handleGenerate('pdf')} className="nbs-button" disabled={loading}>
              {loading ? 'Generating...' : 'Generate PDF Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleOfAccountsModal;