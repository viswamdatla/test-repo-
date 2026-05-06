import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import dashboardData from '../../data/dashboard.json';
import './Dashboard.scss';

export const Dashboard = () => {
  usePageTitle('Dashboard');

  const [pendingFeesTerm, setPendingFeesTerm] = useState('all');
  const [monthlyCollectionMonth, setMonthlyCollectionMonth] = useState('may');
  const [pendingMenuOpen, setPendingMenuOpen] = useState(false);
  const [collectionMenuOpen, setCollectionMenuOpen] = useState(false);
  const pendingDdRef = useRef(null);
  const collectionDdRef = useRef(null);
  const [finTerm, setFinTerm] = useState(() => dashboardData.financialOverview?.selectedTerm || 'all');
  const [finTermMenuOpen, setFinTermMenuOpen] = useState(false);
  const finTermDdRef = useRef(null);
  const [activeEvent, setActiveEvent] = useState(null);

  const {
    kpis,
    recentActivities,
    recentCollections,
    attendanceOverview,
    upcomingEvents,
    financialOverview,
  } = dashboardData;

  const kpiIconConfig = {
    students: { icon: 'groups', color: 'blue', badge: 'positive-green' },
    fees: { icon: 'pending_actions', color: 'amber', badge: 'negative-red' },
    collection: { icon: 'account_balance_wallet', color: 'emerald', badge: 'positive-green' },
    staff: { icon: 'badge', color: 'purple', badge: 'positive-blue' }
  };

  const activityIconConfig = {
    payment: { icon: 'payments', color: 'bg-primary' },
    admission: { icon: 'person_add', color: 'bg-blue' },
    collection: { icon: 'receipt_long', color: 'bg-emerald' },
    system: { icon: 'cloud_done', color: 'bg-stone' },
    schedule: { icon: 'calendar_month', color: 'bg-amber' }
  };

  const getEventTagClass = (tag) => {
    if (tag === 'PARENTS') return 'tag-primary';
    if (tag === 'ALL') return 'tag-secondary';
    return 'tag-tertiary';
  };

  const pendingFeeTermOptions = [
    { value: 'all', label: 'All terms' },
    { value: 'term1', label: 'Term 1' },
    { value: 'term2', label: 'Term 2' },
    { value: 'term3', label: 'Term 3' },
  ];

  const monthOptions = [
    { value: 'may', label: 'May' },
    { value: 'apr', label: 'Apr' },
    { value: 'mar', label: 'Mar' },
    { value: 'feb', label: 'Feb' },
  ];

  useEffect(() => {
    if (!pendingMenuOpen && !collectionMenuOpen && !finTermMenuOpen) return;
    const onDocPointerDown = (e) => {
      const t = e.target;
      if (pendingDdRef.current && !pendingDdRef.current.contains(t)) setPendingMenuOpen(false);
      if (collectionDdRef.current && !collectionDdRef.current.contains(t)) setCollectionMenuOpen(false);
      if (finTermDdRef.current && !finTermDdRef.current.contains(t)) setFinTermMenuOpen(false);
    };
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [pendingMenuOpen, collectionMenuOpen, finTermMenuOpen]);

  useEffect(() => {
    if (!activeEvent) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveEvent(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [activeEvent]);

  const pendingFeesTermLabel = useMemo(
    () => pendingFeeTermOptions.find((x) => x.value === pendingFeesTerm)?.label ?? 'All terms',
    [pendingFeeTermOptions, pendingFeesTerm]
  );
  const monthlyCollectionMonthLabel = useMemo(
    () => monthOptions.find((x) => x.value === monthlyCollectionMonth)?.label ?? 'May',
    [monthOptions, monthlyCollectionMonth]
  );

  const finTermOptions = useMemo(
    () => [
      { value: 'all', label: 'All terms' },
      { value: 'term1', label: 'Term 1' },
      { value: 'term2', label: 'Term 2' },
      { value: 'term3', label: 'Term 3' },
    ],
    []
  );

  const finTermLabel = useMemo(
    () => finTermOptions.find((x) => x.value === finTerm)?.label ?? 'All terms',
    [finTermOptions, finTerm]
  );

  const finBreakdown = financialOverview?.termBreakdown?.[finTerm] ?? financialOverview?.termBreakdown?.all ?? {
    collected: 78,
    pending: 15,
    overdue: 7,
  };
  const collectedPct = finBreakdown.collected ?? 0;
  const pendingPct = finBreakdown.pending ?? 0;
  const overduePct = finBreakdown.overdue ?? 0;

  const donut = useMemo(() => {
    const r = 80;
    const circ = 2 * Math.PI * r;
    const segments = [
      { key: 'collected', pct: collectedPct, stroke: 'var(--primary)' },
      { key: 'pending', pct: pendingPct, stroke: 'var(--tertiary)' },
      { key: 'overdue', pct: overduePct, stroke: 'var(--error)' },
    ];
    let acc = 0;
    const out = segments.map((s) => {
      const len = (Math.max(0, Math.min(100, s.pct)) / 100) * circ;
      const dasharray = `${len} ${circ}`;
      const dashoffset = -acc;
      acc += len;
      return { ...s, dasharray, dashoffset };
    });
    return { r, circ, segments: out };
  }, [collectedPct, pendingPct, overduePct]);

  return (
    <div className="dashboard-container">
      {/* 1. Stats Cards - Bento Style */}
      <div className="stats-grid">
        {kpis.map((kpi) => {
          const config = kpiIconConfig[kpi.id];
          const isPendingFees = kpi.id === 'fees';
          const isMonthlyCollection = kpi.id === 'collection';

          let displayValue = kpi.value;
          if (isPendingFees && kpi.termValues) {
            displayValue = kpi.termValues[pendingFeesTerm] ?? kpi.value;
          } else if (isMonthlyCollection && kpi.monthValues) {
            displayValue = kpi.monthValues[monthlyCollectionMonth] ?? kpi.value;
          }
          return (
            <div className="stat-card group" key={kpi.id}>
              <div className="card-header">
                <div className={`icon-btn ${config.color}`}>
                  <span className="material-symbols-outlined">{config.icon}</span>
                </div>
                <div className="kpi-header-right">
                  {isPendingFees ? (
                    <div className="kpi-dd" ref={pendingDdRef}>
                      <button
                        type="button"
                        className={`kpi-chip${pendingMenuOpen ? ' is-open' : ''}`}
                        aria-haspopup="menu"
                        aria-expanded={pendingMenuOpen}
                        onClick={() => {
                          setCollectionMenuOpen(false);
                          setPendingMenuOpen((o) => !o);
                        }}
                      >
                        <span>{pendingFeesTermLabel}</span>
                        <span className="material-symbols-outlined" aria-hidden>
                          expand_more
                        </span>
                      </button>
                      {pendingMenuOpen ? (
                        <div className="kpi-menu" role="menu" aria-label="Pending fees term">
                          {pendingFeeTermOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              className={`kpi-menu-opt${pendingFeesTerm === opt.value ? ' is-selected' : ''}`}
                              onClick={() => {
                                setPendingFeesTerm(opt.value);
                                setPendingMenuOpen(false);
                              }}
                              role="menuitemradio"
                              aria-checked={pendingFeesTerm === opt.value}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {isMonthlyCollection ? (
                    <div className="kpi-dd" ref={collectionDdRef}>
                      <button
                        type="button"
                        className={`kpi-chip${collectionMenuOpen ? ' is-open' : ''}`}
                        aria-haspopup="menu"
                        aria-expanded={collectionMenuOpen}
                        onClick={() => {
                          setPendingMenuOpen(false);
                          setCollectionMenuOpen((o) => !o);
                        }}
                      >
                        <span>{monthlyCollectionMonthLabel}</span>
                        <span className="material-symbols-outlined" aria-hidden>
                          expand_more
                        </span>
                      </button>
                      {collectionMenuOpen ? (
                        <div className="kpi-menu" role="menu" aria-label="Monthly collection month">
                          {monthOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              className={`kpi-menu-opt${monthlyCollectionMonth === opt.value ? ' is-selected' : ''}`}
                              onClick={() => {
                                setMonthlyCollectionMonth(opt.value);
                                setCollectionMenuOpen(false);
                              }}
                              role="menuitemradio"
                              aria-checked={monthlyCollectionMonth === opt.value}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <span className={`growth-badge ${config.badge}`}>{kpi.change}</span>
                </div>
              </div>
              <p className="stat-label">{kpi.title}</p>
              <h3 className="stat-value">{displayValue}</h3>
            </div>
          );
        })}
      </div>

      <div className="middle-grid">
        {/* 2. Financial Overview & Collections */}
        <div className="left-col">
          <div className="fin-card">
            <div className="fin-header">
              <div>
                <h3>Financial Overview</h3>
                <p>Fee status for Academic Year {financialOverview?.academicYear || '2023-24'}</p>
              </div>
              <div className="fin-header-links">
                <div className="fin-term-dd" ref={finTermDdRef}>
                  <button
                    type="button"
                      className={`kpi-chip fin-term-chip${finTermMenuOpen ? ' is-open' : ''}`}
                    aria-haspopup="menu"
                    aria-expanded={finTermMenuOpen}
                    onClick={() => {
                      setPendingMenuOpen(false);
                      setCollectionMenuOpen(false);
                      setFinTermMenuOpen((o) => !o);
                    }}
                  >
                    <span>{finTermLabel}</span>
                    <span className="material-symbols-outlined" aria-hidden>
                      expand_more
                    </span>
                  </button>
                  {finTermMenuOpen ? (
                    <div className="kpi-menu" role="menu" aria-label="Financial overview term">
                      {finTermOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`kpi-menu-opt${finTerm === opt.value ? ' is-selected' : ''}`}
                          onClick={() => {
                            setFinTerm(opt.value);
                            setFinTermMenuOpen(false);
                          }}
                          role="menuitemradio"
                          aria-checked={finTerm === opt.value}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <Link to="/financial-services" className="report-link">
                  Full Report <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
                <Link to="/financial-services/collect-fee" className="report-link">
                  Collect fee <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
            
            <div className="fin-content">
              {/* SVG Donut Chart */}
              <div className="chart-container">
                <svg viewBox="0 0 192 192">
                  <circle
                    cx="96"
                    cy="96"
                    r={donut.r}
                    fill="transparent"
                    stroke="var(--surface-container-highest)"
                    strokeWidth="18"
                  />
                  {donut.segments.map((seg) => (
                    <circle
                      key={seg.key}
                      cx="96"
                      cy="96"
                      r={donut.r}
                      fill="transparent"
                      stroke={seg.stroke}
                      strokeWidth="18"
                      strokeDasharray={seg.dasharray}
                      strokeDashoffset={seg.dashoffset}
                      strokeLinecap="butt"
                    />
                  ))}
                </svg>
                <div className="chart-text">
                  <p>{collectedPct}%</p>
                  <p>COLLECTED</p>
                </div>
              </div>

              <div className="bars-container">
                <div className="bar-row">
                  <div className="bar-header">
                    <span className="label"><span className="dot dot-primary"></span> Fees Collected</span>
                    <span>{collectedPct}%</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill fill-primary" style={{ width: `${collectedPct}%` }} />
                  </div>
                </div>
                
                <div className="bar-row">
                  <div className="bar-header">
                    <span className="label"><span className="dot dot-tertiary"></span> Pending</span>
                    <span>{pendingPct}%</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill fill-tertiary" style={{ width: `${pendingPct}%` }} />
                  </div>
                </div>

                <div className="bar-row">
                  <div className="bar-header">
                    <span className="label"><span className="dot dot-error"></span> Overdue</span>
                    <span>{overduePct}%</span>
                  </div>
                  <div className="bar-bg">
                    <div className="bar-fill fill-error" style={{ width: `${overduePct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="recent-collections">
            <h3>Recent Collections</h3>
            <div className="collections-grid">
              {recentCollections.map((col, idx) => (
                <div className="col-item" key={col.label ?? idx}>
                  <p className="col-label">{col.label}</p>
                  <p className={`col-amount ${idx === 0 ? 'text-primary' : ''}`}>{col.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Recent Activities & 5. Attendance */}
        <div className="right-col">
          <div className="activities-card">
            <h3>Recent Activities</h3>
            <div className="timeline">
              {recentActivities.slice(0, 4).map((act) => {
                const config = activityIconConfig[act.type];
                return (
                  <div className="timeline-item" key={act.id}>
                    <div className={`icon-wrapper ${config.color}`}>
                      <span className="material-symbols-outlined">{config.icon}</span>
                    </div>
                    <div className="details">
                      <p>{act.title}</p>
                      {act.description && <p className="positive">{act.description}</p>}
                      <p className="time">{act.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="attendance-card">
            <h3>
              <span className="material-symbols-outlined">analytics</span>
              {' '}
              Attendance Overview
            </h3>
            <div className="att-grid">
              <div className="att-box">
                <p>Today</p>
                <p>{attendanceOverview.today}</p>
              </div>
              <div className="att-box border-x">
                <p>Week</p>
                <p>{attendanceOverview.week}</p>
              </div>
              <div className="att-box">
                <p>Month</p>
                <p>{attendanceOverview.month}</p>
              </div>
            </div>
            <div className="att-footer">
              * Last updated {attendanceOverview.lastUpdated}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Upcoming Events */}
      <section className="events-section">
        <h3>Upcoming Events</h3>
        <div className="events-grid">
          {upcomingEvents.map((event) => {
            const tagClass = getEventTagClass(event.tag);
            return (
              <div className="event-card" key={event.id}>
                <div className="img-container">
                  <img src={event.image} alt={event.title} />
                </div>
                <div className="event-body">
                  <div className="event-meta">
                    <div className={`tag ${tagClass}`}>{event.tag}</div>
                    <div className="date">{event.date}</div>
                  </div>
                  <h4>{event.title}</h4>
                  <div className="location">
                    <span className="material-symbols-outlined">location_on</span>
                    {event.location}
                  </div>
                  <button
                    type="button"
                    className="event-btn"
                    onClick={() => setActiveEvent(event)}
                  >
                    {event.id === 3 ? 'View Schedule' : 'Details'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {activeEvent ? (
        <div className="event-modal-layer">
          <button
            type="button"
            className="event-modal-backdrop"
            aria-label="Close event details"
            onClick={() => setActiveEvent(null)}
          />
          <dialog
            className="event-modal"
            open
            aria-label={`Event details: ${activeEvent.title}`}
          >
            <div className="event-modal__header">
              <div className="event-modal__meta">
                <div className={`tag ${getEventTagClass(activeEvent.tag)}`}>
                  {activeEvent.tag}
                </div>
                <div className="event-modal__date">{activeEvent.date}</div>
              </div>
              <button
                type="button"
                className="event-modal__close"
                onClick={() => setActiveEvent(null)}
                aria-label="Close"
              >
                <span className="material-symbols-outlined" aria-hidden>
                  close
                </span>
              </button>
            </div>

            <div className="event-modal__body">
              <div className="event-modal__image">
                <img src={activeEvent.image} alt={activeEvent.title} />
              </div>

              <div className="event-modal__content">
                <h4 className="event-modal__title">{activeEvent.title}</h4>

                <div className="event-modal__row">
                  <span className="material-symbols-outlined" aria-hidden>location_on</span>
                  <span>{activeEvent.location}</span>
                </div>
                <div className="event-modal__row">
                  <span className="material-symbols-outlined" aria-hidden>event</span>
                  <span>{activeEvent.date}</span>
                </div>

                <div className="event-modal__desc">
                  <p>
                    This event is scheduled for <strong>{activeEvent.date}</strong>. Please check the details and plan accordingly.
                    {activeEvent.id === 3 ? ' Exam schedules may vary by class/section.' : ''}
                  </p>
                </div>

                <div className="event-modal__actions">
                  <button
                    type="button"
                    className="event-modal__primary"
                    onClick={() => setActiveEvent(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </dialog>
        </div>
      ) : null}
    </div>
  );
};
