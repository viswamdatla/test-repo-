import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import '../Employees/EmployeesDirectory.scss';
import './FinancialServices.scss';
import './OtherExpenses.scss';
import {
  fetchOtherExpenses,
  selectExpensesUi,
  selectOtherExpensesItems,
  setPage,
  setSearchQuery,
  setStatusFilter,
} from '../../store/expenses/expensesSlice';

const statusMeta = {
  Approved: { label: 'Approved', pillClass: 'pill-approved' },
  Pending: { label: 'Pending', pillClass: 'pill-pending' },
  Rejected: { label: 'Rejected', pillClass: 'pill-rejected' },
};

export const OtherExpenses = () => {
  usePageTitle('Other expenses');

  const dispatch = useDispatch();
  const { searchQuery, statusFilter, page, pageSize } = useSelector(selectExpensesUi);
  const items = useSelector(selectOtherExpensesItems);
  const loadStatus = useSelector((s) => s.expenses.loadStatus);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchOtherExpenses());
  }, [dispatch]);

  const filteredExpenses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((it) => {
      const statusOk = statusFilter === 'all' ? true : it.status === statusFilter;
      if (!statusOk) return false;
      if (!q) return true;
      const haystack = `${it.category} ${it.description} ${it.date}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, searchQuery, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredExpenses.length / pageSize));

  useEffect(() => {
    if (page > pageCount) dispatch(setPage(pageCount));
  }, [page, pageCount, dispatch]);

  const startIndex = (page - 1) * pageSize;
  const endIndexExclusive = Math.min(startIndex + pageSize, filteredExpenses.length);
  const pageItems = filteredExpenses.slice(startIndex, endIndexExclusive);

  const showingStart = filteredExpenses.length === 0 ? 0 : startIndex + 1;
  const showingEnd = endIndexExclusive;

  const pagesToRender = useMemo(() => {
    if (pageCount <= 3) return Array.from({ length: pageCount }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(page - 1, pageCount - 2));
    return [start, start + 1, start + 2].filter((n) => n <= pageCount);
  }, [page, pageCount]);

  const handlePageChange = (nextPage) => {
    dispatch(setPage(nextPage));
  };

  const handleSelectStatus = (nextStatus) => {
    dispatch(setStatusFilter(nextStatus));
    setIsFilterOpen(false);
  };

  const totals = useMemo(() => {
    const total = items.reduce((sum, x) => sum + x.amount, 0);
    const approved = items.filter((x) => x.status === 'Approved').reduce((sum, x) => sum + x.amount, 0);
    const pending = items.filter((x) => x.status === 'Pending').reduce((sum, x) => sum + x.amount, 0);
    const rejected = items.filter((x) => x.status === 'Rejected').reduce((sum, x) => sum + x.amount, 0);
    return { total, approved, pending, rejected };
  }, [items]);

  const expenseKpis = [
    {
      icon: 'account_balance_wallet',
      label: 'Total Expenses',
      value: `$${totals.total.toFixed(2)}`,
      badge: 'Current period',
      accentClass: 'emp-dashboard-kpi-card--primary',
      iconClass: 'emp-dashboard-kpi-icon--primary',
      badgeClass: 'emp-dashboard-kpi-badge--neutral',
    },
    {
      icon: 'task_alt',
      label: 'Approved',
      value: `$${totals.approved.toFixed(2)}`,
      badge: 'Approved',
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
      label: 'Rejected',
      value: `$${totals.rejected.toFixed(2)}`,
      badge: 'Needs review',
      accentClass: 'emp-dashboard-kpi-card--primary-container',
      iconClass: 'emp-dashboard-kpi-icon--primary-container',
      badgeClass: 'emp-dashboard-kpi-badge--red',
    },
  ];

  return (
    <div className="financial-services-page">
      <header className="emp-directory-hero">
        <div className="emp-directory-hero__text">
          <h1 className="emp-directory-hero__title">Other Expenses</h1>
          <p className="emp-directory-hero__subtitle">
            Comprehensive tracking of infrastructure, supplies, and maintenance overhead for the current academic session.
          </p>
        </div>
        <Link className="emp-directory-cta" to="/admission">
          <span className="material-symbols-outlined" aria-hidden>
            add
          </span>
          <span>Record New Expense</span>
        </Link>
      </header>

      <section className="emp-dashboard-kpis" aria-label="Other expenses metrics">
        {expenseKpis.map((tile) => (
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
        <div className="emp-table-toolbar">
          <div className="emp-table-toolbar__row emp-table-toolbar__row--controls">
            <button className="oe-generate-btn" type="button">
              Generate Statement
            </button>
            <div className="emp-toolbar-search emp-toolbar-search--in-panel">
              <div className="emp-top-search emp-top-search--toolbar">
                <span className="material-symbols-outlined" aria-hidden>
                  search
                </span>
                <input
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  placeholder="Search expenses..."
                  aria-label="Search expenses"
                />
              </div>
            </div>

            <div className="oe-filter-wrap">
              <button
                className="oe-filter-btn"
                type="button"
                onClick={() => setIsFilterOpen((v) => !v)}
              >
                <span className="material-symbols-outlined">filter_list</span>
                <span>Filters</span>
              </button>

              {isFilterOpen && (
                <div className="oe-filter-menu" role="menu">
                  {[
                    { value: 'all', label: 'All statuses' },
                    { value: 'Approved', label: 'Approved' },
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Rejected', label: 'Rejected' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`oe-filter-opt ${statusFilter === opt.value ? 'active' : ''}`}
                      onClick={() => handleSelectStatus(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="oe-table-scroll">
          <table className="oe-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadStatus === 'loading' && (
                <tr>
                  <td colSpan={5} className="oe-empty">
                    Loading expense records...
                  </td>
                </tr>
              )}
              {loadStatus !== 'loading' && pageItems.map((it) => {
                const meta = statusMeta[it.status] ?? statusMeta.Approved;
                return (
                  <tr key={it.id}>
                    <td>{it.date}</td>
                    <td>
                      <span className="oe-category-pill">{it.category}</span>
                    </td>
                    <td>{it.description}</td>
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
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="oe-pagination">
          <p className="oe-pagination-text">
            Showing {showingStart} to {showingEnd} of {filteredExpenses.length} entries
          </p>

          <div className="oe-pagination-controls">
            <button
              type="button"
              className="oe-page-btn"
              onClick={() => handlePageChange(Math.max(1, page - 1))}
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
                onClick={() => handlePageChange(p)}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              className="oe-page-btn"
              onClick={() => handlePageChange(Math.min(pageCount, page + 1))}
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

