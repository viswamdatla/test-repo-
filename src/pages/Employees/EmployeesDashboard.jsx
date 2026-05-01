import React from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import './EmployeesDirectory.scss';

const kpiCards = [
  {
    icon: 'badge',
    label: 'Total Workforce',
    value: '1,284',
    badge: '+2.4%',
    accentClass: 'emp-dashboard-kpi-card--primary',
    iconClass: 'emp-dashboard-kpi-icon--primary',
    badgeClass: 'emp-dashboard-kpi-badge--green',
  },
  {
    icon: 'event_available',
    label: 'Attendance Rate',
    value: '96.8%',
    badge: 'Stable',
    accentClass: 'emp-dashboard-kpi-card--tertiary',
    iconClass: 'emp-dashboard-kpi-icon--tertiary',
    badgeClass: 'emp-dashboard-kpi-badge--neutral',
  },
  {
    icon: 'history_edu',
    label: 'Certifications Due',
    value: '42',
    badge: '12 New',
    accentClass: 'emp-dashboard-kpi-card--secondary',
    iconClass: 'emp-dashboard-kpi-icon--secondary',
    badgeClass: 'emp-dashboard-kpi-badge--blue',
  },
  {
    icon: 'pending_actions',
    label: 'Open Requests',
    value: '18',
    badge: 'Critical',
    accentClass: 'emp-dashboard-kpi-card--primary-container',
    iconClass: 'emp-dashboard-kpi-icon--primary-container',
    badgeClass: 'emp-dashboard-kpi-badge--red',
  },
];

export const EmployeesDashboard = () => {
  usePageTitle('Employees');

  return (
    <div className="employees-page">
      <header className="emp-directory-hero">
        <div className="emp-directory-hero__text">
          <h1 className="emp-directory-hero__title">Employees Overview Dashboard</h1>
          <p className="emp-directory-hero__subtitle">
            Communication hub, workforce metrics, and action items for teachers, administration, and operational teams.
          </p>
        </div>
      </header>

      <section className="emp-dashboard-kpis" aria-label="Employee dashboard metrics">
        {kpiCards.map((tile) => (
          <div key={tile.label} className={`emp-dashboard-kpi-card ${tile.accentClass}`}>
            <div className="emp-dashboard-kpi-card__head">
              <span className={`material-symbols-outlined emp-dashboard-kpi-icon ${tile.iconClass}`}>{tile.icon}</span>
              <span className={`emp-dashboard-kpi-badge ${tile.badgeClass}`}>{tile.badge}</span>
            </div>
            <h3 className="emp-dashboard-kpi-label">{tile.label}</h3>
            <p className="emp-dashboard-kpi-value">{tile.value}</p>
          </div>
        ))}
      </section>

    </div>
  );
};
