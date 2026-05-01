import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  TEACHER_DEPARTMENTS,
  fetchEmployeesData,
  selectEmployeesSectionItems,
  selectEmployeesSectionUi,
  selectEmployeesStatus,
  setSectionDepartmentFilter,
  setSectionPage,
  setSectionSearchQuery,
  setSectionStatusFilter,
} from '../../store/employees/employeesSlice';
import './TeachersStaffDirectory.scss';

const initialsFromName = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const deptPillClass = (dept) => {
  const d = String(dept || '');
  if (d === 'Administration') return 'sd-dept-pill--admin';
  if (d === 'Mathematics') return 'sd-dept-pill--math';
  if (d === 'Science') return 'sd-dept-pill--science';
  if (d === 'Humanities') return 'sd-dept-pill--humanities';
  return 'sd-dept-pill--support';
};

const statusDisplay = (status) => {
  if (status === 'Active') return { dot: 'is-active', label: 'Active Now' };
  if (status === 'On Leave') return { dot: 'is-leave', label: 'On Leave' };
  return { dot: 'is-inactive', label: status };
};

const teacherRoleKeywords = ['teacher', 'lecturer', 'faculty'];

export const TeachersStaffDirectory = () => {
  const section = 'teachers';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector((s) => selectEmployeesSectionItems(s, section));
  const ui = useSelector((s) => selectEmployeesSectionUi(s, section));
  const loadStatus = useSelector(selectEmployeesStatus);
  const mountedAt = useRef(Date.now());
  const [syncLabel, setSyncLabel] = useState('2m ago');

  useEffect(() => {
    if (loadStatus === 'idle') dispatch(fetchEmployeesData());
  }, [dispatch, loadStatus]);

  useEffect(() => {
    const tick = () => {
      const m = Math.max(1, Math.floor((Date.now() - mountedAt.current) / 60000));
      setSyncLabel(`${m}m ago`);
    };
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  const teacherItems = useMemo(
    () => items.filter((it) => teacherRoleKeywords.some((keyword) => String(it.role || '').toLowerCase().includes(keyword))),
    [items]
  );

  const totalDepartments = useMemo(() => {
    const u = new Set(teacherItems.map((it) => it.department).filter(Boolean));
    return u.size || TEACHER_DEPARTMENTS.length;
  }, [teacherItems]);

  const filteredItems = useMemo(() => {
    const q = ui.searchQuery.trim().toLowerCase();
    return teacherItems.filter((it) => {
      if (ui.statusFilter !== 'all' && it.status !== ui.statusFilter) return false;
      if (ui.departmentFilter !== 'all' && it.department !== ui.departmentFilter) return false;
      if (!q) return true;
      const text = `${it.name} ${it.empId} ${it.role} ${it.department ?? ''} ${it.email} ${it.category ?? ''}`.toLowerCase();
      return text.includes(q);
    });
  }, [teacherItems, ui.searchQuery, ui.statusFilter, ui.departmentFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / ui.pageSize));
  const startIndex = (ui.page - 1) * ui.pageSize;
  const pageItems = filteredItems.slice(startIndex, startIndex + ui.pageSize);

  useEffect(() => {
    if (ui.page > pageCount) dispatch(setSectionPage({ section, value: pageCount }));
  }, [dispatch, ui.page, pageCount]);

  const pageButtons = useMemo(() => {
    const pc = pageCount;
    const cur = ui.page;
    if (pc <= 7) return Array.from({ length: pc }, (_, i) => ({ type: 'page', n: i + 1 }));
    const out = [];
    const show = new Set([1, pc, cur, cur - 1, cur + 1].filter((n) => n >= 1 && n <= pc));
    const sorted = [...show].sort((a, b) => a - b);
    let prev = 0;
    sorted.forEach((n) => {
      if (n - prev > 1) out.push({ type: 'ellipsis' });
      out.push({ type: 'page', n });
      prev = n;
    });
    return out;
  }, [pageCount, ui.page]);

  const resetFilters = () => {
    dispatch(setSectionDepartmentFilter({ section, value: 'all' }));
    dispatch(setSectionStatusFilter({ section, value: 'Active' }));
    dispatch(setSectionSearchQuery({ section, value: '' }));
    dispatch(setSectionPage({ section, value: 1 }));
  };

  const exportCsv = () => {
    const headers = ['Name', 'Teacher ID', 'Role', 'Department', 'Email', 'Phone', 'Status'];
    const rows = filteredItems.map((it) =>
      [it.name, it.empId, it.role, it.department, it.email, it.phone, it.status].map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'teachers-directory.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const showingFrom = filteredItems.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + ui.pageSize, filteredItems.length);

  return (
    <div className="sd-page">
      <div className="sd-toolbar">
        <div className="sd-search-wide">
          <span className="material-symbols-outlined sd-search-ic">search</span>
          <input
            type="search"
            className="sd-search-input"
            placeholder="Search teachers by name, ID or department..."
            value={ui.searchQuery}
            onChange={(e) => dispatch(setSectionSearchQuery({ section, value: e.target.value }))}
            aria-label="Search teachers"
          />
        </div>
      </div>

      <header className="sd-head">
        <div>
          <h1 className="sd-title">Teachers</h1>
          <div className="sd-meta">
            <span className="sd-count-pill">{teacherItems.length} Teachers</span>
            <span className="sd-sync">
              <span className="material-symbols-outlined">update</span>
              Last synced {syncLabel}
            </span>
          </div>
        </div>
        <div className="sd-head-actions">
          <button type="button" className="sd-btn sd-btn--outline" onClick={exportCsv}>
            <span className="material-symbols-outlined">file_download</span>
            Export CSV
          </button>
          <button
            type="button"
            className="sd-btn sd-btn--primary"
            onClick={() => navigate('/employees/teachers/onboarding')}
          >
            <span className="material-symbols-outlined">person_add</span>
            Add New Teacher
          </button>
        </div>
      </header>

      <div className="sd-bento">
        <div className="sd-filters-card">
          <div className="sd-filter-field">
            <label htmlFor="sd-dept">Filter by Department</label>
            <select
              id="sd-dept"
              className="sd-select"
              value={ui.departmentFilter}
              onChange={(e) => dispatch(setSectionDepartmentFilter({ section, value: e.target.value }))}
            >
              <option value="all">All Departments</option>
              {TEACHER_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="sd-filter-field sd-filter-field--grow">
            <span className="sd-filter-label">Status</span>
            <div className="sd-segment" role="group" aria-label="Status filter">
              <button
                type="button"
                className={`sd-segment-btn ${ui.statusFilter === 'Active' ? 'active' : ''}`}
                onClick={() => dispatch(setSectionStatusFilter({ section, value: 'Active' }))}
              >
                Active
              </button>
              <button
                type="button"
                className={`sd-segment-btn ${ui.statusFilter === 'On Leave' ? 'active' : ''}`}
                onClick={() => dispatch(setSectionStatusFilter({ section, value: 'On Leave' }))}
              >
                On Leave
              </button>
            </div>
          </div>
          <button type="button" className="sd-reset" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
        <div className="sd-stat-card">
          <p className="sd-stat-label">Total Departments</p>
          <p className="sd-stat-value">{totalDepartments}</p>
          <div className="sd-stat-bar">
            <div className="sd-stat-bar-fill" />
          </div>
        </div>
      </div>

      <div className="sd-table-card">
        <div className="sd-table-scroll">
          <table className="sd-table">
            <thead>
              <tr>
                <th>Teacher</th>
                <th>Role</th>
                <th>Department</th>
                <th>Contact Info</th>
                <th>Status</th>
                <th className="sd-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="sd-empty-row">
                    No teachers match these filters.
                  </td>
                </tr>
              )}
              {pageItems.map((it) => {
                const st = statusDisplay(it.status);
                const sub = it.roleDetail || it.category;
                return (
                  <tr key={it.id} className="sd-tr">
                    <td>
                      <div className="sd-member">
                        <div className="sd-avatar">{initialsFromName(it.name)}</div>
                        <div>
                          <p className="sd-member-name">{it.name}</p>
                          <p className="sd-member-id">ID: {it.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="sd-role-title">{it.role}</p>
                      <p className="sd-role-sub">{sub}</p>
                    </td>
                    <td>
                      <span className={`sd-dept-pill ${deptPillClass(it.department)}`}>
                        {it.department}
                      </span>
                    </td>
                    <td>
                      <div className="sd-contact">
                        <p>
                          <span className="material-symbols-outlined">mail</span>
                          {it.email}
                        </p>
                        <p>
                          <span className="material-symbols-outlined">call</span>
                          {it.phone}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div className="sd-status">
                        <span className={`sd-status-dot ${st.dot}`} />
                        <span className="sd-status-label">{st.label}</span>
                      </div>
                    </td>
                    <td className="sd-td-actions">
                      <div className="sd-row-actions">
                        <button type="button" className="sd-icon-act sd-icon-act--msg" title="Message" aria-label="Message">
                          <span className="material-symbols-outlined">chat_bubble</span>
                        </button>
                        <button type="button" className="sd-icon-act" title="Edit profile" aria-label="Edit profile">
                          <span className="material-symbols-outlined">edit_square</span>
                        </button>
                        <button type="button" className="sd-icon-act" title="More" aria-label="More actions">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="sd-pagination">
          <p className="sd-page-text">
            Showing {showingFrom} to {showingTo} of {filteredItems.length} entries
          </p>
          <div className="sd-page-btns">
            <button
              type="button"
              className="sd-page-arrow"
              disabled={ui.page <= 1}
              onClick={() => dispatch(setSectionPage({ section, value: Math.max(1, ui.page - 1) }))}
              aria-label="Previous page"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="sd-page-nums">
              {pageButtons.map((item, idx) =>
                item.type === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="sd-page-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={item.n}
                    type="button"
                    className={`sd-page-num ${item.n === ui.page ? 'active' : ''}`}
                    onClick={() => dispatch(setSectionPage({ section, value: item.n }))}
                  >
                    {item.n}
                  </button>
                )
              )}
            </div>
            <button
              type="button"
              className="sd-page-arrow"
              disabled={ui.page >= pageCount}
              onClick={() => dispatch(setSectionPage({ section, value: Math.min(pageCount, ui.page + 1) }))}
              aria-label="Next page"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="sd-insights">
        <div className="sd-insight sd-insight--training">
          <span className="material-symbols-outlined sd-insight-watermark">groups</span>
          <h3 className="sd-insight-title">Upcoming Staff Training</h3>
          <p className="sd-insight-desc">
            &ldquo;Modern Pedagogical Strategies&rdquo; — Hosted by the Science Dept next Tuesday at 10:00 AM.
          </p>
          <button type="button" className="sd-insight-cta" onClick={() => window.alert('RSVP recorded (demo).')}>
            RSVP Now
          </button>
        </div>
        <div className="sd-insight sd-insight--chart">
          <div className="sd-chart-head">
            <div>
              <h3 className="sd-insight-title">Teacher Attendance</h3>
              <p className="sd-chart-sub">Last 30 Days Average</p>
            </div>
            <span className="sd-chart-badge">+2.4%</span>
          </div>
          <div className="sd-bars">
            {[60, 75, 45, 90, 65, 95, 70].map((h, i) => (
              <div
                key={i}
                className={`sd-bar ${i === 5 ? 'sd-bar--hot' : ''}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="sd-fab"
        aria-label="Add new teacher"
        onClick={() => navigate('/employees/teachers/onboarding')}
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          person_add
        </span>
      </button>

      {loadStatus === 'loading' && <p className="sd-loading">Loading teachers…</p>}
    </div>
  );
};
