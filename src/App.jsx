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
import { CollectFeeFlowPage } from './pages/FinancialServices/CollectFeeFlowPage';
import { EmployeesLayout } from './pages/Employees/EmployeesLayout';
import { EmployeesDashboard } from './pages/Employees/EmployeesDashboard';
import { TeachersDirectory } from './pages/Employees/TeachersDirectory';
import { TeacherOnboardingPage } from './pages/Employees/TeacherOnboardingPage';
import { AdministrationDirectory } from './pages/Employees/AdministrationDirectory';
import { OperationalStaffDirectory } from './pages/Employees/OperationalStaffDirectory';
import { LeaveManagementPage } from './pages/Employees/LeaveManagementPage';
import { LeaveApplicationPage } from './pages/Employees/LeaveApplicationPage';
import { EmployeeDetailPage } from './pages/Employees/EmployeeDetailPage';
import { AcademicsLayout } from './pages/Academics/AcademicsLayout';
import { AcademicsModernPage } from './pages/Academics/AcademicsModernPage';
import { AcademicsKeyedOutlet } from './pages/Academics/AcademicsKeyedOutlet';
import { AttendanceLogPage } from './pages/Academics/AttendanceLogPage';
import { GradesLogPage } from './pages/Academics/GradesLogPage';
import { SectionStudentsPage } from './pages/Academics/SectionStudentsPage';
import { SectionTimeTablePage } from './pages/Academics/SectionTimeTablePage';
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
            <Route path="leave-management" element={<LeaveManagementPage />} />
            <Route path="leave-management/new" element={<LeaveApplicationPage />} />
            <Route path="profile/:section/:employeeId" element={<EmployeeDetailPage />} />
          </Route>
          <Route path="financial-services" element={<FinancialServicesLayout />}>
            <Route index element={<FinancialServicesOverview />} />
            <Route path="collect-fee" element={<CollectFeeFlowPage />} />
            <Route path="fee-management" element={<FeeManagement />} />
            <Route path="salary-management" element={<SalaryManagement />} />
            <Route path="other-expenses" element={<OtherExpenses />} />
          </Route>
          <Route path="academics" element={<AcademicsLayout />}>
            <Route index element={<Navigate to="student-management" replace />} />
            <Route path="student-management" element={<AcademicsModernPage pageKey="studentManagement" />} />
            <Route path="student-management/section/:sectionId" element={<SectionStudentsPage />} />
            <Route path="time-table" element={<AcademicsModernPage pageKey="timeTable" />} />
            <Route path="time-table/section/:sectionId" element={<SectionTimeTablePage />} />
            <Route path="attendance" element={<AcademicsKeyedOutlet wizardBase="/academics/attendance" />}>
              <Route index element={<AcademicsModernPage pageKey="attendance" />} />
              <Route path=":classSlug/:sectionSlug" element={<AttendanceLogPage />} />
            </Route>
            <Route path="grades" element={<AcademicsKeyedOutlet wizardBase="/academics/grades" />}>
              <Route index element={<AcademicsModernPage pageKey="grades" />} />
              <Route path=":classSlug/:sectionSlug" element={<GradesLogPage />} />
            </Route>
          </Route>
          <Route path="user-management" element={<UserManagementPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
