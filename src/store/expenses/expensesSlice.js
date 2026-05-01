import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatDate = (date) => {
  const m = monthShort[date.getMonth()];
  const d = date.getDate();
  const y = date.getFullYear();
  return `${m} ${d}, ${y}`;
};

const createMockOtherExpenses = () => {
  const base = [
    {
      id: 'exp-1',
      date: 'Oct 24, 2023',
      category: 'Electricity',
      description: 'Monthly Utility Bill',
      amount: 3450.0,
      status: 'Approved',
    },
    {
      id: 'exp-2',
      date: 'Oct 22, 2023',
      category: 'Repair',
      description: 'Lab Equipment Maintenance',
      amount: 1120.45,
      status: 'Pending',
    },
    {
      id: 'exp-3',
      date: 'Oct 20, 2023',
      category: 'Supplies',
      description: 'Annual Stationery Restock',
      amount: 890.2,
      status: 'Approved',
    },
    {
      id: 'exp-4',
      date: 'Oct 18, 2023',
      category: 'Miscellaneous',
      description: 'Sports Day Trophies',
      amount: 450.0,
      status: 'Rejected',
    },
    {
      id: 'exp-5',
      date: 'Oct 15, 2023',
      category: 'Internet',
      description: 'Leased Line Subscription',
      amount: 6000.0,
      status: 'Approved',
    },
  ];

  const categories = ['Electricity', 'Repair', 'Supplies', 'Miscellaneous', 'Internet', 'Cleaning', 'Catering'];
  const descriptions = [
    'Campus Utility Charges',
    'Preventive Maintenance',
    'Workshop Material Purchase',
    'Event Support & Consumables',
    'Network Equipment Renewal',
    'Facility Cleaning Services',
    'Guest Lecturer Refreshments',
    'Inventory Replenishment',
  ];
  const statuses = ['Approved', 'Pending', 'Rejected'];

  const targetTotal = 42;
  const start = new Date('2023-10-15T00:00:00');
  const items = [...base];

  for (let i = items.length; i < targetTotal; i += 1) {
    const date = new Date(start);
    date.setDate(date.getDate() - (i - (base.length - 1)) * 1.5);

    const category = categories[i % categories.length];
    const description = descriptions[(i * 3) % descriptions.length];

    // Deterministic pseudo-pricing for a realistic table.
    const amountBase = 120 + (i * 137) % 4200;
    const amount = Math.round((amountBase + (i % 7) * 0.45) * 100) / 100;
    const status = statuses[i % statuses.length];

    items.push({
      id: `exp-${i + 1}`,
      date: formatDate(date),
      category,
      description,
      amount,
      status,
    });
  }

  return items;
};

export const fetchOtherExpenses = createAsyncThunk(
  'expenses/fetchOtherExpenses',
  async () => {
    // Swap this with a real API call when you connect the backend.
    const items = createMockOtherExpenses();
    return items;
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
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
      .addCase(fetchOtherExpenses.pending, (state) => {
        state.loadStatus = 'loading';
      })
      .addCase(fetchOtherExpenses.fulfilled, (state, action) => {
        state.loadStatus = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchOtherExpenses.rejected, (state) => {
        state.loadStatus = 'failed';
      });
  },
});

export const { setSearchQuery, setStatusFilter, setPage } = expensesSlice.actions;

export const selectOtherExpensesItems = (state) => state.expenses.items;

export const selectExpensesUi = (state) => ({
  searchQuery: state.expenses.searchQuery,
  statusFilter: state.expenses.statusFilter,
  page: state.expenses.page,
  pageSize: state.expenses.pageSize,
});

export default expensesSlice.reducer;

