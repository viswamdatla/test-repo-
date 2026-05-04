import React, { useMemo } from 'react';
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

const SUBJECT_POOL = [
  { code: 'MATH', name: 'Mathematics', room: '101' },
  { code: 'ENG', name: 'English', room: '102' },
  { code: 'SCI', name: 'Science', room: 'Lab-1' },
  { code: 'SOC', name: 'Social Studies', room: '103' },
  { code: 'HIN', name: 'Hindi', room: '104' },
  { code: 'COMP', name: 'Computers', room: 'Lab-2' },
  { code: 'PE', name: 'Physical Ed.', field: 'Ground' },
  { code: 'ART', name: 'Art', room: '105' },
  { code: 'MUS', name: 'Music', room: '106' },
  { code: 'LIB', name: 'Library', room: 'Lib' },
];

function slotFor(dayIndex, periodIndex) {
  const lunchAfter = 3;
  if (periodIndex === lunchAfter) {
    return { type: 'break', label: 'Lunch' };
  }
  const idx = (dayIndex * 7 + periodIndex + (periodIndex > lunchAfter ? -1 : 0)) % SUBJECT_POOL.length;
  return { type: 'class', ...SUBJECT_POOL[idx] };
}

export const SectionTimeTablePage = () => {
  const { sectionId: sectionIdParam } = useParams();
  const sectionId = sectionIdParam ? decodeURIComponent(sectionIdParam) : '';

  const ctx = useMemo(() => getSectionContext(sectionId), [sectionId]);
  const navTitle = useMemo(() => getSectionNavTitle(sectionId), [sectionId]);
  usePageTitle(`Time Table — ${navTitle}`);

  const grid = useMemo(() => {
    return DAYS.map((day, dIdx) =>
      PERIOD_LABELS.map((_, pIdx) => ({
        period: pIdx + 1,
        slot: slotFor(dIdx, pIdx),
      })),
    );
  }, []);

  if (!ctx) {
    return <Navigate to={LIST_BASE} replace />;
  }

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
          <p className="sec-tt-sub">Section {ctx.sectionLetter} · {ctx.totalStudentsInClass} students in class</p>
        </div>
        <p className="sec-tt-year">
          <span>Academic Year {ACADEMIC_YEAR}</span>
        </p>
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

      <div className="sec-tt-table-wrap">
        <div className="sec-tt-table-scroll">
          <table className="sec-tt-grid">
            <thead>
              <tr>
                <th className="sec-tt-th sec-tt-th--corner">Period</th>
                {DAYS.map((d) => (
                  <th key={d.key} className="sec-tt-th">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIOD_LABELS.map((label, pIdx) => (
                <tr key={label}>
                  <td className="sec-tt-td sec-tt-td--period">
                    <span className="sec-tt-period-num">{label}</span>
                    <span className="sec-tt-period-meta">
                      {pIdx === 3 ? '12:30–1:15' : `${8 + pIdx}:00`}
                    </span>
                  </td>
                  {DAYS.map((d, dIdx) => {
                    const cell = grid[dIdx][pIdx].slot;
                    return (
                      <td key={`${d.key}-${label}`} className="sec-tt-td">
                        {cell.type === 'break' ? (
                          <div className="sec-tt-cell sec-tt-cell--break">
                            <span className="material-symbols-outlined">restaurant</span>
                            <span>{cell.label}</span>
                          </div>
                        ) : (
                          <div className="sec-tt-cell sec-tt-cell--subject">
                            <span className="sec-tt-subject-code">{cell.code}</span>
                            <span className="sec-tt-subject-name">{cell.name}</span>
                            <span className="sec-tt-subject-room">{cell.room || cell.field}</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
