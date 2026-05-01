import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  fetchAcademicsData,
  saveAttendanceMarks,
  selectAcademicsStructure,
  selectAcademicsSectionItems,
  selectAcademicsStatus,
  selectClassSections,
} from '../../store/academics/academicsSlice';
import {
  flattenAllClassNames,
  resolveStageForClass,
  sectionFromSlug,
  slugToClassLevel,
} from './studentManagement/studentManagementConfig';
import { useAcademicsWizardMeta } from './wizard/useAcademicsWizardMeta';
import './studentManagement/StudentManagementFlow.scss';
import './AttendanceLogPage.scss';

const SESSION_LABEL = 'Academic Session 2023-2024 • Semester 1';
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'English Literature',
  'Computer Science',
];

const hashStr = (s) => {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) h = (h * 33) ^ s.charCodeAt(i);
  return Math.abs(h);
};

const parseRecordDate = (dateStr) => {
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;

const localDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const tallyBucket = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'present') return 'present';
  if (s === 'late') return 'late';
  if (s === 'absent') return 'absent';
  if (s === 'leave') return 'leave';
  if (s === 'sick') return 'sick';
  return 'other';
};

const dominantDayDot = (counts) => {
  if (!counts) return 'none';
  const p = counts.present + counts.late;
  const { absent, leave, sick } = counts;
  const sk = sick || 0;
  if (sk >= p && sk >= absent && sk >= leave && sk > 0) return 'leave';
  if (leave >= p && leave >= absent && leave > 0) return 'leave';
  if (absent > p) return 'absent';
  if (p > 0) return 'present';
  if (leave > 0) return 'leave';
  if (absent > 0) return 'absent';
  return 'present';
};

const studentInitials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const AttendanceLogPage = () => {
  const { classSlug, sectionSlug } = useParams();
  const { wizardBase } = useOutletContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { navRootTitle } = useAcademicsWizardMeta();
  const loadStatus = useSelector(selectAcademicsStatus);
  const items = useSelector((s) => selectAcademicsSectionItems(s, 'attendance'));
  const students = useSelector((s) => selectAcademicsSectionItems(s, 'students'));
  const structure = useSelector(selectAcademicsStructure);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDate, setViewDate] = useState(() => new Date(2023, 9, 1));
  const [selectedDay, setSelectedDay] = useState(11);
  const [markMode, setMarkMode] = useState(false);
  const [markPage, setMarkPage] = useState(1);
  const [bulkAction, setBulkAction] = useState('');
  const [markSearchQuery, setMarkSearchQuery] = useState('');
  const [markDraft, setMarkDraft] = useState({});
  const [markResetNonce, setMarkResetNonce] = useState(0);

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

  const sectionRecords = useMemo(() => {
    if (!stage || !classLevel || !section) return [];
    return items.filter(
      (it) =>
        it.stage === stage &&
        it.classLevel === classLevel &&
        (it.section || '') === section
    );
  }, [items, stage, classLevel, section]);

  const sectionRoster = useMemo(() => {
    if (!stage || !classLevel || !section) return [];
    return students
      .filter(
        (s) =>
          s.stage === stage && s.classLevel === classLevel && (s.section || '') === section
      )
      .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  }, [students, stage, classLevel, section]);

  const selectedDate = useMemo(
    () => new Date(viewDate.getFullYear(), viewDate.getMonth(), selectedDay),
    [viewDate, selectedDay]
  );
  const selectedDateKey = localDateKey(selectedDate);
  const selectedDateLabel = selectedDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dailyRoll = useMemo(() => {
    const dayRecords = sectionRecords.filter((r) => {
      const d = parseRecordDate(r.date);
      return d && localDateKey(d) === selectedDateKey;
    });
    const byStudent = new Map();
    dayRecords.forEach((r) => {
      byStudent.set(String(r.student || '').trim(), r);
    });

    const present = [];
    const absent = [];
    const leave = [];
    const sick = [];
    const notMarked = [];

    sectionRoster.forEach((stu) => {
      const name = String(stu.name || '').trim();
      const rec = byStudent.get(name);
      if (!rec) {
        notMarked.push({ student: stu, record: null });
        return;
      }
      const t = tallyBucket(rec.status);
      if (t === 'present' || t === 'late') {
        present.push({ student: stu, record: rec });
      } else if (t === 'absent') {
        absent.push({ student: stu, record: rec });
      } else if (t === 'leave') {
        leave.push({ student: stu, record: rec });
      } else if (t === 'sick') {
        sick.push({ student: stu, record: rec });
      } else {
        notMarked.push({ student: stu, record: rec });
      }
    });

    const rosterNames = new Set(sectionRoster.map((s) => String(s.name || '').trim()));
    const orphanRows = dayRecords.filter((r) => !rosterNames.has(String(r.student || '').trim()));
    orphanRows.forEach((rec) => {
      const t = tallyBucket(rec.status);
      const pseudo = {
        id: rec.id,
        name: rec.student,
        admissionNo: '—',
      };
      if (t === 'present' || t === 'late') {
        present.push({ student: pseudo, record: rec });
      } else if (t === 'absent') {
        absent.push({ student: pseudo, record: rec });
      } else if (t === 'leave') {
        leave.push({ student: pseudo, record: rec });
      } else if (t === 'sick') {
        sick.push({ student: pseudo, record: rec });
      }
    });

    return {
      present,
      absent,
      leave,
      sick,
      notMarked,
      enrolled: sectionRoster.length,
      marked: present.length + absent.length + leave.length + sick.length,
    };
  }, [sectionRecords, sectionRoster, selectedDateKey]);

  const dailyDisplay = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const f = (rows) =>
      !q
        ? rows
        : rows.filter(
            ({ student }) =>
              String(student.name || '').toLowerCase().includes(q) ||
              String(student.admissionNo || '').toLowerCase().includes(q)
          );
    return {
      present: f(dailyRoll.present),
      absent: f(dailyRoll.absent),
      leave: f(dailyRoll.leave),
      sick: f(dailyRoll.sick),
      notMarked: f(dailyRoll.notMarked),
    };
  }, [dailyRoll, searchQuery]);

  const workingRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sectionRecords;
    return sectionRecords.filter((r) => String(r.student || '').toLowerCase().includes(q));
  }, [sectionRecords, searchQuery]);

  const groupedByDay = useMemo(() => {
    const m = new Map();
    workingRecords.forEach((r) => {
      const d = parseRecordDate(r.date);
      if (!d) return;
      const key = localDateKey(d);
      if (!m.has(key)) {
        m.set(key, { present: 0, late: 0, absent: 0, leave: 0, sick: 0, other: 0 });
      }
      const bucket = m.get(key);
      const t = tallyBucket(r.status);
      if (t === 'present') bucket.present += 1;
      else if (t === 'late') bucket.late += 1;
      else if (t === 'absent') bucket.absent += 1;
      else if (t === 'leave') bucket.leave += 1;
      else if (t === 'sick') bucket.sick += 1;
      else bucket.other += 1;
    });
    return m;
  }, [workingRecords]);

  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let sick = 0;
    workingRecords.forEach((r) => {
      const t = tallyBucket(r.status);
      if (t === 'present' || t === 'late') present += 1;
      else if (t === 'absent') absent += 1;
      else if (t === 'leave') leave += 1;
      else if (t === 'sick') sick += 1;
    });
    const total = present + absent + leave + sick;
    const rate = total ? Math.round((100 * present) / total) : 0;
    return { present, absent, leave, sick, rate, total };
  }, [workingRecords]);

  const subjectRows = useMemo(() => {
    const h = hashStr(`${classLevel}-${section}-${stage}`);
    return SUBJECTS.map((name, i) => ({
      name,
      pct: Math.min(100, 82 + ((h + i * 11) % 19)),
    }));
  }, [classLevel, section, stage]);

  const monthlyTrend = useMemo(() => {
    const monthBuckets = new Map();
    workingRecords.forEach((r) => {
      const d = parseRecordDate(r.date);
      if (!d) return;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthBuckets.has(key)) {
        monthBuckets.set(key, { present: 0, late: 0, absent: 0, leave: 0, sick: 0 });
      }
      const b = monthBuckets.get(key);
      const t = tallyBucket(r.status);
      if (t === 'present') b.present += 1;
      else if (t === 'late') b.late += 1;
      else if (t === 'absent') b.absent += 1;
      else if (t === 'leave') b.leave += 1;
      else if (t === 'sick') b.sick += 1;
    });
    const labels = ['JUL', 'AUG', 'SEP', 'OCT'];
    const baseYear = 2023;
    const monthsIdx = [6, 7, 8, 9];
    const out = monthsIdx.map((mi, idx) => {
      const key = `${baseYear}-${mi}`;
      const b = monthBuckets.get(key);
      let pct;
      if (b) {
        const ok = b.present + b.late;
        const t = ok + b.absent + b.leave + (b.sick || 0);
        pct = t ? Math.round((100 * ok) / t) : stats.rate;
      } else {
        pct = [92, 95, 93, stats.rate || 94][idx];
      }
      return { label: labels[idx], pct, x: idx };
    });
    return out;
  }, [workingRecords, stats.rate]);

  const calendarCells = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const first = new Date(y, m, 1);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startPad; i += 1) {
      cells.push({ type: 'empty' });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = new Date(y, m, day);
      const key = localDateKey(d);
      const counts = groupedByDay.get(key);
      let dot = 'none';
      if (counts) {
        dot = dominantDayDot(counts);
      } else if (isWeekend(d)) {
        dot = 'holiday';
      } else {
        dot = 'neutral';
      }
      cells.push({
        type: 'day',
        day,
        dot,
        isWeekend: isWeekend(d),
      });
    }
    return cells;
  }, [viewDate, groupedByDay]);

  const trendPolylinePoints = useMemo(() => {
    const w = 280;
    const h = 120;
    const pad = 12;
    const n = monthlyTrend.length;
    const denom = n > 1 ? n - 1 : 1;
    const pts = monthlyTrend.map((t, i) => {
      const x = pad + ((i * (w - pad * 2)) / denom);
      const yp = h - pad - (t.pct / 100) * (h - pad * 2);
      return `${x},${yp}`;
    });
    return { points: pts.join(' '), w, h };
  }, [monthlyTrend]);

  useEffect(() => {
    const dim = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    if (selectedDay > dim) setSelectedDay(dim);
  }, [viewDate, selectedDay]);

  useEffect(() => {
    if (!markMode || !sectionRoster.length) return;
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const day = selectedDay;
    const dateKey = localDateKey(new Date(y, m, day));
    const byStudent = new Map();
    sectionRecords.forEach((r) => {
      const pd = parseRecordDate(r.date);
      if (pd && localDateKey(pd) === dateKey) {
        byStudent.set(String(r.student || '').trim(), r);
      }
    });
    const next = {};
    sectionRoster.forEach((stu) => {
      const name = String(stu.name || '').trim();
      const rec = byStudent.get(name);
      let status = 'present';
      let remark = '';
      if (rec) {
        remark = rec.remark || '';
        const t = tallyBucket(rec.status);
        if (t === 'absent') status = 'absent';
        else if (t === 'leave') status = 'leave';
        else if (t === 'sick') status = 'sick';
        else if (t === 'late') status = 'present';
      }
      next[stu.id] = { status, remark };
    });
    setMarkDraft(next);
  }, [markMode, markResetNonce, viewDate, selectedDay, sectionRoster, sectionRecords]);

  useEffect(() => {
    if (markMode) setMarkPage(1);
  }, [markSearchQuery, markMode]);

  const markStudentsFiltered = useMemo(() => {
    const q = markSearchQuery.trim().toLowerCase();
    if (!q) return sectionRoster;
    return sectionRoster.filter(
      (s) =>
        String(s.name || '')
          .toLowerCase()
          .includes(q) ||
        String(s.email || '')
          .toLowerCase()
          .includes(q) ||
        String(s.rollNo || '')
          .toLowerCase()
          .includes(q)
    );
  }, [sectionRoster, markSearchQuery]);

  const markPageSize = 5;
  const markPageCount = Math.max(1, Math.ceil(markStudentsFiltered.length / markPageSize));

  useEffect(() => {
    if (markPage > markPageCount) setMarkPage(markPageCount);
  }, [markPage, markPageCount]);

  const markPageItems = useMemo(() => {
    const start = (markPage - 1) * markPageSize;
    return markStudentsFiltered.slice(start, start + markPageSize);
  }, [markStudentsFiltered, markPage]);

  const markSummary = useMemo(() => {
    const acc = { present: 0, absent: 0, leave: 0, sick: 0 };
    markStudentsFiltered.forEach((s) => {
      const row = markDraft[s.id];
      if (!row) return;
      if (acc[row.status] != null) acc[row.status] += 1;
    });
    return acc;
  }, [markStudentsFiltered, markDraft]);

  const markCompletionPct = useMemo(() => {
    if (markStudentsFiltered.length === 0) return 100;
    let done = 0;
    markStudentsFiltered.forEach((s) => {
      if (markDraft[s.id]?.status) done += 1;
    });
    return Math.round((100 * done) / markStudentsFiltered.length);
  }, [markStudentsFiltered, markDraft]);

  const applyBulkAttendance = () => {
    const map = {
      all_present: 'present',
      all_absent: 'absent',
      all_leave: 'leave',
      all_sick: 'sick',
    };
    const st = map[bulkAction];
    if (!st) return;
    setMarkDraft((d) => {
      const next = { ...d };
      sectionRoster.forEach((s) => {
        next[s.id] = { ...(next[s.id] || { remark: '' }), status: st, remark: next[s.id]?.remark || '' };
      });
      return next;
    });
    setBulkAction('');
  };

  const saveMarkAttendance = () => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const day = selectedDay;
    const marks = sectionRoster.map((s) => ({
      studentName: s.name,
      status: markDraft[s.id]?.status || 'present',
      remark: markDraft[s.id]?.remark || '',
    }));
    dispatch(
      saveAttendanceMarks({
        stage,
        classLevel,
        section,
        year: y,
        monthIndex: m,
        day,
        marks,
      })
    );
    setMarkMode(false);
  };

  const markDateSubtitle = selectedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const statusSelectClass = (status) => {
    const m = {
      present: 'att-mark-select--present',
      absent: 'att-mark-select--absent',
      sick: 'att-mark-select--sick',
      leave: 'att-mark-select--leave',
    };
    return `att-mark-select ${m[status] || m.present}`;
  };

  const markDateInputValue = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;

  usePageTitle(
    section && classLevel
      ? markMode
        ? `Mark Attendance — ${classLevel} · Section ${section}`
        : `${classLevel} ${section} — ${navRootTitle}`
      : navRootTitle
  );

  const monthTitle = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const shiftMonth = (delta) => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  if (!stage || !validClass || !section) return null;

  if (markMode) {
    const showingFrom = markStudentsFiltered.length === 0 ? 0 : (markPage - 1) * markPageSize + 1;
    const showingTo = Math.min(markPage * markPageSize, markStudentsFiltered.length);
    return (
      <div className="att-mark">
        <button
          type="button"
          className="att-mark-back sm-back"
          onClick={() => setMarkMode(false)}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to overview
        </button>

        <header className="att-mark-appbar">
          <div className="att-mark-appbar-titles">
            <h1 className="att-mark-appbar-title">Mark Attendance</h1>
            <p className="att-mark-appbar-sub">
              {classLevel} • Section {section} • {markDateSubtitle}
            </p>
          </div>
          <div className="att-mark-appbar-right">
            <div className="att-mark-search-wrap">
              <span className="material-symbols-outlined att-mark-search-ic">search</span>
              <input
                type="search"
                className="att-mark-search"
                placeholder="Quick search students…"
                value={markSearchQuery}
                onChange={(e) => setMarkSearchQuery(e.target.value)}
                aria-label="Search students"
              />
            </div>
            <div className="att-mark-appbar-icons">
              <button type="button" className="att-mark-icon-btn" aria-label="Notifications">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button type="button" className="att-mark-icon-btn" aria-label="Help">
                <span className="material-symbols-outlined">help</span>
              </button>
              <div className="att-mark-avatar" aria-hidden>
                {studentInitials('Admin')}
              </div>
            </div>
          </div>
        </header>

        <div className="att-mark-grid">
          <section className="att-mark-main">
            <div className="att-mark-filters">
              <div className="att-mark-filters-row">
                <div className="att-mark-field">
                  <label>Grade</label>
                  <select className="att-mark-input" disabled value={classLevel}>
                    <option value={classLevel}>{classLevel}</option>
                  </select>
                </div>
                <div className="att-mark-field">
                  <label>Section</label>
                  <select className="att-mark-input" disabled value={section}>
                    <option value={section}>Section {section}</option>
                  </select>
                </div>
                <div className="att-mark-field">
                  <label>Date</label>
                  <div className="att-mark-date-wrap">
                    <input
                      className="att-mark-input att-mark-input-date"
                      type="date"
                      value={markDateInputValue}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!v) return;
                        const [y, mo, d] = v.split('-').map(Number);
                        setViewDate(new Date(y, mo - 1, 1));
                        setSelectedDay(d);
                      }}
                    />
                    <span className="material-symbols-outlined att-mark-cal-ic">calendar_today</span>
                  </div>
                </div>
              </div>
              <div className="att-mark-filters-divider" aria-hidden />
              <div className="att-mark-bulk">
                <div className="att-mark-field att-mark-field--bulk">
                  <label>Bulk Action</label>
                  <select
                    className="att-mark-input att-mark-input--bulk"
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                  >
                    <option value="">Bulk Update Status</option>
                    <option value="all_present">Mark All Present</option>
                    <option value="all_absent">Mark All Absent</option>
                    <option value="all_leave">Mark All Leave</option>
                    <option value="all_sick">Mark All Sick</option>
                  </select>
                </div>
                <button type="button" className="att-mark-apply" onClick={applyBulkAttendance}>
                  Apply
                </button>
              </div>
            </div>

            <div className="att-mark-table-card">
              <div className="att-mark-thead">
                <div>Student Name</div>
                <div>Roll Number</div>
                <div>Attendance Status</div>
                <div className="att-mark-th-remarks">Remarks</div>
              </div>
              <div className="att-mark-tbody">
                {markPageItems.map((stu) => {
                  const row = markDraft[stu.id] || { status: 'present', remark: '' };
                  return (
                    <div key={stu.id} className="att-mark-row">
                      <div className="att-mark-cell att-mark-cell-name">
                        <div className="att-mark-photo">{studentInitials(stu.name)}</div>
                        <div>
                          <p className="att-mark-stu-name">{stu.name}</p>
                          <p className="att-mark-stu-email">{stu.email || '—'}</p>
                        </div>
                      </div>
                      <div className="att-mark-cell att-mark-cell-roll">
                        #{stu.rollNo || stu.admissionNo || '—'}
                      </div>
                      <div className="att-mark-cell att-mark-cell-status">
                        <div className={`att-mark-select-wrap att-mark-select-wrap--${row.status}`}>
                          <select
                            className={statusSelectClass(row.status)}
                            value={row.status}
                            onChange={(e) =>
                              setMarkDraft((d) => ({
                                ...d,
                                [stu.id]: { ...d[stu.id], status: e.target.value, remark: d[stu.id]?.remark || '' },
                              }))
                            }
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="leave">Leave</option>
                            <option value="sick">Sick</option>
                          </select>
                          <span className="material-symbols-outlined att-mark-select-chevron">expand_more</span>
                        </div>
                      </div>
                      <div className="att-mark-cell att-mark-cell-remarks">
                        <input
                          type="text"
                          className="att-mark-remark-input"
                          placeholder="Add optional remark…"
                          value={row.remark}
                          onChange={(e) =>
                            setMarkDraft((d) => ({
                              ...d,
                              [stu.id]: { ...d[stu.id], status: d[stu.id]?.status || 'present', remark: e.target.value },
                            }))
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="att-mark-table-footer">
                <p className="att-mark-page-caption">
                  Showing {showingFrom} to {showingTo} of {markStudentsFiltered.length} students in {classLevel}{' '}
                  Section {section}
                </p>
                <div className="att-mark-pager">
                  <button
                    type="button"
                    className="att-mark-page-btn"
                    disabled={markPage <= 1}
                    onClick={() => setMarkPage((p) => Math.max(1, p - 1))}
                    aria-label="Previous page"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  {Array.from({ length: markPageCount }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`att-mark-page-num ${n === markPage ? 'is-active' : ''}`}
                      onClick={() => setMarkPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="att-mark-page-btn"
                    disabled={markPage >= markPageCount}
                    onClick={() => setMarkPage((p) => Math.min(markPageCount, p + 1))}
                    aria-label="Next page"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="att-mark-actions">
              <button
                type="button"
                className="att-mark-cancel"
                onClick={() => {
                  setMarkResetNonce((x) => x + 1);
                }}
              >
                Cancel / Reset
              </button>
              <button type="button" className="att-mark-save" onClick={saveMarkAttendance}>
                Save Attendance
              </button>
            </div>
          </section>

          <aside className="att-mark-aside">
            <div className="att-mark-summary-card">
              <h2 className="att-mark-summary-title">Attendance Summary</h2>
              <div className="att-mark-summary-stats">
                <div className="att-mark-sum att-mark-sum--present">
                  <div>
                    <p className="att-mark-sum-label">Present</p>
                    <p className="att-mark-sum-value">{markSummary.present}</p>
                  </div>
                  <span className="material-symbols-outlined att-mark-sum-ic">check_circle</span>
                </div>
                <div className="att-mark-sum att-mark-sum--absent">
                  <div>
                    <p className="att-mark-sum-label">Absent</p>
                    <p className="att-mark-sum-value">{String(markSummary.absent).padStart(2, '0')}</p>
                  </div>
                  <span className="material-symbols-outlined att-mark-sum-ic">cancel</span>
                </div>
                <div className="att-mark-sum att-mark-sum--leave">
                  <div>
                    <p className="att-mark-sum-label">Leave</p>
                    <p className="att-mark-sum-value">{String(markSummary.leave).padStart(2, '0')}</p>
                  </div>
                  <span className="material-symbols-outlined att-mark-sum-ic">event_busy</span>
                </div>
                <div className="att-mark-sum att-mark-sum--sick">
                  <div>
                    <p className="att-mark-sum-label">Sick</p>
                    <p className="att-mark-sum-value">{String(markSummary.sick).padStart(2, '0')}</p>
                  </div>
                  <span className="material-symbols-outlined att-mark-sum-ic">medical_services</span>
                </div>
              </div>
              <div className="att-mark-progress-block">
                <div className="att-mark-progress-head">
                  <span>Completion Status</span>
                  <span className="att-mark-progress-pct">{markCompletionPct}%</span>
                </div>
                <div className="att-mark-progress-track">
                  <div className="att-mark-progress-fill" style={{ width: `${markCompletionPct}%` }} />
                </div>
                <p className="att-mark-progress-hint">
                  {markCompletionPct >= 100
                    ? 'All student records have been addressed.'
                    : 'Complete status for every student before saving.'}
                </p>
              </div>
            </div>
            <div className="att-mark-automate">
              <div className="att-mark-automate-inner">
                <h3>Automate Daily Attendance</h3>
                <p>Integrate biometric or RFID scans to reduce manual effort by up to 90%.</p>
                <button type="button" className="att-mark-automate-btn">
                  Learn More
                </button>
              </div>
              <span className="material-symbols-outlined att-mark-automate-bolt">bolt</span>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="att-dash">
      <button
        type="button"
        className="att-dash-back sm-back"
        onClick={() => navigate(`${wizardBase}/${classSlug}`)}
      >
        <span className="material-symbols-outlined">arrow_back</span>
        Sections
      </button>

      <header className="att-dash-topbar">
        <div className="att-dash-search-wrap">
          <span className="material-symbols-outlined att-dash-search-ic">search</span>
          <input
            type="search"
            className="att-dash-search"
            placeholder="Search students on roll or records…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search attendance"
          />
        </div>
      </header>

      <div className="att-dash-head">
        <div>
          <h1 className="att-dash-title">Section attendance</h1>
          <p className="att-dash-sub">
            {classLevel} — Section {section} · {SESSION_LABEL} · Super admin daily roll
          </p>
        </div>
        <div className="att-dash-head-actions">
          <button type="button" className="att-dash-btn-secondary" onClick={() => window.print()}>
            <span className="material-symbols-outlined">download</span>
            Report PDF
          </button>
          <button type="button" className="att-dash-btn-primary" onClick={() => setMarkMode(true)}>
            <span className="material-symbols-outlined">how_to_reg</span>
            Take Attendance
          </button>
          <button
            type="button"
            className="att-dash-btn-secondary"
            onClick={() => window.alert('Leave application is not wired yet.')}
          >
            <span className="material-symbols-outlined">add</span>
            Apply leave
          </button>
        </div>
      </div>

      {loadStatus === 'loading' && <p className="sm-loading att-dash-loading">Loading…</p>}

      <div className="att-dash-layout">
        <div className="att-dash-main">
          <div className="att-dash-stats">
            <div className="att-dash-stat-card">
              <p className="att-dash-stat-label">Attendance rate</p>
              <div className="att-dash-stat-row">
                <h3 className="att-dash-stat-value att-dash-stat-value--primary">{stats.rate}%</h3>
                <div className="att-dash-stat-icon att-dash-stat-icon--blue">
                  <span className="material-symbols-outlined">analytics</span>
                </div>
              </div>
              <div className="att-dash-stat-bar">
                <div className="att-dash-stat-bar-fill" style={{ width: `${stats.rate}%` }} />
              </div>
            </div>
            <div className="att-dash-stat-card">
              <p className="att-dash-stat-label">Total present</p>
              <div className="att-dash-stat-row">
                <h3 className="att-dash-stat-value">
                  {stats.present} <span className="att-dash-stat-unit">Days</span>
                </h3>
                <div className="att-dash-stat-icon att-dash-stat-icon--green">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
              </div>
            </div>
            <div className="att-dash-stat-card">
              <p className="att-dash-stat-label">Total absent</p>
              <div className="att-dash-stat-row">
                <h3 className="att-dash-stat-value">
                  {stats.absent} <span className="att-dash-stat-unit">Days</span>
                </h3>
                <div className="att-dash-stat-icon att-dash-stat-icon--red">
                  <span className="material-symbols-outlined">cancel</span>
                </div>
              </div>
            </div>
            <div className="att-dash-stat-card">
              <p className="att-dash-stat-label">Leave count</p>
              <div className="att-dash-stat-row">
                <h3 className="att-dash-stat-value">
                  {stats.leave} <span className="att-dash-stat-unit">Days</span>
                </h3>
                <div className="att-dash-stat-icon att-dash-stat-icon--amber">
                  <span className="material-symbols-outlined">event_busy</span>
                </div>
              </div>
            </div>
          </div>

          <section className="att-dash-calendar-card">
            <div className="att-dash-cal-header">
              <h2 className="att-dash-cal-title">
                <span className="material-symbols-outlined att-dash-cal-title-ic">calendar_month</span>
                {monthTitle}
              </h2>
              <div className="att-dash-cal-nav">
                <button type="button" className="att-dash-cal-nav-btn" onClick={() => shiftMonth(-1)} aria-label="Previous month">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button type="button" className="att-dash-cal-nav-btn" onClick={() => shiftMonth(1)} aria-label="Next month">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
            <div className="att-dash-cal-body">
              <div className="att-dash-cal-weekdays">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="att-dash-cal-wd">
                    {d}
                  </div>
                ))}
              </div>
              <div className="att-dash-cal-grid">
                {calendarCells.map((cell, idx) => {
                  if (cell.type === 'empty') {
                    return <div key={`e-${idx}`} className="att-dash-cal-cell att-dash-cal-cell--empty" />;
                  }
                  const isSelected = cell.day === selectedDay;
                  return (
                    <button
                      key={cell.day}
                      type="button"
                      className={`att-dash-cal-cell att-dash-cal-cell--day ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => setSelectedDay(cell.day)}
                    >
                      <span className="att-dash-cal-daynum">{cell.day}</span>
                      <span className={`att-dash-dot att-dash-dot--${cell.dot}`} aria-hidden />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="att-dash-cal-legend">
              <div className="att-dash-legend-item">
                <span className="att-dash-dot att-dash-dot--present" />
                <span>Present</span>
              </div>
              <div className="att-dash-legend-item">
                <span className="att-dash-dot att-dash-dot--absent" />
                <span>Absent</span>
              </div>
              <div className="att-dash-legend-item">
                <span className="att-dash-dot att-dash-dot--leave" />
                <span>Leave</span>
              </div>
              <div className="att-dash-legend-item">
                <span className="att-dash-dot att-dash-dot--holiday att-dash-dot--neutral" />
                <span>Holiday / no class</span>
              </div>
            </div>
            <p className="att-dash-cal-hint">Select a date above to view the roll for that day.</p>
          </section>

          <section className="att-dash-daily" aria-labelledby="att-daily-title">
            <div className="att-dash-daily-head">
              <h2 id="att-daily-title" className="att-dash-daily-title">
                Daily roll
              </h2>
              <p className="att-dash-daily-date">{selectedDateLabel}</p>
              <p className="att-dash-daily-meta">
                {dailyRoll.enrolled} enrolled · {dailyRoll.marked} with a mark on this date
              </p>
            </div>

            <div className="att-dash-daily-kpis">
              <div className="att-dash-daily-kpi att-dash-daily-kpi--ok">
                <span className="att-dash-daily-kpi-label">Present</span>
                <span className="att-dash-daily-kpi-value">{dailyRoll.present.length}</span>
              </div>
              <div className="att-dash-daily-kpi att-dash-daily-kpi--bad">
                <span className="att-dash-daily-kpi-label">Absent</span>
                <span className="att-dash-daily-kpi-value">{dailyRoll.absent.length}</span>
              </div>
              <div className="att-dash-daily-kpi att-dash-daily-kpi--leave">
                <span className="att-dash-daily-kpi-label">Leave</span>
                <span className="att-dash-daily-kpi-value">{dailyRoll.leave.length}</span>
              </div>
              <div className="att-dash-daily-kpi att-dash-daily-kpi--sick">
                <span className="att-dash-daily-kpi-label">Sick</span>
                <span className="att-dash-daily-kpi-value">{dailyRoll.sick.length}</span>
              </div>
              <div className="att-dash-daily-kpi att-dash-daily-kpi--muted">
                <span className="att-dash-daily-kpi-label">Not marked</span>
                <span className="att-dash-daily-kpi-value">{dailyRoll.notMarked.length}</span>
              </div>
            </div>

            <div className="att-dash-daily-grid">
              <div className="att-dash-daily-col">
                <h3 className="att-dash-daily-col-title att-dash-daily-col-title--ok">
                  <span className="material-symbols-outlined">check_circle</span>
                  Present ({dailyDisplay.present.length})
                </h3>
                <ul className="att-dash-daily-list">
                  {dailyDisplay.present.map(({ student, record }) => (
                    <li key={`p-${student.id || student.name}`} className="att-dash-daily-row">
                      <div>
                        <p className="att-dash-daily-name">{student.name}</p>
                        <p className="att-dash-daily-sub">
                          {student.admissionNo ? `#${student.admissionNo}` : '—'} ·{' '}
                          {record?.checkIn || '—'}
                        </p>
                      </div>
                      <span className="att-dash-daily-pill att-dash-daily-pill--ok">
                        {record?.status || 'Present'}
                      </span>
                    </li>
                  ))}
                  {dailyDisplay.present.length === 0 && (
                    <li className="att-dash-daily-empty">No students marked present for this day.</li>
                  )}
                </ul>
              </div>

              <div className="att-dash-daily-col">
                <h3 className="att-dash-daily-col-title att-dash-daily-col-title--bad">
                  <span className="material-symbols-outlined">cancel</span>
                  Absent ({dailyDisplay.absent.length})
                </h3>
                <ul className="att-dash-daily-list">
                  {dailyDisplay.absent.map(({ student, record }) => (
                    <li key={`a-${student.id || student.name}`} className="att-dash-daily-row">
                      <div>
                        <p className="att-dash-daily-name">{student.name}</p>
                        <p className="att-dash-daily-sub">
                          {student.admissionNo ? `#${student.admissionNo}` : '—'} ·{' '}
                          {record?.checkIn || 'No record'}
                        </p>
                      </div>
                      <span className="att-dash-daily-pill att-dash-daily-pill--bad">Absent</span>
                    </li>
                  ))}
                  {dailyDisplay.absent.length === 0 && (
                    <li className="att-dash-daily-empty">No students marked absent for this day.</li>
                  )}
                </ul>
              </div>

              <div className="att-dash-daily-col">
                <h3 className="att-dash-daily-col-title att-dash-daily-col-title--leave">
                  <span className="material-symbols-outlined">event_busy</span>
                  Leave ({dailyDisplay.leave.length})
                </h3>
                <ul className="att-dash-daily-list">
                  {dailyDisplay.leave.map(({ student, record }) => (
                    <li key={`l-${student.id || student.name}`} className="att-dash-daily-row">
                      <div>
                        <p className="att-dash-daily-name">{student.name}</p>
                        <p className="att-dash-daily-sub">
                          {student.admissionNo ? `#${student.admissionNo}` : '—'}
                        </p>
                      </div>
                      <span className="att-dash-daily-pill att-dash-daily-pill--leave">Leave</span>
                    </li>
                  ))}
                  {dailyDisplay.leave.length === 0 && (
                    <li className="att-dash-daily-empty">No leave recorded for this day.</li>
                  )}
                </ul>
              </div>

              <div className="att-dash-daily-col">
                <h3 className="att-dash-daily-col-title att-dash-daily-col-title--sick">
                  <span className="material-symbols-outlined">medical_services</span>
                  Sick ({dailyDisplay.sick.length})
                </h3>
                <ul className="att-dash-daily-list">
                  {dailyDisplay.sick.map(({ student, record }) => (
                    <li key={`k-${student.id || student.name}`} className="att-dash-daily-row">
                      <div>
                        <p className="att-dash-daily-name">{student.name}</p>
                        <p className="att-dash-daily-sub">
                          {student.admissionNo ? `#${student.admissionNo}` : '—'}
                        </p>
                      </div>
                      <span className="att-dash-daily-pill att-dash-daily-pill--sick">Sick</span>
                    </li>
                  ))}
                  {dailyDisplay.sick.length === 0 && (
                    <li className="att-dash-daily-empty">No sick leave recorded for this day.</li>
                  )}
                </ul>
              </div>

              <div className="att-dash-daily-col">
                <h3 className="att-dash-daily-col-title att-dash-daily-col-title--muted">
                  <span className="material-symbols-outlined">help</span>
                  Not marked ({dailyDisplay.notMarked.length})
                </h3>
                <ul className="att-dash-daily-list">
                  {dailyDisplay.notMarked.map(({ student, record }) => (
                    <li key={`n-${student.id || student.name}`} className="att-dash-daily-row">
                      <div>
                        <p className="att-dash-daily-name">{student.name}</p>
                        <p className="att-dash-daily-sub">
                          {student.admissionNo ? `#${student.admissionNo}` : '—'}
                          {record ? ` · ${record.status}` : ' · No attendance entry'}
                        </p>
                      </div>
                    </li>
                  ))}
                  {dailyDisplay.notMarked.length === 0 && (
                    <li className="att-dash-daily-empty">Everyone on the roster has a mark.</li>
                  )}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <aside className="att-dash-side">
          <section className="att-dash-panel">
            <h2 className="att-dash-panel-title">
              <span className="material-symbols-outlined">subject</span>
              Subject wise
            </h2>
            <div className="att-dash-subject-list">
              {subjectRows.map((s) => (
                <div key={s.name} className="att-dash-subject-row">
                  <div className="att-dash-subject-head">
                    <span>{s.name}</span>
                    <span className="att-dash-subject-pct">{s.pct}%</span>
                  </div>
                  <div className="att-dash-subject-bar">
                    <div className="att-dash-subject-bar-fill" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="att-dash-panel">
            <h2 className="att-dash-panel-title">
              <span className="material-symbols-outlined">trending_up</span>
              Monthly trend
            </h2>
            <div className="att-dash-chart-wrap">
              <svg
                className="att-dash-chart"
                viewBox={`0 0 ${trendPolylinePoints.w} ${trendPolylinePoints.h}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="attLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={trendPolylinePoints.points}
                />
              </svg>
            </div>
            <div className="att-dash-trend-labels">
              {monthlyTrend.map((t) => (
                <div key={t.label} className="att-dash-trend-lbl">
                  <p className="att-dash-trend-mon">{t.label}</p>
                  <p className={`att-dash-trend-val ${t.label === 'OCT' ? 'is-current' : ''}`}>{t.pct}%</p>
                </div>
              ))}
            </div>
          </section>

          <section className="att-dash-legend-card">
            <h3 className="att-dash-legend-card-title">Legend &amp; status</h3>
            <ul className="att-dash-legend-list">
              <li className="att-dash-legend-row">
                <span className="att-dash-legend-badge att-dash-legend-badge--p">P</span>
                <span className="att-dash-legend-desc">Present — In class</span>
              </li>
              <li className="att-dash-legend-row">
                <span className="att-dash-legend-badge att-dash-legend-badge--a">A</span>
                <span className="att-dash-legend-desc">Absent — Not recorded</span>
              </li>
              <li className="att-dash-legend-row">
                <span className="att-dash-legend-badge att-dash-legend-badge--l">L</span>
                <span className="att-dash-legend-desc">Leave — Approved</span>
              </li>
              <li className="att-dash-legend-row">
                <span className="att-dash-legend-badge att-dash-legend-badge--s">S</span>
                <span className="att-dash-legend-desc">Suspended — Admin</span>
              </li>
            </ul>
            <p className="att-dash-quote">
              “Regular attendance is the primary step towards academic excellence.”
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
};
