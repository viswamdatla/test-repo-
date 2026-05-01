import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatMonth = (d) => `${monthShort[d.getMonth()]} ${d.getFullYear()}`;

const createMockSalary = () => {
  const base = [
    { id: 'sal-1', month: 'Oct 2023', department: 'Administration', amount: 42000.0, status: 'Approved' },
    { id: 'sal-2', month: 'Oct 2023', department: 'Science Department', amount: 28650.75, status: 'Pending' },
    { id: 'sal-3', month: 'Sep 2023', department: 'Transport Office', amount: 15890.2, status: 'Approved' },
    { id: 'sal-4', month: 'Sep 2023', department: 'Hostel Services', amount: 12650.0, status: 'Rejected' },
    { id: 'sal-5', month: 'Aug 2023', department: 'Sports Department', amount: 9800.5, status: 'Approved' },
  ];

  const departments = [
    'Administration',
    'Science Department',
    'Math Department',
    'Transport Office',
    'Hostel Services',
    'Sports Department',
    'Library Team',
    'IT Department',
  ];
  const statuses = ['Approved', 'Pending', 'Rejected'];

  const targetTotal = 42;
  const start = new Date('2023-08-01T00:00:00');
  const items = [...base];

  for (let i = items.length; i < targetTotal; i += 1) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i);

    const department = departments[i % departments.length];
    const status = statuses[i % statuses.length];

    const amountBase = 800 + ((i * 511) % 32000);
    const amount = Math.round(amountBase * (0.7 + (i % 6) * 0.05) * 100) / 100;

    items.push({
      id: `sal-${i + 1}`,
      month: formatMonth(d),
      department,
      amount,
      status,
    });
  }

  return items;
};

export const fetchSalaries = createAsyncThunk('salary/fetchSalaries', async () => {
  // Replace with backend call later.
  return createMockSalary();
});

const salarySlice = createSlice({
  name: 'salary',
  initialState: {
    loadStatus: 'idle',
    items: [],
    searchQuery: '',
    statusFilter: 'all',
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
      .addCase(fetchSalaries.pending, (state) => {
        state.loadStatus = 'loading';
      })
      .addCase(fetchSalaries.fulfilled, (state, action) => {
        state.loadStatus = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSalaries.rejected, (state) => {
        state.loadStatus = 'failed';
      });
  },
});

export const { setSearchQuery, setStatusFilter, setPage } = salarySlice.actions;

export const selectSalaryItems = (state) => state.salary.items;

export const selectSalaryUi = (state) => ({
  searchQuery: state.salary.searchQuery,
  statusFilter: state.salary.statusFilter,
  page: state.salary.page,
  pageSize: state.salary.pageSize,
});

export default salarySlice.reducer;

