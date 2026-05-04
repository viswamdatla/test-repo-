import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  LEAVE_KPI_FILTERS,
  LEAVE_TABLE_FILTER_HEADINGS,
  buildLeaveApplications,
  filterLeaves,
  leaveCounts,
} from '../../data/leaveManagementMock';
import './LeaveManagementPage.scss';

function escapeCsvCell(value) {
  const s = String(value ?? '');
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function downloadCsv(filename, rows) {
  const headers = ['Staff Name', 'Role', 'Leave Type', 'Duration', 'Status', 'Decision Date'];
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((r) =>
      [r.name, r.role, r.leaveType, r.duration, r.status, r.decisionDate ?? '']
        .map(escapeCsvCell)
        .join(','),
    ),
  ];
  const csv = `\uFEFF${lines.join('\r\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function StatusBadge({ status }) {
  if (status === 'pending') {
    return (
      <span className="leave-status leave-status--pending">
        <span className="leave-status-dot" aria-hidden />
        Pending
      </span>
    );
  }
  if (status === 'approved') {
    return (
      <span className="leave-status leave-status--approved">
        <span className="leave-status-dot" aria-hidden />
        Approved
      </span>
    );
  }
  return (
    <span className="leave-status leave-status--rejected">
      <span className="leave-status-dot" aria-hidden />
      Rejected
    </span>
  );
}

export const LeaveManagementPage = () => {
  usePageTitle('Leave Management');

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const leaveApplications = useMemo(() => buildLeaveApplications(todayISO), [todayISO]);
  const counts = useMemo(() => leaveCounts(leaveApplications, todayISO), [leaveApplications, todayISO]);

  const [activeFilter, setActiveFilter] = useState('all');
  const tableSectionRef = useRef(null);

  const filteredRows = useMemo(
    () => filterLeaves(leaveApplications, activeFilter, todayISO),
    [leaveApplications, activeFilter, todayISO],
  );

  const selectKpi = (filterId) => {
    setActiveFilter(filterId);
    queueMicrotask(() => {
      tableSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const tableHeading = LEAVE_TABLE_FILTER_HEADINGS[activeFilter] ?? 'Leave requests';
  const footerHint = useMemo(() => {
    const n = filteredRows.length;
    if (activeFilter === 'all') {
      return `Showing all ${n} application${n === 1 ? '' : 's'} in the current academic window.`;
    }
    if (activeFilter === 'pending') {
      return `Showing ${n} pending application${n === 1 ? '' : 's'} that need a decision.`;
    }
    if (activeFilter === 'approved_today') {
      return n === 0
        ? 'No applications were approved today yet.'
        : `Showing ${n} application${n === 1 ? '' : 's'} approved today (${todayISO}).`;
    }
    if (activeFilter === 'rejected_today') {
      return n === 0
        ? 'No applications were rejected today.'
        : `Showing ${n} application${n === 1 ? '' : 's'} rejected today (${todayISO}).`;
    }
    return '';
  }, [activeFilter, filteredRows.length, todayISO]);

  const handleExportReport = useCallback(() => {
    const safeFilter = activeFilter.replace(/[^a-z0-9-_]/gi, '');
    const filename = `leave-report-${safeFilter}-${todayISO}.csv`;
    downloadCsv(filename, filteredRows);
  }, [activeFilter, filteredRows, todayISO]);

  return (
    <div className="leave-mgmt-page">
      <header className="leave-mgmt-head">
        <div>
          <p className="leave-mgmt-eyebrow">Workspace / Human Resources</p>
          <h1 className="leave-mgmt-title">Leave Management</h1>
        </div>
        <div className="leave-mgmt-head-actions">
          <button type="button" className="leave-btn leave-btn--ghost" onClick={handleExportReport}>
            Export Report
          </button>
          <Link to="/employees/leave-management/new" className="leave-btn leave-btn--primary">
            New Leave Application
          </Link>
        </div>
      </header>

      <section className="leave-kpi-grid" aria-label="Leave summary">
        {LEAVE_KPI_FILTERS.map((k) => {
          const count = counts[k.id] ?? 0;
          const isActive = activeFilter === k.id;
          return (
            <button
              key={k.id}
              type="button"
              className={`leave-kpi-card ${isActive ? 'leave-kpi-card--active' : ''}`}
              onClick={() => selectKpi(k.id)}
              aria-pressed={isActive}
            >
              <div className={`leave-kpi-icon ${k.iconWrap}`}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {k.icon}
                </span>
              </div>
              <div>
                <p className="leave-kpi-label">{k.label}</p>
                <span className="leave-kpi-value">{count}</span>
                <p className={`leave-kpi-meta ${k.metaClass || ''}`}>{k.meta}</p>
              </div>
            </button>
          );
        })}
      </section>

      <section ref={tableSectionRef} className="leave-table-card" aria-labelledby="leave-recent-heading">
        <div className="leave-table-card__head">
          <h2 id="leave-recent-heading" className="leave-table-card__title">
            {tableHeading}
            <span className="leave-table-card__count"> ({filteredRows.length})</span>
          </h2>
          <button type="button" className="leave-filter-chip">
            <span className="material-symbols-outlined">filter_list</span>
            Filter
          </button>
        </div>

        <div className="leave-table-scroll">
          <table className="leave-table">
            <thead>
              <tr>
                <th scope="col">Staff Name</th>
                <th scope="col">Leave Type</th>
                <th scope="col">Duration</th>
                <th scope="col">Status</th>
                <th scope="col" className="leave-table__actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="leave-table-empty">
                    <p className="leave-table-empty__title">No applications in this view</p>
                    <p className="leave-table-empty__text">Try another summary tile or check back later.</p>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="leave-staff">
                        <div className="leave-staff-avatar" aria-hidden>
                          {row.initials}
                        </div>
                        <div>
                          <p className="leave-staff-name">{row.name}</p>
                          <p className="leave-staff-role">{row.role}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`leave-type-tag leave-type-tag--${row.leaveTone}`}>{row.leaveType}</span>
                    </td>
                    <td className="leave-table-duration">{row.duration}</td>
                    <td>
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="leave-table__actions">
                      {row.status === 'pending' ? (
                        <div className="leave-row-actions">
                          <button type="button" className="leave-mini-btn leave-mini-btn--approve">
                            Approve
                          </button>
                          <button type="button" className="leave-mini-btn leave-mini-btn--reject">
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button type="button" className="leave-icon-btn" aria-label="More options">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="leave-table-foot">
          <p className="leave-table-foot__hint">{footerHint}</p>
          {filteredRows.length > 8 ? (
            <div className="leave-pagination" role="navigation" aria-label="Table pages">
              <button type="button" className="leave-page-btn leave-page-btn--active">
                1
              </button>
              <button type="button" className="leave-page-btn">
                2
              </button>
              <button type="button" className="leave-page-btn">
                3
              </button>
            </div>
          ) : null}
        </footer>
      </section>

      <div className="leave-bottom-grid">
        <aside className="leave-policy-card">
          <div className="leave-policy-card__bg-icon" aria-hidden>
            <span className="material-symbols-outlined">calendar_month</span>
          </div>
          <div className="leave-policy-card__content">
            <div className="leave-policy-card__label">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                info
              </span>
              <span>Leave Policy Alert</span>
            </div>
            <h3 className="leave-policy-card__title">Academic Winter Break</h3>
            <p className="leave-policy-card__text">
              All leave applications for the December cycle must be submitted by Oct 25 for guaranteed processing.
            </p>
            <button type="button" className="leave-policy-card__cta">
              Read leave bylaws
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </aside>

        <section className="leave-insights-card" aria-labelledby="leave-insights-heading">
          <h3 id="leave-insights-heading" className="leave-insights-card__title">
            Automated Leave Insights
          </h3>
          <ul className="leave-insights-list">
            <li className="leave-insight leave-insight--success">
              <span className="leave-insight__bar" aria-hidden />
              <div>
                <h4>Peak Staffing Efficiency: 92%</h4>
                <p>
                  Leave schedules are currently optimized to ensure no department drops below 85% active roster during
                  the midterm phase.
                </p>
              </div>
            </li>
            <li className="leave-insight leave-insight--warn">
              <span className="leave-insight__bar" aria-hidden />
              <div>
                <h4>Upcoming Overlap Warning</h4>
                <p>
                  Science Department has 4 staff members requesting leave on Nov 2nd. Potential sub-teacher shortage
                  detected.
                </p>
                <button type="button" className="leave-insight__link">
                  Re-route Staff
                </button>
              </div>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};
