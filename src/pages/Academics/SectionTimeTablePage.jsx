import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { getSectionContext, getSectionNavTitle } from './classSectionRegistry';
import './SectionTimeTablePage.scss';

const ACADEMIC_YEAR = '2024-25';
const LIST_BASE = '/academics/time-table';

const DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
];

const PERIOD_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8'];

const LUNCH_AFTER_INDEX = 3;

const SUBJECT_POOL = [
  { code: 'MATH', name: 'Mathematics', legend: 'Math', room: '101', accent: 'var(--primary)' },
  { code: 'ENG', name: 'English', legend: 'Eng', room: '102', accent: '#4caf50' },
  { code: 'SCI', name: 'Science', legend: 'Sci', room: 'Lab-1', accent: '#009688' },
  { code: 'SOC', name: 'Social Studies', legend: 'Soc', room: '103', accent: '#795548' },
  { code: 'HIN', name: 'Hindi', legend: 'Hin', room: '104', accent: '#ff9800' },
  { code: 'COMP', name: 'Computers', legend: 'Comp', room: 'Lab-2', accent: '#3f51b5' },
  { code: 'PE', name: 'PE', field: 'Ground', legend: 'PE', accent: '#f44336' },
  { code: 'ART', name: 'Art', legend: 'Art', room: '105', accent: '#e91e63' },
  { code: 'MUS', name: 'Music', legend: 'Mus', room: '106', accent: '#9c27b0' },
  { code: 'LIB', name: 'Library', legend: 'Lib', room: 'Lib', accent: '#ffc107' },
];

const TEACHER_POOL = [
  'Ms. Sarah',
  'Mr. James',
  'Ms. Meena',
  'Dr. Peterson',
  'Ms. Elena',
  'Mr. Robert',
  'Ms. Clara',
  'Mr. Alan',
  'Coach Sam',
  'Mr. Henry',
];

const PERIOD_TIME_LABEL = {
  0: '09:00 AM',
  1: '10:00 AM',
  2: '11:00 AM',
  4: '01:15 PM',
  5: '02:15 PM',
  6: '03:15 PM',
  7: '04:15 PM',
};

/** Period column copy in edit modal (aligned with grid row order, excluding lunch). */
const EDIT_PERIOD_META = {
  0: { range: '08:30 – 09:30', tag: 'Morning Session' },
  1: { range: '09:30 – 10:30', tag: 'Core Learning' },
  2: { range: '10:30 – 11:30', tag: 'Extension' },
  4: { range: '01:15 – 02:15', tag: 'Afternoon Session' },
  5: { range: '02:15 – 03:15', tag: 'Afternoon Session' },
  6: { range: '03:15 – 04:15', tag: 'Activity Slot' },
  7: { range: '04:15 – 05:15', tag: 'Final Session' },
};

function slotFor(dayIndex, periodIndex) {
  if (periodIndex === LUNCH_AFTER_INDEX) {
    return { type: 'break', label: 'Lunch' };
  }
  const idx =
    (dayIndex * 7 + periodIndex + (periodIndex > LUNCH_AFTER_INDEX ? -1 : 0)) % SUBJECT_POOL.length;
  return { type: 'class', ...SUBJECT_POOL[idx] };
}

function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h);
}

function teacherFor(dayKey, subjectName) {
  return TEACHER_POOL[hashStr(`${dayKey}|${subjectName}`) % TEACHER_POOL.length];
}

function teachingOrdinal(periodIndex) {
  if (periodIndex < LUNCH_AFTER_INDEX) return periodIndex + 1;
  return periodIndex;
}

function ordinalSuffix(n) {
  const j = n % 10;
  const k = n % 100;
  if (j === 1 && k !== 11) return `${n}st`;
  if (j === 2 && k !== 12) return `${n}nd`;
  if (j === 3 && k !== 13) return `${n}rd`;
  return `${n}th`;
}

function createDefaultDraft() {
  return DAYS.map((day, dIdx) =>
    PERIOD_LABELS.map((_, pIdx) => {
      if (pIdx === LUNCH_AFTER_INDEX) return { kind: 'lunch' };
      const s = slotFor(dIdx, pIdx);
      return {
        kind: 'filled',
        code: s.code,
        teacher: teacherFor(day.key, s.name),
      };
    }),
  );
}

function cloneDraft(d) {
  return JSON.parse(JSON.stringify(d));
}

function buildDisplaySlots(savedDraft) {
  return DAYS.map((_, dIdx) =>
    PERIOD_LABELS.map((_, pIdx) => {
      if (pIdx === LUNCH_AFTER_INDEX) return { type: 'break' };
      if (!savedDraft) {
        const s = slotFor(dIdx, pIdx);
        return { type: 'class', slot: s, teacher: teacherFor(DAYS[dIdx].key, s.name) };
      }
      const c = savedDraft[dIdx][pIdx];
      if (!c || c.kind === 'empty') return { type: 'empty' };
      const sub = SUBJECT_POOL.find((x) => x.code === c.code) || SUBJECT_POOL[0];
      return {
        type: 'class',
        slot: sub,
        teacher: (c.teacher || '').trim() || teacherFor(DAYS[dIdx].key, sub.name),
      };
    }),
  );
}

function SlotCard({ display }) {
  if (display.type === 'break') return null;
  if (display.type === 'empty') {
    return (
      <div className="sec-tt-slot sec-tt-slot--free">
        <span className="sec-tt-slot-free-label">Free period</span>
      </div>
    );
  }
  const { slot, teacher } = display;
  return (
    <div className="sec-tt-slot" style={{ borderLeftColor: slot.accent }}>
      <span className="sec-tt-slot-subject">{slot.name}</span>
      <div className="sec-tt-slot-teacher">
        <span className="material-symbols-outlined">person</span>
        <span>{teacher}</span>
      </div>
    </div>
  );
}

export const SectionTimeTablePage = () => {
  const { sectionId: sectionIdParam } = useParams();
  const sectionId = sectionIdParam ? decodeURIComponent(sectionIdParam) : '';

  const ctx = useMemo(() => getSectionContext(sectionId), [sectionId]);
  const navTitle = useMemo(() => getSectionNavTitle(sectionId), [sectionId]);
  usePageTitle(`Time Table — ${navTitle}`);

  const [savedDraft, setSavedDraft] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState(null);

  const displaySlots = useMemo(() => buildDisplaySlots(savedDraft), [savedDraft]);

  const legendItems = useMemo(() => {
    const seen = new Map();
    for (let d = 0; d < DAYS.length; d += 1) {
      for (let p = 0; p < PERIOD_LABELS.length; p += 1) {
        const disp = displaySlots[d][p];
        if (disp.type === 'class' && !seen.has(disp.slot.code)) {
          seen.set(disp.slot.code, {
            code: disp.slot.code,
            legend: disp.slot.legend || disp.slot.code,
            accent: disp.slot.accent,
          });
        }
      }
    }
    return [...seen.values()].sort((a, b) => a.code.localeCompare(b.code));
  }, [displaySlots]);

  useEffect(() => {
    if (!isEditOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isEditOpen]);

  const openEdit = () => {
    setEditDraft(cloneDraft(savedDraft ?? createDefaultDraft()));
    setIsEditOpen(true);
  };

  const saveEdit = () => {
    setSavedDraft(cloneDraft(editDraft));
    setIsEditOpen(false);
  };

  const cancelEdit = () => {
    setIsEditOpen(false);
  };

  const updateCell = (dIdx, pIdx, patch) => {
    setEditDraft((prev) => {
      const next = cloneDraft(prev);
      const cur = next[dIdx][pIdx];
      if (cur.kind === 'lunch') return prev;
      next[dIdx][pIdx] = { ...cur, ...patch };
      return next;
    });
  };

  const clearCell = (dIdx, pIdx) => {
    setEditDraft((prev) => {
      const next = cloneDraft(prev);
      next[dIdx][pIdx] = { kind: 'empty' };
      return next;
    });
  };

  const addCell = (dIdx, pIdx) => {
    setEditDraft((prev) => {
      const next = cloneDraft(prev);
      const sub = SUBJECT_POOL[0];
      next[dIdx][pIdx] = {
        kind: 'filled',
        code: sub.code,
        teacher: '',
      };
      return next;
    });
  };

  if (!ctx) {
    return <Navigate to={LIST_BASE} replace />;
  }

  const classLine = ctx.classLabel || navTitle;
  const sectionLine = `Section ${ctx.sectionLetter}`;

  const teachingRowIndices = PERIOD_LABELS.map((_, i) => i).filter((i) => i !== LUNCH_AFTER_INDEX);

  return (
    <div className="sec-tt-page">
      <nav className="sec-tt-crumb" aria-label="Breadcrumb">
        <Link to={LIST_BASE}>Academics</Link>
        <span className="material-symbols-outlined">chevron_right</span>
        <Link to={LIST_BASE}>Time Table</Link>
        <span className="material-symbols-outlined">chevron_right</span>
        <span className="current">{navTitle}</span>
      </nav>

      <header className="sec-tt-head">
        <div>
          <p className="sec-tt-eyebrow">Weekly schedule</p>
          <h1 className="sec-tt-title">Time Table — {navTitle}</h1>
          <p className="sec-tt-sub">
            Section {ctx.sectionLetter} · {ctx.totalStudentsInClass} students in class
          </p>
        </div>
        <div className="sec-tt-head-aside">
          <button type="button" className="sec-tt-edit-trigger" onClick={openEdit}>
            <span className="material-symbols-outlined">edit</span>
            Edit schedule
          </button>
          <p className="sec-tt-year">
            <span>Academic Year {ACADEMIC_YEAR}</span>
          </p>
        </div>
      </header>

      <div className="sec-tt-legend">
        <span className="material-symbols-outlined" aria-hidden>
          calendar_month
        </span>
        <p>
          Timetable below is a sample layout for this section. Adjust periods and subjects when your scheduling
          module is connected.
        </p>
      </div>

      <div className="sec-tt-grid-shell">
        <div className="sec-tt-grid-head sec-tt-timetable-grid" role="row">
          <div className="sec-tt-grid-head-cell sec-tt-grid-head-cell--period">Period</div>
          {DAYS.map((d) => (
            <div key={d.key} className="sec-tt-grid-head-cell sec-tt-grid-head-cell--day">
              {d.label}
            </div>
          ))}
        </div>

        <div className="sec-tt-grid-body">
          {PERIOD_LABELS.map((_, pIdx) => {
            if (pIdx === LUNCH_AFTER_INDEX) {
              return (
                <div key="lunch" className="sec-tt-lunch-row">
                  <span className="material-symbols-outlined" aria-hidden>
                    restaurant
                  </span>
                  <span>Lunch Break · 12:30–1:15 PM</span>
                </div>
              );
            }

            const ord = teachingOrdinal(pIdx);
            const timeLabel = PERIOD_TIME_LABEL[pIdx] ?? `${8 + pIdx}:00 AM`;

            return (
              <div key={`row-${pIdx}`} className="sec-tt-period-row sec-tt-timetable-grid">
                <div className="sec-tt-period-col">
                  <span className="sec-tt-period-time">{timeLabel}</span>
                  <span className="sec-tt-period-ordinal">{ordinalSuffix(ord)} Period</span>
                </div>
                {DAYS.map((d, dIdx) => {
                  const display = displaySlots[dIdx][pIdx];
                  return (
                    <div key={`${d.key}-${pIdx}`} className="sec-tt-day-cell">
                      <SlotCard display={display} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {legendItems.length > 0 && (
        <div className="sec-tt-subject-legend">
          <h3 className="sec-tt-subject-legend-title">Subject color legend</h3>
          <ul className="sec-tt-subject-legend-list">
            {legendItems.map((item) => (
              <li key={item.code} className="sec-tt-subject-legend-item">
                <span className="sec-tt-subject-legend-dot" style={{ background: item.accent }} />
                <span className="sec-tt-subject-legend-name">{item.legend}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isEditOpen && editDraft && (
        <div className="sec-tt-edit-overlay" role="dialog" aria-modal="true" aria-labelledby="sec-tt-edit-title">
          <div className="sec-tt-edit-panel">
            <header className="sec-tt-edit-topbar">
              <div className="sec-tt-edit-topbar-main">
                <div className="sec-tt-edit-icon-wrap" aria-hidden>
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
                <div>
                  <h2 className="sec-tt-edit-topbar-title">
                    {navTitle}
                  </h2>
                  <p className="sec-tt-edit-topbar-meta">Academic Year {ACADEMIC_YEAR}</p>
                </div>
              </div>
              <div className="sec-tt-edit-topbar-actions">
                <button type="button" className="sec-tt-edit-btn sec-tt-edit-btn--primary" onClick={saveEdit}>
                  Save Changes
                </button>
                <button type="button" className="sec-tt-edit-btn sec-tt-edit-btn--ghost" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </header>

            <div className="sec-tt-edit-crumb">
              <Link to={LIST_BASE} onClick={cancelEdit}>
                Academics
              </Link>
              <span className="material-symbols-outlined">chevron_right</span>
              <Link to={LIST_BASE} onClick={cancelEdit}>
                Time Table
              </Link>
              <span className="material-symbols-outlined">chevron_right</span>
              <span className="sec-tt-edit-crumb-current">{navTitle} · Edit</span>
            </div>

            <div className="sec-tt-edit-intro">
              <h1 id="sec-tt-edit-title" className="sec-tt-edit-h1">
                Edit Timetable Detail
              </h1>
              <p className="sec-tt-edit-lede">
                Manage weekly schedules, subjects, and assigned faculty for {classLine} — {sectionLine}.
              </p>
              <div className="sec-tt-edit-banner">
                <span className="material-symbols-outlined" aria-hidden>
                  info
                </span>
                <div>
                  <span className="sec-tt-edit-banner-title">Drafting Mode Active</span>
                  <p className="sec-tt-edit-banner-text">
                    Changes apply to this view after you click &quot;Save Changes&quot;. Cancel discards edits for this
                    session.
                  </p>
                </div>
              </div>
            </div>

            <div className="sec-tt-edit-table-wrap timetable-scroll">
              <table className="sec-tt-edit-table">
                <thead>
                  <tr>
                    <th className="sec-tt-edit-th sec-tt-edit-th--period">Period</th>
                    {DAYS.map((d) => (
                      <th key={d.key} className="sec-tt-edit-th">
                        {d.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {teachingRowIndices.map((pIdx) => {
                    const meta = EDIT_PERIOD_META[pIdx] || {
                      range: PERIOD_TIME_LABEL[pIdx] || `Period ${pIdx + 1}`,
                      tag: 'Session',
                    };
                    return (
                      <tr key={`edit-${pIdx}`}>
                        <td className="sec-tt-edit-td sec-tt-edit-td--period">
                          <span className="sec-tt-edit-range">{meta.range}</span>
                          <span className="sec-tt-edit-tag">{meta.tag}</span>
                        </td>
                        {DAYS.map((d, dIdx) => {
                          const cell = editDraft[dIdx][pIdx];
                          if (cell.kind === 'empty') {
                            return (
                              <td key={`${d.key}-${pIdx}`} className="sec-tt-edit-td">
                                <button
                                  type="button"
                                  className="sec-tt-edit-add"
                                  onClick={() => addCell(dIdx, pIdx)}
                                >
                                  <span className="material-symbols-outlined">add_circle</span>
                                  <span>Add Period</span>
                                </button>
                              </td>
                            );
                          }
                          return (
                            <td key={`${d.key}-${pIdx}`} className="sec-tt-edit-td sec-tt-edit-td--slot">
                              <button
                                type="button"
                                className="sec-tt-edit-clear"
                                aria-label="Clear slot"
                                onClick={() => clearCell(dIdx, pIdx)}
                              >
                                <span className="material-symbols-outlined">close</span>
                              </button>
                              <div className="sec-tt-edit-fields">
                                <select
                                  className="sec-tt-edit-select"
                                  value={cell.code}
                                  onChange={(e) => updateCell(dIdx, pIdx, { code: e.target.value, kind: 'filled' })}
                                >
                                  {SUBJECT_POOL.map((s) => (
                                    <option key={s.code} value={s.code}>
                                      {s.name}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  className="sec-tt-edit-input"
                                  type="text"
                                  placeholder="Teacher name"
                                  value={cell.teacher}
                                  onChange={(e) => updateCell(dIdx, pIdx, { teacher: e.target.value })}
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <tr className="sec-tt-edit-tr-lunch">
                    <td className="sec-tt-edit-td sec-tt-edit-td--period">
                      <span className="sec-tt-edit-range">12:30 – 01:15 PM</span>
                    </td>
                    <td className="sec-tt-edit-td sec-tt-edit-td-lunch" colSpan={5}>
                      <div className="sec-tt-edit-lunch-inner">
                        <span className="material-symbols-outlined">restaurant</span>
                        Lunch Break
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="sec-tt-edit-extras">
              <div className="sec-tt-edit-extras-head">
                <span className="material-symbols-outlined">edit_note</span>
                <h3>Edit Slot Details</h3>
              </div>
              <div className="sec-tt-edit-extras-grid">
                <div className="sec-tt-edit-extras-col">
                  <label className="sec-tt-edit-label">Default Faculty Assignment</label>
                  <div className="sec-tt-edit-notebox">
                    <p>
                      Changes made in the grid above stay on this device until a scheduling API is connected. Saved
                      drafts update the section timetable view immediately.
                    </p>
                  </div>
                </div>
                <div className="sec-tt-edit-extras-col">
                  <label className="sec-tt-edit-label">Recurrence Rule</label>
                  <div className="sec-tt-edit-recur-row">
                    <div className="sec-tt-edit-recur-pill">
                      <span>Weekly Recurrence</span>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    </div>
                    <button type="button" className="sec-tt-edit-gear" aria-label="Recurrence settings">
                      <span className="material-symbols-outlined">settings</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
