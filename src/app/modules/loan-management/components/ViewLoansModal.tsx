import React, { useCallback, useEffect, useState } from 'react';
import { Member } from '../../member-management/types/MemberManagement.types';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import { EditIcon, TrashIcon } from '../../../shared/components/icons';
import { Loan } from '../types/LoanManagement.types';
import EditLoanModal from './EditLoanModal';
import { useSelector } from 'react-redux';
import { selectBranches, selectLoanTypes } from '../../master-record/redux/masterRecordSlice';
import { LoanManagementService } from '../services/LoanManagement.service';
import { toast } from 'react-toastify';

interface Props {
  member: Member;
  onClose: () => void;
}

const ViewLoansModal: React.FC<Props> = ({ member, onClose }) => {
  const [loanDetails, setLoanDetails] = useState<Loan>();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const loanTypes = useSelector(selectLoanTypes);
  const branches = useSelector(selectBranches);

  const fetchLoanLists = useCallback(async () => {
    try {
      setLoading(true);
      const memberLoans = await LoanManagementService.getLoansByEmployeeId(member.employeeId);

      const processedLoans = memberLoans.map((loan) => ({
        ...loan,
        loanType: loanTypes.find(lt => lt.loanTypeCode === loan.loanType)?.loanTypeName || loan.loanType,
      }));

      setLoans(processedLoans);
    } catch (error) {
      console.error('Failed to fetch loan data:', error);
      toast.error('Failed to fetch loan data for this member.');
    } finally {
      setLoading(false);
    }
  }, [loanTypes, member.employeeId]);

  useEffect(() => {
    if (loanTypes.length > 0 && branches.length > 0) {
      fetchLoanLists();
    }
  }, [loanTypes, branches, fetchLoanLists]);

  const handleEditLoanClick = (loanId: string) => {
    const selectedLoan = loans.find(loan => loan.loanId === loanId);
    if (selectedLoan) {
      setLoanDetails({
        ...selectedLoan,
        loanDate: selectedLoan.loanDate.split('T')[0],
        maturityDate: selectedLoan.maturityDate.split('T')[0],
      });
      setShowEdit(true);
    }
  };

  const handleDeleteLoanClick = async (loanId: string) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        await LoanManagementService.deleteLoan(loanId);
        toast.success('Loan deleted successfully!');
        fetchLoanLists();
      } catch (error) {
        toast.error('Failed to delete loan');
        console.error('Error deleting loan:', error);
      }
    }
  };

  const onCloseEditModal = () => {
    setShowEdit(false);
    setLoanDetails(undefined);
  }

  const ActionsCellRenderer = (props: { data: Loan }) => {
    return (
      <div className="flex items-center justify-center h-full space-x-2">
        <button onClick={() => handleEditLoanClick(props.data.loanId)} title="Edit Loans" className="text-green-600 hover:text-green-800">
          <EditIcon className="w-5 h-5" />
        </button>
        <button onClick={() => handleDeleteLoanClick(props.data.loanId)} title="Delete Loans" className="text-blue-600 hover:text-blue-800">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const columnDefs: ColDef[] = [
    {
      headerName: 'Actions',
      pinned: 'left',
      cellRenderer: ActionsCellRenderer,
      width: 100,
      resizable: false,
      sortable: false,
      filter: false,
    },
    { headerName: 'Loan ID', field: 'loanId', sortable: true, filter: true },
    { headerName: 'Loan Amount', field: 'loanAmount', sortable: true, filter: true, valueFormatter: (params) => params.data.loanAmount.toFixed(2) },
    { headerName: 'Monthly Payment', field: 'monthlyPayment', sortable: true, filter: true, valueFormatter: (params) => params.data.monthlyPayment.toFixed(2) },
    { headerName: 'Remaining Balance', field:'remainingBalance', sortable: true, filter: true, valueFormatter: (params) => params.data.remainingBalance.toFixed(2) },
    { headerName: 'Total Payable', field: 'totalPayable', sortable: true, filter: true, valueFormatter: (params) => params.data.totalPayable.toFixed(2) },
    { headerName: 'Loan Term', field: 'loanTerm', sortable: true, filter: true },
    { headerName: 'Interest', field: 'interest', sortable: true, filter: true, valueFormatter: (params) => `${params.data.interest}%` },
    { headerName: 'Status', field: 'status', sortable: true, filter: true },
    { headerName: 'Loan Type', field: 'loanType', sortable: true, filter: true },
    { headerName: 'Loan Date', field: 'loanDate', sortable: true, filter: true, valueFormatter: (params) => params.data.loanDate.split('T')[0] },
    { headerName: 'Maturity Date', field: 'maturityDate', sortable: true, filter: true, valueFormatter: (params) => params.data.maturityDate.split('T')[0] },
    { headerName: 'Branch', field: 'branch', sortable: true, filter: true },
    { headerName: 'Date Created', field: 'createdAt', sortable: true, filter: true, valueFormatter: (params) => params.data.createdAt.split('T')[0] },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-4xl shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Loans for {member.firstName} {member.lastName} (ID: {member.employeeId})
          </h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        {
          loading ?
            (
              <p className="text-center">Loading loans...</p>
            )
            :
            (
              <div className="ag-theme-alpine h-[600px] w-full">
                <AgGridReact
                  rowData={loans}
                  columnDefs={columnDefs}
                  defaultColDef={{ sortable: true, filter: true, resizable: true }}
                  pagination={true}
                  paginationPageSize={10}
                  paginationPageSizeSelector={[10, 20, 50, 100]}
                  suppressRowClickSelection={true}
                  overlayLoadingTemplate='<span class="ag-overlay-loading-center">Please wait while your rows are loading</span>'
                  animateRows={true}
                />
              </div>
            )
        }
        {showEdit && <EditLoanModal
          loanDetails={loanDetails}
          onClose={onCloseEditModal}
          member={member}
          loanTypes={loanTypes}
          branches={branches}
        />}
      </div>
    </div >
  )
}

export default ViewLoansModal;