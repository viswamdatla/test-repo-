import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../../styles/DataTable.scss';
import {
  OPERATIONAL_DEPARTMENTS,
  TEACHER_CATEGORIES,
  TEACHER_DEPARTMENTS,
  fetchEmployeesData,
  selectEmployeesSectionItems,
  selectEmployeesSectionUi,
  selectEmployeesStatus,
  setSectionCategoryFilter,
  setSectionDepartmentFilter,
  setSectionPage,
  setSectionSearchQuery,
  setSectionStatusFilter,
} from '../../store/employees/employeesSlice';
const statusClassMap = {
  Active: 'emp-pill-active',
  'On Leave': 'emp-pill-leave',
  Inactive: 'emp-pill-inactive',
};
const teacherRoleKeywords = ['teacher', 'lecturer', 'faculty'];

const SECTION_PAGE_HEADER = {
  teachers: {
    title: 'Teachers Directory',
    description: 'View and manage teacher profiles, categories, departments, and contact details.',
    ctaTo: '/employees/teachers/onboarding',
    ctaLabel: 'Add Teacher',
  },
  administration: {
    title: 'Administration Directory',
    description: 'View and manage administrative staff, roles, departments, and contact details.',
    ctaTo: '/admission',
    ctaLabel: 'Add Staff Member',
  },
  operational: {
    title: 'Operational Staff Directory',
    description: 'Managing technical facilities, campus security, and IT infrastructure.',
    ctaTo: '/admission',
    ctaLabel: 'Add Staff Member',
  },
};

export const EmployeesDirectoryView = ({ section }) => {
  const dispatch = useDispatch();
  const items = useSelector((state) => selectEmployeesSectionItems(state, section));
  const ui = useSelector((state) => selectEmployeesSectionUi(state, section));
  const loadStatus = useSelector(selectEmployeesStatus);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (loadStatus === 'idle') dispatch(fetchEmployeesData());
  }, [dispatch, loadStatus]);

  const sectionItems = useMemo(() => {
    if (section !== 'teachers') return items;
    return items.filter((it) =>
      teacherRoleKeywords.some((keyword) => String(it.role || '').toLowerCase().includes(keyword))
    );
  }, [items, section]);

  const filteredItems = useMemo(() => {
    const q = ui.searchQuery.trim().toLowerCase();
    return sectionItems.filter((it) => {
      const statusMatch = ui.statusFilter === 'all' ? true : it.status === ui.statusFilter;
      if (!statusMatch) return false;
      if (section === 'teachers') {
        const catMatch = ui.categoryFilter === 'all' ? true : it.category === ui.categoryFilter;
        const depMatch = ui.departmentFilter === 'all' ? true : it.department === ui.departmentFilter;
        if (!catMatch || !depMatch) return false;
      }
      if (section === 'operational') {
        const depMatch = ui.departmentFilter === 'all' ? true : it.department === ui.departmentFilter;
        if (!depMatch) return false;
      }
      if (!q) return true;
      const text = `${it.name} ${it.empId} ${it.role} ${it.department ?? ''} ${it.category ?? ''} ${it.email}`.toLowerCase();
      return text.includes(q);
    });
  }, [sectionItems, ui.searchQuery, ui.statusFilter, ui.categoryFilter, ui.departmentFilter, section]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / ui.pageSize));
  const startIndex = (ui.page - 1) * ui.pageSize;
  const currentItems = filteredItems.slice(startIndex, startIndex + ui.pageSize);

  useEffect(() => {
    if (ui.page > pageCount) {
      dispatch(setSectionPage({ section, value: pageCount }));
    }
  }, [dispatch, ui.page, pageCount, section]);

  const pagesToRender = useMemo(() => {
    if (pageCount <= 3) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(ui.page - 1, pageCount - 2));
    return [start, start + 1, start + 2].filter((n) => n <= pageCount);
  }, [ui.page, pageCount]);

  const totals = useMemo(() => {
    const total = sectionItems.length;
    const active = sectionItems.filter((x) => x.status === 'Active').length;
    const onLeave = sectionItems.filter((x) => x.status === 'On Leave').length;
    const inactive = sectionItems.filter((x) => x.status === 'Inactive').length;
    const deptCount = new Set(sectionItems.map((x) => x.department).filter(Boolean)).size;
    return { total, active, onLeave, inactive, deptCount };
  }, [sectionItems]);

  const departmentPills = useMemo(() => {
    if (section === 'operational') {
      return [{ label: 'All teams', value: 'all' }, ...OPERATIONAL_DEPARTMENTS.map((d) => ({ label: d, value: d }))];
    }
    if (section === 'teachers') {
      return [{ label: 'All subjects', value: 'all' }, ...TEACHER_DEPARTMENTS.map((d) => ({ label: d, value: d }))];
    }
    const uniq = [...new Set(sectionItems.map((x) => x.department).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
    return [{ label: 'All offices', value: 'all' }, ...uniq.map((d) => ({ label: d, value: d }))];
  }, [section, sectionItems]);

  const bentoTiles = useMemo(() => {
    if (section === 'operational') {
      return [
        {
          icon: 'groups',
          tone: 'primary',
          label: 'Total ops staff',
          value: totals.total,
          hint: `${totals.deptCount} team${totals.deptCount === 1 ? '' : 's'}`,
        },
        {
          icon: 'construction',
          tone: 'tertiary',
          label: 'Active now',
          value: totals.active,
          hint: 'On duty roster',
        },
        {
          icon: 'admin_panel_settings',
          tone: 'secondary',
          label: 'On leave',
          value: totals.onLeave,
          hint: totals.inactive ? `${totals.inactive} inactive` : 'Campus coverage',
        },
      ];
    }
    if (section === 'teachers') {
      return [
        {
          icon: 'groups',
          tone: 'primary',
          label: 'Total teachers',
          value: totals.total,
          hint: `${totals.deptCount} departments`,
        },
        {
          icon: 'menu_book',
          tone: 'tertiary',
          label: 'Active faculty',
          value: totals.active,
          hint: 'Teaching now',
        },
        {
          icon: 'event_busy',
          tone: 'secondary',
          label: 'On leave',
          value: totals.onLeave,
          hint: 'Away from campus',
        },
      ];
    }
    return [
      {
        icon: 'corporate_fare',
        tone: 'primary',
        label: 'Total staff',
        value: totals.total,
        hint: `${totals.deptCount} office${totals.deptCount === 1 ? '' : 's'}`,
      },
      {
        icon: 'badge',
        tone: 'tertiary',
        label: 'Active',
        value: totals.active,
        hint: 'Currently employed',
      },
      {
        icon: 'history_edu',
        tone: 'secondary',
        label: 'On leave',
        value: totals.onLeave,
        hint: totals.inactive ? `${totals.inactive} inactive` : 'Out of office',
      },
    ];
  }, [section, totals]);

  const dashboardKpis = useMemo(
    () =>
      bentoTiles.map((tile) => {
        if (tile.tone === 'tertiary') {
          return {
            ...tile,
            accentClass: 'emp-dashboard-kpi-card--tertiary',
            iconClass: 'emp-dashboard-kpi-icon--tertiary',
            badgeClass: 'emp-dashboard-kpi-badge--neutral',
          };
        }
        if (tile.tone === 'secondary') {
          return {
            ...tile,
            accentClass: 'emp-dashboard-kpi-card--secondary',
            iconClass: 'emp-dashboard-kpi-icon--secondary',
            badgeClass: 'emp-dashboard-kpi-badge--blue',
          };
        }
        return {
          ...tile,
          accentClass: 'emp-dashboard-kpi-card--primary',
          iconClass: 'emp-dashboard-kpi-icon--primary',
          badgeClass: 'emp-dashboard-kpi-badge--green',
        };
      }),
    [bentoTiles]
  );

  let searchPlaceholder = 'Search operational staff by name, ID or department...';
  if (section === 'teachers') {
    searchPlaceholder = 'Search teachers by name, ID or department...';
  } else if (section === 'administration') {
    searchPlaceholder = 'Search administration by name, ID or department...';
  }
  const memberLabelLower = section === 'teachers' ? 'teachers' : 'staff members';
  const pageHeader =
    SECTION_PAGE_HEADER[section] ?? {
      title: 'Employees Directory',
      description: 'View and manage employee records.',
      ctaTo: '/admission',
      ctaLabel: 'Add Staff Member',
    };

  const renderTable = () => {
    if (section === 'operational') {
      return (
        <table className="emp-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Shift Time</th>
              <th>Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((it) => (
              <tr key={it.id}>
                <td>
                  <div className="emp-name">
                    <div className="avatar">{it.name.charAt(0)}</div>
                    <div>
                      <p className="name">{it.name}</p>
                      <p className="sub">{it.empId}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p className="name">{it.role}</p>
                  <span className="emp-tag">{it.department}</span>
                </td>
                <td>{it.shift}</td>
                <td>
                  <p>{it.email}</p>
                  <p className="sub">{it.phone}</p>
                </td>
                <td>
                  <span className={`emp-pill ${statusClassMap[it.status] ?? 'emp-pill-active'}`}>{it.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (section === 'teachers') {
      return (
        <table className="emp-table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th>Role</th>
              <th>Category</th>
              <th>Department</th>
              <th>Contact Info</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((it) => (
              <tr key={it.id}>
                <td>
                  <div className="emp-name">
                    <div className="avatar">{it.name.charAt(0)}</div>
                    <div>
                      <p className="name">{it.name}</p>
                      <p className="sub">{it.empId}</p>
                    </div>
                  </div>
                </td>
                <td>{it.role}</td>
                <td>
                  <span className="emp-tag emp-tag-muted">{it.category}</span>
                </td>
                <td>
                  <span className="emp-tag">{it.department}</span>
                </td>
                <td>
                  <p>{it.email}</p>
                  <p className="sub">{it.phone}</p>
                </td>
                <td>
                  <span className={`emp-pill ${statusClassMap[it.status] ?? 'emp-pill-active'}`}>{it.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return (
      <table className="emp-table">
        <thead>
          <tr>
            <th>Staff Member</th>
            <th>Role</th>
            <th>Department</th>
            <th>Contact Info</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((it) => (
            <tr key={it.id}>
              <td>
                <div className="emp-name">
                  <div className="avatar">{it.name.charAt(0)}</div>
                  <div>
                    <p className="name">{it.name}</p>
                    <p className="sub">{it.empId}</p>
                  </div>
                </div>
              </td>
              <td>{it.role}</td>
              <td>
                <span className="emp-tag">{it.department}</span>
              </td>
              <td>
                <p>{it.email}</p>
                <p className="sub">{it.phone}</p>
              </td>
              <td>
                <span className={`emp-pill ${statusClassMap[it.status] ?? 'emp-pill-active'}`}>{it.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const showingFrom = filteredItems.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + ui.pageSize, filteredItems.length);

  return (
    <div className="employees-page">
      <header className="emp-directory-hero">
        <div className="emp-directory-hero__text">
          <h1 className="emp-directory-hero__title">{pageHeader.title}</h1>
          <p className="emp-directory-hero__subtitle">{pageHeader.description}</p>
        </div>
        <Link className="emp-directory-cta" to={pageHeader.ctaTo}>
          <span className="material-symbols-outlined" aria-hidden>
            add
          </span>
          {pageHeader.ctaLabel}
        </Link>
      </header>

      <section className="emp-dashboard-kpis emp-dashboard-kpis--three" aria-label="Summary metrics">
        {dashboardKpis.map((tile) => (
          <div key={tile.label} className={`emp-dashboard-kpi-card ${tile.accentClass}`}>
            <div className="emp-dashboard-kpi-card__head">
              <span className={`material-symbols-outlined emp-dashboard-kpi-icon ${tile.iconClass}`}>{tile.icon}</span>
              <span className={`emp-dashboard-kpi-badge ${tile.badgeClass}`}>{tile.hint}</span>
            </div>
            <h3 className="emp-dashboard-kpi-label">{tile.label}</h3>
            <p className="emp-dashboard-kpi-value">{tile.value}</p>
          </div>
        ))}
      </section>

      <section className="emp-table-wrap emp-table-panel" aria-label="Employee directory">
        <div className="emp-table-toolbar">
          <div className="emp-table-toolbar__row emp-table-toolbar__row--pills">
            <div className="emp-pill-strip" role="tablist" aria-label="Filter by department">
              {departmentPills.map((pill) => {
                const isActive = pill.value === 'all' ? ui.departmentFilter === 'all' : ui.departmentFilter === pill.value;
                return (
                  <button
                    key={pill.value === 'all' ? 'all' : pill.value}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`emp-filter-pill ${isActive ? 'is-active' : ''}`}
                    onClick={() => dispatch(setSectionDepartmentFilter({ section, value: pill.value === 'all' ? 'all' : pill.value }))}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
            <div className="oe-filter-wrap emp-advanced-filters-wrap">
              <button className="emp-advanced-filters-btn" type="button" onClick={() => setIsFilterOpen((v) => !v)}>
                <span className="material-symbols-outlined" aria-hidden>
                  filter_list
                </span>
                <span>Advanced filters</span>
              </button>
              {isFilterOpen && (
                <div className="oe-filter-menu">
                  {['all', 'Active', 'On Leave', 'Inactive'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      className={`oe-filter-opt ${ui.statusFilter === status ? 'active' : ''}`}
                      onClick={() => {
                        dispatch(setSectionStatusFilter({ section, value: status }));
                        setIsFilterOpen(false);
                      }}
                    >
                      {status === 'all' ? 'All statuses' : status}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="emp-table-toolbar__row emp-table-toolbar__row--controls">
            <div className="emp-toolbar-search emp-toolbar-search--in-panel">
              <div className="emp-top-search emp-top-search--toolbar">
                <span className="material-symbols-outlined" aria-hidden>
                  search
                </span>
                <input
                  value={ui.searchQuery}
                  onChange={(e) => dispatch(setSectionSearchQuery({ section, value: e.target.value }))}
                  placeholder={searchPlaceholder}
                  aria-label="Search employees"
                />
              </div>
            </div>
            {section === 'teachers' && (
              <div className="emp-toolbar-filters-fields emp-toolbar-filters-fields--inline">
                <div className="emp-filter-field">
                  <label htmlFor="emp-teacher-category">Category</label>
                  <select
                    id="emp-teacher-category"
                    className="emp-filter-select"
                    value={ui.categoryFilter}
                    onChange={(e) => dispatch(setSectionCategoryFilter({ section, value: e.target.value }))}
                  >
                    <option value="all">All categories</option>
                    {TEACHER_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="emp-scroll">{renderTable()}</div>

        <div className="oe-pagination">
          <p className="oe-pagination-text">
            Showing {showingFrom} to {showingTo} of {filteredItems.length} {memberLabelLower}
          </p>
          <div className="oe-pagination-controls">
            <button
              type="button"
              className="oe-page-btn"
              onClick={() => dispatch(setSectionPage({ section, value: Math.max(1, ui.page - 1) }))}
              disabled={ui.page === 1}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {pagesToRender.map((p) => (
              <button
                key={p}
                type="button"
                className={`oe-page-btn ${p === ui.page ? 'active' : ''}`}
                onClick={() => dispatch(setSectionPage({ section, value: p }))}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="oe-page-btn"
              onClick={() => dispatch(setSectionPage({ section, value: Math.min(pageCount, ui.page + 1) }))}
              disabled={ui.page === pageCount}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

