import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  fetchAcademicsData,
  selectAcademicsSectionItems,
  selectAcademicsStatus,
  selectAcademicsStructure,
  selectClassSections,
} from '../../store/academics/academicsSlice';
import {
  flattenAllClassNames,
  resolveStageForClass,
  sectionFromSlug,
  slugToClassLevel,
} from './studentManagement/studentManagementConfig';
import {
  EXAM_FILTER_OPTIONS,
  TERM_OPTIONS,
  abbrevSubject,
  buildCourseRows,
  buildGpaTrendPoints,
  classAverageBySubject,
  computeGpa,
  computeRankInSection,
  distinctionLabel,
  gpaDeltaHint,
  letterGradeTone,
  percentileLabel,
  submissionRate,
  filterSectionGrades,
} from './studentGradesViewModel';
import './studentManagement/StudentManagementFlow.scss';
import './StudentGradesDetailPage.scss';

const initialsFromName = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || 'Student';

export const StudentGradesDetailPage = () => {
  const { classSlug, sectionSlug, studentSlug } = useParams();
  const { wizardBase } = useOutletContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loadStatus = useSelector(selectAcademicsStatus);
  const grades = useSelector((s) => selectAcademicsSectionItems(s, 'grades'));
  const students = useSelector((s) => selectAcademicsSectionItems(s, 'students'));
  const structure = useSelector(selectAcademicsStructure);

  const studentName = useMemo(() => {
    try {
      return decodeURIComponent(studentSlug || '');
    } catch {
      return studentSlug || '';
    }
  }, [studentSlug]);

  const allClasses = useMemo(() => flattenAllClassNames(structure), [structure]);
  const classLevel = slugToClassLevel(classSlug, allClasses);
  const stage = useMemo(
    () => (classLevel ? resolveStageForClass(structure, classLevel) : null),
    [structure, classLevel]
  );
  const sections = useSelector((s) => selectClassSections(s, stage, classLevel));
  const section = sectionFromSlug(sectionSlug, sections);
  const validClass = Boolean(classLevel && allClasses.includes(classLevel));

  const [examFilterId, setExamFilterId] = useState(EXAM_FILTER_OPTIONS[0].id);
  const [termId, setTermId] = useState(TERM_OPTIONS[0].id);

  useEffect(() => {
    if (loadStatus === 'idle') dispatch(fetchAcademicsData());
  }, [dispatch, loadStatus]);

  useEffect(() => {
    if (!validClass || !stage) {
      navigate(wizardBase, { replace: true });
      return;
    }
    if (!section) {
      navigate(`${wizardBase}/${classSlug}`, { replace: true });
    }
  }, [stage, validClass, section, navigate, wizardBase, classSlug]);

  const sectionGrades = useMemo(
    () => (stage && classLevel && section ? filterSectionGrades(grades, stage, classLevel, section) : []),
    [grades, stage, classLevel, section]
  );

  const studentGrades = useMemo(
    () => sectionGrades.filter((g) => g.student === studentName),
    [sectionGrades, studentName]
  );

  const rosterStudent = useMemo(
    () =>
      students.find(
        (s) =>
          s.name === studentName &&
          s.classLevel === classLevel &&
          (s.section || '') === section
      ),
    [students, studentName, classLevel, section]
  );

  const courseRows = useMemo(
    () => buildCourseRows(studentGrades, examFilterId),
    [studentGrades, examFilterId]
  );

  const gpa = useMemo(() => computeGpa(courseRows), [courseRows]);
  const overallPct = useMemo(() => {
    if (courseRows.length === 0) return null;
    return courseRows.reduce((a, r) => a + r.totalPct, 0) / courseRows.length;
  }, [courseRows]);

  const { rank, of } = useMemo(
    () => computeRankInSection(sectionGrades, studentName, examFilterId),
    [sectionGrades, studentName, examFilterId]
  );

  const gpaTrend = useMemo(() => buildGpaTrendPoints(studentGrades), [studentGrades]);
  const deltaHint = useMemo(() => gpaDeltaHint(courseRows), [courseRows]);
  const submitRate = useMemo(() => submissionRate(studentGrades), [studentGrades]);

  const peerRows = useMemo(() => {
    return courseRows.map((row) => {
      const classAvg = classAverageBySubject(sectionGrades, row.subject, examFilterId);
      return {
        subject: row.subject,
        short: abbrevSubject(row.subject),
        studentPct: row.totalPct,
        classPct: classAvg ?? row.totalPct * 0.85,
      };
    });
  }, [courseRows, sectionGrades, examFilterId]);

  const trendSvgPath = useMemo(() => {
    const w = 200;
    const h = 100;
    const pts = gpaTrend.map((p, i) => {
      const x = (i / Math.max(1, gpaTrend.length - 1)) * w;
      const pct = p.pct != null ? p.pct : 65 + i * 5;
      const y = h - (pct / 100) * (h - 8) - 4;
      return { x, y };
    });
    if (pts.length === 0) return { line: '', fill: '', dots: [] };
    let line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    if (pts.length === 1) {
      const p = pts[0];
      line = `M ${p.x} ${p.y} L ${Math.min(w, p.x + 48)} ${p.y}`;
    }
    const fill = `${line} L ${w} ${h} L 0 ${h} Z`;
    return { line, fill, dots: pts };
  }, [gpaTrend]);

  const termLabel = TERM_OPTIONS.find((t) => t.id === termId)?.label ?? TERM_OPTIONS[0].label;
  const honorStudent = gpa != null && gpa >= 3.5;

  usePageTitle(
    studentName && classLevel && section
      ? `${studentName} — Grades (${classLevel} ${section})`
      : 'Academic Grades'
  );

  if (!stage || !validClass || !section) return null;

  const unknownStudent = loadStatus === 'succeeded' && studentGrades.length === 0;
  const showLoading = loadStatus === 'idle' || loadStatus === 'loading';
  const loadFailed = loadStatus === 'failed';

  return (
    <div className="sgd">
      <button type="button" className="sgd-back sm-back" onClick={() => navigate(`${wizardBase}/${classSlug}/${sectionSlug}`)}>
        <span className="material-symbols-outlined">arrow_back</span>
        Grade log
      </button>

      {loadFailed ? (
        <div className="sgd-empty">
          <h1>Could not load academics data</h1>
          <p>Refresh the page or try again later.</p>
          <button type="button" className="sgd-btn-primary" onClick={() => dispatch(fetchAcademicsData())}>
            Retry
          </button>
        </div>
      ) : showLoading ? (
        <p className="sgd-loading sgd-loading--page">Loading…</p>
      ) : unknownStudent ? (
        <div className="sgd-empty">
          <h1>No grades for this student</h1>
          <p>We could not find grade rows for “{studentName}” in {classLevel} section {section}.</p>
          <button type="button" className="sgd-btn-primary" onClick={() => navigate(`${wizardBase}/${classSlug}/${sectionSlug}`)}>
            Back to list
          </button>
        </div>
      ) : (
        <div className="sgd-grid">
          <div className="sgd-main">
            <header className="sgd-head">
              <div>
                <h1 className="sgd-title">Academic Grades</h1>
                <div className="sgd-subrow">
                  <span className="sgd-sub-muted">Student performance overview</span>
                  <span className="sgd-dot" aria-hidden />
                  <span className="sgd-sub-accent">
                    {termLabel} · {classLevel} · Section {section}
                  </span>
                </div>
              </div>
              <button type="button" className="sgd-export" onClick={() => window.print()}>
                <span className="material-symbols-outlined">download</span>
                Export PDF
              </button>
            </header>

            <div className="sgd-kpis">
              <div className="sgd-kpi">
                <p className="sgd-kpi-label">Current GPA</p>
                <div className="sgd-kpi-row">
                  <span className="sgd-kpi-value sgd-kpi-value--primary">{gpa != null ? gpa.toFixed(2) : '—'}</span>
                  {gpa != null && (
                    <span className="sgd-kpi-delta">
                      <span className="material-symbols-outlined">trending_up</span>
                      {deltaHint >= 0 ? deltaHint : `−${Math.abs(deltaHint)}`}
                    </span>
                  )}
                </div>
              </div>
              <div className="sgd-kpi">
                <p className="sgd-kpi-label">Class rank</p>
                <div className="sgd-kpi-row">
                  <span className="sgd-kpi-value">#{rank ?? '—'}</span>
                  <span className="sgd-kpi-of">of {of || '—'}</span>
                </div>
              </div>
              <div className="sgd-kpi">
                <p className="sgd-kpi-label">Overall %</p>
                <div className="sgd-kpi-row">
                  <span className="sgd-kpi-value">{overallPct != null ? `${overallPct.toFixed(1)}%` : '—'}</span>
                  {overallPct != null && (
                    <span className="sgd-kpi-delta sgd-kpi-delta--plain">{distinctionLabel(overallPct)}</span>
                  )}
                </div>
              </div>
              <div className={`sgd-kpi sgd-kpi--honor ${honorStudent ? 'is-active' : 'is-inactive'}`}>
                <span className="material-symbols-outlined sgd-honor-ic">military_tech</span>
                <span className="sgd-honor-label">Honor student</span>
              </div>
            </div>

            <div className="sgd-filter-bar">
              <div className="sgd-filter-field">
                <label className="sgd-filter-label" htmlFor="sgd-exam-filter">
                  Exam type filter
                </label>
                <div className="sgd-select-wrap">
                  <select
                    id="sgd-exam-filter"
                    className="sgd-select"
                    value={examFilterId}
                    onChange={(e) => setExamFilterId(e.target.value)}
                  >
                    {EXAM_FILTER_OPTIONS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined sgd-select-chevron">expand_more</span>
                </div>
              </div>
              <div className="sgd-filter-divider" aria-hidden />
              <div className="sgd-filter-context">
                <span className="sgd-context-hint">Data context</span>
                <div className="sgd-context-row">
                  <span className="material-symbols-outlined">info</span>
                  Viewing results for the selected exam weighting (mid/final columns follow records).
                </div>
              </div>
            </div>

            <section className="sgd-table-card">
              <div className="sgd-table-head">
                <h2 className="sgd-table-title">
                  <span className="material-symbols-outlined">analytics</span>
                  Detailed course performance
                </h2>
                <span className="sgd-pass-pill">Passing: 40%</span>
              </div>
              <div className="sgd-table-scroll">
                <table className="sgd-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th className="sgd-th-num">Mid-term</th>
                      <th className="sgd-th-num">Final-term</th>
                      <th className="sgd-th-num">Total</th>
                      <th className="sgd-th-num">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseRows.length === 0 ? (
                      <tr>
                        <td className="sgd-table-empty" colSpan={5}>
                          No course rows for this exam filter. Try another exam type or confirm marks are published.
                        </td>
                      </tr>
                    ) : (
                      courseRows.map((row) => (
                        <tr key={row.subject}>
                          <td className="sgd-td-subj">{row.subject}</td>
                          <td className="sgd-td-num">{row.mid != null ? `${row.mid}/100` : '—'}</td>
                          <td className="sgd-td-num">{row.final != null ? `${row.final}/100` : '—'}</td>
                          <td className="sgd-td-num sgd-td-strong">{row.totalPct.toFixed(1)}%</td>
                          <td className="sgd-td-num">
                            <span className={`sgd-grade-pill sgd-grade-pill--${letterGradeTone(row.gradeLetter)}`}>
                              {row.gradeLetter}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="sgd-peer">
              <div className="sgd-peer-bgicon" aria-hidden>
                <span className="material-symbols-outlined">bar_chart</span>
              </div>
              <div className="sgd-peer-top">
                <div>
                  <h2 className="sgd-peer-title">Peer benchmarking</h2>
                  <p className="sgd-peer-sub">Student vs. class average performance across subjects</p>
                </div>
                <div className="sgd-peer-legend">
                  <span>
                    <i className="sgd-lg swatch--student" /> {studentName}
                  </span>
                  <span>
                    <i className="sgd-lg swatch--class" /> Class avg
                  </span>
                </div>
              </div>
              <div className="sgd-peer-bars">
                {peerRows.length === 0 ? (
                  <p className="sgd-peer-empty">Course data will appear here once marks exist for this filter.</p>
                ) : (
                  peerRows.map((pr) => {
                    const max = 100;
                    const h1 = Math.min(100, (pr.studentPct / max) * 100);
                    const h2 = Math.min(100, (pr.classPct / max) * 100);
                    return (
                      <div key={pr.subject} className="sgd-peer-col">
                        <div className="sgd-peer-bar-pair">
                          <div
                            className="sgd-bar sgd-bar--student"
                            style={{ height: `${h1}%` }}
                            title={`${pr.studentPct.toFixed(0)}%`}
                          />
                          <div
                            className="sgd-bar sgd-bar--class"
                            style={{ height: `${h2}%` }}
                            title={`${pr.classPct.toFixed(0)}%`}
                          />
                        </div>
                        <span className="sgd-peer-lbl">{pr.short}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          <aside className="sgd-aside">
            <div className="sgd-aside-card">
              <label className="sgd-filter-label" htmlFor="sgd-term">
                View assessment term
              </label>
              <div className="sgd-select-wrap">
                <select id="sgd-term" className="sgd-select" value={termId} onChange={(e) => setTermId(e.target.value)}>
                  {TERM_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined sgd-select-chevron">expand_more</span>
              </div>
            </div>

            <div className="sgd-aside-card">
              <div className="sgd-trend-head">
                <h3 className="sgd-aside-h">GPA trend</h3>
                <span className="sgd-trend-badge">Annual</span>
              </div>
              <div className="sgd-trend-chart">
                <svg className="sgd-trend-svg" viewBox="0 0 200 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sgdTrendFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={trendSvgPath.fill} fill="url(#sgdTrendFill)" />
                  <path
                    d={trendSvgPath.line}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                {trendSvgPath.dots.map((p, i) => (
                  <span
                    key={i}
                    className="sgd-trend-dot"
                    style={{ left: `${(p.x / 200) * 100}%`, top: `${(p.y / 100) * 100}%` }}
                  />
                ))}
              </div>
              <div className="sgd-trend-labels">
                {gpaTrend.map((t) => (
                  <span key={t.label}>{t.label}</span>
                ))}
              </div>
            </div>

            <div className="sgd-aside-card sgd-teacher">
              <div className="sgd-teacher-head">
                <div className="sgd-teacher-avatar" aria-hidden>
                  {initialsFromName('Sarah Thompson')}
                </div>
                <div>
                  <h4 className="sgd-teacher-name">Ms. Sarah Thompson</h4>
                  <p className="sgd-teacher-role">Class teacher</p>
                </div>
              </div>
              <div className="sgd-quote-wrap">
                <span className="material-symbols-outlined sgd-quote-ic">format_quote</span>
                <p className="sgd-quote-text">
                  “{firstName(studentName)} has shown consistent effort this term. Continue building strong study
                  habits ahead of the next assessment cycle.”
                </p>
              </div>
              <div className="sgd-teacher-foot">
                <span className="sgd-teacher-date">Date: June 12, 2024</span>
                <button type="button" className="sgd-link-btn">
                  Contact teacher
                </button>
              </div>
            </div>

            <div className="sgd-bento">
              <div className="sgd-bento-item">
                <span className="material-symbols-outlined sgd-bento-ic">hotel_class</span>
                <p className="sgd-bento-val">{percentileLabel(rank, of)}</p>
                <p className="sgd-bento-lbl">School percentile</p>
              </div>
              <div className="sgd-bento-item">
                <span className="material-symbols-outlined sgd-bento-ic sgd-bento-ic--primary">pending_actions</span>
                <p className="sgd-bento-val">{submitRate}%</p>
                <p className="sgd-bento-lbl">Submission rate</p>
              </div>
            </div>

            <div className="sgd-event">
              <div className="sgd-event-bg" />
              <div className="sgd-event-overlay">
                <p className="sgd-event-kicker">Upcoming events</p>
                <p className="sgd-event-title">Annual awards ceremony 2024</p>
              </div>
            </div>

            {rosterStudent && (
              <p className="sgd-roster-meta">
                <strong>{rosterStudent.name}</strong>
                {rosterStudent.admissionNo ? ` · ${rosterStudent.admissionNo}` : ''}
                {rosterStudent.rollNo ? ` · Roll ${rosterStudent.rollNo}` : ''}
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};
