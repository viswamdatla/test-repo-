import React, { useEffect, useMemo } from 'react';
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
  buildCourseRows,
  buildGpaTrendPoints,
  buildSubjectReportRows,
  computeGpa,
  computeRankInSection,
  filterSectionGrades,
  gpaDeltaHint,
  letterGradeTone,
  studentSectionAttendancePct,
} from './studentGradesViewModel';
import './StudentGradesDetailPage.scss';

const ACADEMIC_YEAR = '2024-25';

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

const ordinalRank = (n) => {
  if (n == null || !Number.isFinite(n)) return '—';
  const v = n % 100;
  const suf = { 11: 'th', 12: 'th', 13: 'th' }[v] || { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th';
  return `${n}${suf}`;
};

const formatScoreCell = (v) => {
  if (v == null || Number.isNaN(v)) return '—';
  return (Math.round(v * 10) / 10).toFixed(1);
};

const formatIntCell = (v) => {
  if (v == null) return '—';
  return String(v).padStart(2, '0');
};

function ReportGradePill({ letter }) {
  if (!letter || letter === '—') {
    return <span className="src-grade-pill src-grade-pill--muted">—</span>;
  }
  const tone = letterGradeTone(letter);
  return <span className={`src-grade-pill src-grade-pill--${tone}`}>{letter}</span>;
}

export const StudentGradesDetailPage = () => {
  const { classSlug, sectionSlug, studentSlug } = useParams();
  const { wizardBase } = useOutletContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loadStatus = useSelector(selectAcademicsStatus);
  const grades = useSelector((s) => selectAcademicsSectionItems(s, 'grades'));
  const students = useSelector((s) => selectAcademicsSectionItems(s, 'students'));
  const attendance = useSelector((s) => selectAcademicsSectionItems(s, 'attendance'));
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
    [structure, classLevel],
  );
  const sections = useSelector((s) => selectClassSections(s, stage, classLevel));
  const section = sectionFromSlug(sectionSlug, sections);
  const validClass = Boolean(classLevel && allClasses.includes(classLevel));

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
    [grades, stage, classLevel, section],
  );

  const studentGrades = useMemo(
    () => sectionGrades.filter((g) => g.student === studentName),
    [sectionGrades, studentName],
  );

  const rosterStudent = useMemo(
    () =>
      students.find(
        (s) =>
          s.name === studentName && s.classLevel === classLevel && (s.section || '') === section && s.stage === stage,
      ),
    [students, studentName, classLevel, section, stage],
  );

  const subjectRows = useMemo(() => buildSubjectReportRows(studentGrades), [studentGrades]);

  const courseRowsForGpa = useMemo(() => buildCourseRows(studentGrades, 'finalTerm'), [studentGrades]);

  const gpa = useMemo(() => computeGpa(courseRowsForGpa), [courseRowsForGpa]);
  const deltaHint = useMemo(() => gpaDeltaHint(courseRowsForGpa), [courseRowsForGpa]);

  const { rank, of } = useMemo(
    () => computeRankInSection(sectionGrades, studentName, 'finalTerm'),
    [sectionGrades, studentName],
  );

  const attendancePct = useMemo(
    () => studentSectionAttendancePct(attendance, studentName, stage, classLevel, section),
    [attendance, studentName, stage, classLevel, section],
  );

  const creditsDisplay = subjectRows.length > 0 ? subjectRows.length * 4 : null;

  const topBandPct = useMemo(() => {
    if (!rank || !of || of < 1) return null;
    return Math.max(1, Math.min(100, Math.round((rank / of) * 100)));
  }, [rank, of]);

  const gpaProgressBars = useMemo(() => {
    const pts = buildGpaTrendPoints(studentGrades);
    const g = gpa ?? 0;
    const v1 = pts[0]?.pct != null ? (pts[0].pct / 100) * 4 : g > 0 ? Math.max(0, g * 0.94) : null;
    const v2 = pts[2]?.pct != null ? (pts[2].pct / 100) * 4 : g > 0 ? Math.max(0, g * 0.97) : null;
    const v3 = g > 0 ? g : pts[3]?.pct != null ? (pts[3].pct / 100) * 4 : null;
    const vals = [v1, v2, v3].map((x) => (x == null || Number.isNaN(x) ? 0 : x));
    const max = Math.max(...vals, 0.01);
    return [
      { label: 'Term 1', gpa: v1, h: max ? (vals[0] / max) * 100 : 0 },
      { label: 'Term 2', gpa: v2, h: max ? (vals[1] / max) * 100 : 0 },
      { label: 'Term 3', gpa: v3, h: max ? (vals[2] / max) * 100 : 0, current: true },
    ];
  }, [studentGrades, gpa]);

  const teacherRemark = useMemo(() => {
    const fn = firstName(studentName);
    const best = subjectRows.reduce(
      (acc, r) => (r.total != null && (acc == null || r.total > acc.total) ? r : acc),
      null,
    );
    const subj = best?.subject ?? 'core subjects';
    if (gpa != null && gpa >= 3.5) {
      return `${fn} continues to show strong performance across subjects, with particular strength in ${subj}. Keep building consistent study habits ahead of the next assessment cycle.`;
    }
    if (gpa != null && gpa >= 3) {
      return `${fn} is meeting expectations this term. Focused practice in ${subj} and steady revision will help lift overall outcomes in the next term.`;
    }
    return `${fn} is developing foundational skills across subjects. Targeted support in ${subj} and regular attendance will support measurable improvement.`;
  }, [studentName, subjectRows, gpa]);

  usePageTitle(
    studentName && classLevel && section
      ? `${studentName} — Report (${classLevel} ${section})`
      : 'Student Report Card',
  );

  if (!stage || !validClass || !section) return null;

  const loadFailed = loadStatus === 'failed';
  const showLoading = loadStatus === 'idle' || loadStatus === 'loading';
  const hasIdentity = Boolean(rosterStudent || studentGrades.length > 0);
  const unknownStudent = loadStatus === 'succeeded' && !hasIdentity;

  const displayName = rosterStudent?.name || studentName || 'Student';
  const rollDisplay = rosterStudent?.rollNo || rosterStudent?.admissionNo || '—';
  const idDisplay = rosterStudent?.admissionNo || rosterStudent?.id || '—';
  const gpaBarPct = gpa != null ? Math.min(100, Math.max(0, (gpa / 4) * 100)) : 0;

  return (
    <div className="src-page">
      <div className="src-toolbar">
        <button
          type="button"
          className="src-back"
          onClick={() => navigate(`${wizardBase}/${classSlug}/${sectionSlug}`)}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Gradebook
        </button>
        <button type="button" className="src-btn src-btn--outline" onClick={() => window.print()}>
          <span className="material-symbols-outlined">print</span>
          Print
        </button>
      </div>

      {loadFailed ? (
        <div className="src-empty">
          <h1>Could not load academics data</h1>
          <p>Refresh the page or try again later.</p>
          <button type="button" className="src-btn src-btn--primary" onClick={() => dispatch(fetchAcademicsData())}>
            Retry
          </button>
        </div>
      ) : showLoading ? (
        <p className="src-loading">Loading report…</p>
      ) : unknownStudent ? (
        <div className="src-empty">
          <h1>Student not found</h1>
          <p>There is no roster or grade record for “{studentName}” in {classLevel} section {section}.</p>
          <button
            type="button"
            className="src-btn src-btn--primary"
            onClick={() => navigate(`${wizardBase}/${classSlug}/${sectionSlug}`)}
          >
            Back to Gradebook
          </button>
        </div>
      ) : (
        <>
          <header className="src-head">
            <div>
              <nav className="src-breadcrumb" aria-label="Breadcrumb">
                <span>Academics</span>
                <span className="material-symbols-outlined src-breadcrumb__sep">chevron_right</span>
                <span>Grades</span>
                <span className="material-symbols-outlined src-breadcrumb__sep">chevron_right</span>
                <span className="src-breadcrumb__current">{displayName}</span>
              </nav>
              <h1 className="src-title">Student Report Card</h1>
              <p className="src-meta-line">
                Academic Year {ACADEMIC_YEAR} · {classLevel} — Section {section}
              </p>
            </div>
            <button type="button" className="src-btn src-btn--primary" onClick={() => window.print()}>
              Export report
            </button>
          </header>

          <section className="src-hero-grid" aria-label="Student summary">
            <div className="src-hero-card">
              <div className="src-hero-avatar" aria-hidden>
                {initialsFromName(displayName)}
              </div>
              <div className="src-hero-copy">
                <h2 className="src-hero-name">{displayName}</h2>
                <p className="src-hero-lines">
                  <span>
                    {classLevel} — Section {section} · Roll #{rollDisplay}
                  </span>
                  <span className="src-hero-lines__muted">ID: {idDisplay}</span>
                </p>
                {attendancePct != null && (
                  <div className="src-att-pill">
                    <span className="material-symbols-outlined">check_circle</span>
                    Attendance: {attendancePct}%
                  </div>
                )}
              </div>
            </div>

            <div className="src-kpi">
              <div className="src-kpi__top">
                <div className="src-kpi-icon src-kpi-icon--blue">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                </div>
                {deltaHint != null && deltaHint !== 0 && (
                  <span className="src-kpi-delta">
                    {deltaHint >= 0 ? '+' : '−'}
                    {Math.abs(Math.round(deltaHint * 100) / 100)} GPA
                  </span>
                )}
              </div>
              <p className="src-kpi-label">Overall GPA</p>
              <p className="src-kpi-value">
                {gpa != null ? gpa.toFixed(2) : '—'} <span className="src-kpi-suffix">/ 4.0</span>
              </p>
              <div className="src-kpi-bar">
                <div className="src-kpi-bar__fill" style={{ width: `${gpaBarPct}%` }} />
              </div>
            </div>

            <div className="src-kpi">
              <div className="src-kpi__top">
                <div className="src-kpi-icon src-kpi-icon--amber">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    trophy
                  </span>
                </div>
              </div>
              <p className="src-kpi-label">Class rank</p>
              <p className="src-kpi-value">
                {ordinalRank(rank)} <span className="src-kpi-suffix">/ {of || '—'}</span>
              </p>
              {topBandPct != null && <p className="src-kpi-foot">Top {topBandPct}% of class</p>}
            </div>

            <div className="src-kpi src-kpi--wide">
              <div className="src-kpi__top">
                <div className="src-kpi-icon src-kpi-icon--indigo">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    workspace_premium
                  </span>
                </div>
              </div>
              <p className="src-kpi-label">Academic credit</p>
              <p className="src-kpi-value">{creditsDisplay != null ? `${creditsDisplay} Credits` : '—'}</p>
              <p className="src-kpi-foot">Based on subjects in this section record</p>
            </div>
          </section>

          <div className="src-split">
            <section className="src-panel" id="src-results" aria-labelledby="src-results-heading">
              <div className="src-panel-head">
                <h3 id="src-results-heading" className="src-panel-title">
                  Academic results
                </h3>
                <button
                  type="button"
                  className="src-link-btn"
                  onClick={() => navigate(`${wizardBase}/${classSlug}/${sectionSlug}`)}
                >
                  View full record
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
              <div className="src-table-scroll">
                <table className="src-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th className="src-th-num">FA1</th>
                      <th className="src-th-num">FA2</th>
                      <th className="src-th-num">H-Yearly</th>
                      <th className="src-th-num">FA3</th>
                      <th className="src-th-num">FA4</th>
                      <th className="src-th-num">Annual</th>
                      <th className="src-th-num">Internal</th>
                      <th className="src-th-total">Total</th>
                      <th className="src-th-grade">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectRows.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="src-table-empty">
                          No published marks for this student in this section yet.
                        </td>
                      </tr>
                    ) : (
                      subjectRows.map((row) => (
                        <tr key={row.subject}>
                          <td className="src-td-subj">{row.subject}</td>
                          <td className="src-td-num">{formatScoreCell(row.fa1)}</td>
                          <td className="src-td-num">{formatScoreCell(row.fa2)}</td>
                          <td className="src-td-num">{formatScoreCell(row.halfYr)}</td>
                          <td className="src-td-num">{formatScoreCell(row.fa3)}</td>
                          <td className="src-td-num">{formatScoreCell(row.fa4)}</td>
                          <td className="src-td-num">{formatScoreCell(row.annual)}</td>
                          <td className="src-td-num">{formatIntCell(row.int)}</td>
                          <td className="src-td-total">{row.total != null ? formatScoreCell(row.total) : '—'}</td>
                          <td className="src-td-grade">
                            <ReportGradePill letter={row.gradeLetter} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="src-aside" aria-label="Progress and remarks">
              <div className="src-card">
                <h4 className="src-card-title">GPA progress</h4>
                <div className="src-bars">
                  {gpaProgressBars.map((b) => (
                    <div key={b.label} className="src-bar-col">
                      <div className="src-bar-track">
                        <div
                          className={`src-bar-fill ${b.current ? 'src-bar-fill--current' : ''}`}
                          style={{ height: `${Math.max(8, b.h)}%` }}
                        />
                        {b.gpa != null && (
                          <span className={`src-bar-label ${b.current ? 'is-current' : ''}`}>{b.gpa.toFixed(2)}</span>
                        )}
                      </div>
                      <span className={`src-bar-term ${b.current ? 'is-current' : ''}`}>{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="src-card src-card--quote">
                <span className="material-symbols-outlined src-quote-watermark" style={{ fontVariationSettings: "'FILL' 1" }}>
                  format_quote
                </span>
                <h4 className="src-card-title src-card-title--inline">
                  <span className="material-symbols-outlined">comment</span>
                  Teacher remarks
                </h4>
                <p className="src-quote-body">{teacherRemark}</p>
                <div className="src-teacher-row">
                  <div className="src-teacher-avatar" aria-hidden>
                    CT
                  </div>
                  <div>
                    <p className="src-teacher-name">Class Teacher</p>
                    <p className="src-teacher-role">Homeroom</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  );
};
