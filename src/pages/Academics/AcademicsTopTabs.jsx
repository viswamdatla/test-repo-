import React from 'react';
import { NavLink } from 'react-router-dom';
import './AcademicsTopTabs.scss';

const tabs = [
  { to: '/academics/student-management', end: true, label: 'Student Dashboard' },
  { to: '/academics/time-table', label: 'Time Table' },
  { to: '/academics/attendance', label: 'Attendance' },
  { to: '/academics/grades', label: 'Grades' },
];

export const AcademicsTopTabs = () => {
  return (
    <div className="academics-top-tabs" role="tablist" aria-label="Academic sections">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `academics-top-tab ${isActive ? 'active' : ''}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
};
