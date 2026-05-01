import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PageLayout } from './layout/PageLayout';
import { Dashboard } from './pages/Dashboard';
import { Admission } from './pages/Admission';
import { FinancialServicesLayout } from './pages/FinancialServices/FinancialServicesLayout';
import { FinancialServicesOverview } from './pages/FinancialServices/FinancialServicesOverview';
import { FeeManagement } from './pages/FinancialServices/FeeManagement';
import { SalaryManagement } from './pages/FinancialServices/SalaryManagement';
import { OtherExpenses } from './pages/FinancialServices/OtherExpenses';
import { EmployeesLayout } from './pages/Employees/EmployeesLayout';
import { EmployeesDashboard } from './pages/Employees/EmployeesDashboard';
import { TeachersDirectory } from './pages/Employees/TeachersDirectory';
import { TeacherOnboardingPage } from './pages/Employees/TeacherOnboardingPage';
import { AdministrationDirectory } from './pages/Employees/AdministrationDirectory';
import { OperationalStaffDirectory } from './pages/Employees/OperationalStaffDirectory';
import { AcademicsLayout } from './pages/Academics/AcademicsLayout';
import { AcademicsModernPage } from './pages/Academics/AcademicsModernPage';
import { SectionStudentsPage } from './pages/Academics/SectionStudentsPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { UserManagementPage } from './pages/UserManagement/UserManagementPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="admission" element={<Admission />} />
          <Route path="employees" element={<EmployeesLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<EmployeesDashboard />} />
            <Route path="teachers" element={<TeachersDirectory />} />
            <Route path="teachers/onboarding" element={<TeacherOnboardingPage />} />
            <Route path="administration" element={<AdministrationDirectory />} />
            <Route path="operational-staff" element={<OperationalStaffDirectory />} />
          </Route>
          <Route path="financial-services" element={<FinancialServicesLayout />}>
            <Route index element={<FinancialServicesOverview />} />
            <Route path="fee-management" element={<FeeManagement />} />
            <Route path="salary-management" element={<SalaryManagement />} />
            <Route path="other-expenses" element={<OtherExpenses />} />
          </Route>
          <Route path="academics" element={<AcademicsLayout />}>
            <Route index element={<Navigate to="student-management" replace />} />
            <Route path="student-management" element={<AcademicsModernPage pageKey="studentManagement" />} />
            <Route path="student-management/section/:sectionId" element={<SectionStudentsPage />} />
            <Route path="attendance" element={<AcademicsModernPage pageKey="attendance" />} />
            <Route path="grades" element={<AcademicsModernPage pageKey="grades" />} />
          </Route>
          <Route path="user-management" element={<UserManagementPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
