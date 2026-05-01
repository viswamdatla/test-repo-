import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePageTitle } from '../../hooks/usePageTitle';
import { ThemeContext } from '../../theme/AppThemeProvider';
import {
  assignUserTemplate,
  cancelTemplateEdit,
  fetchUserManagement,
  saveTemplateDraft,
  setAssignmentField,
  setPage,
  setSearchQuery,
  setTemplateDraftField,
  startTemplateEdit,
} from '../../store/userManagement/userManagementSlice';
import './UserManagementPage.scss';

const ROLE_OPTIONS = ['Principal', 'Teacher', 'Student', 'Parent', 'Finance', 'Operations', 'Accountant'];

const BRANCH_OPTIONS = ['Oakwood Central', 'Northside Heights', 'Global Admin', 'Riverside Campus'];

const ADMIN_ROLES = new Set(['Principal', 'Finance', 'Operations', 'Accountant']);

const initialsFromName = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const rolePillMod = (role) => {
  const r = String(role || '').toLowerCase();
  if (r === 'principal') return 'um-role-pill--principal';
  if (r === 'teacher') return 'um-role-pill--teacher';
  if (r === 'accountant' || r === 'finance') return 'um-role-pill--accountant';
  if (r === 'student') return 'um-role-pill--student';
  if (r === 'parent') return 'um-role-pill--parent';
  if (r === 'operations') return 'um-role-pill--ops';
  return 'um-role-pill--default';
};

export const UserManagementPage = () => {
  usePageTitle('User Management');

  const dispatch = useDispatch();
  const { toggleTheme, isDark } = useContext(ThemeContext);
  const { users, templates, assignmentDraft, templateDraft, editingTemplateName, searchQuery, page, pageSize } =
    useSelector((s) => s.userManagement);

  const [statusFilter, setStatusFilter] = useState('all');
  const [assignOpen, setAssignOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUserManagement());
  }, [dispatch]);

  const kpis = useMemo(() => {
    const active = users.filter((u) => u.status === 'Active').length;
    const admins = users.filter((u) => ADMIN_ROLES.has(u.role)).length;
    const pending = users.filter((u) => u.status === 'Pending').length;
    return { active, admins, pending };
  }, [users]);

  const filteredUsers = useMemo(() => {
    let list = users;
    if (statusFilter !== 'all') {
      list = list.filter((u) => u.status.toLowerCase() === statusFilter.toLowerCase());
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((u) =>
      `${u.name} ${u.email} ${u.role} ${u.template} ${u.status} ${u.branch || ''}`.toLowerCase().includes(q)
    );
  }, [users, searchQuery, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const pageItems = filteredUsers.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    if (page > pageCount) dispatch(setPage(pageCount));
  }, [page, pageCount, dispatch]);

  const pagesToRender = useMemo(() => {
    if (pageCount <= 5) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(page - 1, pageCount - 2));
    return [start, start + 1, start + 2];
  }, [page, pageCount]);

  const showFrom = filteredUsers.length === 0 ? 0 : startIndex + 1;
  const showTo = Math.min(startIndex + pageSize, filteredUsers.length);

  const submitAssign = () => {
    dispatch(assignUserTemplate());
    setAssignOpen(false);
  };

  return (
    <div className="um-page">
      <div className="um-top-bar">
        <div className="um-top-actions">
          <div className="um-search">
            <span className="material-symbols-outlined um-search-ic">search</span>
            <input
              type="search"
              className="um-search-input"
              placeholder="Search systems..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              aria-label="Search users"
            />
          </div>
          <div className="um-top-icons">
            <button type="button" className="um-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button type="button" className="um-icon-btn um-icon-btn--notify" aria-label="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button type="button" className="um-icon-btn" aria-label="Settings">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <div className="um-profile-mini">
            <div className="um-profile-mini-text">
              <p className="um-profile-mini-name">JD</p>
              <p className="um-profile-mini-role">Super Administrator</p>
            </div>
            <div className="um-profile-mini-avatar" aria-hidden>
              JD
            </div>
          </div>
        </div>
      </div>

      <div className="um-kpis">
        <div className="um-kpi">
          <div className="um-kpi-top">
            <div className="um-kpi-icon um-kpi-icon--blue">
              <span className="material-symbols-outlined">group</span>
            </div>
            <span className="um-kpi-badge um-kpi-badge--growth">+12% growth</span>
          </div>
          <div className="um-kpi-body">
            <p className="um-kpi-label">Total active users</p>
            <p className="um-kpi-value">{kpis.active.toLocaleString()}</p>
          </div>
        </div>
        <div className="um-kpi">
          <div className="um-kpi-top">
            <div className="um-kpi-icon um-kpi-icon--amber">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <span className="um-kpi-badge um-kpi-badge--roles">Global roles</span>
          </div>
          <div className="um-kpi-body">
            <p className="um-kpi-label">Admin count</p>
            <p className="um-kpi-value">{kpis.admins}</p>
          </div>
        </div>
        <div className="um-kpi">
          <div className="um-kpi-top">
            <div className="um-kpi-icon um-kpi-icon--red">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <span className="um-kpi-badge um-kpi-badge--action">Action needed</span>
          </div>
          <div className="um-kpi-body">
            <p className="um-kpi-label">Pending requests</p>
            <p className="um-kpi-value">{kpis.pending}</p>
          </div>
        </div>
      </div>

      <div className="um-main">
        <section className="um-registry">
          <div className="um-registry-head">
            <h2 className="um-registry-title">System Registry</h2>
            <div className="um-registry-actions">
              <div className="um-filter-wrap">
                <button
                  type="button"
                  className="um-btn um-btn--secondary"
                  onClick={() => setFiltersOpen((v) => !v)}
                >
                  <span className="material-symbols-outlined">filter_list</span>
                  Filters
                </button>
                {filtersOpen && (
                  <div className="um-filter-pop">
                    <p className="um-filter-pop-title">Status</p>
                    <div className="um-filter-chips">
                      {['all', 'Active', 'Pending', 'Inactive'].map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`um-filter-chip ${statusFilter === s ? 'active' : ''}`}
                          onClick={() => {
                            setStatusFilter(s);
                            dispatch(setPage(1));
                          }}
                        >
                          {s === 'all' ? 'All' : s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button type="button" className="um-btn um-btn--primary" onClick={() => setAssignOpen(true)}>
                <span className="material-symbols-outlined">person_add</span>
                Add User
              </button>
            </div>
          </div>

          <div className="um-table-wrap">
            <table className="um-table">
              <thead>
                <tr>
                  <th>User name</th>
                  <th>Role</th>
                  <th>Branch</th>
                  <th>Status</th>
                  <th className="um-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((u) => {
                  const active = u.status === 'Active';
                  const inactive = u.status === 'Inactive';
                  return (
                    <tr key={u.id} className="um-tr">
                      <td>
                        <div className="um-user-cell">
                          <div className="um-avatar">{initialsFromName(u.name)}</div>
                          <div>
                            <p className="um-user-name">{u.name}</p>
                            <p className="um-user-email">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`um-role-pill ${rolePillMod(u.role)}`}>{u.role}</span>
                      </td>
                      <td className="um-td-branch">{u.branch || '—'}</td>
                      <td>
                        <div className="um-status">
                          <span
                            className={`um-status-dot ${active ? 'is-active' : inactive ? 'is-inactive' : 'is-pending'}`}
                          />
                          <span className="um-status-text">{u.status}</span>
                        </div>
                      </td>
                      <td className="um-td-actions">
                        <button type="button" className="um-more" aria-label={`Actions for ${u.name}`}>
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="um-pagination">
            <p className="um-page-summary">
              Showing <strong>{showFrom}</strong>-<strong>{showTo}</strong> of{' '}
              <strong>{filteredUsers.length}</strong> users
            </p>
            <div className="um-page-btns">
              <button
                type="button"
                className="um-page-nav"
                disabled={page <= 1}
                onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {pagesToRender.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`um-page-num ${p === page ? 'active' : ''}`}
                  onClick={() => dispatch(setPage(p))}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="um-page-nav"
                disabled={page >= pageCount}
                onClick={() => dispatch(setPage(Math.min(pageCount, page + 1)))}
                aria-label="Next page"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        <aside className="um-aside">
          <div className="um-aside-card um-aside-card--access">
            <div className="um-aside-hero" />
            <div className="um-aside-body">
              <h3 className="um-aside-title">Access Controls</h3>
              <p className="um-aside-desc">
                Monitor all system entry points and manage security audit logs for regulatory compliance.
              </p>
              <button type="button" className="um-aside-btn um-aside-btn--primary">
                View Security Audit
              </button>
              <button type="button" className="um-aside-btn um-aside-btn--muted">
                System Logs
              </button>
            </div>
          </div>

          <div className="um-integrity">
            <h3 className="um-integrity-title">System Integrity</h3>
            <div className="um-integrity-row">
              <span className="um-integrity-label">Server uptime</span>
              <span className="um-integrity-val">99.98%</span>
            </div>
            <div className="um-integrity-bar">
              <div className="um-integrity-bar-fill" />
            </div>
            <p className="um-integrity-note">
              All global nodes are currently operational with no reported security breaches in the last 24 hours.
            </p>
          </div>

          <div className="um-policy">
            <div className="um-policy-head">
              <div className="um-policy-icon">
                <span className="material-symbols-outlined">policy</span>
              </div>
              <div>
                <p className="um-policy-name">Privacy Policy</p>
                <p className="um-policy-meta">Updated 2 days ago</p>
              </div>
            </div>
            <p className="um-policy-quote">
              &ldquo;Maintaining user data integrity is our top priority for the 2024 academic year.&rdquo;
            </p>
            <button type="button" className="um-policy-link">
              Read update
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </aside>
      </div>

      <details className="um-templates">
        <summary className="um-templates-summary">Portal templates &amp; assignment rules</summary>
        <div className="um-templates-inner">
          <div className="um-rule-grid">
            <div className="um-rule-pill">Teachers → Teachers Template</div>
            <div className="um-rule-pill">Students → Students Template</div>
            <div className="um-rule-pill">Parents → Parents Template</div>
            <div className="um-rule-pill">Finance / Operations / Accountant → Operations Template</div>
          </div>

          <div className="um-template-editor">
            <h4>{editingTemplateName ? 'Edit template' : 'Create template'}</h4>
            <div className="um-template-form">
              <label>
                Template name
                <input
                  value={templateDraft.name}
                  onChange={(e) => dispatch(setTemplateDraftField({ field: 'name', value: e.target.value }))}
                  placeholder="Enter template name"
                />
              </label>
              <label>
                Description
                <input
                  value={templateDraft.description}
                  onChange={(e) => dispatch(setTemplateDraftField({ field: 'description', value: e.target.value }))}
                  placeholder="Describe this template"
                />
              </label>
              <div className="um-template-form-actions">
                <button type="button" className="um-btn um-btn--primary" onClick={() => dispatch(saveTemplateDraft())}>
                  {editingTemplateName ? 'Update template' : 'Create template'}
                </button>
                {editingTemplateName && (
                  <button type="button" className="um-btn um-btn--secondary" onClick={() => dispatch(cancelTemplateEdit())}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
            <ul className="um-template-list">
              {templates.map((tpl) => (
                <li key={tpl.name} className="um-template-item">
                  <div>
                    <p className="um-template-name">{tpl.name}</p>
                    <p className="um-template-desc">{tpl.description || 'No description'}</p>
                  </div>
                  <button type="button" className="um-btn um-btn--ghost" onClick={() => dispatch(startTemplateEdit(tpl.name))}>
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      {assignOpen && (
        <div className="um-modal-overlay" role="presentation" onClick={() => setAssignOpen(false)}>
          <div
            className="um-modal"
            role="dialog"
            aria-labelledby="um-assign-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="um-assign-title" className="um-modal-title">
              Add user
            </h3>
            <p className="um-modal-sub">Assign portal access and branch placement.</p>
            <div className="um-modal-form">
              <label>
                Name
                <input
                  value={assignmentDraft.name}
                  onChange={(e) => dispatch(setAssignmentField({ field: 'name', value: e.target.value }))}
                  placeholder="Full name"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={assignmentDraft.email}
                  onChange={(e) => dispatch(setAssignmentField({ field: 'email', value: e.target.value }))}
                  placeholder="email@campus360.edu"
                />
              </label>
              <label>
                Role
                <select
                  value={assignmentDraft.role}
                  onChange={(e) => dispatch(setAssignmentField({ field: 'role', value: e.target.value }))}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Branch
                <select
                  value={assignmentDraft.branch}
                  onChange={(e) => dispatch(setAssignmentField({ field: 'branch', value: e.target.value }))}
                >
                  {BRANCH_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Template
                <select
                  value={assignmentDraft.template}
                  onChange={(e) => dispatch(setAssignmentField({ field: 'template', value: e.target.value }))}
                >
                  {templates.map((tpl) => (
                    <option key={tpl.name} value={tpl.name}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="um-modal-actions">
              <button type="button" className="um-btn um-btn--secondary" onClick={() => setAssignOpen(false)}>
                Cancel
              </button>
              <button type="button" className="um-btn um-btn--primary" onClick={submitAssign}>
                Save user
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
