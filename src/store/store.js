import { configureStore } from '@reduxjs/toolkit';
import expensesReducer from './expenses/expensesSlice';
import feesReducer from './fees/feesSlice';
import salaryReducer from './salary/salarySlice';
import employeesReducer from './employees/employeesSlice';
import academicsReducer from './academics/academicsSlice';
import settingsReducer from './settings/settingsSlice';
import userManagementReducer from './userManagement/userManagementSlice';

export const store = configureStore({
  reducer: {
    expenses: expensesReducer,
    fees: feesReducer,
    salary: salaryReducer,
    employees: employeesReducer,
    academics: academicsReducer,
    settings: settingsReducer,
    userManagement: userManagementReducer,
  },
});

