import React from 'react';
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
    title: 'Defaulter Count',
    value: '08',
    meta: 'Critical: Grade 10-B',
    icon: 'person_alert',
    tone: 'error',
  },
];

const rows = [
  {
    name: 'Jameson Carter',
    reg: '#2023-9081',
    classText: 'Grade 10-A',
    roll: '012',
    totalFee: '$1,500.00',
    paid: '$1,500.00',
    due: '$0.00',
    status: 'PAID',
    statusTone: 'paid',
  },
  {
    name: 'Sophia Martinez',
    reg: '#2023-7742',
    classText: 'Grade 8-C',
    roll: '045',
    totalFee: '$1,200.00',
    paid: '$800.00',
    due: '$400.00',
    status: 'PARTIAL',
    statusTone: 'partial',
  },
  {
    name: 'Ethan Williams',
    reg: '#2023-4410',
    classText: 'Grade 12-B',
    roll: '009',
    totalFee: '$1,800.00',
    paid: '$0.00',
    due: '$1,800.00',
    status: 'OVERDUE',
    statusTone: 'overdue',
  },
];

export const FinancialServicesOverview = () => {
  usePageTitle('Financial Services');

  return (
    <div className="fin-overview-page">
      <section className="fin-overview-head">
        <div>
          <h1>Fee Collection Registry</h1>
          <p>Manage and monitor student tuition payments and balance dues.</p>
        </div>
        <div className="fin-overview-head-actions">
          <button type="button" className="fin-btn fin-btn-outline">
            <span className="material-symbols-outlined">receipt</span>
            <span>Collect Fee</span>
          </button>
          <Link to="/financial-services/fee-management" className="fin-btn fin-btn-primary">
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
          <input type="text" placeholder="Search student by name or roll no..." />
        </div>
        <button type="button" className="chip">
          <span className="material-symbols-outlined">calendar_month</span>
          <span>Oct 1 - Oct 31, 2023</span>
          <span className="material-symbols-outlined">expand_more</span>
        </button>
        <button type="button" className="chip">
          <span className="material-symbols-outlined">filter_alt</span>
          <span>Class: All</span>
          <span className="material-symbols-outlined">expand_more</span>
        </button>
      </section>

      <section className="fin-table-wrap">
        <table className="fin-table">
          <thead>
            <tr>
              <th>Student Info</th>
              <th>Class / Roll</th>
              <th>Total Fee</th>
              <th>Amount Paid</th>
              <th>Balance Due</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.reg}>
                <td>
                  <div className="student">
                    <div className="avatar">{row.name.charAt(0)}</div>
                    <div>
                      <p className="name">{row.name}</p>
                      <p className="sub">Reg: {row.reg}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p>{row.classText}</p>
                  <p className="sub">Roll: {row.roll}</p>
                </td>
                <td className="num">{row.totalFee}</td>
                <td className="num paid">{row.paid}</td>
                <td className="num due">{row.due}</td>
                <td>
                  <span className={`status ${row.statusTone}`}>{row.status}</span>
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
      </section>
    </div>
  );
};
