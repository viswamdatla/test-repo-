import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const buildList = (seed, target, mapper) => {
  const items = [...seed];
  for (let i = items.length; i < target; i += 1) items.push(mapper(i));
  return items;
};

const statusCycle = ['Active', 'Pending', 'Archived'];

const defaultStructure = {
  stageOrder: ['Pre Primary', 'Primary', 'Secondary'],
  stages: {
    'Pre Primary': {
      classes: [
        { name: 'Nursery', sections: ['A', 'B', 'C'] },
        { name: 'LKG', sections: ['A', 'B', 'C'] },
        { name: 'UKG', sections: ['A', 'B', 'C'] },
      ],
    },
    Primary: {
      classes: [
        { name: 'Class 1', sections: ['A', 'B', 'C'] },
        { name: 'Class 2', sections: ['A', 'B', 'C'] },
        { name: 'Class 3', sections: ['A', 'B', 'C'] },
        { name: 'Class 4', sections: ['A', 'B', 'C'] },
        { name: 'Class 5', sections: ['A', 'B', 'C'] },
      ],
    },
    Secondary: {
      classes: [
        { name: 'Class 6', sections: ['A', 'B', 'C'] },
        { name: 'Class 7', sections: ['A', 'B', 'C'] },
        { name: 'Class 8', sections: ['A', 'B', 'C'] },
        { name: 'Class 9', sections: ['A', 'B', 'C'] },
        { name: 'Class 10', sections: ['A', 'B', 'C'] },
      ],
    },
  },
};

const classLevels = defaultStructure.stageOrder.flatMap(
  (stage) => defaultStructure.stages[stage]?.classes?.map((c) => c.name) ?? []
);

const stageByClass = defaultStructure.stageOrder.reduce((acc, stage) => {
  (defaultStructure.stages[stage]?.classes ?? []).forEach((c) => {
    acc[c.name] = stage;
  });
  return acc;
}, {});

const getStageFromClass = (classLevel) => stageByClass[classLevel] ?? 'Secondary';

const classLevelToRollPrefix = (level) => {
  const m = /^Class\s+(\d+)/i.exec(level || '');
  if (m) return m[1];
  return String(level || 'X')
    .split(/\s+/)
    .map((w) => w[0] || '')
    .join('')
    .slice(0, 3)
    .toUpperCase() || 'X';
};

/** Registry-style section keys (matches classSectionRegistry section ids / URL). */
const classLevelToRegistrySectionCode = (level) => {
  const m = /^Class\s+(\d+)$/i.exec(level || '');
  if (m) return String(Number(m[1])).padStart(2, '0');
  const short = { Nursery: 'NUR', LKG: 'LKG', UKG: 'UKG' };
  return (
    short[level] ||
    String(level || 'X')
      .replace(/\s+/g, '')
      .slice(0, 3)
      .toUpperCase()
  );
};

const baseProfileSubjectsTemplate = () => [
  { name: 'Mathematics', marks: 88, total: 100, grade: 'A' },
  { name: 'Science', marks: 84, total: 100, grade: 'A' },
  { name: 'English', marks: 79, total: 100, grade: 'B' },
  { name: 'Social Studies', marks: 82, total: 100, grade: 'A' },
  { name: 'Computer Science', marks: 91, total: 100, grade: 'A+' },
];

const gradeFromMarksPct = (marks, total = 100) => {
  const pct = total ? (marks / total) * 100 : 0;
  if (pct >= 95) return 'A+';
  if (pct >= 90) return 'A';
  if (pct >= 85) return 'B+';
  if (pct >= 80) return 'B';
  if (pct >= 75) return 'C+';
  if (pct >= 70) return 'C';
  if (pct >= 55) return 'D';
  return 'F';
};

/** Merges profile / roster fields used by StudentManagementStudentDetailPage UI. Preserves ids, rollNo, kit fields, guardian, etc. */
function enrichStudentRecord(s) {
  const seqMatch = String(s?.id ?? '').match(/(\d+)/g);
  const seq = seqMatch ? Number(seqMatch[seqMatch.length - 1]) : 1;
  const ix = seq - 1;
  const classId = s.classLevel || s.grade || '';
  const sectionLetter = String(s.section || 'A');
  const sectionRegistryKey = `${classLevelToRegistrySectionCode(classId)}-${sectionLetter}`;
  const presentDays = Math.min(200, 160 + ((ix + 5) % 35));
  const absentDays = Math.min(35, 8 + ((ix + 3) % 22));
  const totalDays = presentDays + absentDays;
  const subjects = baseProfileSubjectsTemplate().map((row, si) => {
    const jitter = (((ix + 1) * (si + 3)) % 11) - 5;
    const marks = Math.min(100, Math.max(41, row.marks + jitter));
    return {
      ...row,
      marks,
      grade: gradeFromMarksPct(marks, row.total),
    };
  });
  const gpa = parseFloat((2.5 + (ix % 15) * 0.1).toFixed(2));
  const totalFee = 85000 + (ix % 9) * 1800 - (ix % 4) * 400;
  const feesPaidBase = Math.min(totalFee - 2500 + (ix % 17) * 900, totalFee - 500);
  const feesPaid = Math.max(20000, Math.min(totalFee, feesPaidBase));
  const hostelRow = (s.uniformStatus === 'complete' ? 'complete' : 'pending');
  const profileStatusText = ix % 4 === 0 ? 'Inactive' : 'Active';

  const fatherIncome = Math.min(9900000, 900000 + ((ix % 29) + 7) * 11000);
  const motherIncome = Math.min(8800000, 650000 + ((ix % 17) + 3) * 9000);

  return {
    ...s,
    classId,
    sectionId: sectionRegistryKey,
    attendancePct: Math.round((presentDays / Math.max(totalDays, 1)) * 100),
    hostelStatus: s.hostelStatus || hostelRow,
    studentAdmissionId: s.studentAdmissionId || `ADM${10000 + seq}`,
    dob: s.dob || s.dateOfBirth || `${201 + (ix % 4)}-${String((ix % 11) + 1).padStart(2, '0')}-${String((ix % 26) + 1).padStart(2, '0')}`,
    gender:
      s.gender ||
      (seq % 2 === 0 ? 'Male' : 'Female'),
    bloodGroup: s.bloodGroup || ['A+', 'B+', 'O+', 'AB+'][ix % 4],
    height: s.height ? String(s.height) : `${Math.min(180, 130 + ((ix % 18) || 8))} cm`,
    weight: s.weight ? String(s.weight) : `${Math.min(72, 30 + ((ix % 12) || 3))} kg`,
    address: s.address && String(s.address).trim() ? s.address : `${seq}, School Street, City`,
    gpa,
    academicStanding: s.academicStanding || 'Pass',
    promoted: s.promoted ?? ix % 3 !== 2,
    presentDays,
    absentDays,
    totalDays,
    subjects,
    father: s.father || {
      name: `Guardian ${seq}`,
      occupation: (ix % 2 === 0 ? 'Business Owner' : 'Service'),
      phone: `981000${String(seq).padStart(4, '0')}`,
      email: `father.${seq}@schoolmail.com`,
      annualIncome: fatherIncome,
    },
    mother: s.mother || {
      name: `Guardian ${seq} (Spouse)`,
      occupation: (ix % 3 === 0 ? 'Engineer' : 'Homemaker'),
      phone: `992000${String(seq).padStart(4, '0')}`,
      email: `mother.${seq}@schoolmail.com`,
      annualIncome: motherIncome,
    },
    conditions: s.conditions ?? 'None',
    allergies: s.allergies ?? 'None',
    vaccination: ix % 6 === 5 ? 'Follow-up Pending' : 'Up to Date',
    admissionDate: s.admissionDate || '2021-06-15',
    transport: s.transport ?? 'None',
    hostel: s.hostel || 'Day Scholar',
    docsVerified: s.docsVerified ?? ix % 5 !== 0,
    previousSchool: s.previousSchool || 'Springfield Public School',
    sport: ['Football', 'Cricket', 'Basketball', 'Athletics'][ix % 4],
    club: ['Art Club', 'Science Club', 'Literary Club', 'Music Club'][ix % 4],
    achievement:
      ix % 2 === 0
        ? 'Participated in annual cultural fest'
        : 'Regional science fair honorable mention',
    totalFee,
    feesPaid,
    scholarship: ix % 5 === 3 ? Math.min(10000, 2000 + (ix % 12) * 400) : 0,
    profileStatus: s.profileStatus || profileStatusText,
  };
}

const kitBooksCycle = ['taken', 'partial', 'not_taken'];
const kitUniformCycle = ['complete', 'pending'];
const kitPaymentCycle = ['paid', 'unpaid', 'partial'];

const createStudents = () => {
  const generatedStudentTarget = 200;
  const seed = [
    {
      id: 'stu-001',
      admissionNo: 'ST-2023-091',
      name: 'Aditya Miller',
      grade: 'Class 10',
      classLevel: 'Class 10',
      stage: 'Secondary',
      section: 'A',
      rollNo: '10A001',
      booksStatus: 'taken',
      uniformStatus: 'complete',
      paymentStatus: 'paid',
      guardian: 'Michael Miller',
      email: 'aditya.miller@school.edu',
      phone: '+1 (555) 201-7781',
      dateOfBirth: '2008-04-12',
      address: '12 Riverbend Ave, Springfield',
      status: 'Active',
    },
    {
      id: 'stu-002',
      admissionNo: 'ST-2023-095',
      name: 'Elena Castillo',
      grade: 'Class 8',
      classLevel: 'Class 8',
      stage: 'Secondary',
      section: 'A',
      rollNo: '8A002',
      booksStatus: 'partial',
      uniformStatus: 'pending',
      paymentStatus: 'unpaid',
      guardian: 'Rosa Castillo',
      email: 'elena.castillo@school.edu',
      phone: '+1 (555) 201-8892',
      dateOfBirth: '2010-09-03',
      address: '88 Maple Court, Springfield',
      status: 'Active',
    },
    {
      id: 'stu-003',
      admissionNo: 'ST-2023-012',
      name: 'Jordan Walker',
      grade: 'Class 4',
      classLevel: 'Class 4',
      stage: 'Primary',
      section: 'A',
      rollNo: '4A003',
      booksStatus: 'not_taken',
      uniformStatus: 'complete',
      paymentStatus: 'partial',
      guardian: 'Dan Walker',
      email: 'jordan.walker@school.edu',
      phone: '+1 (555) 201-3344',
      dateOfBirth: '2014-01-22',
      address: '5 Oak Lane, Springfield',
      status: 'Pending',
    },
  ];
  const rawList = buildList(seed, generatedStudentTarget, (i) => {
    const cl = classLevels[i % classLevels.length];
    const sec = ['A', 'B', 'C'][i % 3];
    const prefix = classLevelToRollPrefix(cl);
    return {
      classLevel: cl,
      id: `stu-${String(i + 1).padStart(3, '0')}`,
      admissionNo: `ST-2024-${String(100 + i)}`,
      name: `Student ${i + 1}`,
      grade: cl,
      stage: getStageFromClass(cl),
      section: sec,
      rollNo: `${prefix}${sec}${String(i + 1).padStart(3, '0')}`,
      booksStatus: kitBooksCycle[i % 3],
      uniformStatus: kitUniformCycle[i % 2],
      paymentStatus: kitPaymentCycle[i % 3],
      guardian: `Guardian ${i + 1}`,
      email: `student${i + 1}@school.edu`,
      phone: `+1 (555) ${String(210 + i).padStart(3, '0')}-${String(4400 + i).padStart(4, '0')}`,
      dateOfBirth: `201${i % 10}-${String((i % 11) + 1).padStart(2, '0')}-${String((i % 27) + 1).padStart(2, '0')}`,
      address: `${120 + i} Campus Road, Block ${(i % 4) + 1}`,
      status: statusCycle[i % statusCycle.length],
    };
  });
  return rawList.map((row) => enrichStudentRecord(row));
};

const createAttendance = () => {
  const seed = [
    { id: 'att-001', student: 'Aditya Miller', classLevel: 'Class 10', stage: 'Secondary', section: 'A', className: 'Class 10-A', date: 'Oct 23, 2023', checkIn: '08:05 AM', status: 'Present' },
    { id: 'att-002', student: 'Elena Castillo', classLevel: 'Class 8', stage: 'Secondary', section: 'A', className: 'Class 8-A', date: 'Oct 23, 2023', checkIn: 'No record', status: 'Absent' },
    { id: 'att-003', student: 'Jordan Walker', classLevel: 'Class 4', stage: 'Primary', section: 'A', className: 'Class 4-A', date: 'Oct 23, 2023', checkIn: '08:45 AM', status: 'Late' },
  ];
  const marks = ['Present', 'Absent', 'Late', 'Leave'];
  return buildList(seed, 42, (i) => {
    const sec = ['A', 'B', 'C'][i % 3];
    const cl = classLevels[i % classLevels.length];
    return {
    classLevel: cl,
    id: `att-${String(i + 1).padStart(3, '0')}`,
    student: `Student ${i + 1}`,
    stage: getStageFromClass(cl),
    section: sec,
    className: `${cl}-${sec}`,
    date: `Oct ${10 + (i % 20)}, 2023`,
    checkIn: marks[i % marks.length] === 'Absent' ? 'No record' : `${8 + (i % 3)}:${String((i * 7) % 60).padStart(2, '0')} AM`,
    status: marks[i % marks.length],
  };
  });
};

const createGrades = () => {
  const seed = [
    { id: 'gr-001', student: 'Sophia Fisher', classLevel: 'Class 10', stage: 'Secondary', section: 'A', className: 'Class 10-A', subject: 'Mathematics', exam: 'Midterm', score: 91, grade: 'A', status: 'Published' },
    { id: 'gr-002', student: 'Noah Jenkins', classLevel: 'Class 8', stage: 'Secondary', section: 'A', className: 'Class 8-A', subject: 'Physics', exam: 'Midterm', score: 84, grade: 'B+', status: 'Published' },
    { id: 'gr-003', student: 'Ava Chen', classLevel: 'Class 4', stage: 'Primary', section: 'B', className: 'Class 4-B', subject: 'Chemistry', exam: 'Unit Test', score: 76, grade: 'B', status: 'Pending' },
  ];
  return buildList(seed, 42, (i) => {
    const score = 55 + ((i * 9) % 45);
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B+' : score >= 70 ? 'B' : score >= 60 ? 'C+' : 'C';
    const sec = ['A', 'B', 'C'][i % 3];
    const cl = classLevels[i % classLevels.length];
    return {
      classLevel: cl,
      id: `gr-${String(i + 1).padStart(3, '0')}`,
      student: `Student ${i + 1}`,
      stage: getStageFromClass(cl),
      section: sec,
      className: `${cl}-${sec}`,
      subject: ['Mathematics', 'Science', 'English', 'History'][i % 4],
      exam: ['Midterm', 'Final', 'Unit Test', 'Quiz'][i % 4],
      score,
      grade,
      status: i % 4 === 0 ? 'Pending' : 'Published',
    };
  });
};

const createUi = () => ({
  searchQuery: '',
  statusFilter: 'all',
  stageFilter: null,
  classFilter: null,
  sectionFilter: 'all',
  page: 1,
  pageSize: 5,
});

const createStructure = () => JSON.parse(JSON.stringify(defaultStructure));

const getNextStudentNumber = (students) => {
  const max = students.reduce((acc, s) => {
    const n = Number(String(s.id || '').replace('stu-', ''));
    return Number.isFinite(n) ? Math.max(acc, n) : acc;
  }, 0);
  return max + 1;
};

/** Normalize any attendance date string to YYYY-MM-DD for matching */
const attendanceDateKey = (dateStr) => {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatAttendanceDisplayDate = (y, monthIndex, day) => {
  const d = new Date(y, monthIndex, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const fetchAcademicsData = createAsyncThunk('academics/fetchAcademicsData', async () => ({
  students: createStudents(),
  attendance: createAttendance(),
  grades: createGrades(),
}));

const academicsSlice = createSlice({
  name: 'academics',
  initialState: {
    loadStatus: 'idle',
    data: { students: [], attendance: [], grades: [] },
    ui: { students: createUi(), attendance: createUi(), grades: createUi() },
    structure: createStructure(),
  },
  reducers: {
    setSectionSearchQuery(state, action) {
      const { section, value } = action.payload;
      state.ui[section].searchQuery = value;
      state.ui[section].page = 1;
    },
    setSectionStatusFilter(state, action) {
      const { section, value } = action.payload;
      state.ui[section].statusFilter = value;
      state.ui[section].page = 1;
    },
    setSectionStageFilter(state, action) {
      const { section, value } = action.payload;
      state.ui[section].stageFilter = value;
      state.ui[section].classFilter = null;
      state.ui[section].sectionFilter = 'all';
      state.ui[section].page = 1;
    },
    setSectionClassFilter(state, action) {
      const { section, value } = action.payload;
      state.ui[section].classFilter = value;
      state.ui[section].sectionFilter = 'all';
      state.ui[section].page = 1;
    },
    setSectionSectionFilter(state, action) {
      const { section, value } = action.payload;
      state.ui[section].sectionFilter = value;
      state.ui[section].page = 1;
    },
    setSectionPage(state, action) {
      const { section, value } = action.payload;
      state.ui[section].page = value;
    },
    addClassToStage(state, action) {
      const { stage, className } = action.payload;
      const trimmed = (className || '').trim();
      if (!stage || !trimmed) return;
      const target = state.structure.stages[stage];
      if (!target) return;
      const exists = target.classes.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
      if (exists) return;
      target.classes.push({ name: trimmed, sections: ['A', 'B', 'C'] });
    },
    removeClassFromStage(state, action) {
      const { stage, className } = action.payload;
      const target = state.structure.stages[stage];
      if (!target) return;
      target.classes = target.classes.filter((c) => c.name !== className);
    },
    addSectionToClass(state, action) {
      const { stage, className, sectionName } = action.payload;
      const trimmed = (sectionName || '').trim();
      if (!stage || !className || !trimmed) return;
      const target = state.structure.stages[stage];
      if (!target) return;
      const classObj = target.classes.find((c) => c.name === className);
      if (!classObj) return;
      const exists = classObj.sections.some((s) => s.toLowerCase() === trimmed.toLowerCase());
      if (exists) return;
      classObj.sections.push(trimmed);
    },
    removeSectionFromClass(state, action) {
      const { stage, className, sectionName } = action.payload;
      const target = state.structure.stages[stage];
      if (!target) return;
      const classObj = target.classes.find((c) => c.name === className);
      if (!classObj) return;
      classObj.sections = classObj.sections.filter((s) => s !== sectionName);
    },
    bulkImportStudents(state, action) {
      const { stage, classLevel, section, records } = action.payload;
      if (!stage || !classLevel || !section || !Array.isArray(records) || records.length === 0) return;
      let nextNumber = getNextStudentNumber(state.data.students);
      const rollPrefix = classLevelToRollPrefix(classLevel);
      records.forEach((r) => {
        const id = `stu-${String(nextNumber).padStart(3, '0')}`;
        const admissionNo = r.admissionNo || `ST-2026-${String(1000 + nextNumber)}`;
        const rollNo = r.rollNo || `${rollPrefix}${section}${String(nextNumber).padStart(3, '0')}`;
        const base = enrichStudentRecord({
          id,
          admissionNo,
          name: r.name,
          grade: classLevel,
          classLevel,
          stage,
          section,
          rollNo,
          booksStatus: r.booksStatus || 'not_taken',
          uniformStatus: r.uniformStatus || 'pending',
          paymentStatus: r.paymentStatus || 'unpaid',
          guardian: r.guardian || 'Not Provided',
          email: r.email || '',
          phone: r.phone || '',
          dateOfBirth: r.dateOfBirth || '',
          address: r.address || '',
          status: r.status || 'Active',
        });
        state.data.students.push(base);
        nextNumber += 1;
      });
    },
    saveAttendanceMarks(state, action) {
      const { stage, classLevel, section, year, monthIndex, day, marks } = action.payload;
      if (!stage || !classLevel || !section || !Array.isArray(marks)) return;
      const dateKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const displayDate = formatAttendanceDisplayDate(year, monthIndex, day);
      state.data.attendance = state.data.attendance.filter((a) => {
        if (a.stage !== stage || a.classLevel !== classLevel || (a.section || '') !== section) return true;
        const k = attendanceDateKey(a.date);
        return k !== dateKey;
      });
      let seq = 0;
      marks.forEach((m) => {
        const st = String(m.status || 'present').toLowerCase();
        const label =
          st === 'absent'
            ? 'Absent'
            : st === 'leave'
              ? 'Leave'
              : st === 'sick'
                ? 'Sick'
                : 'Present';
        const id = `att-save-${Date.now()}-${seq}`;
        seq += 1;
        state.data.attendance.push({
          id,
          student: m.studentName,
          classLevel,
          stage,
          section,
          className: `${classLevel}-${section}`,
          date: displayDate,
          checkIn: label === 'Absent' ? 'No record' : '—',
          status: label,
          remark: m.remark || '',
        });
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAcademicsData.pending, (state) => {
        state.loadStatus = 'loading';
      })
      .addCase(fetchAcademicsData.fulfilled, (state, action) => {
        state.loadStatus = 'succeeded';
        state.data.students = action.payload.students;
        state.data.attendance = action.payload.attendance;
        state.data.grades = action.payload.grades;
      })
      .addCase(fetchAcademicsData.rejected, (state) => {
        state.loadStatus = 'failed';
      });
  },
});

export const {
  setSectionSearchQuery,
  setSectionStatusFilter,
  setSectionStageFilter,
  setSectionClassFilter,
  setSectionSectionFilter,
  setSectionPage,
  addClassToStage,
  removeClassFromStage,
  addSectionToClass,
  removeSectionFromClass,
  bulkImportStudents,
  saveAttendanceMarks,
} = academicsSlice.actions;
export const selectAcademicsStatus = (state) => state.academics.loadStatus;
export const selectAcademicsSectionItems = (state, section) => state.academics.data[section] ?? [];
export const selectAcademicsSectionUi = (state, section) => state.academics.ui[section] ?? createUi();
export const selectAcademicsStructure = (state) => state.academics.structure ?? createStructure();
export const selectStageOrder = (state) => selectAcademicsStructure(state).stageOrder ?? [];
export const selectStageClasses = (state, stage) =>
  selectAcademicsStructure(state).stages?.[stage]?.classes?.map((c) => c.name) ?? [];
export const selectClassSections = (state, stage, className) =>
  selectAcademicsStructure(state).stages?.[stage]?.classes?.find((c) => c.name === className)?.sections ?? [];

export default academicsSlice.reducer;

