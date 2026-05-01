import React from 'react';
import { NavLink } from 'react-router-dom';
import './EmployeesTopTabs.scss';

const tabs = [
  { to: '/employees/dashboard', label: 'Dashboard' },
  { to: '/employees/teachers', label: 'Teachers' },
  { to: '/employees/administration', label: 'Administration' },
  { to: '/employees/operational-staff', label: 'Operational Staff' },
];

export const EmployeesTopTabs = () => {
  return (
    <div className="employees-top-tabs" role="tablist" aria-label="Employees sections">
      {tabs.map((tab) => (
        <NavLink key={tab.to} to={tab.to} className={({ isActive }) => `employees-top-tab ${isActive ? 'active' : ''}`}>
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
};

