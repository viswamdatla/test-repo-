import React, { useEffect, useMemo, useState } from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useDispatch, useSelector } from 'react-redux';
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

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchFees());
  }, [dispatch]);

  const filteredFees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((it) => {
      const statusOk = statusFilter === 'all' ? true : it.status === statusFilter;
      if (!statusOk) return false;
      if (!q) return true;
      const haystack = `${it.period} ${it.feeType} ${it.department ?? ''} ${it.status}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, searchQuery, statusFilter]);

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
    setIsFilterOpen(false);
  };

  const totals = useMemo(() => {
    const total = items.reduce((sum, x) => sum + x.amount, 0);
    const approved = items.filter((x) => x.status === 'Approved').reduce((sum, x) => sum + x.amount, 0);
    const pending = items.filter((x) => x.status === 'Pending').reduce((sum, x) => sum + x.amount, 0);
    const outstanding = pending + items.filter((x) => x.status === 'Rejected').reduce((sum, x) => sum + x.amount, 0);
    const collectedRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    return { total, approved, pending, outstanding, collectedRate };
  }, [items]);

  const statusMeta = {
    Approved: { label: 'Approved', pillClass: 'pill-approved' },
    Pending: { label: 'Pending', pillClass: 'pill-pending' },
    Rejected: { label: 'Rejected', pillClass: 'pill-rejected' },
  };

  return (
    <div className="financial-services-page">
      <div className="financial-services-card">
        <h1>Fee Management</h1>
        <p>Manage fee structures, payments, dues, and collection workflows.</p>
      </div>

      <section className="fee-kpi-grid">
        <div className="fee-kpi-card">
          <div className="fee-kpi-top">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            <span className="fee-kpi-badge">Total</span>
          </div>
          <div className="fee-kpi-value">${totals.total.toFixed(2)}</div>
          <div className="fee-kpi-label">Fees tracked</div>
        </div>

        <div className="fee-kpi-card">
          <div className="fee-kpi-top">
            <span className="material-symbols-outlined">task_alt</span>
            <span className="fee-kpi-badge badge-green">Collected</span>
          </div>
          <div className="fee-kpi-value">${totals.approved.toFixed(2)}</div>
          <div className="fee-kpi-label">{totals.collectedRate}% collected</div>
        </div>

        <div className="fee-kpi-card">
          <div className="fee-kpi-top">
            <span className="material-symbols-outlined">schedule</span>
            <span className="fee-kpi-badge badge-amber">Pending</span>
          </div>
          <div className="fee-kpi-value">${totals.pending.toFixed(2)}</div>
          <div className="fee-kpi-label">Awaiting approvals</div>
        </div>

        <div className="fee-kpi-card">
          <div className="fee-kpi-top">
            <span className="material-symbols-outlined">report_problem</span>
            <span className="fee-kpi-badge badge-red">Outstanding</span>
          </div>
          <div className="fee-kpi-value">${totals.outstanding.toFixed(2)}</div>
          <div className="fee-kpi-label">Needs action</div>
        </div>
      </section>

      <section className="oe-log">
        <div className="oe-log-actions">
          <div className="oe-search-filter">
            <div className="oe-search">
              <span className="material-symbols-outlined">search</span>
              <input
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search fees..."
                aria-label="Search fees"
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

