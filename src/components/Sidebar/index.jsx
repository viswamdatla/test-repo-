import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.scss';

const employeeSubItems = [
  { to: '/employees/teachers', label: 'Staff Directory', icon: 'badge' },
  { to: '/employees/administration', label: 'Administration', icon: 'admin_panel_settings' },
  { to: '/employees/operational-staff', label: 'Operational Staff', icon: 'engineering' },
];

const financialSubItems = [
  { to: '/financial-services/fee-management', label: 'Fee Management', icon: 'receipt_long' },
  { to: '/financial-services/salary-management', label: 'Salary Management', icon: 'badge' },
  { to: '/financial-services/other-expenses', label: 'Other expenses', icon: 'inventory_2' }
];

const academicsSubItems = [
  { to: '/academics/student-management', label: 'Student Management', icon: 'groups' },
  { to: '/academics/attendance', label: 'Attendance', icon: 'fact_check' },
  { to: '/academics/grades', label: 'Grades', icon: 'grading' },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const topEmployeePath = employeeSubItems[0].to;
  const topFinancialPath = financialSubItems[0].to;
  const topAcademicsPath = academicsSubItems[0].to;

  const isInFinancialServices = useMemo(
    () => location.pathname.startsWith('/financial-services'),
    [location.pathname]
  );
  const isInEmployees = useMemo(() => location.pathname.startsWith('/employees'), [location.pathname]);
  const isInAcademics = useMemo(() => location.pathname.startsWith('/academics'), [location.pathname]);

  const [isEmployeesOpen, setIsEmployeesOpen] = useState(isInEmployees);
  const [isFinancialOpen, setIsFinancialOpen] = useState(isInFinancialServices);
  const [isAcademicsOpen, setIsAcademicsOpen] = useState(isInAcademics);

  useEffect(() => {
    setIsEmployeesOpen(isInEmployees);
  }, [isInEmployees]);

  useEffect(() => {
    // Keep dropdown open while user is navigating inside Financial Services.
    setIsFinancialOpen(isInFinancialServices);
  }, [isInFinancialServices]);

  useEffect(() => {
    setIsAcademicsOpen(isInAcademics);
  }, [isInAcademics]);

  const handleEmployeesClick = () => {
    if (isEmployeesOpen) {
      setIsEmployeesOpen(false);
      return;
    }
    setIsEmployeesOpen(true);
    if (!isInEmployees) {
      navigate(topEmployeePath);
    }
  };

  const handleFinancialClick = () => {
    if (isFinancialOpen) {
      setIsFinancialOpen(false);
      return;
    }
    setIsFinancialOpen(true);
    if (!isInFinancialServices) {
      navigate(topFinancialPath);
    }
  };

  const handleAcademicsClick = () => {
    if (isAcademicsOpen) {
      setIsAcademicsOpen(false);
      return;
    }
    setIsAcademicsOpen(true);
    if (!isInAcademics) {
      navigate(topAcademicsPath);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Campus360Pro</h1>
        <p>Institutional Management</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="nav-label">Dashboard</span>
        </NavLink>

        <NavLink to="/admission" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          <span className="material-symbols-outlined">person_add</span>
          <span className="nav-label">Admission</span>
        </NavLink>

        <div className={`employee-group ${isEmployeesOpen ? 'open' : ''}`}>
          <button
            type="button"
            className={`nav-link employee-toggle ${isInEmployees ? 'active' : ''}`}
            onClick={handleEmployeesClick}
          >
            <span className="material-symbols-outlined">group</span>
            <span className="nav-label">Employees</span>
            <span className={`employee-caret material-symbols-outlined ${isEmployeesOpen ? 'open' : ''}`}>
              {isEmployeesOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {isEmployeesOpen && (
            <div className="employee-submenu">
              {employeeSubItems.map((sub) => (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  className={({ isActive }) => (isActive ? 'submenu-link active' : 'submenu-link')}
                >
                  <span className="submenu-icon material-symbols-outlined">{sub.icon}</span>
                  <span className="submenu-label">{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <div className={`financial-group ${isFinancialOpen ? 'open' : ''}`}>
          <button
            type="button"
            className={`nav-link financial-toggle ${isInFinancialServices ? 'active' : ''}`}
            onClick={handleFinancialClick}
          >
            <span className="material-symbols-outlined">payments</span>
            <span className="nav-label">Financial Services</span>
            <span className={`financial-caret material-symbols-outlined ${isFinancialOpen ? 'open' : ''}`}>
              {isFinancialOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {isFinancialOpen && (
            <div className="financial-submenu">
              {financialSubItems.map((sub) => (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  className={({ isActive }) => (isActive ? 'submenu-link active' : 'submenu-link')}
                >
                  <span className="submenu-icon material-symbols-outlined">{sub.icon}</span>
                  <span className="submenu-label">{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <div className={`academics-group ${isAcademicsOpen ? 'open' : ''}`}>
          <button
            type="button"
            className={`nav-link academics-toggle ${isInAcademics ? 'active' : ''}`}
            onClick={handleAcademicsClick}
          >
            <span className="material-symbols-outlined">school</span>
            <span className="nav-label">Academics</span>
            <span className={`academics-caret material-symbols-outlined ${isAcademicsOpen ? 'open' : ''}`}>
              {isAcademicsOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {isAcademicsOpen && (
            <div className="academics-submenu">
              {academicsSubItems.map((sub) => (
                <NavLink
                  key={sub.to}
                  to={sub.to}
                  className={({ isActive }) => (isActive ? 'submenu-link active' : 'submenu-link')}
                >
                  <span className="submenu-icon material-symbols-outlined">{sub.icon}</span>
                  <span className="submenu-label">{sub.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <NavLink
          to="/user-management"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <span className="material-symbols-outlined">manage_accounts</span>
          <span className="nav-label">User Management</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="nav-label">Settings</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button className="branch-btn bg-gradient-primary">
          <span className="material-symbols-outlined shrink-icon">account_tree</span>
          Select Branch
        </button>
      </div>
    </aside>
  );
};
