import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import './LeaveApplicationPage.scss';

const LEAVE_TYPES = [
  { value: '', label: 'Select Leave Type' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'parental', label: 'Maternity / Paternity' },
  { value: 'unpaid', label: 'Unpaid Leave' },
];

function inclusiveDayCount(startStr, endStr) {
  if (!startStr || !endStr) return 0;
  const start = new Date(`${startStr}T12:00:00`);
  const end = new Date(`${endStr}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  return Math.round((end - start) / 86400000) + 1;
}

const balanceRows = [
  { label: 'Earned Leave', used: 12, total: 15, pct: 80, barClass: 'leave-app-balance__fill--earned', valueClass: 'leave-app-balance__value--primary' },
  { label: 'Sick Leave', used: 8, total: 10, pct: 80, barClass: 'leave-app-balance__fill--sick', valueClass: 'leave-app-balance__value--tertiary' },
  { label: 'Personal Leave', used: 3, total: 5, pct: 60, barClass: 'leave-app-balance__fill--personal', valueClass: 'leave-app-balance__value--default' },
];

export const LeaveApplicationPage = () => {
  usePageTitle('New Leave Application');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const totalDays = useMemo(() => inclusiveDayCount(startDate, endDate), [startDate, endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleCancel = () => {
    navigate('/employees/leave-management');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const input = fileInputRef.current;
    if (!input || !e.dataTransfer?.files?.length) return;
    const dt = new DataTransfer();
    Array.from(e.dataTransfer.files).forEach((f) => dt.items.add(f));
    input.files = dt.files;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="leave-app-page">
      <nav className="leave-app-breadcrumb" aria-label="Breadcrumb">
        <span className="leave-app-breadcrumb__muted">Workspace</span>
        <span className="leave-app-breadcrumb__sep">/</span>
        <span className="leave-app-breadcrumb__muted">Human Resources</span>
        <span className="leave-app-breadcrumb__sep">/</span>
        <Link to="/employees/leave-management" className="leave-app-breadcrumb__link">
          Leave Management
        </Link>
        <span className="leave-app-breadcrumb__sep">/</span>
        <span className="leave-app-breadcrumb__current">New Application</span>
      </nav>

      <div className="leave-app-intro">
        <h1 className="leave-app-intro__title">Submit Leave Application</h1>
        <p className="leave-app-intro__subtitle">Complete the details below to request time off from your academic schedule.</p>
      </div>

      <div className="leave-app-grid">
        <aside className="leave-app-sidebar" aria-label="Leave balance and tips">
          <div className="leave-app-balance">
            <h2 className="leave-app-balance__title">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_balance_wallet
              </span>
              Leave Balance
            </h2>
            <div className="leave-app-balance__rows">
              {balanceRows.map((row) => (
                <div key={row.label} className="leave-app-balance__row">
                  <div className="leave-app-balance__meta">
                    <span className="leave-app-balance__label">{row.label}</span>
                    <span className={`leave-app-balance__value ${row.valueClass}`}>
                      {row.used} / {row.total} Days
                    </span>
                  </div>
                  <div className="leave-app-balance__track" role="presentation">
                    <div className={`leave-app-balance__fill ${row.barClass}`} style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="leave-app-pro-tip">
              <p>
                <strong>Pro Tip:</strong> Applications for vacations longer than 5 days require 2 weeks notice.
              </p>
            </div>
          </div>

          <div className="leave-app-visual-card">
            <div className="leave-app-visual-card__bg" aria-hidden />
            <p className="leave-app-visual-card__caption">Recharge and return inspired.</p>
          </div>
        </aside>

        <div className="leave-app-form-wrap">
          <form className="leave-app-form" onSubmit={handleSubmit}>
            <div className="leave-app-field">
              <label htmlFor="leave-type">Leave Type</label>
              <div className="leave-app-select-wrap">
                <select
                  id="leave-type"
                  className="leave-app-select"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  {LEAVE_TYPES.map((opt) => (
                    <option key={opt.value || 'placeholder'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined leave-app-select__chevron">expand_more</span>
              </div>
            </div>

            <div className="leave-app-dates">
              <div className="leave-app-field">
                <label htmlFor="start-date">Start Date</label>
                <input
                  id="start-date"
                  type="date"
                  className="leave-app-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="leave-app-field">
                <label htmlFor="end-date">End Date</label>
                <input
                  id="end-date"
                  type="date"
                  className="leave-app-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="leave-app-field">
              <span id="total-days-label" className="leave-app-field-label">
                Total Days
              </span>
              <div className="leave-app-total-days" aria-labelledby="total-days-label">
                {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
              </div>
            </div>

            <div className="leave-app-field">
              <label htmlFor="leave-reason">Reason for Leave</label>
              <textarea
                id="leave-reason"
                className="leave-app-textarea"
                rows={5}
                placeholder="Please provide a detailed explanation for your leave request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="leave-app-field">
              <label htmlFor="leave-attachments" className="leave-app-field-label">
                Attachments
              </label>
              <input
                id="leave-attachments"
                ref={fileInputRef}
                type="file"
                className="leave-app-file-input"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                multiple
              />
              <button
                type="button"
                className="leave-app-dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="leave-app-dropzone__icon">
                  <span className="material-symbols-outlined">upload_file</span>
                </div>
                <p className="leave-app-dropzone__title">Click to upload or drag and drop</p>
                <p className="leave-app-dropzone__hint">PDF, JPG, PNG (Max 5MB)</p>
              </button>
            </div>

            <div className="leave-app-form-actions">
              <button type="button" className="leave-app-btn leave-app-btn--text" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="leave-app-btn leave-app-btn--submit">
                Submit Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
