import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePageTitle } from '../../hooks/usePageTitle';
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

  return (
    <div className="other-expenses-page">
      <div className="oe-breadcrumbs">
        <span>Financial Services</span>
        <span className="sep">›</span>
        <span className="current">Other expenses</span>
      </div>

      <div className="oe-header">
        <div>
          <h1 className="oe-title">Institutional Expenses</h1>
          <p className="oe-subtitle">
            Comprehensive tracking of infrastructure, supplies, and maintenance overhead for the
            current academic session.
          </p>
        </div>

        <button className="oe-record-btn bg-gradient-primary" type="button">
          <span className="material-symbols-outlined">add_circle</span>
          Record New Expense
        </button>
      </div>

      <section className="oe-cards">
        <div className="oe-card oe-card-infra">
          <div className="oe-card-top">
            <span className="material-symbols-outlined oe-card-icon">build</span>
          </div>
          <h2 className="oe-card-name">Infrastructure</h2>
          <p className="oe-card-desc">Major expansions and structural improvements.</p>
          <div className="oe-card-amount">$42,850.00</div>
          <div className="oe-card-foot">
            <span className="oe-card-foot-muted">12% from last quarter</span>
          </div>
        </div>

        <div className="oe-card oe-card-supplies">
          <div className="oe-card-top">
            <span className="material-symbols-outlined oe-card-icon">description</span>
          </div>
          <h2 className="oe-card-name">Supplies</h2>
          <p className="oe-card-desc">Classroom materials &amp; office stationery.</p>
          <div className="oe-card-amount">$18,240.50</div>
          <div className="oe-progress-meta">
            <div className="meta-row">
              <span className="meta-label">BUDGET</span>
              <span className="meta-value">$28.0k</span>
            </div>
            <div className="meta-row">
              <span className="meta-label">REMAINING</span>
              <span className="meta-value">$9.8k</span>
            </div>
          </div>
          <div className="oe-progress">
            <div className="oe-progress-fill" style={{ width: '65%' }} />
          </div>
        </div>

        <div className="oe-card oe-card-maint">
          <div className="oe-card-top oe-card-top-row">
            <span className="material-symbols-outlined oe-card-icon">construction</span>
            <span className="oe-urgent">3 URGENT REPAIRS</span>
          </div>

          <h2 className="oe-card-name">Maintenance</h2>
          <p className="oe-card-desc">Routine cleaning, repairs &amp; facility upkeep</p>

          <div className="oe-maint-list">
            <div className="oe-maint-item">
              <div className="left">
                <span className="material-symbols-outlined">build</span>
                <span>HVAC Servicing</span>
              </div>
              <div className="right">$1,200</div>
            </div>
            <div className="oe-maint-item">
              <div className="left">
                <span className="material-symbols-outlined">tune</span>
                <span>Panel Upgrade</span>
              </div>
              <div className="right">$850</div>
            </div>
          </div>
        </div>
      </section>

      <section className="oe-log">
        <div className="oe-log-actions">
          <button className="oe-generate-btn" type="button">
            Generate Statement
          </button>

          <div className="oe-search-filter">
            <div className="oe-search">
              <span className="material-symbols-outlined">search</span>
              <input
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search expenses..."
                aria-label="Search expenses"
              />
            </div>

            <div className="oe-filter-wrap">
              <button
                className="oe-filter-btn"
                type="button"
                onClick={() => setIsFilterOpen((v) => !v)}
              >
                <span className="material-symbols-outlined">filter_list</span>
                Filters
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

