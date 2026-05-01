import React from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import dashboardData from '../../data/dashboard.json';
import './Dashboard.scss';

export const Dashboard = () => {
  usePageTitle('Dashboard');

  const {
    kpis,
    recentActivities,
    recentCollections,
    attendanceOverview,
    upcomingEvents
  } = dashboardData;

  const kpiIconConfig = {
    students: { icon: 'groups', color: 'blue', badge: 'positive-green' },
    fees: { icon: 'pending_actions', color: 'amber', badge: 'negative-red' },
    collection: { icon: 'account_balance_wallet', color: 'emerald', badge: 'positive-green' },
    staff: { icon: 'badge', color: 'purple', badge: 'positive-blue' }
  };

  const activityIconConfig = {
    payment: { icon: 'payments', color: 'bg-primary' },
    admission: { icon: 'person_add', color: 'bg-blue' },
    collection: { icon: 'receipt_long', color: 'bg-emerald' },
    system: { icon: 'cloud_done', color: 'bg-stone' },
    schedule: { icon: 'calendar_month', color: 'bg-amber' }
  };

  return (
    <div className="dashboard-container">
      {/* 1. Stats Cards - Bento Style */}
      <div className="stats-grid">
        {kpis.map((kpi) => {
          const config = kpiIconConfig[kpi.id];
          return (
            <div className="stat-card group" key={kpi.id}>
              <div className="card-header">
                <div className={`icon-btn ${config.color}`}>
                  <span className="material-symbols-outlined">{config.icon}</span>
                </div>
                <span className={`growth-badge ${config.badge}`}>{kpi.change}</span>
              </div>
              <p className="stat-label">{kpi.title}</p>
              <h3 className="stat-value">{kpi.value}</h3>
            </div>
          );
        })}
      </div>

      <div className="middle-grid">
        {/* 2. Financial Overview & Collections */}
        <div className="left-col">
          <div className="fin-card">
            <div className="fin-header">
              <div>
                <h3>Financial Overview</h3>
                <p>Fee status for Academic Year 2023-24</p>
              </div>
              <a href="#" className="report-link">
                Full Report <span className="material-symbols-outlined">arrow_forward</span>
              </a>
            </div>
            
            <div className="fin-content">
              {/* SVG Donut Chart */}
              <div className="chart-container">
                <svg viewBox="0 0 192 192">
                  <circle cx="96" cy="96" r="80" fill="transparent" stroke="var(--surface-container-highest)" strokeWidth="18" />
                  <circle cx="96" cy="96" r="80" fill="transparent" stroke="var(--primary)" strokeWidth="18" strokeDasharray="502.6" strokeDashoffset="110.5" />
                  <circle cx="96" cy="96" r="80" fill="transparent" stroke="var(--tertiary)" strokeWidth="18" strokeDasharray="502.6" strokeDashoffset="427.2" />
                  <circle cx="96" cy="96" r="80" fill="transparent" stroke="var(--error)" strokeWidth="18" strokeDasharray="502.6" strokeDashoffset="467.4" />
                </svg>
                <div className="chart-text">
                  <p>78%</p>
                  <p>COLLECTED</p>
                </div>
              </div>

              <div className="bars-container">
                <div className="bar-row">
                  <div className="bar-header">
                    <span className="label"><span className="dot dot-primary"></span> Fees Collected</span>
                    <span>78%</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill fill-primary"></div>
                  </div>
                </div>
                
                <div className="bar-row">
                  <div className="bar-header">
                    <span className="label"><span className="dot dot-tertiary"></span> Pending</span>
                    <span>15%</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill fill-tertiary"></div>
                  </div>
                </div>

                <div className="bar-row">
                  <div className="bar-header">
                    <span className="label"><span className="dot dot-error"></span> Overdue</span>
                    <span>7%</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill fill-error"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="recent-collections">
            <h3>Recent Collections</h3>
            <div className="collections-grid">
              {recentCollections.map((col, idx) => (
                <div className="col-item" key={idx}>
                  <p className="col-label">{col.label}</p>
                  <p className={`col-amount ${idx === 0 ? 'text-primary' : ''}`}>{col.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Recent Activities & 5. Attendance */}
        <div className="right-col">
          <div className="activities-card">
            <h3>Recent Activities</h3>
            <div className="timeline">
              {recentActivities.map((act) => {
                const config = activityIconConfig[act.type];
                return (
                  <div className="timeline-item" key={act.id}>
                    <div className={`icon-wrapper ${config.color}`}>
                      <span className="material-symbols-outlined">{config.icon}</span>
                    </div>
                    <div className="details">
                      <p>{act.title}</p>
                      {act.description && <p className="positive">{act.description}</p>}
                      <p className="time">{act.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="attendance-card">
            <h3>
              <span className="material-symbols-outlined">analytics</span>
              Attendance Overview
            </h3>
            <div className="att-grid">
              <div className="att-box">
                <p>Today</p>
                <p>{attendanceOverview.today}</p>
              </div>
              <div className="att-box border-x">
                <p>Week</p>
                <p>{attendanceOverview.week}</p>
              </div>
              <div className="att-box">
                <p>Month</p>
                <p>{attendanceOverview.month}</p>
              </div>
            </div>
            <div className="att-footer">
              * Last updated {attendanceOverview.lastUpdated}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Upcoming Events */}
      <section className="events-section">
        <h3>Upcoming Events</h3>
        <div className="events-grid">
          {upcomingEvents.map((event) => {
            const tagClass = event.tag === 'PARENTS' ? 'tag-primary' : (event.tag === 'ALL' ? 'tag-secondary' : 'tag-tertiary');
            return (
              <div className="event-card" key={event.id}>
                <div className="img-container">
                  <img src={event.image} alt={event.title} />
                </div>
                <div className="event-body">
                  <div className="event-meta">
                    <div className={`tag ${tagClass}`}>{event.tag}</div>
                    <div className="date">{event.date}</div>
                  </div>
                  <h4>{event.title}</h4>
                  <div className="location">
                    <span className="material-symbols-outlined">location_on</span>
                    {event.location}
                  </div>
                  <button className="event-btn">
                    {event.id === 3 ? 'View Schedule' : 'Details'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
