import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PageLayout } from './layout/PageLayout';
import { Dashboard } from './pages/Dashboard';
import { Admission } from './pages/Admission';
import { FinancialServicesLayout } from './pages/FinancialServices/FinancialServicesLayout';
import { FeeManagement } from './pages/FinancialServices/FeeManagement';
import { SalaryManagement } from './pages/FinancialServices/SalaryManagement';
import { OtherExpenses } from './pages/FinancialServices/OtherExpenses';
import { EmployeesLayout } from './pages/Employees/EmployeesLayout';
import { TeachersDirectory } from './pages/Employees/TeachersDirectory';
import { TeacherOnboardingPage } from './pages/Employees/TeacherOnboardingPage';
import { AdministrationDirectory } from './pages/Employees/AdministrationDirectory';
import { OperationalStaffDirectory } from './pages/Employees/OperationalStaffDirectory';
import { AcademicsLayout } from './pages/Academics/AcademicsLayout';
import { AcademicsWizardLayout } from './pages/Academics/wizard/AcademicsWizardLayout';
import { AcademicsFlatGatewayPage } from './pages/Academics/wizard/AcademicsFlatGatewayPage';
import { StudentManagementStudentListPage } from './pages/Academics/studentManagement/StudentManagementStudentListPage';
import { StudentManagementStudentDetailPage } from './pages/Academics/studentManagement/StudentManagementStudentDetailPage';
import { AttendanceLogPage } from './pages/Academics/AttendanceLogPage';
import { GradesLogPage } from './pages/Academics/GradesLogPage';
import { StudentGradesDetailPage } from './pages/Academics/StudentGradesDetailPage';
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
            <Route index element={<TeachersDirectory />} />
            <Route path="teachers" element={<TeachersDirectory />} />
            <Route path="teachers/onboarding" element={<TeacherOnboardingPage />} />
            <Route path="administration" element={<AdministrationDirectory />} />
            <Route path="operational-staff" element={<OperationalStaffDirectory />} />
          </Route>
          <Route path="financial-services" element={<FinancialServicesLayout />}>
            <Route index element={<FeeManagement />} />
            <Route path="fee-management" element={<FeeManagement />} />
            <Route path="salary-management" element={<SalaryManagement />} />
            <Route path="other-expenses" element={<OtherExpenses />} />
          </Route>
          <Route path="academics" element={<AcademicsLayout />}>
            <Route index element={<Navigate to="student-management" replace />} />
            <Route path="student-management" element={<AcademicsWizardLayout />}>
              <Route index element={<AcademicsFlatGatewayPage />} />
              <Route path=":classSlug/:sectionSlug/:studentId" element={<StudentManagementStudentDetailPage />} />
              <Route path=":classSlug/:sectionSlug" element={<StudentManagementStudentListPage />} />
              <Route path=":classSlug" element={<AcademicsFlatGatewayPage />} />
            </Route>
            <Route path="attendance" element={<AcademicsWizardLayout />}>
              <Route index element={<AcademicsFlatGatewayPage />} />
              <Route path=":classSlug/:sectionSlug" element={<AttendanceLogPage />} />
              <Route path=":classSlug" element={<AcademicsFlatGatewayPage />} />
            </Route>
            <Route path="grades" element={<AcademicsWizardLayout />}>
              <Route index element={<AcademicsFlatGatewayPage />} />
              <Route path=":classSlug/:sectionSlug/student/:studentSlug" element={<StudentGradesDetailPage />} />
              <Route path=":classSlug/:sectionSlug" element={<GradesLogPage />} />
              <Route path=":classSlug" element={<AcademicsFlatGatewayPage />} />
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
