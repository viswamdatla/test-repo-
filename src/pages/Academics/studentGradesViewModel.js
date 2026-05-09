/** Pure helpers for student grades dashboard (section-scoped). */

const normExam = (s) => String(s || '').toLowerCase();

export const isMidtermExam = (exam) => /midterm|mid-term|half/i.test(normExam(exam));
export const isFinalExam = (exam) => /final/i.test(normExam(exam));
export const isUnitExam = (exam) => /unit|quarterly/i.test(normExam(exam));
export const isQuizExam = (exam) => /quiz|monthly/i.test(normExam(exam));

export const EXAM_FILTER_OPTIONS = [
  { id: 'finalTerm', label: 'Final Term', predicate: (exam) => isFinalExam(exam) || isMidtermExam(exam) },
  { id: 'halfYearly', label: 'Half-Yearly', predicate: (exam) => isMidtermExam(exam) },
  { id: 'quarterly', label: 'Quarterly Exam', predicate: (exam) => isUnitExam(exam) },
  { id: 'monthly', label: 'Monthly Test', predicate: (exam) => isQuizExam(exam) },
];

export const TERM_OPTIONS = [
  { id: 't2', label: 'Second Term (Current)' },
  { id: 't1', label: 'First Term' },
  { id: 'annual', label: 'Annual Performance' },
];

export const scoreToLetter = (pct) => {
  if (pct >= 97) return 'A+';
  if (pct >= 93) return 'A';
  if (pct >= 90) return 'A-';
  if (pct >= 87) return 'B+';
  if (pct >= 83) return 'B';
  if (pct >= 80) return 'B-';
  if (pct >= 77) return 'C+';
  if (pct >= 73) return 'C';
  if (pct >= 70) return 'C-';
  if (pct >= 60) return 'D';
  return 'F';
};

export const letterToGpaPoints = (letter) => {
  const map = {
    'A+': 4.0,
    A: 4.0,
    'A-': 3.7,
    'B+': 3.3,
    B: 3.0,
    'B-': 2.7,
    'C+': 2.3,
    C: 2.0,
    'C-': 1.7,
    D: 1.0,
    F: 0,
  };
  return map[letter] ?? 2.5;
};

export const letterGradeTone = (letter) => {
  const l = String(letter || '');
  if (l.startsWith('A')) return 'aplus';
  if (l.startsWith('B')) return 'b';
  if (l.startsWith('C')) return 'c';
  return 'low';
};

export const abbrevSubject = (name) => {
  const s = String(name || '').trim();
  if (s.length <= 5) return s.toUpperCase();
  const words = s.split(/\s+/);
  if (words.length > 1) return words.map((w) => w[0]).join('').slice(0, 4).toUpperCase();
  return s.slice(0, 4).toUpperCase();
};

export const filterSectionGrades = (grades, stage, classLevel, section) =>
  (grades || []).filter(
    (g) => g.stage === stage && g.classLevel === classLevel && (g.section || '') === section
  );

const pickScore = (rows, pred) => {
  const hit = rows.find((r) => pred(r.exam));
  return hit != null ? Number(hit.score) : null;
};

export const buildCourseRows = (studentGrades, examFilterId) => {
  const opt = EXAM_FILTER_OPTIONS.find((o) => o.id === examFilterId) ?? EXAM_FILTER_OPTIONS[0];
  const predicate = opt.predicate;

  const relevant = studentGrades.filter((g) => predicate(g.exam));
  const bySubject = new Map();
  for (const g of studentGrades) {
    if (!bySubject.has(g.subject)) bySubject.set(g.subject, []);
    bySubject.get(g.subject).push(g);
  }

  const subjects = new Set();
  for (const g of relevant) subjects.add(g.subject);
  if (subjects.size === 0) {
    for (const g of studentGrades) subjects.add(g.subject);
  }

  const rows = [];
  for (const subject of [...subjects].sort()) {
    const recs = bySubject.get(subject) || [];
    const mid = pickScore(recs, isMidtermExam);
    const fin = pickScore(recs, isFinalExam);
    const unit = pickScore(recs, isUnitExam);
    const quiz = pickScore(recs, isQuizExam);

    let midDisplay = mid;
    let finalDisplay = fin;
    let totalPct = null;

    if (examFilterId === 'halfYearly') {
      totalPct = mid;
      finalDisplay = null;
    } else if (examFilterId === 'quarterly') {
      midDisplay = null;
      finalDisplay = null;
      totalPct = unit;
    } else if (examFilterId === 'monthly') {
      midDisplay = null;
      finalDisplay = null;
      totalPct = quiz;
    } else {
      /* finalTerm — cumulative mid + final */
      if (mid != null && fin != null) totalPct = (mid + fin) / 2;
      else if (mid != null) totalPct = mid;
      else if (fin != null) totalPct = fin;
      else if (unit != null) {
        totalPct = unit;
        midDisplay = null;
        finalDisplay = null;
      } else if (quiz != null) {
        totalPct = quiz;
        midDisplay = null;
        finalDisplay = null;
      } else if (recs[0]) totalPct = Number(recs[0].score);
    }

    if (totalPct == null) continue;

    const gradeLetter = scoreToLetter(totalPct);
    rows.push({
      subject,
      mid: midDisplay,
      final: finalDisplay,
      totalPct,
      gradeLetter,
    });
  }
  return rows;
};

export const classAverageBySubject = (sectionGrades, subject, examFilterId) => {
  const opt = EXAM_FILTER_OPTIONS.find((o) => o.id === examFilterId) ?? EXAM_FILTER_OPTIONS[0];
  const byStudent = new Map();
  for (const g of sectionGrades) {
    if (g.subject !== subject) continue;
    if (!opt.predicate(g.exam)) continue;
    if (!byStudent.has(g.student)) byStudent.set(g.student, []);
    byStudent.get(g.student).push(g);
  }
  const avgs = [];
  for (const [, recs] of byStudent) {
    const rows = buildCourseRows(recs, examFilterId);
    const row = rows.find((r) => r.subject === subject);
    if (row) avgs.push(row.totalPct);
  }
  if (avgs.length === 0) return null;
  return avgs.reduce((a, b) => a + b, 0) / avgs.length;
};

export const studentSectionAverage = (studentGrades, examFilterId) => {
  const rows = buildCourseRows(studentGrades, examFilterId);
  if (rows.length === 0) return null;
  return rows.reduce((acc, r) => acc + r.totalPct, 0) / rows.length;
};

export const computeRankInSection = (sectionGrades, studentName, examFilterId) => {
  const names = [...new Set(sectionGrades.map((g) => g.student))];
  const scored = names
    .map((name) => {
      const sg = sectionGrades.filter((g) => g.student === name);
      const avg = studentSectionAverage(sg, examFilterId);
      return { name, avg: avg ?? -1 };
    })
    .filter((x) => x.avg >= 0)
    .sort((a, b) => b.avg - a.avg);
  const idx = scored.findIndex((x) => x.name === studentName);
  return { rank: idx >= 0 ? idx + 1 : null, of: scored.length };
};

export const computeGpa = (courseRows) => {
  if (courseRows.length === 0) return null;
  const pts = courseRows.map((r) => letterToGpaPoints(r.gradeLetter));
  return pts.reduce((a, b) => a + b, 0) / pts.length;
};

/**
 * One row per subject for a single student's grade rows (same column rules as section matrix).
 * Maps Redux `grades` rows (exam: Quiz | Unit Test | Midterm | Final).
 */
export const buildSubjectReportRows = (studentGrades) => {
  const bySubject = new Map();
  for (const g of studentGrades || []) {
    if (!bySubject.has(g.subject)) bySubject.set(g.subject, []);
    bySubject.get(g.subject).push(g);
  }
  return [...bySubject.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([subject, recs]) => {
      const row = matrixFromSubjectGradeRecords(recs);
      return { subject, ...row };
    });
};

/** Shared matrix logic for grade rows that already belong to one student and one subject. */
export const matrixFromSubjectGradeRecords = (sg) => {
  const avgExam = (examLabel) => {
    const rows = sg.filter((g) => String(g.exam) === examLabel);
    if (rows.length === 0) return null;
    return rows.reduce((a, g) => a + Number(g.score), 0) / rows.length;
  };

  const fa1 = avgExam('Quiz');
  const fa2 = avgExam('Unit Test');
  const halfYr = avgExam('Midterm');
  const annual = avgExam('Final');
  const fa3 = fa1 != null && fa2 != null ? (fa1 + fa2) / 2 : null;
  const fa4 = halfYr != null && annual != null ? (halfYr + annual) / 2 : null;

  const courseRows = buildCourseRows(sg, 'finalTerm');
  const fromCourse = courseRows[0]?.totalPct;
  const parts = [fa1, fa2, halfYr, annual].filter((x) => x != null);
  const total =
    fromCourse != null
      ? fromCourse
      : parts.length > 0
        ? parts.reduce((a, b) => a + b, 0) / parts.length
        : null;

  const intVal = total != null ? Math.min(10, Math.max(0, Math.round(total / 10))) : null;
  const gradeLetter = total != null ? scoreToLetter(total) : null;

  return {
    fa1,
    fa2,
    halfYr,
    fa3,
    fa4,
    annual,
    int: intVal,
    total,
    gradeLetter,
  };
};

export const studentSectionAttendancePct = (attendance, studentName, stage, classLevel, section) => {
  const name = String(studentName || '').trim();
  const recs = (attendance || []).filter(
    (a) =>
      String(a.student || '').trim() === name &&
      a.stage === stage &&
      a.classLevel === classLevel &&
      (a.section || '') === section,
  );
  let present = 0;
  let counted = 0;
  for (const r of recs) {
    const t = String(r.status || '').toLowerCase();
    if (t === 'present' || t === 'late') present += 1;
    if (t === 'present' || t === 'late' || t === 'absent' || t === 'leave' || t === 'sick') counted += 1;
  }
  if (!counted) return null;
  return Math.round((100 * present) / counted);
};

export const buildPerformanceMatrixRow = (studentName, sectionGrades) => {
  const sg = (sectionGrades || []).filter((g) => g.student === studentName);
  const avgExam = (examLabel) => {
    const rows = sg.filter((g) => String(g.exam) === examLabel);
    if (rows.length === 0) return null;
    return Math.round(rows.reduce((a, g) => a + Number(g.score), 0) / rows.length);
  };

  const fa1 = avgExam('Quiz');
  const fa2 = avgExam('Unit Test');
  const halfYr = avgExam('Midterm');
  const annual = avgExam('Final');
  const fa3 = fa1 != null && fa2 != null ? Math.round((fa1 + fa2) / 2) : null;
  const fa4 = halfYr != null && annual != null ? Math.round((halfYr + annual) / 2) : null;

  const termAvg = studentSectionAverage(sg, 'finalTerm');
  const parts = [fa1, fa2, halfYr, annual].filter((x) => x != null);
  const overall =
    termAvg != null
      ? Math.round(termAvg)
      : parts.length > 0
        ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length)
        : null;

  const intVal =
    overall != null ? Math.min(10, Math.max(0, Math.round(overall / 10))) : null;
  const gradeLetter = overall != null ? scoreToLetter(overall) : null;

  return {
    fa1,
    fa2,
    halfYr,
    fa3,
    fa4,
    annual,
    int: intVal,
    overall,
    gradeLetter,
  };
};

export const gpaDeltaHint = (courseRows) => {
  if (courseRows.length < 2) return 0.1;
  const pts = courseRows.map((r) => letterToGpaPoints(r.gradeLetter));
  const half = Math.floor(pts.length / 2);
  const a = pts.slice(0, half).reduce((x, y) => x + y, 0) / Math.max(1, half);
  const b = pts.slice(half).reduce((x, y) => x + y, 0) / Math.max(1, pts.length - half);
  return Math.round((b - a) * 10) / 10;
};

export const buildGpaTrendPoints = (studentGrades) => {
  const buckets = [
    { key: 'mid', label: 'Term 1', match: isMidtermExam },
    { key: 'unit', label: 'Mid 1', match: isUnitExam },
    { key: 'fin', label: 'Term 2', match: isFinalExam },
    { key: 'quiz', label: 'Mid 2', match: isQuizExam },
  ];
  return buckets.map(({ label, match }) => {
    const scores = studentGrades.filter((g) => match(g.exam)).map((g) => Number(g.score));
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    return { label, pct: avg };
  });
};

export const submissionRate = (studentGrades) => {
  if (studentGrades.length === 0) return 100;
  const pub = studentGrades.filter((g) => String(g.status).toLowerCase() === 'published').length;
  return Math.round((pub / studentGrades.length) * 100);
};

export const percentileLabel = (rank, of) => {
  if (!rank || !of || of < 2) return '—';
  const pct = Math.round((rank / of) * 100);
  if (pct <= 5) return 'Top 5%';
  if (pct <= 10) return 'Top 10%';
  if (pct <= 25) return 'Top 25%';
  return `Top ${Math.min(50, pct)}%`;
};

export const distinctionLabel = (pct) => {
  if (pct >= 90) return 'Dist.';
  if (pct >= 80) return 'Merit';
  if (pct >= 70) return 'Pass';
  return '';
};
