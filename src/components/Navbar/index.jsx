import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeContext } from '../../theme/AppThemeProvider';
import { EmployeesTopTabs } from '../../pages/Employees/EmployeesTopTabs';
import { FinancialTopTabs } from '../../pages/FinancialServices/FinancialTopTabs';
import { AcademicsTopTabs } from '../../pages/Academics/AcademicsTopTabs';
import './Navbar.scss';

export const Navbar = ({ title }) => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { pathname } = useLocation();
  const showEmployeesTabs =
    pathname.startsWith('/employees') && !pathname.startsWith('/employees/teachers/onboarding');
  const showFinancialTabs = pathname.startsWith('/financial-services');
  const isAcademicsSectionRoster = pathname.startsWith('/academics/student-management/section/');
  const showAcademicsTabs = pathname.startsWith('/academics') && !isAcademicsSectionRoster;
  const showCenterTitle =
    isAcademicsSectionRoster ||
    (!showEmployeesTabs && !showFinancialTabs && !showAcademicsTabs);

  return (
    <header className="navbar">
      <div className="nav-left">
        <button className="menu-btn">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div
          className={`nav-title-block${showEmployeesTabs || showFinancialTabs || showAcademicsTabs || isAcademicsSectionRoster ? ' nav-title-block--section-tabs' : ''}`}
        >
          {showCenterTitle ? <h2 className="nav-title">{title}</h2> : null}
          {showEmployeesTabs ? <EmployeesTopTabs /> : null}
          {showFinancialTabs ? <FinancialTopTabs /> : null}
          {showAcademicsTabs ? <AcademicsTopTabs /> : null}
        </div>
      </div>
      
      <div className="nav-right">
        <div className="status-badge">
          <span className="pulse-dot"></span>
          <span className="status-text">System Online</span>
        </div>
        
        <button className="icon-btn" onClick={toggleTheme}>
          <span className="material-symbols-outlined">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
        
        <button className="icon-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div className="profile-section">
          <div className="profile-info">
            <p className="profile-name">Admin User</p>
            <p className="profile-role">Principal Office</p>
          </div>
          <div className="profile-avatar">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};
