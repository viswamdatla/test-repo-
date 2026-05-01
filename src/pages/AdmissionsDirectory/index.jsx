import React from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import './AdmissionsDirectory.scss';

export const AdmissionsDirectory = () => {
  usePageTitle('Admissions Directory');

  return (
    <div className="directory-container">
      {/* Page Header */}
      <div className="directory-header">
        <div className="header-text">
          <h2>Admissions Directory</h2>
          <p>Manage student enrollments, review current application statuses, and analyze the admission funnel performance.</p>
        </div>
        <button className="btn-new btn-primary">
          <span className="material-symbols-outlined">add_circle</span>
          New Application
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="icon-wrapper color-primary">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="kpi-badge badge-primary">+12%</span>
          </div>
          <p className="kpi-label">Total Applications</p>
          <h3 className="kpi-value">248</h3>
        </div>
        
        <div className="kpi-card border-tertiary">
          <div className="kpi-header">
            <div className="icon-wrapper color-tertiary">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <span className="kpi-badge badge-tertiary">High Priority</span>
          </div>
          <p className="kpi-label">Pending Review</p>
          <h3 className="kpi-value">42</h3>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="icon-wrapper color-secondary">
              <span className="material-symbols-outlined">event_available</span>
            </div>
          </div>
          <p className="kpi-label">Interview Scheduled</p>
          <h3 className="kpi-value">18</h3>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="icon-wrapper color-success">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <span className="kpi-badge badge-success">66% Rate</span>
          </div>
          <p className="kpi-label">Successfully Enrolled</p>
          <h3 className="kpi-value">165</h3>
        </div>
      </div>

      {/* Admission Funnel Overview */}
      <section className="funnel-section">
        <div className="funnel-header">
          <h4>Admission Funnel Overview</h4>
          <div className="active-badge">
            <span className="dot bg-primary"></span> Current Active
          </div>
        </div>

        <div className="funnel-track-wrapper">
          <div className="funnel-track-bg">
            <div className="funnel-track-fill" style={{ width: '75%' }}></div>
          </div>
          <div className="funnel-nodes">
            
            <div className="node active">
              <div className="node-icon bg-primary">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div className="node-text">
                <p className="node-title color-dark">Application</p>
                <p className="node-desc">248 Total</p>
              </div>
            </div>

            <div className="node active">
              <div className="node-icon bg-primary">
                <span className="material-symbols-outlined">task_alt</span>
              </div>
              <div className="node-text">
                <p className="node-title color-dark">Verification</p>
                <p className="node-desc">190 Passed</p>
              </div>
            </div>

            <div className="node active">
              <div className="node-icon bg-primary">
                <span className="material-symbols-outlined">video_chat</span>
              </div>
              <div className="node-text">
                <p className="node-title color-dark">Interview</p>
                <p className="node-desc">142 Conducted</p>
              </div>
            </div>

            <div className="node inactive">
              <div className="node-icon bg-inactive">
                <span className="material-symbols-outlined">stars</span>
              </div>
              <div className="node-text">
                <p className="node-title color-light">Final Decision</p>
                <p className="node-desc">65 Waiting</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Student Directory Table */}
      <section className="directory-table-section">
        <div className="table-header">
          <h4>Student Directory</h4>
          <div className="table-actions">
            <button className="btn-secondary rounded-full">
              <span className="material-symbols-outlined">filter_list</span> Filter
            </button>
            <button className="btn-secondary rounded-full">
              <span className="material-symbols-outlined">download</span> Export CSV
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="student-table">
            <thead>
              <tr>
                <th>Application ID</th>
                <th>Student Name</th>
                <th>Applied Grade</th>
                <th>Submission Date</th>
                <th>Current Stage</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="id-col">#ADM-2024-001</td>
                <td>
                  <div className="student-info-cell">
                    <div className="avatar bg-blue-light color-primary">EW</div>
                    <span className="student-name">Eleanor Wright</span>
                  </div>
                </td>
                <td className="text-muted">Grade 9</td>
                <td className="text-muted">Oct 12, 2023</td>
                <td><span className="stage-badge bg-secondary-container">Document Verified</span></td>
                <td className="text-right"><button className="btn-text">View Details</button></td>
              </tr>
              <tr>
                <td className="id-col">#ADM-2024-002</td>
                <td>
                  <div className="student-info-cell">
                    <div className="avatar bg-amber-light color-amber">JM</div>
                    <span className="student-name">Julian Martinez</span>
                  </div>
                </td>
                <td className="text-muted">Grade 11</td>
                <td className="text-muted">Oct 14, 2023</td>
                <td><span className="stage-badge bg-tertiary-fixed">In Review</span></td>
                <td className="text-right"><button className="btn-text">View Details</button></td>
              </tr>
              <tr>
                <td className="id-col">#ADM-2024-003</td>
                <td>
                  <div className="student-info-cell">
                    <div className="avatar bg-green-light color-green">AC</div>
                    <span className="student-name">Aria Chen</span>
                  </div>
                </td>
                <td className="text-muted">Grade 7</td>
                <td className="text-muted">Oct 15, 2023</td>
                <td><span className="stage-badge bg-green-light-badge">Final Decision</span></td>
                <td className="text-right"><button className="btn-text">View Details</button></td>
              </tr>
              <tr>
                <td className="id-col">#ADM-2024-004</td>
                <td>
                  <div className="student-info-cell">
                    <div className="avatar bg-rose-light color-rose">LB</div>
                    <span className="student-name">Lucas Bennett</span>
                  </div>
                </td>
                <td className="text-muted">Grade 10</td>
                <td className="text-muted">Oct 16, 2023</td>
                <td><span className="stage-badge bg-primary-light">Interview</span></td>
                <td className="text-right"><button className="btn-text">View Details</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="table-pagination">
          <p>Showing 4 of 248 applications</p>
          <div className="pagination-controls">
            <button className="page-btn"><span className="material-symbols-outlined">chevron_left</span></button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <button className="page-btn"><span className="material-symbols-outlined">chevron_right</span></button>
          </div>
        </div>
      </section>

    </div>
  );
};
