import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getSavedDraftsCount } from '../../utils/admissionDraftStorage';
import {
  ADMISSIONS_APPLICATIONS,
  KPI_FILTER,
  filterApplicationsByKpi,
  computeKpiCounts,
  LOCAL_DEVICE_DRAFT_PLACEHOLDER,
} from '../../data/admissionsDirectoryMock';
import '../Employees/EmployeesDirectory.scss';
import '../../styles/DataTable.scss';
import './AdmissionsDirectory.scss';

const KPI_META = [
  {
    key: KPI_FILTER.ALL,
    label: 'Total Applications',
    badge: '+12%',
    badgeClass: 'emp-dashboard-kpi-badge--green',
    icon: 'group',
    iconModifier: 'emp-dashboard-kpi-icon--primary',
    cardModifier: 'emp-dashboard-kpi-card--primary',
    aria: 'Show all applications',
  },
  {
    key: KPI_FILTER.PENDING_REVIEW,
    label: 'Pending Review',
    badge: 'High Priority',
    badgeClass: 'emp-dashboard-kpi-badge--red',
    icon: 'pending_actions',
    iconModifier: 'emp-dashboard-kpi-icon--tertiary',
    cardModifier: 'emp-dashboard-kpi-card--tertiary',
    aria: 'Show applications pending review',
  },
  {
    key: KPI_FILTER.SAVED_DRAFT,
    label: 'Saved Drafts',
    badge: 'On device',
    badgeClass: 'emp-dashboard-kpi-badge--neutral',
    icon: 'draft',
    iconModifier: 'emp-dashboard-kpi-icon--secondary',
    cardModifier: 'emp-dashboard-kpi-card--secondary',
    aria: 'Show saved drafts',
  },
  {
    key: KPI_FILTER.ENROLLED,
    label: 'Successfully Enrolled',
    badge: '66% Rate',
    badgeClass: 'emp-dashboard-kpi-badge--green',
    icon: 'verified_user',
    iconModifier: 'emp-dashboard-kpi-icon--primary',
    cardModifier: 'emp-dashboard-kpi-card--primary admissions-kpi-card--enrolled',
    aria: 'Show enrolled students',
  },
];

export const AdmissionsDirectory = () => {
  usePageTitle('Admissions Dashboard');

  const [savedDraftsFromDevice, setSavedDraftsFromDevice] = useState(0);
  const [activeKpi, setActiveKpi] = useState(KPI_FILTER.ALL);

  useEffect(() => {
    const sync = () => setSavedDraftsFromDevice(getSavedDraftsCount());
    sync();
    window.addEventListener('admission-draft-saved', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('admission-draft-saved', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const counts = useMemo(
    () => computeKpiCounts(ADMISSIONS_APPLICATIONS, savedDraftsFromDevice),
    [savedDraftsFromDevice]
  );

  const kpiValues = useMemo(
    () => ({
      [KPI_FILTER.ALL]: counts.total,
      [KPI_FILTER.PENDING_REVIEW]: counts.pendingReview,
      [KPI_FILTER.SAVED_DRAFT]: counts.savedDrafts,
      [KPI_FILTER.ENROLLED]: counts.enrolled,
    }),
    [counts]
  );

  const filteredApplications = useMemo(() => {
    let rows = filterApplicationsByKpi(ADMISSIONS_APPLICATIONS, activeKpi);
    if (activeKpi === KPI_FILTER.SAVED_DRAFT && savedDraftsFromDevice > 0) {
      rows = [LOCAL_DEVICE_DRAFT_PLACEHOLDER, ...rows];
    }
    return rows;
  }, [activeKpi, savedDraftsFromDevice]);

  const filterSummary =
    activeKpi === KPI_FILTER.ALL
      ? null
      : KPI_META.find((k) => k.key === activeKpi)?.label ?? '';

  return (
    <div className="employees-page admissions-dashboard">
      <header className="emp-directory-hero">
        <div className="emp-directory-hero__text">
          <h1 className="emp-directory-hero__title">Admissions Dashboard</h1>
          <p className="emp-directory-hero__subtitle">
            Track admissions performance, monitor pipeline health, and start new student applications quickly.
          </p>
        </div>
        <Link className="emp-directory-cta" to="/admission/new">
          <span className="material-symbols-outlined" aria-hidden>
            add
          </span>
          Add Student
        </Link>
      </header>

      <section className="emp-dashboard-kpis" aria-label="Admission metrics">
        {KPI_META.map((kpi) => (
          <button
            key={kpi.key}
            type="button"
            className={`emp-dashboard-kpi-card ${kpi.cardModifier} emp-dashboard-kpi-card--clickable ${
              activeKpi === kpi.key ? 'is-active' : ''
            }`}
            onClick={() => setActiveKpi(kpi.key)}
            aria-pressed={activeKpi === kpi.key}
            aria-label={kpi.aria}
          >
            <div className="emp-dashboard-kpi-card__head">
              <span className={`material-symbols-outlined emp-dashboard-kpi-icon ${kpi.iconModifier}`}>{kpi.icon}</span>
              <span className={`emp-dashboard-kpi-badge ${kpi.badgeClass}`}>{kpi.badge}</span>
            </div>
            <h3 className="emp-dashboard-kpi-label">{kpi.label}</h3>
            <p className="emp-dashboard-kpi-value">{kpiValues[kpi.key]}</p>
          </button>
        ))}
      </section>

      <section className="admissions-funnel" aria-labelledby="admissions-funnel-heading">
        <div className="admissions-funnel__header">
          <h2 id="admissions-funnel-heading" className="admissions-funnel__title">
            Admission Funnel Overview
          </h2>
          <div className="admissions-funnel__badge">
            <span className="admissions-funnel__dot" aria-hidden />
            Current Active
          </div>
        </div>

        <div className="admissions-funnel__track-wrap">
          <div className="admissions-funnel__track-bg">
            <div className="admissions-funnel__track-fill" style={{ width: '75%' }} />
          </div>
          <div className="admissions-funnel__nodes">
            <div className="admissions-funnel__node admissions-funnel__node--active">
              <div className="admissions-funnel__node-icon admissions-funnel__node-icon--on">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div className="admissions-funnel__node-text">
                <p className="admissions-funnel__node-title">Application</p>
                <p className="admissions-funnel__node-desc">{counts.total} Total</p>
              </div>
            </div>

            <div className="admissions-funnel__node admissions-funnel__node--active">
              <div className="admissions-funnel__node-icon admissions-funnel__node-icon--on">
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div className="admissions-funnel__node-text">
                <p className="admissions-funnel__node-title">Verification</p>
                <p className="admissions-funnel__node-desc">190 Passed</p>
              </div>
            </div>

            <div className="admissions-funnel__node admissions-funnel__node--active">
              <div className="admissions-funnel__node-icon admissions-funnel__node-icon--on">
                <span className="material-symbols-outlined">video_chat</span>
              </div>
              <div className="admissions-funnel__node-text">
                <p className="admissions-funnel__node-title">Interview</p>
                <p className="admissions-funnel__node-desc">142 Conducted</p>
              </div>
            </div>

            <div className="admissions-funnel__node">
              <div className="admissions-funnel__node-icon admissions-funnel__node-icon--off">
                <span className="material-symbols-outlined">stars</span>
              </div>
              <div className="admissions-funnel__node-text">
                <p className="admissions-funnel__node-title admissions-funnel__node-title--muted">Final Decision</p>
                <p className="admissions-funnel__node-desc admissions-funnel__node-desc--muted">65 Waiting</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="admissions-table-panel emp-table-panel emp-table-wrap" aria-label="Student directory">
        <div className="emp-table-data-card">
          <div className="admissions-table-card-header">
            <div>
              <h2 className="admissions-table-card-title">Student Directory</h2>
              {filterSummary && (
                <p className="admissions-table-filter-caption">
                  Showing <strong>{filterSummary}</strong>
                  <button type="button" className="admissions-filter-clear" onClick={() => setActiveKpi(KPI_FILTER.ALL)}>
                    Show all
                  </button>
                </p>
              )}
            </div>
            <div className="admissions-table-card-actions">
              <button type="button" className="admissions-toolbar-btn">
                <span className="material-symbols-outlined" aria-hidden>
                  filter_list
                </span>
                Filter
              </button>
              <button type="button" className="admissions-toolbar-btn">
                <span className="material-symbols-outlined" aria-hidden>
                  download
                </span>
                Export CSV
              </button>
            </div>
          </div>

          <div className="emp-scroll">
            <table className="emp-table admissions-student-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Student Name</th>
                  <th>Applied Grade</th>
                  <th>Submission Date</th>
                  <th>Current Stage</th>
                  <th className="admissions-th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admissions-table-empty">
                      No applications match this view.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((row) => (
                    <tr key={row.id}>
                      <td className="admissions-id-cell">{row.applicationId}</td>
                      <td>
                        <div className="emp-name">
                          <div className={`avatar admissions-avatar ${row.avatar}`}>{row.initials}</div>
                          <div>
                            <p className="name">{row.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="admissions-cell-muted">{row.grade}</td>
                      <td className="admissions-cell-muted">{row.date}</td>
                      <td>
                        <span className={`admissions-stage-pill ${row.stagePillClass}`}>{row.stageLabel}</span>
                      </td>
                      <td className="admissions-td-action">
                        {row.isDevicePlaceholder ? (
                          <Link className="admissions-link-btn" to="/admission/new">
                            Continue
                          </Link>
                        ) : (
                          <button type="button" className="admissions-link-btn">
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="oe-pagination">
            <p className="oe-pagination-text">
              {activeKpi === KPI_FILTER.ALL
                ? `Showing ${filteredApplications.length} of ${counts.total} applications`
                : `Showing ${filteredApplications.length} application${filteredApplications.length !== 1 ? 's' : ''} matching “${filterSummary}”`}
            </p>
            <div className="oe-pagination-controls">
              <button type="button" className="oe-page-btn" aria-label="Previous page" disabled>
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button type="button" className="oe-page-btn active">
                1
              </button>
              <button type="button" className="oe-page-btn" disabled>
                2
              </button>
              <button type="button" className="oe-page-btn" disabled>
                3
              </button>
              <button type="button" className="oe-page-btn" aria-label="Next page" disabled>
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
