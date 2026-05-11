import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  appendAuditLog,
  assignUserTemplate,
  bulkSetUsersStatus,
  cancelTemplateEdit,
  fetchUserManagement,
  resetAccessMatrix,
  saveTemplateDraft,
  setAssignmentAccess,
  setAccessPermission,
  setAssignmentField,
  setAuditActionFilter,
  setAuditAdminFilter,
  setAuditSearch,
  setPage,
  setSearchQuery,
  setTemplateDraftField,
  setUserAccess,
  startTemplateEdit,
} from '../../store/userManagement/userManagementSlice';
import './UserManagementPage.scss';

const ROLE_OPTIONS = ['Principal', 'Teacher', 'Student', 'Parent', 'Finance', 'Operations', 'Accountant'];

const BRANCH_OPTIONS = [
  'Oakwood Central',
  'Northside Heights',
  'Global Admin',
  'Riverside Campus',
  'Main Campus',
  'Darga',
  'North Block',
];

const ADMIN_ROLES = new Set(['Principal', 'Finance', 'Operations', 'Accountant']);

const APP_BRANCHES = ['Darga', 'Main Campus', 'North Block'];

const HUB_NAV = [
  { id: 'overview', label: 'System Registry', icon: 'dataset_linked', subtitle: 'User Management' },
  { id: 'command', label: 'Command Center', icon: 'grid_view', subtitle: 'Super Admin' },
  { id: 'personnel', label: 'Personnel Directory', icon: 'group', subtitle: 'Super Admin' },
  { id: 'access', label: 'Access Console', icon: 'shield_person', subtitle: 'Super Admin' },
  { id: 'audit', label: 'Audit Log', icon: 'history_edu', subtitle: 'Super Admin' },
  { id: 'portal', label: 'Portal Templates', icon: 'hub', subtitle: 'Academics link' },
];

const ACCESS_ROLES = [
  { key: 'super-admin', title: 'Super Admin', sub: 'Global Access Root', icon: 'shield_person', filled: true },
  { key: 'branch-admin', title: 'Branch Admin', sub: 'Branch Specific Control', icon: 'corporate_fare' },
  { key: 'registrar', title: 'Registrar', sub: 'Academic Operations', icon: 'edit_document' },
  { key: 'accountant', title: 'Accountant', sub: 'Financial Ledger Control', icon: 'account_balance' },
  { key: 'store-manager', title: 'Store Manager', sub: 'Inventory & Logistics', icon: 'inventory_2' },
];

const PERM_MODULES = [
  {
    key: 'academics',
    title: 'Academics Module',
    sub: 'Manage curriculum, grades, and student records.',
    icon: 'menu_book',
    iconFill: true,
    rows: [
      { k: 'modifyCurriculum', label: 'Modify Curriculum', hint: 'Add/Edit courses and syllabi' },
      { k: 'publishGrades', label: 'Publish Grades', hint: 'Finalize and release semester results' },
      { k: 'manageEnrollment', label: 'Manage Enrollment', hint: 'Register or withdraw students' },
      { k: 'facultyAssignments', label: 'Faculty Assignments', hint: 'Link teachers to specific modules' },
    ],
  },
  {
    key: 'finance',
    title: 'Finance Module',
    sub: 'Fee collection, payroll, and financial reporting.',
    icon: 'payments',
    iconFill: true,
    rows: [
      { k: 'auditTransactions', label: 'Audit Transactions', hint: 'View all financial movement' },
      { k: 'executeRefunds', label: 'Execute Refunds', hint: 'Authorize and process fee reversals' },
      { k: 'taxConfiguration', label: 'Tax Configuration', hint: 'Modify global tax rates and rules' },
      { k: 'payrollDisbursement', label: 'Payroll Disbursement', hint: 'Generate and send salary payments' },
    ],
  },
  {
    key: 'inventory',
    title: 'Inventory',
    sub: '',
    icon: 'inventory',
    small: true,
    rows: [
      { k: 'stockRequisition', label: 'Stock Requisition' },
      { k: 'vendorManagement', label: 'Vendor Management' },
      { k: 'assetLiquidation', label: 'Asset Liquidation' },
    ],
  },
  {
    key: 'personnel',
    title: 'Personnel',
    sub: '',
    icon: 'badge',
    small: true,
    rows: [
      { k: 'hiringControl', label: 'Hiring Control' },
      { k: 'leaveApproval', label: 'Leave Approval' },
      { k: 'terminationRoot', label: 'Termination Root' },
    ],
  },
];

const USER_ACCESS_MODULES = [
  { key: 'academics', title: 'Academics', hint: 'Students, timetable, attendance, grades' },
  { key: 'finance', title: 'Finance', hint: 'Fees, payroll, expenses' },
  { key: 'inventory', title: 'Inventory', hint: 'Kits, stock, assets' },
  { key: 'personnel', title: 'Personnel', hint: 'Employees, leave, staff records' },
];

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

const formatAuditDate = (iso) => {
  try {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
      time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC',
    };
  } catch {
    return { date: '—', time: '' };
  }
};

const actionPillClass = (key) => {
  if (key === 'user') return 'um-audit-pill um-audit-pill--user';
  if (key === 'security') return 'um-audit-pill um-audit-pill--security';
  if (key === 'financial') return 'um-audit-pill um-audit-pill--finance';
  return 'um-audit-pill um-audit-pill--system';
};

const accessSummary = (access) => {
  const modules = USER_ACCESS_MODULES.map((module) => access?.[module.key]).filter(Boolean);
  const viewCount = modules.filter((item) => item.view).length;
  const editCount = modules.filter((item) => item.edit).length;
  return `${viewCount} view / ${editCount} edit`;
};

export const UserManagementPage = () => {
  usePageTitle('User Management');

  const dispatch = useDispatch();
  const {
    users,
    templates,
    assignmentDraft,
    templateDraft,
    editingTemplateName,
    searchQuery,
    page,
    pageSize,
    auditLogs,
    auditAdminFilter,
    auditActionFilter,
    auditSearch,
    accessMatrix,
    loadStatus,
  } = useSelector((s) => s.userManagement);

  const [hubSection, setHubSection] = useState('overview');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignOpen, setAssignOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [integrityMsg, setIntegrityMsg] = useState(null);

  const [personnelBranch, setPersonnelBranch] = useState('All Branches');
  const [personnelRole, setPersonnelRole] = useState('All Roles');
  const [personnelStatus, setPersonnelStatus] = useState('Any Status');
  const [personnelActiveOnly, setPersonnelActiveOnly] = useState(false);
  const [personnelSearch, setPersonnelSearch] = useState('');
  const [personnelPage, setPersonnelPage] = useState(1);
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState(() => new Set());
  const [accessRoleKey, setAccessRoleKey] = useState('super-admin');
  const [accessDirty, setAccessDirty] = useState(false);
  const [accessUserId, setAccessUserId] = useState(null);

  const personnelPageSize = 10;

  useEffect(() => {
    dispatch(fetchUserManagement());
  }, [dispatch]);

  useEffect(() => {
    const onBranch = () => {
      /* reserved: could sync default branch filter from sidebar */
    };
    globalThis.addEventListener('branch:change', onBranch);
    return () => globalThis.removeEventListener('branch:change', onBranch);
  }, []);

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

  const personnelFiltered = useMemo(() => {
    let list = users;
    if (personnelActiveOnly) list = list.filter((u) => u.status === 'Active');
    if (personnelBranch !== 'All Branches') list = list.filter((u) => u.branch === personnelBranch);
    if (personnelRole !== 'All Roles') list = list.filter((u) => u.role === personnelRole);
    if (personnelStatus !== 'Any Status') list = list.filter((u) => u.status === personnelStatus);
    const q = personnelSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((u) => `${u.name} ${u.email} ${u.role} ${u.branch}`.toLowerCase().includes(q));
    }
    return list;
  }, [users, personnelBranch, personnelRole, personnelStatus, personnelActiveOnly, personnelSearch]);

  const personnelPageCount = Math.max(1, Math.ceil(personnelFiltered.length / personnelPageSize));
  const safePersonnelPage = Math.min(personnelPage, personnelPageCount);
  const personnelStart = (safePersonnelPage - 1) * personnelPageSize;
  const personnelRows = personnelFiltered.slice(personnelStart, personnelStart + personnelPageSize);

  const filteredAudit = useMemo(() => {
    let list = [...auditLogs];
    if (auditAdminFilter !== 'all') {
      list = list.filter((l) => l.admin === auditAdminFilter);
    }
    if (auditActionFilter !== 'all') {
      list = list.filter((l) => l.actionKey === auditActionFilter);
    }
    const q = auditSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (l) =>
          `${l.admin} ${l.action} ${l.target} ${l.ip}`.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => new Date(b.at) - new Date(a.at));
    return list;
  }, [auditLogs, auditAdminFilter, auditActionFilter, auditSearch]);

  const auditAdmins = useMemo(() => {
    const s = new Set(auditLogs.map((l) => l.admin));
    return ['all', ...[...s].sort()];
  }, [auditLogs]);

  const submitAssign = () => {
    dispatch(assignUserTemplate());
    setAssignOpen(false);
    setHubSection('overview');
  };

  const togglePersonnelRow = (id) => {
    setSelectedPersonnelIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllPersonnelPage = () => {
    const ids = personnelRows.map((r) => r.id);
    const allOn = ids.length && ids.every((id) => selectedPersonnelIds.has(id));
    setSelectedPersonnelIds((prev) => {
      const next = new Set(prev);
      if (allOn) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearPersonnelSelection = () => setSelectedPersonnelIds(new Set());

  const bulkStatus = (status) => {
    dispatch(bulkSetUsersStatus({ ids: [...selectedPersonnelIds], status }));
    clearPersonnelSelection();
  };

  const onPermissionToggle = (module, key, value) => {
    dispatch(setAccessPermission({ roleKey: accessRoleKey, module, key, value }));
    setAccessDirty(true);
  };

  const saveAccess = () => {
    dispatch(
      appendAuditLog({
        action: 'Access Configuration Saved',
        actionKey: 'security',
        target: `Role: ${accessRoleKey}`,
      })
    );
    setAccessDirty(false);
    setIntegrityMsg('Access configuration saved. An audit entry was recorded.');
    setTimeout(() => setIntegrityMsg(null), 4000);
  };

  const discardAccess = () => {
    dispatch(resetAccessMatrix());
    setAccessDirty(false);
  };

  const verifyIntegrity = () => {
    dispatch(
      appendAuditLog({
        action: 'Integrity Verification Run',
        actionKey: 'system',
        target: 'SHA-256 chain scan — 0 discrepancies',
      })
    );
    setIntegrityMsg('Integrity scan completed: 0 discrepancies. Log chain verified (demo).');
    setTimeout(() => setIntegrityMsg(null), 5000);
  };

  const roleMatrix = accessMatrix[accessRoleKey] || {};
  const accessUser = useMemo(() => users.find((u) => u.id === accessUserId) ?? null, [users, accessUserId]);

  if (loadStatus === 'loading' && users.length === 0) {
    return (
      <div className="um-page um-page--loading">
        <p>Loading user management…</p>
      </div>
    );
  }

  return (
    <div className="um-hub">
      <div className="um-hub-main">
        <h1 className="um-sr-only">User Management</h1>

        <nav className="um-hub-tabs" role="tablist" aria-label="User administration workspace">
          {HUB_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              title={item.label}
              aria-selected={hubSection === item.id}
              className={`um-hub-tab ${hubSection === item.id ? 'is-active' : ''}`}
              onClick={() => setHubSection(item.id)}
            >
              <span className={`material-symbols-outlined um-hub-tab-ic${hubSection === item.id ? ' filled' : ''}`}>
                {item.icon}
              </span>
              <span className="um-hub-tab-text">{item.label}</span>
            </button>
          ))}
        </nav>

        {integrityMsg && <div className="um-toast">{integrityMsg}</div>}

        {hubSection === 'command' && (
          <div className="um-section um-command">
            <section className="um-command-stats">
              <div className="um-command-health">
                <span className="um-command-kicker">System Health Index</span>
                <div className="um-command-health-row">
                  <h3>Optimal</h3>
                  <span className="um-command-pct">98%</span>
                </div>
                <p className="um-command-desc">
                  Global services are running with zero critical failures across all geographic nodes.
                </p>
                <div className="um-command-bar">
                  <div className="um-command-bar-fill" style={{ width: '98%' }} />
                </div>
              </div>
              <div className="um-command-card">
                <div className="um-command-card-icon um-command-card-icon--blue">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <p className="um-command-card-label">Active Global Users</p>
                <p className="um-command-card-value">{users.filter((u) => u.status === 'Active').length}</p>
                <p className="um-command-card-foot">Across {new Set(users.map((u) => u.branch)).size} branches</p>
              </div>
              <div className="um-command-card">
                <div className="um-command-card-icon um-command-card-icon--amber">
                  <span className="material-symbols-outlined">speed</span>
                </div>
                <p className="um-command-card-label">Server Uptime</p>
                <p className="um-command-card-value">99.98%</p>
                <p className="um-command-card-foot muted">Last 30 days</p>
              </div>
            </section>

            <div className="um-command-grid">
              <section className="um-command-queue">
                <div className="um-command-queue-head">
                  <div className="um-command-queue-title">
                    <span className="material-symbols-outlined text-primary">priority_high</span>
                    <h3>Pending Requests</h3>
                  </div>
                  <button type="button" className="um-text-link" onClick={() => setHubSection('overview')}>
                    View All
                  </button>
                </div>
                <div className="um-command-queue-list">
                  {[
                    { code: 'NY', title: 'New York Branch: Expansion Approval', meta: 'David Miller • 2 hours ago' },
                    { code: 'SF', title: 'San Francisco: Security Override', meta: 'System Process • 5 hours ago' },
                    { code: 'LD', title: 'London: Faculty Payroll Adjustment', meta: 'Elena Rossi • 1 day ago' },
                  ].map((req) => (
                    <div key={req.code} className="um-command-queue-item">
                      <div className="um-command-queue-left">
                        <div className="um-command-queue-avatar">{req.code}</div>
                        <div>
                          <h4>{req.title}</h4>
                          <p>{req.meta}</p>
                        </div>
                      </div>
                      <button type="button" className="um-btn um-btn--review" onClick={() => setHubSection('audit')}>
                        Review
                      </button>
                    </div>
                  ))}
                </div>
              </section>
              <aside className="um-command-aside">
                <div className="um-command-widget">
                  <h3>
                    <span className="material-symbols-outlined">sensors</span> System Status
                  </h3>
                  {[
                    { label: 'Core Database', state: 'ONLINE', ok: true },
                    { label: 'API Gateway', state: 'ONLINE', ok: true },
                    { label: 'Auth Service', state: 'LOCKED', ok: false },
                    { label: 'Global CDN', state: 'ONLINE', ok: true },
                  ].map((row) => (
                    <div key={row.label} className="um-command-status-row">
                      <div className="um-command-status-left">
                        <span className={`um-dot ${row.ok ? 'is-on' : 'is-warn'}`} />
                        <span>{row.label}</span>
                      </div>
                      <span className={`um-status-badge ${row.ok ? 'is-green' : 'is-amber'}`}>{row.state}</span>
                    </div>
                  ))}
                </div>
                <div className="um-command-widget">
                  <h3>Recent Global Activity</h3>
                  <div className="um-command-activity">
                    {[
                      { t: '10:42 AM', title: 'Admin Role Updated', sub: 'Permissions updated for a branch.', dot: 'primary' },
                      { t: '09:15 AM', title: 'Automated Backup Complete', sub: 'Cloud storage synced.', dot: 'tertiary' },
                      { t: 'Yesterday', title: 'New Branch Initialized', sub: 'Campus added to directory.', dot: 'primary' },
                    ].map((ev) => (
                      <div key={ev.title} className="um-command-activity-item">
                        <span className={`um-activity-dot is-${ev.dot}`} />
                        <div>
                          <p className="um-activity-time">{ev.t}</p>
                          <p className="um-activity-title">{ev.title}</p>
                          <p className="um-activity-sub">{ev.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </div>

            <section className="um-command-globe">
              <h3>Global Network Reach</h3>
              <p>
                Real-time visualization of data throughput across all secondary campuses. Latency currently holding at
                42ms globally.
              </p>
              <span className="material-symbols-outlined um-globe-ico">public</span>
            </section>
          </div>
        )}

        {hubSection === 'personnel' && (
          <div className="um-section um-personnel">
            <div className="um-personnel-head">
              <div>
                <h2 className="um-personnel-title">Personnel Directory</h2>
                <p className="um-personnel-desc">
                  Unified management of staff and portal users. Filters apply to the same registry used by Academics
                  student provisioning.
                </p>
              </div>
              <div className="um-personnel-toggle">
                <button
                  type="button"
                  className={!personnelActiveOnly ? 'is-on' : ''}
                  onClick={() => setPersonnelActiveOnly(false)}
                >
                  All Staff
                </button>
                <button
                  type="button"
                  className={personnelActiveOnly ? 'is-on' : ''}
                  onClick={() => setPersonnelActiveOnly(true)}
                >
                  Active Only
                </button>
              </div>
            </div>

            <div className="um-personnel-filters">
              <label className="um-personnel-search-field">
                <span>Search</span>
                <input
                  type="search"
                  placeholder="Name or email…"
                  value={personnelSearch}
                  onChange={(e) => {
                    setPersonnelSearch(e.target.value);
                    setPersonnelPage(1);
                  }}
                  aria-label="Search personnel"
                />
              </label>
              <label>
                <span>Filter by Branch</span>
                <select value={personnelBranch} onChange={(e) => { setPersonnelBranch(e.target.value); setPersonnelPage(1); }}>
                  <option>All Branches</option>
                  {[...new Set([...APP_BRANCHES, ...users.map((u) => u.branch)])].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Filter by Role</span>
                <select value={personnelRole} onChange={(e) => { setPersonnelRole(e.target.value); setPersonnelPage(1); }}>
                  <option>All Roles</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Status</span>
                <select value={personnelStatus} onChange={(e) => { setPersonnelStatus(e.target.value); setPersonnelPage(1); }}>
                  <option>Any Status</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Inactive</option>
                </select>
              </label>
            </div>

            {selectedPersonnelIds.size > 0 && (
              <div className="um-personnel-bulk">
                <span>
                  <strong>{selectedPersonnelIds.size}</strong> selected
                </span>
                <div className="um-personnel-bulk-actions">
                  <button type="button" className="um-btn um-btn--primary" onClick={() => bulkStatus('Active')}>
                    <span className="material-symbols-outlined">lock_reset</span>
                    Reset / Activate
                  </button>
                  <button type="button" className="um-btn um-btn--secondary" onClick={() => bulkStatus('Pending')}>
                    <span className="material-symbols-outlined">badge</span>
                    Mark Pending
                  </button>
                  <button type="button" className="um-btn um-btn--danger" onClick={() => bulkStatus('Inactive')}>
                    <span className="material-symbols-outlined">block</span>
                    Suspend
                  </button>
                </div>
                <button type="button" className="um-text-link" onClick={clearPersonnelSelection}>
                  Clear selection
                </button>
              </div>
            )}

            <div className="um-personnel-table-wrap">
              <table className="um-table um-table--personnel">
                <thead>
                  <tr>
                    <th className="um-th-check">
                      <input
                        type="checkbox"
                        aria-label="Select page"
                        checked={personnelRows.length > 0 && personnelRows.every((r) => selectedPersonnelIds.has(r.id))}
                        onChange={toggleSelectAllPersonnelPage}
                      />
                    </th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Branch</th>
                    <th>Access</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th className="um-th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {personnelRows.map((u) => {
                    const active = u.status === 'Active';
                    const suspended = u.status === 'Inactive';
                    return (
                      <tr key={u.id} className="um-tr">
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedPersonnelIds.has(u.id)}
                            onChange={() => togglePersonnelRow(u.id)}
                            aria-label={`Select ${u.name}`}
                          />
                        </td>
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
                        <td className="um-td-branch">{u.branch}</td>
                        <td>
                          <button type="button" className="um-access-chip" onClick={() => setAccessUserId(u.id)}>
                            <span className="material-symbols-outlined">admin_panel_settings</span>
                            {accessSummary(u.access)}
                          </button>
                        </td>
                        <td>
                          <div className="um-status">
                            <span
                              className={`um-status-dot ${active ? 'is-active' : suspended ? 'is-inactive' : 'is-pending'}`}
                            />
                            <span className="um-status-text">{u.status}</span>
                          </div>
                        </td>
                        <td>
                          <span className="um-last-login">{u.lastLogin || '—'}</span>
                        </td>
                        <td className="um-td-actions">
                          <button type="button" className="um-more" aria-label={`Manage access for ${u.name}`} onClick={() => setAccessUserId(u.id)}>
                            <span className="material-symbols-outlined">shield_person</span>
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
                Showing <strong>{personnelFiltered.length ? personnelStart + 1 : 0}</strong>-
                <strong>{Math.min(personnelStart + personnelPageSize, personnelFiltered.length)}</strong> of{' '}
                <strong>{personnelFiltered.length}</strong> members
              </p>
              <div className="um-page-btns">
                <button
                  type="button"
                  className="um-page-nav"
                  disabled={safePersonnelPage <= 1}
                  onClick={() => setPersonnelPage((p) => Math.max(1, p - 1))}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                {Array.from({ length: personnelPageCount }, (_, i) => i + 1)
                  .slice(0, 5)
                  .map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`um-page-num ${p === safePersonnelPage ? 'active' : ''}`}
                      onClick={() => setPersonnelPage(p)}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  type="button"
                  className="um-page-nav"
                  disabled={safePersonnelPage >= personnelPageCount}
                  onClick={() => setPersonnelPage((p) => Math.min(personnelPageCount, p + 1))}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {hubSection === 'access' && (
          <div className="um-section um-access">
            <div className="um-access-head">
              <div>
                <h2 className="um-access-title">Permission Architecture</h2>
                <p className="um-access-sub">Configure granular access protocols for institutional roles.</p>
              </div>
              <button type="button" className="um-btn um-btn--audit" onClick={() => setHubSection('audit')}>
                <span className="material-symbols-outlined">verified_user</span>
                Security Audit
              </button>
            </div>
            <div className="um-access-grid">
              <div className="um-access-roles">
                <div className="um-access-roles-head">
                  <h4>Administrative Levels</h4>
                  <button type="button" className="um-icon-only" aria-label="Add role">
                    <span className="material-symbols-outlined">add_circle</span>
                  </button>
                </div>
                <div className="um-access-role-list">
                  {ACCESS_ROLES.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      className={`um-access-role ${accessRoleKey === r.key ? 'is-active' : ''}`}
                      onClick={() => setAccessRoleKey(r.key)}
                    >
                      <div className="um-access-role-icon">
                        <span className={`material-symbols-outlined${r.filled ? ' filled' : ''}`}>{r.icon}</span>
                      </div>
                      <div className="um-access-role-text">
                        <p className="um-access-role-title">{r.title}</p>
                        <p className="um-access-role-sub">{r.sub}</p>
                      </div>
                      <span className="material-symbols-outlined um-access-chev">chevron_right</span>
                    </button>
                  ))}
                </div>
                <div className="um-access-info">
                  <span className="material-symbols-outlined">info</span>
                  <p>
                    Roles define the maximum scope of permissions. Student-facing views are controlled via the Students
                    Template and{' '}
                    <Link to="/academics/student-management" className="um-inline-link">
                      Academics → Student Management
                    </Link>
                    .
                  </p>
                </div>
              </div>
              <div className="um-access-modules">
                {PERM_MODULES.map((mod) => (
                  <section key={mod.key} className={`um-access-module ${mod.small ? 'is-compact' : ''}`}>
                    <div className="um-access-module-head">
                      <div className="um-access-mod-icon">
                        <span className={`material-symbols-outlined${mod.iconFill ? ' filled' : ''}`}>{mod.icon}</span>
                      </div>
                      <div>
                        <h5>{mod.title}</h5>
                        {mod.sub ? <p>{mod.sub}</p> : null}
                      </div>
                      <span className="um-access-active-pill">ACTIVE</span>
                    </div>
                    <div className={mod.small ? 'um-access-rows sm' : 'um-access-rows'}>
                      {mod.rows.map((row) => (
                        <label key={row.k} className="um-access-row">
                          <div>
                            <span className="um-access-row-label">{row.label}</span>
                            {row.hint ? <span className="um-access-row-hint">{row.hint}</span> : null}
                          </div>
                          <input
                            type="checkbox"
                            className="um-access-checkbox"
                            checked={!!roleMatrix[mod.key]?.[row.k]}
                            onChange={(e) => onPermissionToggle(mod.key, row.k, e.target.checked)}
                          />
                        </label>
                      ))}
                    </div>
                  </section>
                ))}
                <div className="um-access-footer-btns">
                  <button type="button" className="um-btn um-btn--ghost" onClick={discardAccess} disabled={!accessDirty}>
                    Discard Changes
                  </button>
                  <button type="button" className="um-btn um-btn--primary" onClick={saveAccess}>
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {hubSection === 'audit' && (
          <div className="um-section um-audit">
            <div className="um-audit-head">
              <div>
                <h2 className="um-audit-title">Audit Log</h2>
                <p className="um-audit-desc">
                  Immutable record of administrative actions. New entries are appended when you save templates, add
                  users, change permissions, or run bulk personnel actions.
                </p>
              </div>
              <button type="button" className="um-btn um-btn--verify" onClick={verifyIntegrity}>
                <span className="material-symbols-outlined">verified_user</span>
                Verify Log Integrity
              </button>
            </div>
            <div className="um-audit-kpis">
              <div className="um-audit-kpi">
                <p>Total Logs</p>
                <div className="um-audit-kpi-row">
                  <strong>{filteredAudit.length}</strong>
                  <span className="um-audit-trend">
                    <span className="material-symbols-outlined">trending_up</span> live
                  </span>
                </div>
              </div>
              <div className="um-audit-kpi">
                <p>Active Admins</p>
                <strong>{new Set(users.filter((u) => ADMIN_ROLES.has(u.role)).map((u) => u.name)).size || 3}</strong>
              </div>
              <div className="um-audit-kpi">
                <p>System Integrity</p>
                <strong>100%</strong>
              </div>
              <div className="um-audit-kpi">
                <p>Security Flags</p>
                <div className="um-audit-kpi-row">
                  <strong className="text-error">0</strong>
                  <span className="muted">Normal range</span>
                </div>
              </div>
            </div>
            <div className="um-audit-filters">
              <label>
                <span>Search</span>
                <input
                  type="search"
                  placeholder="Events, IPs, admins…"
                  value={auditSearch}
                  onChange={(e) => dispatch(setAuditSearch(e.target.value))}
                  aria-label="Search audit log"
                />
              </label>
              <label>
                <span>Administrator</span>
                <select
                  value={auditAdminFilter}
                  onChange={(e) => dispatch(setAuditAdminFilter(e.target.value))}
                >
                  <option value="all">All Administrators</option>
                  {auditAdmins.filter((a) => a !== 'all').map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Action Type</span>
                <select
                  value={auditActionFilter}
                  onChange={(e) => dispatch(setAuditActionFilter(e.target.value))}
                >
                  <option value="all">All Actions</option>
                  <option value="user">User Management</option>
                  <option value="financial">Financial</option>
                  <option value="security">Security</option>
                  <option value="system">System</option>
                </select>
              </label>
              <button type="button" className="um-btn um-btn--primary" onClick={() => dispatch(setAuditSearch(auditSearch))}>
                Apply Filters
              </button>
            </div>
            <div className="um-audit-table-wrap">
              <table className="um-table um-table--audit">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Administrator</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th className="um-th-actions">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAudit.slice(0, 50).map((log) => {
                    const { date, time } = formatAuditDate(log.at);
                    return (
                      <tr key={log.id} className="um-tr">
                        <td>
                          <div className="um-audit-ts">
                            <span className="um-audit-date">{date}</span>
                            <span className="um-audit-time">{time}</span>
                          </div>
                        </td>
                        <td>
                          <div className="um-audit-admin">
                            <div className="um-audit-admin-av">{log.adminInitials}</div>
                            <span>{log.admin}</span>
                          </div>
                        </td>
                        <td>
                          <span className={actionPillClass(log.actionKey)}>{log.action}</span>
                        </td>
                        <td className="um-td-branch">{log.target}</td>
                        <td className="um-mono">{log.ip}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="um-audit-banner">
              <div className="um-audit-banner-icon">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <h4>Cryptographic Integrity Guaranteed</h4>
                <p>
                  Every new entry is recorded in this log when User Management actions occur. Last scan:{' '}
                  <strong>12 minutes ago</strong> (demo) — <strong>0 discrepancies</strong>.
                </p>
              </div>
            </div>
          </div>
        )}

        {hubSection === 'portal' && (
          <div className="um-section um-portal">
            <div className="um-portal-intro">
              <h2>Portal templates &amp; assignment rules</h2>
              <p>
                Templates control what each role sees in the app. The <strong>Students Template</strong> maps to the
                student experience in{' '}
                <Link to="/academics/student-management" className="um-inline-link">
                  Academics → Student Management
                </Link>
                .
              </p>
            </div>
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
                      {tpl.name === 'Students Template' && (
                        <Link to="/academics/student-management" className="um-template-link">
                          Open linked student roster →
                        </Link>
                      )}
                    </div>
                    <button type="button" className="um-btn um-btn--ghost" onClick={() => dispatch(startTemplateEdit(tpl.name))}>
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {hubSection === 'overview' && (
          <>
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
                  <div className="um-registry-head-right">
                    <div className="um-inline-search">
                      <span className="material-symbols-outlined" aria-hidden>
                        search
                      </span>
                      <input
                        type="search"
                        className="um-inline-search-input"
                        placeholder="Search users…"
                        value={searchQuery}
                        onChange={(e) => {
                          dispatch(setSearchQuery(e.target.value));
                          dispatch(setPage(1));
                        }}
                        aria-label="Search users in registry"
                      />
                    </div>
                    <div className="um-registry-actions">
                    <div className="um-filter-wrap">
                      <button type="button" className="um-btn um-btn--secondary" onClick={() => setFiltersOpen((v) => !v)}>
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
                </div>

                <div className="um-table-wrap">
                  <table className="um-table">
                    <thead>
                      <tr>
                        <th>User name</th>
                        <th>Role</th>
                        <th>Branch</th>
                        <th>Access</th>
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
                              <button type="button" className="um-access-chip" onClick={() => setAccessUserId(u.id)}>
                                <span className="material-symbols-outlined">admin_panel_settings</span>
                                {accessSummary(u.access)}
                              </button>
                            </td>
                            <td>
                              <div className="um-status">
                                <span
                                  className={`um-status-dot ${active ? 'is-active' : inactive ? 'is-inactive' : 'is-pending'}`}
                                />
                                <span className="um-status-text">{u.status}</span>
                              </div>
                            </td>
                            <td className="um-td-actions">
                              <button type="button" className="um-more" aria-label={`Manage access for ${u.name}`} onClick={() => setAccessUserId(u.id)}>
                                <span className="material-symbols-outlined">shield_person</span>
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
                    Showing <strong>{showFrom}</strong>-<strong>{showTo}</strong> of <strong>{filteredUsers.length}</strong>{' '}
                    users
                  </p>
                  <div className="um-page-btns">
                    <button
                      type="button"
                      className="um-page-nav"
                      disabled={page <= 1}
                      onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
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
                    <button type="button" className="um-aside-btn um-aside-btn--primary" onClick={() => setHubSection('audit')}>
                      View Security Audit
                    </button>
                    <button type="button" className="um-aside-btn um-aside-btn--muted" onClick={() => setHubSection('command')}>
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
          </>
        )}

        {assignOpen && (
          <div className="um-modal-overlay" role="presentation" onClick={() => setAssignOpen(false)}>
            <div className="um-modal" role="dialog" aria-labelledby="um-assign-title" onClick={(e) => e.stopPropagation()}>
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
                <div className="um-modal-access">
                  <div className="um-modal-access-head">
                    <h4>Access after creation</h4>
                    <p>Choose what this user can see or edit immediately after account creation.</p>
                  </div>
                  <div className="um-user-access-grid">
                    {USER_ACCESS_MODULES.map((module) => {
                      const moduleAccess = assignmentDraft.access?.[module.key] || {};
                      return (
                        <div key={module.key} className="um-user-access-row">
                          <div>
                            <p className="um-user-access-title">{module.title}</p>
                            <p className="um-user-access-hint">{module.hint}</p>
                          </div>
                          <label className="um-user-access-check">
                            <input
                              type="checkbox"
                              checked={!!moduleAccess.view}
                              onChange={(e) =>
                                dispatch(
                                  setAssignmentAccess({
                                    module: module.key,
                                    permission: 'view',
                                    value: e.target.checked,
                                  })
                                )
                              }
                            />
                            View
                          </label>
                          <label className="um-user-access-check">
                            <input
                              type="checkbox"
                              checked={!!moduleAccess.edit}
                              onChange={(e) =>
                                dispatch(
                                  setAssignmentAccess({
                                    module: module.key,
                                    permission: 'edit',
                                    value: e.target.checked,
                                  })
                                )
                              }
                            />
                            Edit
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
        {accessUser && (
          <div className="um-modal-overlay" role="presentation" onClick={() => setAccessUserId(null)}>
            <div className="um-modal um-modal--wide" role="dialog" aria-labelledby="um-user-access-title" onClick={(e) => e.stopPropagation()}>
              <h3 id="um-user-access-title" className="um-modal-title">
                Manage access
              </h3>
              <p className="um-modal-sub">
                {accessUser.name} can be allowed to view or edit each module independently.
              </p>
              <div className="um-user-access-grid">
                {USER_ACCESS_MODULES.map((module) => {
                  const moduleAccess = accessUser.access?.[module.key] || {};
                  return (
                    <div key={module.key} className="um-user-access-row">
                      <div>
                        <p className="um-user-access-title">{module.title}</p>
                        <p className="um-user-access-hint">{module.hint}</p>
                      </div>
                      <label className="um-user-access-check">
                        <input
                          type="checkbox"
                          checked={!!moduleAccess.view}
                          onChange={(e) =>
                            dispatch(
                              setUserAccess({
                                userId: accessUser.id,
                                module: module.key,
                                permission: 'view',
                                value: e.target.checked,
                              })
                            )
                          }
                        />
                        View
                      </label>
                      <label className="um-user-access-check">
                        <input
                          type="checkbox"
                          checked={!!moduleAccess.edit}
                          onChange={(e) =>
                            dispatch(
                              setUserAccess({
                                userId: accessUser.id,
                                module: module.key,
                                permission: 'edit',
                                value: e.target.checked,
                              })
                            )
                          }
                        />
                        Edit
                      </label>
                    </div>
                  );
                })}
              </div>
              <div className="um-modal-actions">
                <button
                  type="button"
                  className="um-btn um-btn--primary"
                  onClick={() => {
                    dispatch(
                      appendAuditLog({
                        action: 'User Access Updated',
                        actionKey: 'security',
                        target: accessUser.name,
                      })
                    );
                    setAccessUserId(null);
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
