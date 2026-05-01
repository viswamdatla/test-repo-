import React from 'react';
import { NavLink } from 'react-router-dom';
import './FinancialTopTabs.scss';

const tabs = [
  { to: '/financial-services', end: true, label: 'Dashboard' },
  { to: '/financial-services/fee-management', label: 'Fee Management' },
  { to: '/financial-services/salary-management', label: 'Salary Management' },
  { to: '/financial-services/other-expenses', label: 'Other expenses' },
];

export const FinancialTopTabs = () => {
  return (
    <div className="financial-top-tabs" role="tablist" aria-label="Financial sections">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `financial-top-tab ${isActive ? 'active' : ''}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
};
