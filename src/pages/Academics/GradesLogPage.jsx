import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  fetchAcademicsData,
  selectAcademicsStructure,
  selectClassSections,
  selectAcademicsSectionItems,
  selectAcademicsStatus,
} from '../../store/academics/academicsSlice';
import {
  flattenAllClassNames,
  resolveStageForClass,
  sectionFromSlug,
  slugToClassLevel,
} from './studentManagement/studentManagementConfig';
import {
  buildPerformanceMatrixRow,
  filterSectionGrades,
  letterGradeTone,
} from './studentGradesViewModel';
import './GradesLogPage.scss';

const PAGE_SIZE = 8;
const ACADEMIC_YEAR = '2024-25';
const PASS_PCT = 40;

const GRADE_FILTERS = [
  { id: 'all', label: 'All Students' },
  { id: 'remedial', label: 'Remedial Focus' },
];

const initialsFromName = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

function formatCell(v) {
  if (v == null) return '—';
  return String(v);
}

function formatIntCell(v) {
  if (v == null) return '—';
  return String(v).padStart(2, '0');
}

function GradeLetterBadge({ letter }) {
  if (!letter || letter === '—') {
    return <span className="gbc-grade-pill gbc-grade-pill--muted">—</span>;
  }
  const tone = letterGradeTone(letter);
  return <span className={`gbc-grade-pill gbc-grade-pill--${tone}`}>{letter}</span>;
}

export const GradesLogPage = () => {
  const { classSlug, sectionSlug } = useParams();
  const { wizardBase } = useOutletContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loadStatus = useSelector(selectAcademicsStatus);
  const structure = useSelector(selectAcademicsStructure);
  const students = useSelector((s) => selectAcademicsSectionItems(s, 'students'));
  const grades = useSelector((s) => selectAcademicsSectionItems(s, 'grades'));

  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [page, setPage] = useState(1);

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

  const roster = useMemo(
    () => students.filter((s) => s.stage === stage && s.classLevel === classLevel && (s.section || '') === section),
    [students, stage, classLevel, section],
  );

  const gradeRows = useMemo(() => {
    const byName = new Map(roster.map((s) => [s.name, s]));
    const names = new Set([...roster.map((s) => s.name), ...sectionGrades.map((g) => g.student)]);

    return [...names]
      .sort((a, b) => a.localeCompare(b))
      .map((name) => {
        const stu = byName.get(name);
        const matrix = buildPerformanceMatrixRow(name, sectionGrades);
        return {
          id: stu?.id ?? `grade:${name}`,
          name,
          rollNo: stu?.rollNo || stu?.admissionNo || '—',
          matrix,
        };
      });
  }, [roster, sectionGrades]);

  const rosterStats = useMemo(() => {
    const avgs = gradeRows.map((r) => r.matrix.overall).filter((x) => x != null);
    const classAvg = avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : null;
    const remedial = gradeRows.filter((r) => r.matrix.overall != null && r.matrix.overall < PASS_PCT).length;
    return { total: gradeRows.length, classAvg, remedial };
  }, [gradeRows]);

  const spotlight = useMemo(() => {
    const ranked = gradeRows
      .filter((r) => r.matrix.overall != null)
      .sort((a, b) => b.matrix.overall - a.matrix.overall || a.name.localeCompare(b.name));
    return ranked[0] ?? null;
  }, [gradeRows]);

  const spotlightRankPct = useMemo(() => {
    if (!spotlight) return null;
    const scored = gradeRows
      .filter((r) => r.matrix.overall != null)
      .sort((a, b) => b.matrix.overall - a.matrix.overall || a.name.localeCompare(b.name));
    if (scored.length <= 1) return '100.0';
    const idx = scored.findIndex((r) => r.id === spotlight.id);
    if (idx < 0) return null;
    return ((1 - idx / (scored.length - 1)) * 100).toFixed(1);
  }, [spotlight, gradeRows]);

  const tableSource = useMemo(() => {
    let rows = gradeRows;
    if (gradeFilter === 'remedial') {
      rows = rows.filter((r) => r.matrix.overall != null && r.matrix.overall < PASS_PCT);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          String(r.rollNo || '')
            .toLowerCase()
            .includes(q),
      );
    }
    return rows;
  }, [gradeRows, gradeFilter, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(tableSource.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = tableSource.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [gradeFilter, searchQuery, classSlug, sectionSlug]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  usePageTitle(section && classLevel ? `${classLevel} ${section} — Grades` : 'Grades');

  const openStudent = (studentName) => {
    navigate(`${wizardBase}/${classSlug}/${sectionSlug}/student/${encodeURIComponent(studentName)}`);
  };

  const showFrom = tableSource.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showTo = Math.min(safePage * PAGE_SIZE, tableSource.length);

  const pageButtonRange = useMemo(() => {
    const pc = pageCount;
    const cur = safePage;
    if (pc <= 5) return Array.from({ length: pc }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(cur - 1, pc - 2));
    const out = [];
    for (let p = start; p <= Math.min(start + 2, pc); p += 1) out.push(p);
    return out;
  }, [pageCount, safePage]);

  const classAvgDisplay = rosterStats.classAvg != null ? rosterStats.classAvg.toFixed(1) : '—';
  const barPct =
    rosterStats.classAvg != null ? Math.min(100, Math.max(0, Number(rosterStats.classAvg))) : 0;

  const spotlightBadges = spotlight
    ? Math.min(10, Math.max(0, Math.round((spotlight.matrix.overall ?? 0) / 10)))
    : 0;

  if (!stage || !validClass || !section) return null;

  return (
    <div className="gbc-page">
      <div className="gbc-toolbar-top">
        <button type="button" className="gbc-back" onClick={() => navigate(`${wizardBase}/${classSlug}`)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Sections
        </button>
      </div>

      <header className="gbc-page-head">
        <div>
          <nav className="gbc-breadcrumb" aria-label="Breadcrumb">
            <span>Academics</span>
            <span className="material-symbols-outlined gbc-breadcrumb__sep">chevron_right</span>
            <span className="gbc-breadcrumb__current">Gradebook Central</span>
          </nav>
          <h1 className="gbc-title">Gradebook Central</h1>
          <p className="gbc-subtitle">
            {classLevel} — Section {section} · Academic Year {ACADEMIC_YEAR}
          </p>
        </div>
        <div className="gbc-head-actions">
          <button
            type="button"
            className="gbc-btn gbc-btn--primary"
            onClick={() => window.alert('Notify parents (demo).')}
          >
            <span className="material-symbols-outlined">mail</span>
            Notify Parents
          </button>
          <button
            type="button"
            className="gbc-btn gbc-btn--outline"
            onClick={() => window.alert('Export CSV (demo).')}
          >
            <span className="material-symbols-outlined">download</span>
            Export CSV
          </button>
        </div>
      </header>

      {loadStatus === 'loading' && <p className="gbc-loading">Loading grades…</p>}

      <div className="gbc-bento">
        <article className="gbc-card gbc-card--average">
          <div className="gbc-card--average__top">
            <div className="gbc-icon-wrap">
              <span className="material-symbols-outlined gbc-icon-wrap__ic">analytics</span>
            </div>
            <span className="gbc-trend-pill">
              <span className="material-symbols-outlined gbc-trend-pill__ic">trending_up</span>
              {rosterStats.remedial} <span className="gbc-trend-pill__muted">below {PASS_PCT}%</span>
            </span>
          </div>
          <p className="gbc-kicker">System-Wide Average</p>
          <div className="gbc-stat-line">
            <span className="gbc-stat-line__value">{classAvgDisplay}</span>
            <span className="gbc-stat-line__suffix">/ 100</span>
          </div>
          <div className="gbc-progress-track">
            <div className="gbc-progress-fill" style={{ width: `${barPct}%` }} />
          </div>
        </article>

        <article className="gbc-card gbc-card--spotlight">
          <div className="gbc-card--spotlight__glow" aria-hidden />
          {spotlight ? (
            <>
              <div className="gbc-spotlight-avatar-wrap">
                <div className="gbc-spotlight-avatar-ring">
                  <div className="gbc-spotlight-avatar-fallback" aria-hidden>
                    {initialsFromName(spotlight.name)}
                  </div>
                </div>
                <div className="gbc-spotlight-badge" aria-hidden>
                  <span className="material-symbols-outlined gbc-spotlight-badge__ic">military_tech</span>
                </div>
              </div>
              <div className="gbc-spotlight-copy">
                <p className="gbc-spotlight-label">Student spotlight</p>
                <h2 className="gbc-spotlight-name">{spotlight.name}</h2>
                <div className="gbc-spotlight-stats">
                  <div>
                    <p className="gbc-spotlight-stat-label">GPA rank</p>
                    <p className="gbc-spotlight-stat-value">
                      {spotlightRankPct != null ? `${spotlightRankPct}%` : '—'}
                    </p>
                  </div>
                  <div className="gbc-spotlight-divider" aria-hidden />
                  <div className="gbc-spotlight-milestone">
                    <p className="gbc-spotlight-stat-label">Excellence milestone</p>
                    <div className="gbc-spotlight-milestone-row">
                      <div className="gbc-progress-track gbc-progress-track--on-dark">
                        <div
                          className="gbc-progress-fill gbc-progress-fill--dim"
                          style={{ width: `${spotlightBadges * 10}%` }}
                        />
                      </div>
                      <span className="gbc-spotlight-badges">{spotlightBadges}/10 Badges</span>
                    </div>
                  </div>
                </div>
                <button type="button" className="gbc-spotlight-cta" onClick={() => openStudent(spotlight.name)}>
                  View Profile
                </button>
              </div>
            </>
          ) : (
            <p className="gbc-spotlight-empty">No graded students in this section yet.</p>
          )}
        </article>
      </div>

      <div className="gbc-matrix-wrap">
        <div className="gbc-matrix-head">
          <div>
            <h3 className="gbc-matrix-title">Detailed Performance Matrix</h3>
            <p className="gbc-matrix-sub">
              Term 2 Examination Results (Spring {ACADEMIC_YEAR.split('-')[0]})
            </p>
          </div>
          <div className="gbc-matrix-filters">
            {GRADE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`gbc-filter-chip ${gradeFilter === f.id ? 'is-active' : ''}`}
                onClick={() => setGradeFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="gbc-search-row">
          <span className="material-symbols-outlined gbc-search-ic">search</span>
          <input
            type="search"
            className="gbc-search-input"
            placeholder="Search student name or roll number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search students"
          />
        </div>

        <div className="gbc-table-scroll">
          <table className="gbc-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th className="gbc-th-num">FA1</th>
                <th className="gbc-th-num">FA2</th>
                <th className="gbc-th-num">Half Yr</th>
                <th className="gbc-th-num">FA3</th>
                <th className="gbc-th-num">FA4</th>
                <th className="gbc-th-num">Annual</th>
                <th className="gbc-th-num">Int</th>
                <th className="gbc-th-num">Overall</th>
                <th className="gbc-th-num">Grade</th>
                <th className="gbc-th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, idx) => {
                const m = row.matrix;
                const overallTone =
                  m.overall != null && m.overall >= 90 ? 'high' : m.overall != null && m.overall < PASS_PCT ? 'low' : '';
                return (
                  <tr
                    key={row.id}
                    className="gbc-tr"
                    onClick={(e) => {
                      if (e.target.closest('button')) return;
                      openStudent(row.name);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openStudent(row.name);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <td className="gbc-td-roll">{row.rollNo}</td>
                    <td>
                      <div className="gbc-name-cell">
                        <div className={`gbc-avatar gbc-avatar--${idx % 3}`}>{initialsFromName(row.name)}</div>
                        <span className="gbc-name">{row.name}</span>
                      </div>
                    </td>
                    <td className="gbc-td-num">{formatCell(m.fa1)}</td>
                    <td className="gbc-td-num">{formatCell(m.fa2)}</td>
                    <td className="gbc-td-num">{formatCell(m.halfYr)}</td>
                    <td className="gbc-td-num">{formatCell(m.fa3)}</td>
                    <td className="gbc-td-num">{formatCell(m.fa4)}</td>
                    <td className="gbc-td-num">{formatCell(m.annual)}</td>
                    <td className="gbc-td-num">{formatIntCell(m.int)}</td>
                    <td className={`gbc-td-num gbc-td-overall ${overallTone}`}>
                      {m.overall != null ? `${m.overall}%` : '—'}
                    </td>
                    <td className="gbc-td-num">
                      <GradeLetterBadge letter={m.gradeLetter} />
                    </td>
                    <td className="gbc-td-action">
                      <button
                        type="button"
                        className="gbc-more"
                        aria-label={`Actions for ${row.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openStudent(row.name);
                        }}
                      >
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {tableSource.length === 0 && loadStatus !== 'loading' && (
          <p className="gbc-empty">No students match this view.</p>
        )}

        {tableSource.length > 0 && (
          <footer className="gbc-pagination">
            <p className="gbc-page-summary">
              Showing <strong>{showFrom}</strong>-<strong>{showTo}</strong> of <strong>{tableSource.length}</strong>{' '}
              students
            </p>
            <div className="gbc-page-btns">
              <button
                type="button"
                className="gbc-page-nav"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {pageButtonRange.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`gbc-page-num ${p === safePage ? 'is-current' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              {pageCount > 5 && pageButtonRange[pageButtonRange.length - 1] < pageCount && (
                <>
                  <span className="gbc-page-ellipsis">…</span>
                  <button type="button" className="gbc-page-num" onClick={() => setPage(pageCount)}>
                    {pageCount}
                  </button>
                </>
              )}
              <button
                type="button"
                className="gbc-page-nav"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                aria-label="Next page"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
