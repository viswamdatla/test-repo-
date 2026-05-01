import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatPeriod = (d) => `${monthShort[d.getMonth()]} ${d.getFullYear()}`;

const createMockFees = () => {
  const base = [
    { id: 'fee-1', period: 'Oct 2023', feeType: 'Tuition', studentCount: 120, amount: 48000.0, status: 'Approved' },
    { id: 'fee-2', period: 'Oct 2023', feeType: 'Transport', studentCount: 78, amount: 15600.5, status: 'Pending' },
    { id: 'fee-3', period: 'Sep 2023', feeType: 'Library', studentCount: 98, amount: 2940.0, status: 'Approved' },
    { id: 'fee-4', period: 'Sep 2023', feeType: 'Examination', studentCount: 65, amount: 6500.75, status: 'Rejected' },
    { id: 'fee-5', period: 'Aug 2023', feeType: 'Tuition', studentCount: 118, amount: 47250.0, status: 'Approved' },
  ];

  const feeTypes = ['Tuition', 'Transport', 'Library', 'Examination', 'Other'];
  const statuses = ['Approved', 'Pending', 'Rejected'];

  const targetTotal = 42;
  const start = new Date('2023-08-01T00:00:00');
  const items = [...base];

  for (let i = items.length; i < targetTotal; i += 1) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);

    const feeType = feeTypes[i % feeTypes.length];
    const status = statuses[i % statuses.length];

    const studentCountBase = 40 + ((i * 37) % 140);
    const studentCount = Math.max(1, studentCountBase - (feeType === 'Examination' ? 10 : 0));
    const amountBase = 120 + ((i * 411) % 8200);
    const amount = Math.round((amountBase * (studentCount / 100)) * 100) / 100;

    items.push({
      id: `fee-${i + 1}`,
      period: formatPeriod(d),
      feeType,
      studentCount,
      amount,
      status,
    });
  }

  return items;
};

export const fetchFees = createAsyncThunk('fees/fetchFees', async () => {
  // Replace with backend call later.
  return createMockFees();
});

const feesSlice = createSlice({
  name: 'fees',
  initialState: {
    loadStatus: 'idle', // idle | loading | succeeded | failed
    items: [],
    searchQuery: '',
    statusFilter: 'all', // all | Approved | Pending | Rejected
    page: 1,
    pageSize: 5,
  },
  reducers: {
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
      state.page = 1;
    },
    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
      state.page = 1;
    },
    setPage(state, action) {
      state.page = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFees.pending, (state) => {
        state.loadStatus = 'loading';
      })
      .addCase(fetchFees.fulfilled, (state, action) => {
        state.loadStatus = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchFees.rejected, (state) => {
        state.loadStatus = 'failed';
      });
  },
});

export const { setSearchQuery, setStatusFilter, setPage } = feesSlice.actions;

export const selectFeesItems = (state) => state.fees.items;

export const selectFeesUi = (state) => ({
  searchQuery: state.fees.searchQuery,
  statusFilter: state.fees.statusFilter,
  page: state.fees.page,
  pageSize: state.fees.pageSize,
});

export default feesSlice.reducer;

