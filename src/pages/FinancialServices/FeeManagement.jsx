import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import '../Employees/EmployeesDirectory.scss';
import './FinancialServices.scss';
import './FeeManagement.scss';
import './OtherExpenses.scss';
import {
  fetchFees,
  selectFeesItems,
  selectFeesUi,
  setPage,
  setSearchQuery,
  setStatusFilter,
} from '../../store/fees/feesSlice';

export const FeeManagement = () => {
  usePageTitle('Fee Management');

  const dispatch = useDispatch();
  const { searchQuery, statusFilter, page, pageSize } = useSelector(selectFeesUi);
  const items = useSelector(selectFeesItems);
  const loadStatus = useSelector((s) => s.fees.loadStatus);

  const filterBarRef = useRef(null);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const [periodPreset, setPeriodPreset] = useState('oct2023');
  const [classKey, setClassKey] = useState('all');

  const periodPresets = useMemo(
    () => [
      { id: 'oct2023', label: 'Oct 1 - Oct 31, 2023', match: (period) => period === 'Oct 2023' || period.startsWith('Oct') },
      { id: 'sep2023', label: 'Sep 1 - Sep 30, 2023', match: (period) => period === 'Sep 2023' || period.startsWith('Sep') },
      { id: 'all', label: 'All dates', match: () => true },
    ],
    [],
  );

  const classOptions = useMemo(
    () => [
      { value: 'all', label: 'All' },
      { value: 'g10', label: 'Grade 10-A' },
      { value: 'g8', label: 'Grade 8-C' },
      { value: 'g12', label: 'Grade 12-B' },
    ],
    [],
  );

  const activePeriodLabel = periodPresets.find((p) => p.id === periodPreset)?.label ?? 'All dates';
  const activeClassLabel = classOptions.find((c) => c.value === classKey)?.label ?? 'All';

  useEffect(() => {
    dispatch(fetchFees());
  }, [dispatch]);

  const filteredFees = useMemo(() => {
    const preset = periodPresets.find((p) => p.id === periodPreset);
    const q = searchQuery.trim().toLowerCase();
    return items.filter((it) => {
      const statusOk = statusFilter === 'all' ? true : it.status === statusFilter;
      if (!statusOk) return false;
      if (preset && !preset.match(it.period)) return false;
      if (!q) return true;
      const haystack = `${it.period} ${it.feeType} ${it.department ?? ''} ${it.status}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, searchQuery, statusFilter, periodPreset, periodPresets]);

  const pageCount = Math.max(1, Math.ceil(filteredFees.length / pageSize));

  useEffect(() => {
    if (page > pageCount) dispatch(setPage(pageCount));
  }, [page, pageCount, dispatch]);

  const startIndex = (page - 1) * pageSize;
  const endIndexExclusive = Math.min(startIndex + pageSize, filteredFees.length);
  const pageItems = filteredFees.slice(startIndex, endIndexExclusive);

  const showingStart = filteredFees.length === 0 ? 0 : startIndex + 1;
  const showingEnd = endIndexExclusive;

  const pagesToRender = useMemo(() => {
    if (pageCount <= 3) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(page - 1, pageCount - 2));
    return [start, start + 1, start + 2].filter((n) => n <= pageCount);
  }, [page, pageCount]);

  const handleSelectStatus = (nextStatus) => {
    dispatch(setStatusFilter(nextStatus));
    setIsClassMenuOpen(false);
  };

  const handleSelectPeriod = (id) => {
    setPeriodPreset(id);
    setIsDateMenuOpen(false);
    dispatch(setPage(1));
  };

  const handleSelectClass = (value) => {
    setClassKey(value);
    setIsClassMenuOpen(false);
  };

  useEffect(() => {
    if (!isDateMenuOpen && !isClassMenuOpen) return;
    const close = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setIsDateMenuOpen(false);
        setIsClassMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isDateMenuOpen, isClassMenuOpen]);

  const totals = useMemo(() => {
    const total = items.reduce((sum, x) => sum + x.amount, 0);
    const approved = items.filter((x) => x.status === 'Approved').reduce((sum, x) => sum + x.amount, 0);
    const pending = items.filter((x) => x.status === 'Pending').reduce((sum, x) => sum + x.amount, 0);
    const outstanding = pending + items.filter((x) => x.status === 'Rejected').reduce((sum, x) => sum + x.amount, 0);
    const collectedRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    return { total, approved, pending, outstanding, collectedRate };
  }, [items]);

  const feeKpis = [
    {
      icon: 'account_balance_wallet',
      label: 'Total Fees',
      value: `$${totals.total.toFixed(2)}`,
      badge: 'Total',
      accentClass: 'emp-dashboard-kpi-card--primary',
      iconClass: 'emp-dashboard-kpi-icon--primary',
      badgeClass: 'emp-dashboard-kpi-badge--neutral',
    },
    {
      icon: 'task_alt',
      label: 'Collected',
      value: `$${totals.approved.toFixed(2)}`,
      badge: `${totals.collectedRate}%`,
      accentClass: 'emp-dashboard-kpi-card--secondary',
      iconClass: 'emp-dashboard-kpi-icon--secondary',
      badgeClass: 'emp-dashboard-kpi-badge--green',
    },
    {
      icon: 'schedule',
      label: 'Pending',
      value: `$${totals.pending.toFixed(2)}`,
      badge: 'Pending',
      accentClass: 'emp-dashboard-kpi-card--tertiary',
      iconClass: 'emp-dashboard-kpi-icon--tertiary',
      badgeClass: 'emp-dashboard-kpi-badge--neutral',
    },
    {
      icon: 'report_problem',
      label: 'Outstanding',
      value: `$${totals.outstanding.toFixed(2)}`,
      badge: 'Needs action',
      accentClass: 'emp-dashboard-kpi-card--primary-container',
      iconClass: 'emp-dashboard-kpi-icon--primary-container',
      badgeClass: 'emp-dashboard-kpi-badge--red',
    },
  ];

  const statusMeta = {
    Approved: { label: 'Approved', pillClass: 'pill-approved' },
    Pending: { label: 'Pending', pillClass: 'pill-pending' },
    Rejected: { label: 'Rejected', pillClass: 'pill-rejected' },
  };

  return (
    <div className="financial-services-page">
      <header className="emp-directory-hero">
        <div className="emp-directory-hero__text">
          <h1 className="emp-directory-hero__title">Fee Management</h1>
          <p className="emp-directory-hero__subtitle">Manage fee structures, payments, dues, and collection workflows.</p>
        </div>
        <Link className="emp-directory-cta" to="/financial-services/collect-fee">
          <span className="material-symbols-outlined" aria-hidden>
            add
          </span>
          <span>New Fee Record</span>
        </Link>
      </header>

      <section className="emp-dashboard-kpis" aria-label="Fee management metrics">
        {feeKpis.map((tile) => (
          <div key={tile.label} className={`emp-dashboard-kpi-card ${tile.accentClass}`}>
            <div className="emp-dashboard-kpi-card__head">
              <span className={`material-symbols-outlined emp-dashboard-kpi-icon ${tile.iconClass}`}>{tile.icon}</span>
              <span className={`emp-dashboard-kpi-badge ${tile.badgeClass}`}>{tile.badge}</span>
            </div>
            <h3 className="emp-dashboard-kpi-label">{tile.label}</h3>
            <p className="emp-dashboard-kpi-value">{tile.value}</p>
          </div>
        ))}
      </section>

      <section className="emp-table-wrap emp-table-panel">
        <div ref={filterBarRef} className="fee-mgmt-filter-bar">
          <div className="fee-mgmt-filter-bar__inner">
            <label className="fee-mgmt-filter-search">
              <span className="material-symbols-outlined" aria-hidden>
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search student by name or roll no..."
                aria-label="Search students by name or roll number"
                type="search"
                autoComplete="off"
              />
            </label>

            <div className="fee-mgmt-filter-bar__chips">
              <div className="fee-mgmt-filter-dropdown">
                <button
                  type="button"
                  className="fee-mgmt-filter-chip"
                  aria-expanded={isDateMenuOpen}
                  aria-haspopup="listbox"
                  aria-label="Date range"
                  onClick={() => {
                    setIsClassMenuOpen(false);
                    setIsDateMenuOpen((o) => !o);
                  }}
                >
                  <span className="material-symbols-outlined fee-mgmt-filter-chip__icon">calendar_month</span>
                  <span className="fee-mgmt-filter-chip__text">{activePeriodLabel}</span>
                  <span className="material-symbols-outlined fee-mgmt-filter-chip__caret">expand_more</span>
                </button>
                {isDateMenuOpen && (
                  <div className="fee-mgmt-filter-menu" role="listbox">
                    {periodPresets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        role="option"
                        aria-selected={periodPreset === p.id}
                        className={`fee-mgmt-filter-menu__opt ${periodPreset === p.id ? 'is-active' : ''}`}
                        onClick={() => handleSelectPeriod(p.id)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="fee-mgmt-filter-dropdown">
                <button
                  type="button"
                  className="fee-mgmt-filter-chip"
                  aria-expanded={isClassMenuOpen}
                  aria-haspopup="listbox"
                  aria-label="Class and status filters"
                  onClick={() => {
                    setIsDateMenuOpen(false);
                    setIsClassMenuOpen((o) => !o);
                  }}
                >
                  <span className="material-symbols-outlined fee-mgmt-filter-chip__icon">filter_alt</span>
                  <span className="fee-mgmt-filter-chip__text">
                    Class: {activeClassLabel}
                  </span>
                  <span className="material-symbols-outlined fee-mgmt-filter-chip__caret">expand_more</span>
                </button>
                {isClassMenuOpen && (
                  <div className="fee-mgmt-filter-menu fee-mgmt-filter-menu--wide" role="presentation">
                    <div className="fee-mgmt-filter-menu__group">
                      <p className="fee-mgmt-filter-menu__heading">Class</p>
                      {classOptions.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          className={`fee-mgmt-filter-menu__opt ${classKey === c.value ? 'is-active' : ''}`}
                          onClick={() => handleSelectClass(c.value)}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                    <div className="fee-mgmt-filter-menu__group">
                      <p className="fee-mgmt-filter-menu__heading">Status</p>
                      {[
                        { value: 'all', label: 'All statuses' },
                        { value: 'Approved', label: 'Approved' },
                        { value: 'Pending', label: 'Pending' },
                        { value: 'Rejected', label: 'Rejected' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`fee-mgmt-filter-menu__opt ${statusFilter === opt.value ? 'is-active' : ''}`}
                          onClick={() => handleSelectStatus(opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="oe-table-scroll">
          <table className="oe-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Fee Type</th>
                <th>Students</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadStatus === 'loading' && (
                <tr>
                  <td colSpan={5} className="oe-empty">
                    Loading fee records...
                  </td>
                </tr>
              )}
              {loadStatus !== 'loading' && pageItems.map((it) => {
                const meta = statusMeta[it.status] ?? statusMeta.Approved;
                return (
                  <tr key={it.id}>
                    <td>{it.period}</td>
                    <td>
                      <span className="oe-category-pill">{it.feeType}</span>
                    </td>
                    <td>{it.studentCount}</td>
                    <td className="oe-amount-cell">${it.amount.toFixed(2)}</td>
                    <td>
                      <span className={`oe-pill ${meta.pillClass}`}>{meta.label}</span>
                    </td>
                  </tr>
                );
              })}
              {loadStatus !== 'loading' && pageItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="oe-empty">
                    No fee records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="oe-pagination">
          <p className="oe-pagination-text">
            Showing {showingStart} to {showingEnd} of {filteredFees.length} entries
          </p>

          <div className="oe-pagination-controls">
            <button
              type="button"
              className="oe-page-btn"
              onClick={() => dispatch(setPage(Math.max(1, page - 1)))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            {pagesToRender.map((p) => (
              <button
                key={p}
                type="button"
                className={`oe-page-btn ${p === page ? 'active' : ''}`}
                onClick={() => dispatch(setPage(p))}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              className="oe-page-btn"
              onClick={() => dispatch(setPage(Math.min(pageCount, page + 1)))}
              disabled={page === pageCount}
              aria-label="Next page"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

