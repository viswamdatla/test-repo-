import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getSectionContext, getSectionNavTitle } from './classSectionRegistry';
import './SectionStudentsPage.scss';

const ACADEMIC_YEAR = '2024-25';

const PAYMENT_FILTERS = [
  { id: 'all', label: 'All Students' },
  { id: 'paid', label: 'Paid' },
  { id: 'unpaid', label: 'Unpaid' },
  { id: 'partial', label: 'Partial' },
];

const MOCK_STUDENTS = [
  {
    id: '1',
    name: 'Arjun Adhikari',
    guardian: 'Mohan Adhikari',
    rollNo: '6A001',
    initials: 'AA',
    avatarClass: 'primary',
    attendancePct: 96,
    hostelStatus: 'complete',
    payment: 'paid',
  },
  {
    id: '2',
    name: 'Bina Kumari',
    guardian: 'Sita Devi',
    rollNo: '6A002',
    initials: 'BK',
    avatarClass: 'secondary',
    attendancePct: 68,
    hostelStatus: 'pending',
    payment: 'unpaid',
  },
  {
    id: '3',
    name: 'Deepak Khanal',
    guardian: 'Ram Khanal',
    rollNo: '6A003',
    initials: 'DK',
    avatarClass: 'primary',
    attendancePct: 88,
    hostelStatus: 'pending',
    payment: 'partial',
  },
  {
    id: '4',
    name: 'Pooja Sharma',
    guardian: 'Laxmi Sharma',
    rollNo: '6A004',
    initials: 'PS',
    avatarClass: 'tertiary',
    attendancePct: 54,
    hostelStatus: 'complete',
    payment: 'paid',
  },
];

function paymentMatchesFilter(row, filterId) {
  if (filterId === 'all') return true;
  return row.payment === filterId;
}

function AttendancePill({ pct }) {
  let band = 'high';
  if (pct < 60) band = 'low';
  else if (pct < 85) band = 'mid';

  return (
    <span className={`sec-stu-pill sec-stu-pill--att sec-stu-pill--att-${band}`}>
      {pct}%
    </span>
  );
}

function HostelPill({ status }) {
  const isComplete = status === 'complete';
  return (
    <span
      className={
        isComplete
          ? 'sec-stu-pill sec-stu-pill--hostel sec-stu-pill--hostel-ok'
          : 'sec-stu-pill sec-stu-pill--hostel sec-stu-pill--hostel-warn'
      }
    >
      <span className="material-symbols-outlined" aria-hidden>
        {isComplete ? 'check_circle' : 'error'}
      </span>
      {isComplete ? 'Complete' : 'Pending'}
    </span>
  );
}

function PaymentPill({ status }) {
  if (status === 'paid') {
    return <span className="sec-stu-pill sec-stu-pill--pay sec-stu-pill--pay-paid">Paid</span>;
  }
  if (status === 'unpaid') {
    return <span className="sec-stu-pill sec-stu-pill--pay sec-stu-pill--pay-unpaid">Unpaid</span>;
  }
  return <span className="sec-stu-pill sec-stu-pill--pay sec-stu-pill--pay-partial">Partial</span>;
}

export const SectionStudentsPage = () => {
  const { sectionId: sectionIdParam } = useParams();
  const sectionId = sectionIdParam ? decodeURIComponent(sectionIdParam) : '';

  const ctx = useMemo(() => getSectionContext(sectionId), [sectionId]);
  const navTitle = useMemo(() => getSectionNavTitle(sectionId), [sectionId]);
  usePageTitle(navTitle);

  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const rollPrefix = useMemo(() => {
    if (!ctx) return '';
    const { classCode, sectionLetter } = ctx;
    if (/^\d+$/.test(classCode)) {
      return `${String(Number(classCode))}${sectionLetter}`;
    }
    return `${classCode}${sectionLetter}`;
  }, [ctx]);

  const students = useMemo(() => {
    if (!ctx) return [];
    return MOCK_STUDENTS.map((s, i) => ({
      ...s,
      rollNo: `${rollPrefix}${String(i + 1).padStart(3, '0')}`,
    }));
  }, [ctx, rollPrefix]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((row) => {
      if (!paymentMatchesFilter(row, paymentFilter)) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.rollNo.toLowerCase().includes(q) ||
        row.guardian.toLowerCase().includes(q)
      );
    });
  }, [students, search, paymentFilter]);

  const totalInSection = ctx?.section?.count ?? students.length;
  const unpaidCount = useMemo(
    () => students.filter((s) => s.payment === 'unpaid').length,
    [students],
  );

  const toggleRow = useCallback((id, checked) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggleAllPage = useCallback(
    (checked) => {
      if (!checked) {
        setSelectedIds(new Set());
        return;
      }
      setSelectedIds(new Set(filteredRows.map((r) => r.id)));
    },
    [filteredRows],
  );

  const allPageSelected =
    filteredRows.length > 0 && filteredRows.every((r) => selectedIds.has(r.id));
  const somePageSelected = filteredRows.some((r) => selectedIds.has(r.id));

  const selectAllRef = useRef(null);
  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = somePageSelected && !allPageSelected;
  }, [somePageSelected, allPageSelected]);

  if (!ctx) {
    return <Navigate to="/academics/student-management" replace />;
  }

  const selectedPreview = students.filter((s) => selectedIds.has(s.id)).slice(0, 4);

  return (
    <div className="sec-students-page">
      <nav className="sec-students-crumb" aria-label="Breadcrumb">
        <Link to="/academics/student-management">Academics</Link>
        <span className="material-symbols-outlined">chevron_right</span>
        <Link to="/academics/student-management">Student Management</Link>
        <span className="material-symbols-outlined">chevron_right</span>
        <span className="current">{navTitle}</span>
      </nav>

      <header className="sec-students-head">
        <div>
          <p className="sec-students-eyebrow">Roster</p>
          <h1 className="sec-students-title">{navTitle}</h1>
        </div>
        <p className="sec-students-year">
          <span>Academic Year {ACADEMIC_YEAR}</span>
        </p>
      </header>

      <div className="sec-students-bento">
        <article className="sec-students-bento-main">
          <span className="sec-students-bento-label">Roster Overview</span>
          <h2 className="sec-students-bento-heading">Student Distribution</h2>
          <div className="sec-students-bento-legend">
            <div className="sec-students-legend-item">
              <span className="dot dot--primary" />
              <span>{totalInSection} Total Students</span>
            </div>
            <div className="sec-students-legend-item">
              <span className="dot dot--tertiary" />
              <span>{unpaidCount} Unpaid</span>
            </div>
          </div>
        </article>
        <article className="sec-students-bento-card sec-students-bento-card--kits">
          <span className="material-symbols-outlined sec-students-bento-icon">package_2</span>
          <p className="sec-students-bento-stat">85%</p>
          <p className="sec-students-bento-meta">Kits Distributed</p>
        </article>
        <article className="sec-students-bento-card sec-students-bento-card--pending">
          <span className="material-symbols-outlined sec-students-bento-icon">account_balance_wallet</span>
          <p className="sec-students-bento-stat">12</p>
          <p className="sec-students-bento-meta">Pending Payments</p>
        </article>
      </div>

      <div className="sec-students-toolbar">
        <div className="sec-students-search-wrap">
          <span className="material-symbols-outlined sec-students-search-icon">search</span>
          <input
            type="search"
            className="sec-students-search"
            placeholder="Search student name or roll number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search students"
          />
        </div>
        <div className="sec-students-filters">
          {PAYMENT_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`sec-stu-chip ${paymentFilter === f.id ? 'is-active' : ''}`}
              onClick={() => setPaymentFilter(f.id)}
            >
              <span>{f.label}</span>
            </button>
          ))}
          <span className="sec-students-filter-divider" aria-hidden />
          <button type="button" className="sec-students-filter-icon-btn" aria-label="More filters">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      <div className="sec-students-table-wrap">
        <div className="sec-students-table-scroll">
          <table className="sec-students-table">
            <thead>
              <tr>
                <th className="sec-students-th sec-students-th--check">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    className="sec-students-checkbox"
                    checked={allPageSelected}
                    onChange={(e) => toggleAllPage(e.target.checked)}
                    aria-label="Select all students on this page"
                  />
                </th>
                <th className="sec-students-th">Student Name</th>
                <th className="sec-students-th">Roll No</th>
                <th className="sec-students-th">Attendance%</th>
                <th className="sec-students-th">Hostel Status</th>
                <th className="sec-students-th">Payment Status</th>
                <th className="sec-students-th sec-students-th--actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td className="sec-students-td">
                    <input
                      type="checkbox"
                      className="sec-students-checkbox"
                      checked={selectedIds.has(row.id)}
                      onChange={(e) => toggleRow(row.id, e.target.checked)}
                      aria-label={`Select ${row.name}`}
                    />
                  </td>
                  <td className="sec-students-td">
                    <div className="sec-students-name-cell">
                      <div className={`sec-students-avatar sec-students-avatar--${row.avatarClass}`}>
                        {row.initials}
                      </div>
                      <div>
                        <p className="sec-students-name">{row.name}</p>
                        <p className="sec-students-guardian">Guardian: {row.guardian}</p>
                      </div>
                    </div>
                  </td>
                  <td className="sec-students-td sec-students-td--muted">{row.rollNo}</td>
                  <td className="sec-students-td">
                    <AttendancePill pct={row.attendancePct} />
                  </td>
                  <td className="sec-students-td">
                    <HostelPill status={row.hostelStatus} />
                  </td>
                  <td className="sec-students-td">
                    <PaymentPill status={row.payment} />
                  </td>
                  <td className="sec-students-td sec-students-td--actions">
                    <button type="button" className="sec-students-more" aria-label={`Actions for ${row.name}`}>
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="sec-students-pagination">
          <p className="sec-students-page-summary">
            Showing{' '}
            <strong>
              {filteredRows.length ? `1-${filteredRows.length}` : '0'}
            </strong>{' '}
            of <strong>{totalInSection}</strong> students
          </p>
          <div className="sec-students-page-btns">
            <button type="button" className="sec-students-page-btn" disabled aria-label="Previous page">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button type="button" className="sec-students-page-btn sec-students-page-btn--num is-current">
              1
            </button>
            <button type="button" className="sec-students-page-btn sec-students-page-btn--num">
              2
            </button>
            <button type="button" className="sec-students-page-btn sec-students-page-btn--num">
              3
            </button>
            <button type="button" className="sec-students-page-btn" aria-label="Next page">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </footer>
      </div>

      {selectedIds.size > 0 ? (
        <div className="sec-students-float">
          <div className="sec-students-float-bubble">
            <div className="sec-students-float-avatars" aria-hidden>
              {selectedPreview.map((s) => (
                <span key={s.id} className={`sec-students-float-av sec-students-float-av--${s.avatarClass}`}>
                  {s.initials}
                </span>
              ))}
            </div>
            <p className="sec-students-float-text">
              <span>{selectedIds.size}</span> students selected for order
            </p>
          </div>
          <button type="button" className="sec-students-cta">
            <span>Proceed to Order</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};
