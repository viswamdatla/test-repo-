import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.scss';

export const Sidebar = () => {
  const location = useLocation();
  const isInFinancialServices = useMemo(
    () => location.pathname.startsWith('/financial-services'),
    [location.pathname]
  );
  const isInEmployees = useMemo(() => location.pathname.startsWith('/employees'), [location.pathname]);
  const isInAcademics = useMemo(() => location.pathname.startsWith('/academics'), [location.pathname]);

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

        <NavLink to="/employees/teachers" className={`nav-link ${isInEmployees ? 'active' : ''}`}>
            <span className="material-symbols-outlined">group</span>
            <span className="nav-label">Employees</span>
        </NavLink>

        <NavLink to="/financial-services" className={`nav-link ${isInFinancialServices ? 'active' : ''}`}>
          <span className="material-symbols-outlined">payments</span>
          <span className="nav-label">Financial Services</span>
        </NavLink>

        <NavLink to="/academics" className={`nav-link ${isInAcademics ? 'active' : ''}`}>
          <span className="material-symbols-outlined">school</span>
          <span className="nav-label">Academics</span>
        </NavLink>

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
          <span>Select Branch</span>
        </button>
      </div>
    </aside>
  );
};
