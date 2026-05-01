import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  buildCourseRows,
  computeGpa,
  filterSectionGrades,
  letterToGpaPoints,
  scoreToLetter,
} from './studentGradesViewModel';
import './studentManagement/StudentManagementFlow.scss';
import './GradesLogPage.scss';

const PAGE_SIZE = 8;
const ACADEMIC_YEAR = '2024-25';
const PASS_PCT = 40;

const GRADE_FILTERS = [
  { id: 'all', label: 'All Students' },
  { id: 'published', label: 'Published' },
  { id: 'pending', label: 'Pending' },
  { id: 'atRisk', label: 'At risk' },
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

function RecordsStatusPill({ gradeCount, hasPending, allPublished }) {
  if (gradeCount === 0) {
    return (
      <span className="sm-pill gl-pill-records gl-pill-records--muted">
        <span className="material-symbols-outlined sm-pill-ic">help</span>
        No marks yet
      </span>
    );
  }
  if (hasPending) {
    return (
      <span className="sm-pill gl-pill-records gl-pill-records--pending">
        <span className="material-symbols-outlined sm-pill-ic" style={{ fontVariationSettings: "'FILL' 1" }}>
          pending
        </span>
        Pending review
      </span>
    );
  }
  if (allPublished) {
    return (
      <span className="sm-pill gl-pill-records gl-pill-records--ok">
        <span className="material-symbols-outlined sm-pill-ic" style={{ fontVariationSettings: "'FILL' 1" }}>
          check_circle
        </span>
        Published
      </span>
    );
  }
  return (
    <span className="sm-pill gl-pill-records gl-pill-records--muted">
      <span className="material-symbols-outlined sm-pill-ic">edit_note</span>
      In progress
    </span>
  );
}

function ResultPill({ avgPct }) {
  if (avgPct == null) {
    return <span className="sm-pill sm-pill-plain gl-pill-result gl-pill-result--muted">—</span>;
  }
  if (avgPct >= PASS_PCT) {
    return <span className="sm-pill sm-pill-plain gl-pill-result gl-pill-result--pass">Pass</span>;
  }
  return <span className="sm-pill sm-pill-plain gl-pill-result gl-pill-result--risk">At risk</span>;
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
  const headCheckboxRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState({});

  const allClasses = useMemo(() => flattenAllClassNames(structure), [structure]);
  const classLevel = slugToClassLevel(classSlug, allClasses);
  const stage = useMemo(
    () => (classLevel ? resolveStageForClass(structure, classLevel) : null),
    [structure, classLevel]
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
    [grades, stage, classLevel, section]
  );

  const roster = useMemo(() => {
    return students.filter(
      (s) => s.stage === stage && s.classLevel === classLevel && (s.section || '') === section
    );
  }, [students, stage, classLevel, section]);

  const gradeRows = useMemo(() => {
    const byName = new Map(roster.map((s) => [s.name, s]));
    const names = new Set([...roster.map((s) => s.name), ...sectionGrades.map((g) => g.student)]);

    return [...names]
      .sort((a, b) => a.localeCompare(b))
      .map((name) => {
        const stu = byName.get(name);
        const sg = sectionGrades.filter((g) => g.student === name);
        const courseRows = buildCourseRows(sg, 'finalTerm');
        let avgPct =
          courseRows.length > 0
            ? courseRows.reduce((acc, r) => acc + r.totalPct, 0) / courseRows.length
            : null;
        if (avgPct == null && sg.length > 0) {
          avgPct = sg.reduce((acc, g) => acc + Number(g.score), 0) / sg.length;
        }
        let gpa = computeGpa(courseRows);
        if (gpa == null && avgPct != null) {
          gpa = letterToGpaPoints(scoreToLetter(avgPct));
        }
        const gpaDisplay = gpa != null ? gpa.toFixed(2) : '—';
        const hasPending = sg.some((g) => String(g.status || '').toLowerCase() === 'pending');
        const allPublished =
          sg.length > 0 && sg.every((g) => String(g.status || '').toLowerCase() === 'published');

        return {
          id: stu?.id ?? `grade:${name}`,
          name,
          rollNo: stu?.rollNo || stu?.admissionNo || '—',
          guardian: stu?.guardian || '—',
          avgPct,
          gpaDisplay,
          gradeCount: sg.length,
          hasPending,
          allPublished,
        };
      });
  }, [roster, sectionGrades]);

  const rosterStats = useMemo(() => {
    const total = gradeRows.length;
    const pendingMarks = gradeRows.filter((r) => r.hasPending).length;
    const avgs = gradeRows.map((r) => r.avgPct).filter((x) => x != null);
    const classAvg = avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : null;
    const atRisk = gradeRows.filter((r) => r.avgPct != null && r.avgPct < PASS_PCT).length;
    return { total, pendingMarks, classAvg, atRisk };
  }, [gradeRows]);

  const tableSource = useMemo(() => {
    let rows = gradeRows;
    if (gradeFilter === 'published') {
      rows = rows.filter((r) => r.gradeCount > 0 && !r.hasPending);
    } else if (gradeFilter === 'pending') {
      rows = rows.filter((r) => r.hasPending);
    } else if (gradeFilter === 'atRisk') {
      rows = rows.filter((r) => r.avgPct != null && r.avgPct < PASS_PCT);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          String(r.rollNo || '')
            .toLowerCase()
            .includes(q)
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

  useEffect(() => {
    setSelectedIds({});
  }, [gradeFilter, searchQuery, classSlug, sectionSlug]);

  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selectedIds[r.id]);
  const somePageSelected = pageRows.some((r) => selectedIds[r.id]);

  useEffect(() => {
    const el = headCheckboxRef.current;
    if (el) el.indeterminate = somePageSelected && !allPageSelected;
  }, [somePageSelected, allPageSelected]);

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const toggleSelectAllPage = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = { ...prev };
        pageRows.forEach((r) => {
          delete next[r.id];
        });
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = { ...prev };
        pageRows.forEach((r) => {
          next[r.id] = true;
        });
        return next;
      });
    }
  };

  const selectedStudents = useMemo(
    () => gradeRows.filter((r) => selectedIds[r.id]),
    [gradeRows, selectedIds]
  );
  const selectedCount = selectedStudents.length;

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

  if (!stage || !validClass || !section) return null;

  return (
    <div className="sm-roster-page grades-log-page">
      <div className="sm-roster-toolbar-top">
        <button type="button" className="sm-back" onClick={() => navigate(`${wizardBase}/${classSlug}`)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Sections
        </button>
      </div>

      <header className="sm-roster-page-head">
        <div>
          <h1 className="sm-roster-title">
            {classLevel} — Section {section}
          </h1>
          <p className="sm-roster-year">
            <span className="material-symbols-outlined sm-roster-year-ic">calendar_month</span>
            Academic Year {ACADEMIC_YEAR}
          </p>
        </div>
      </header>

      {loadStatus === 'loading' && <p className="sm-loading">Loading grades…</p>}

      <div className="sm-roster-stats">
        <div className="sm-roster-stat sm-roster-stat-wide">
          <span className="sm-roster-stat-kicker">Grade overview</span>
          <h2 className="sm-roster-stat-title">Class performance</h2>
          <div className="sm-roster-stat-legend">
            <div className="sm-roster-legend-item">
              <span className="sm-roster-dot sm-roster-dot-primary" />
              <span className="sm-roster-legend-text">{rosterStats.total} Total students</span>
            </div>
            <div className="sm-roster-legend-item">
              <span className="sm-roster-dot sm-roster-dot-tertiary" />
              <span className="sm-roster-legend-text">{rosterStats.pendingMarks} Pending marks</span>
            </div>
          </div>
        </div>
        <div className="sm-roster-stat sm-roster-stat-primary">
          <span className="material-symbols-outlined sm-roster-stat-icon">school</span>
          <h3 className="sm-roster-stat-value">
            {rosterStats.classAvg != null ? `${rosterStats.classAvg.toFixed(0)}%` : '—'}
          </h3>
          <p className="sm-roster-stat-caption">Class average</p>
        </div>
        <div className="sm-roster-stat sm-roster-stat-wallet">
          <span className="material-symbols-outlined sm-roster-stat-icon">warning</span>
          <h3 className="sm-roster-stat-value">{rosterStats.atRisk}</h3>
          <p className="sm-roster-stat-caption">Below passing ({PASS_PCT}%)</p>
        </div>
      </div>

      <div className="sm-roster-filters">
        <div className="sm-roster-search-wrap">
          <span className="material-symbols-outlined sm-roster-search-ic">search</span>
          <input
            type="search"
            className="sm-roster-search-input"
            placeholder="Search student name or roll number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search students"
          />
        </div>
        <div className="sm-roster-pills">
          {GRADE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`sm-roster-filter-pill ${gradeFilter === f.id ? 'active' : ''}`}
              onClick={() => setGradeFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
          <span className="sm-roster-pills-divider" aria-hidden />
          <button type="button" className="sm-roster-filter-icon" title="More filters" aria-label="More filters">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      <div className="sm-roster-table-card">
        <div className="sm-roster-table-scroll">
          <table className="sm-roster-table">
            <thead>
              <tr>
                <th className="sm-roster-th-check">
                  <input
                    ref={headCheckboxRef}
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAllPage}
                    aria-label="Select all on this page"
                  />
                </th>
                <th>Student name</th>
                <th>Roll no</th>
                <th>Overall %</th>
                <th>GPA</th>
                <th>Records</th>
                <th>Result</th>
                <th className="sm-roster-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="sm-roster-tr grades-log-student-row"
                  onClick={(e) => {
                    if (e.target.closest('input, button')) return;
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
                  <td>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedIds[row.id])}
                      onChange={() => toggleRow(row.id)}
                      aria-label={`Select ${row.name}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td>
                    <div className="sm-roster-student-cell">
                      <div className={`sm-roster-avatar sm-roster-avatar-${idx % 3}`}>{initialsFromName(row.name)}</div>
                      <div>
                        <span className="sm-roster-name-link grades-log-name">{row.name}</span>
                        <p className="sm-roster-guardian">Guardian: {row.guardian}</p>
                      </div>
                    </div>
                  </td>
                  <td className="sm-roster-td-muted">{row.rollNo}</td>
                  <td className="sm-roster-td-muted">
                    {row.avgPct != null ? `${row.avgPct.toFixed(1)}%` : '—'}
                  </td>
                  <td className="sm-roster-td-muted">{row.gpaDisplay}</td>
                  <td>
                    <RecordsStatusPill
                      gradeCount={row.gradeCount}
                      hasPending={row.hasPending}
                      allPublished={row.allPublished}
                    />
                  </td>
                  <td>
                    <ResultPill avgPct={row.avgPct} />
                  </td>
                  <td className="sm-roster-td-actions">
                    <button
                      type="button"
                      className="sm-roster-more"
                      aria-label={`Open grades for ${row.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        openStudent(row.name);
                      }}
                    >
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tableSource.length === 0 && loadStatus !== 'loading' && (
          <p className="sm-empty-hint sm-roster-empty">No students match this view.</p>
        )}
        {tableSource.length > 0 && (
          <div className="sm-roster-pagination">
            <p className="sm-roster-page-summary">
              Showing <strong>{showFrom}</strong>-<strong>{showTo}</strong> of{' '}
              <strong>{tableSource.length}</strong> students
            </p>
            <div className="sm-roster-page-btns">
              <button
                type="button"
                className="sm-roster-page-nav"
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
                  className={`sm-roster-page-num ${p === safePage ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="sm-roster-page-nav"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                aria-label="Next page"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="sm-roster-float">
          <div className="sm-roster-float-bubble">
            <div className="sm-roster-float-avatars">
              {selectedStudents.slice(0, 3).map((s, i) => (
                <span key={s.id} className={`sm-roster-float-av sm-roster-avatar-${i % 3}`}>
                  {initialsFromName(s.name)}
                </span>
              ))}
            </div>
            <p className="sm-roster-float-text">
              {selectedCount} student{selectedCount === 1 ? '' : 's'} selected for reports
            </p>
          </div>
          <button
            type="button"
            className="sm-roster-cta"
            onClick={() =>
              window.alert(
                `Generate report cards for ${selectedCount} student${selectedCount === 1 ? '' : 's'} (demo).`
              )
            }
          >
            Generate report cards
            <span className="material-symbols-outlined sm-roster-cta-ic">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
};
