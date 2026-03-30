import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MasterRecordService } from '../services/MasterRecord.service';
import { LoanType, Branch } from '../types/MasterRecord.types';
import { RootState } from '../../../setup/redux/RootReducer';

export interface MasterRecordState {
  loanTypes: LoanType[];
  branches: Branch[];
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: MasterRecordState = {
  loanTypes: [],
  branches: [],
  loading: 'idle',
  error: null,
};

export const fetchMasterRecords = createAsyncThunk(
  'masterRecord/fetchMasterRecords',
  async (_, { rejectWithValue }) => {
    try {
      const [loanTypesData, branchesData] = await Promise.all([
        MasterRecordService.getLoanTypes(),
        MasterRecordService.getBranches(),
      ]);

      // Normalize the ID field for both datasets
      const loanTypes = loanTypesData.map((lt: any) => ({ ...lt, id: lt._id || lt.id }));
      const branches = branchesData.map((b: any) => ({ ...b, id: b._id || b.id }));

      return { loanTypes, branches };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch master records');
    }
  }
);

const masterRecordSlice = createSlice({
  name: 'masterRecord',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterRecords.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(fetchMasterRecords.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.loanTypes = action.payload.loanTypes;
        state.branches = action.payload.branches;
      })
      .addCase(fetchMasterRecords.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.payload as string;
      });
  },
});

// Selectors
export const selectLoanTypes = (state: RootState) => state.masterRecord.loanTypes;
export const selectBranches = (state: RootState) => state.masterRecord.branches;
export const selectMasterRecordLoading = (state: RootState) => state.masterRecord.loading;
export const selectMasterRecordError = (state: RootState) => state.masterRecord.error;

export default masterRecordSlice.reducer;