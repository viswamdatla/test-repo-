import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import './FinancialServicesOverview.scss';

const summaryCards = [
  {
    title: "Today's Collection",
    value: '$12,450.00',
    meta: '+12% from yesterday',
    icon: 'account_balance_wallet',
    tone: 'primary',
  },
  {
    title: 'Pending Today',
    value: '$3,820.00',
    meta: '14 students remaining',
    icon: 'pending_actions',
    tone: 'tertiary',
  },
  {
    title: "Total Month's Collection",
    value: '$482,150.00',
    meta: '+8% vs last month',
    icon: 'calendar_month',
    tone: 'primary',
  },
];

const DATE_PRESETS = [
  { id: 'all', label: 'All dates', from: null, to: null },
  { id: 'oct2025', label: 'Oct 1 - Oct 31, 2025', from: '2025-10-01', to: '2025-10-31' },
  { id: 'sep2025', label: 'Sep 1 - Sep 30, 2025', from: '2025-09-01', to: '2025-09-30' },
];

const TYPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Tuition', label: 'Tuition' },
  { id: 'Fees', label: 'Fees' },
  { id: 'Operations', label: 'Operations' },
  { id: 'Payroll', label: 'Payroll' },
  { id: 'Admission', label: 'Admission' },
];

const transactionRows = [
  {
    id: 'txn-90812',
    date: 'Oct 31, 2025',
    dateISO: '2025-10-31',
    time: '2:14 PM',
    title: 'Tuition payment received',
    sub: 'Jameson Carter · Card',
    category: 'Tuition',
    ref: 'TXN-90812',
    amount: '+$1,500.00',
    amountTone: 'in',
    status: 'Completed',
    statusTone: 'completed',
  },
  {
    id: 'txn-90805',
    date: 'Oct 31, 2025',
    dateISO: '2025-10-31',
    time: '11:02 AM',
    title: 'Lab fee — partial',
    sub: 'Sophia Martinez · UPI',
    category: 'Fees',
    ref: 'TXN-90805',
    amount: '+$400.00',
    amountTone: 'in',
    status: 'Pending',
    statusTone: 'pending',
  },
  {
    id: 'txn-90788',
    date: 'Oct 30, 2025',
    dateISO: '2025-10-30',
    time: '4:45 PM',
    title: 'Vendor payout — utilities',
    sub: 'City Utilities Ltd · NEFT',
    category: 'Operations',
    ref: 'TXN-90788',
    amount: '-$2,400.00',
    amountTone: 'out',
    status: 'Completed',
    statusTone: 'completed',
  },
  {
    id: 'txn-90771',
    date: 'Oct 30, 2025',
    dateISO: '2025-10-30',
    time: '9:18 AM',
    title: 'Payroll batch — teaching staff',
    sub: 'October cycle · ACH',
    category: 'Payroll',
    ref: 'TXN-90771',
    amount: '-$48,200.00',
    amountTone: 'out',
    status: 'Completed',
    statusTone: 'completed',
  },
  {
    id: 'txn-90740',
    date: 'Oct 29, 2025',
    dateISO: '2025-10-29',
    time: '3:27 PM',
    title: 'Admission deposit',
    sub: 'New intake · Cash',
    category: 'Admission',
    ref: 'TXN-90740',
    amount: '+$5,000.00',
    amountTone: 'in',
    status: 'Failed',
    statusTone: 'failed',
  },
];

function rowMatchesSearch(row, q) {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  const hay = [row.ref, row.title, row.sub, row.category].join(' ').toLowerCase();
  return hay.includes(s);
}

function rowMatchesDatePreset(row, preset) {
  if (!preset.from && !preset.to) return true;
  const d = row.dateISO;
  if (!d) return true;
  if (preset.from && d < preset.from) return false;
  if (preset.to && d > preset.to) return false;
  return true;
}

function rowMatchesType(row, typeFilter) {
  if (typeFilter.id === 'all') return true;
  return row.category === typeFilter.id;
}

export const FinancialServicesOverview = () => {
  usePageTitle('Finance Dashboard');

  const [search, setSearch] = useState('');
  const [datePreset, setDatePreset] = useState(() => DATE_PRESETS[1]);
  const [typeFilter, setTypeFilter] = useState(() => TYPE_FILTERS[0]);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const dateDdRef = useRef(null);
  const typeDdRef = useRef(null);

  useEffect(() => {
    const onDocPointerDown = (e) => {
      const t = e.target;
      if (dateDdRef.current && !dateDdRef.current.contains(t)) setDateMenuOpen(false);
      if (typeDdRef.current && !typeDdRef.current.contains(t)) setTypeMenuOpen(false);
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, []);

  const filteredRows = useMemo(
    () =>
      transactionRows.filter(
        (row) =>
          rowMatchesSearch(row, search) &&
          rowMatchesDatePreset(row, datePreset) &&
          rowMatchesType(row, typeFilter),
      ),
    [search, datePreset, typeFilter],
  );

  return (
    <div className="fin-overview-page">
      <section className="fin-overview-head">
        <div>
          <h1>Finance Dashboard</h1>
          <p>Track collections, payouts, and recent financial activity in one place.</p>
        </div>
        <div className="fin-overview-head-actions">
          <Link to="/financial-services/collect-fee" className="fin-btn fin-btn-outline">
            <span className="material-symbols-outlined">receipt</span>
            <span>Collect Fee</span>
          </Link>
          <Link to="/financial-services/collect-fee" className="fin-btn fin-btn-primary">
            <span className="material-symbols-outlined">add_circle</span>
            <span>Record New Payment</span>
          </Link>
        </div>
      </section>

      <section className="fin-summary-grid">
        {summaryCards.map((card) => (
          <article key={card.title} className={`fin-summary-card tone-${card.tone}`}>
            <div className="top">
              <div>
                <p className="label">{card.title}</p>
                <h3>{card.value}</h3>
                <span className="meta">{card.meta}</span>
              </div>
              <span className="material-symbols-outlined icon">{card.icon}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="fin-filters">
        <div className="search">
          <span className="material-symbols-outlined">search</span>
          <input
            type="search"
            placeholder="Search by reference, description, or party..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search transactions"
          />
        </div>
        <div className="fin-filter-dd" ref={dateDdRef}>
          <button
            type="button"
            className={`chip fin-filter-dd-trigger${dateMenuOpen ? ' is-open' : ''}`}
            aria-expanded={dateMenuOpen}
            aria-haspopup="menu"
            aria-label="Date range"
            onClick={() => {
              setTypeMenuOpen(false);
              setDateMenuOpen((o) => !o);
            }}
          >
            <span className="material-symbols-outlined">calendar_month</span>
            <span>{datePreset.label}</span>
            <span className="material-symbols-outlined" aria-hidden>
              expand_more
            </span>
          </button>
          {dateMenuOpen ? (
            <div className="fin-filter-dd-panel" id="fin-date-filter-menu">
              {DATE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`fin-filter-dd-option${datePreset.id === p.id ? ' is-selected' : ''}`}
                  aria-pressed={datePreset.id === p.id}
                  onClick={() => {
                    setDatePreset(p);
                    setDateMenuOpen(false);
                  }}
                >
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="fin-filter-dd" ref={typeDdRef}>
          <button
            type="button"
            className={`chip fin-filter-dd-trigger${typeMenuOpen ? ' is-open' : ''}`}
            aria-expanded={typeMenuOpen}
            aria-haspopup="menu"
            aria-label="Transaction type"
            onClick={() => {
              setDateMenuOpen(false);
              setTypeMenuOpen((o) => !o);
            }}
          >
            <span className="material-symbols-outlined">filter_alt</span>
            <span>Type: {typeFilter.label}</span>
            <span className="material-symbols-outlined" aria-hidden>
              expand_more
            </span>
          </button>
          {typeMenuOpen ? (
            <div className="fin-filter-dd-panel" id="fin-type-filter-menu">
              {TYPE_FILTERS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`fin-filter-dd-option${typeFilter.id === t.id ? ' is-selected' : ''}`}
                  aria-pressed={typeFilter.id === t.id}
                  onClick={() => {
                    setTypeFilter(t);
                    setTypeMenuOpen(false);
                  }}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="fin-table-wrap" aria-labelledby="fin-recent-tx-heading">
        <div className="fin-table-section-head">
          <h2 id="fin-recent-tx-heading" className="fin-table-section-title">
            Recent Transactions
          </h2>
          <Link to="/financial-services/fee-management" className="fin-table-section-link">
            <span>View all</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
        <div className="fin-table-scroll">
          <table className="fin-table fin-table--transactions">
            <thead>
              <tr>
                <th>Date &amp; time</th>
                <th>Transaction</th>
                <th>Category</th>
                <th>Reference</th>
                <th className="num">Amount</th>
                <th>Status</th>
                <th className="action">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="fin-table-empty">
                    <p>No transactions match your filters.</p>
                    <p className="fin-table-empty-hint">Try a different date range, type, or search.</p>
                  </td>
                </tr>
              ) : null}
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <p className="fin-txn-date">{row.date}</p>
                    <p className="fin-txn-time">{row.time}</p>
                  </td>
                  <td>
                    <p className="fin-txn-title">{row.title}</p>
                    <p className="fin-txn-sub">{row.sub}</p>
                  </td>
                  <td>
                    <span className="fin-txn-cat">{row.category}</span>
                  </td>
                  <td>
                    <span className="fin-txn-ref">{row.ref}</span>
                  </td>
                  <td className={`num fin-txn-amount fin-txn-amount--${row.amountTone}`}>{row.amount}</td>
                  <td>
                    <span className={`status status--${row.statusTone}`}>{row.status}</span>
                  </td>
                  <td className="action">
                    <button type="button" aria-label="More options">
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
