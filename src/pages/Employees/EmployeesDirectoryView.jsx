import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

export const EmployeesDirectoryView = ({ section, title, subtitle }) => {
  const dispatch = useDispatch();
  const items = useSelector((state) => selectEmployeesSectionItems(state, section));
  const ui = useSelector((state) => selectEmployeesSectionUi(state, section));
  const loadStatus = useSelector(selectEmployeesStatus);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (loadStatus === 'idle') dispatch(fetchEmployeesData());
  }, [dispatch, loadStatus]);

  const filteredItems = useMemo(() => {
    const q = ui.searchQuery.trim().toLowerCase();
    return items.filter((it) => {
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
  }, [items, ui.searchQuery, ui.statusFilter, ui.categoryFilter, ui.departmentFilter, section]);

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
    const total = items.length;
    const active = items.filter((x) => x.status === 'Active').length;
    const onLeave = items.filter((x) => x.status === 'On Leave').length;
    return { total, active, onLeave };
  }, [items]);

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
                  <span className="emp-tag">{it.team}</span>
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
              <th>Staff Member</th>
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
      <div className="employees-card">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <section className="emp-kpis">
        <div className="emp-kpi-card">
          <p>Total Staff</p>
          <h3>{totals.total}</h3>
        </div>
        <div className="emp-kpi-card">
          <p>Active</p>
          <h3>{totals.active}</h3>
        </div>
        <div className="emp-kpi-card">
          <p>On Leave</p>
          <h3>{totals.onLeave}</h3>
        </div>
      </section>

      <section className="emp-table-wrap">
        <div className="emp-actions">
          <div className="emp-toolbar-left">
            <div className="emp-search">
              <span className="material-symbols-outlined">search</span>
              <input
                value={ui.searchQuery}
                onChange={(e) => dispatch(setSectionSearchQuery({ section, value: e.target.value }))}
                placeholder="Search by name or ID"
              />
            </div>

            {section === 'teachers' && (
              <>
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
                <div className="emp-filter-field">
                  <label htmlFor="emp-teacher-department">Department</label>
                  <select
                    id="emp-teacher-department"
                    className="emp-filter-select"
                    value={ui.departmentFilter}
                    onChange={(e) => dispatch(setSectionDepartmentFilter({ section, value: e.target.value }))}
                  >
                    <option value="all">All departments</option>
                    {TEACHER_DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {section === 'operational' && (
              <div className="emp-filter-field">
                <label htmlFor="emp-operational-department">Department</label>
                <select
                  id="emp-operational-department"
                  className="emp-filter-select"
                  value={ui.departmentFilter}
                  onChange={(e) => dispatch(setSectionDepartmentFilter({ section, value: e.target.value }))}
                >
                  <option value="all">All departments</option>
                  {OPERATIONAL_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="oe-filter-wrap">
            <button className="oe-filter-btn" type="button" onClick={() => setIsFilterOpen((v) => !v)}>
              <span className="material-symbols-outlined">filter_list</span>
              Filter
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

        <div className="emp-scroll">{renderTable()}</div>

        <div className="oe-pagination">
          <p className="oe-pagination-text">
            Showing {showingFrom} to {showingTo} of {filteredItems.length} staff members
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

