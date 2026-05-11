import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const statuses = ['Active', 'On Leave', 'Inactive'];

const buildMockList = (seedItems, targetCount, mapper) => {
  const items = [...seedItems];
  for (let i = items.length; i < targetCount; i += 1) {
    items.push(mapper(i));
  }
  return items;
};

export const TEACHER_CATEGORIES = ['Pre Primary', 'Primary', 'Secondary'];

export const TEACHER_DEPARTMENTS = [
  'Maths',
  'Physics',
  'Chemistry',
  'Social Studies',
  'English',
  'Second Language',
];

/** Directory filter + department pills (Staff Directory UI). */
export const STAFF_DIRECTORY_DEPARTMENTS = [
  'Administration',
  'Mathematics',
  'Science',
  'Humanities',
  'Support Staff',
];

export const OPERATIONAL_DEPARTMENTS = ['Driver', 'Helper', 'Maintenance', 'Service'];

const TEACHER_PREVIOUS_SCHOOLS = [
  'Green Valley Public School',
  'St. Marys Senior Secondary',
  'Oakridge International School',
  'Delhi Public Academy',
  'National Model School',
  'Sunrise High School',
];

const TEACHER_QUALIFICATIONS = [
  'M.Ed, B.Ed, MA English',
  'M.Sc Mathematics, B.Ed',
  'M.Sc Chemistry, B.Ed',
  'M.Sc Physics, B.Ed',
  'MA History, B.Ed',
  'BA English, Diploma in Early Education',
];

const TEACHER_DOCUMENT_SETS = [
  'Resume, ID Proof, Degree Certificates',
  'Resume, B.Ed Certificate, Experience Letter',
  'Resume, Police Verification, Degree Certificates',
  'Resume, Address Proof, Qualification Certificates',
];

const buildTeacherDocuments = (seq, ix, extraCertificate = 'Other Certificate') => {
  const serial = String(seq).padStart(4, '0');
  const documents = [
    {
      id: 'aadhaar',
      label: 'Aadhaar Card',
      fileName: `teacher-aadhaar-${serial}.pdf`,
      status: 'Uploaded',
      required: true,
    },
    {
      id: 'resume',
      label: 'Resume',
      fileName: `teacher-resume-${serial}.pdf`,
      status: 'Uploaded',
      required: true,
    },
    {
      id: 'qualificationCertificate',
      label: 'Qualification Certificate',
      fileName: `qualification-certificate-${serial}.pdf`,
      status: 'Uploaded',
      required: true,
    },
    {
      id: 'experienceLetter',
      label: 'Experience Letter',
      fileName: ix % 3 === 0 ? '' : `experience-letter-${serial}.pdf`,
      status: ix % 3 === 0 ? 'Not Provided' : 'Uploaded',
      required: false,
    },
    {
      id: 'otherCertificate',
      label: extraCertificate,
      fileName: ix % 4 === 0 ? `teacher-other-certificate-${serial}.pdf` : '',
      status: ix % 4 === 0 ? 'Uploaded' : 'Not Provided',
      required: false,
    },
  ];

  return documents.filter((doc) => doc.required || doc.status === 'Uploaded');
};

const createTeacherMock = () => {
  const base = [
    {
      id: 't-001',
      name: 'Dr. Elena Rodriguez',
      empId: 'CP-2024-001',
      role: 'Principal',
      roleDetail: 'Since 2018',
      category: 'Secondary',
      department: 'English',
      directoryDepartment: 'Administration',
      email: 'elena.r@campus360.edu',
      phone: '+1 (555) 012-3456',
      status: 'Active',
      experience: '14 years in school leadership and English instruction',
      previousSchool: 'Oakridge International School',
      documents: 'Resume, ID Proof, Doctorate Certificate, Experience Letter',
      workingYears: 6,
      qualifications: 'PhD English Literature, M.Ed, B.Ed',
      uploadedDocuments: buildTeacherDocuments(1, 0, 'Doctorate Certificate'),
    },
    {
      id: 't-002',
      name: 'Mark Stevenson',
      empId: 'CP-2024-114',
      role: 'Senior Teacher',
      roleDetail: 'Class 12-B Lead',
      category: 'Secondary',
      department: 'Maths',
      directoryDepartment: 'Mathematics',
      email: 'm.stevenson@campus360.edu',
      phone: '+1 (555) 789-0123',
      status: 'Active',
      experience: '10 years teaching senior mathematics',
      previousSchool: 'Green Valley Public School',
      documents: 'Resume, B.Ed Certificate, Degree Certificates',
      workingYears: 5,
      qualifications: 'M.Sc Mathematics, B.Ed',
      uploadedDocuments: buildTeacherDocuments(2, 1, 'B.Ed Certificate'),
    },
    {
      id: 't-003',
      name: 'Sarah Jenkins',
      empId: 'CP-2024-056',
      role: 'Lab Coordinator',
      roleDetail: 'Science Wing',
      category: 'Secondary',
      department: 'Chemistry',
      directoryDepartment: 'Science',
      email: 's.jenkins@campus360.edu',
      phone: '+1 (555) 456-7890',
      status: 'On Leave',
      experience: '8 years across chemistry labs and science curriculum',
      previousSchool: 'National Model School',
      documents: 'Resume, Lab Safety Certificate, Degree Certificates',
      workingYears: 4,
      qualifications: 'M.Sc Chemistry, B.Ed',
      uploadedDocuments: buildTeacherDocuments(3, 2, 'Lab Safety Certificate'),
    },
    {
      id: 't-004',
      name: 'Albert Finch',
      empId: 'CP-2024-209',
      role: 'Accountant',
      roleDetail: 'Finance Dept',
      category: 'Secondary',
      department: 'Social Studies',
      directoryDepartment: 'Administration',
      email: 'a.finch@campus360.edu',
      phone: '+1 (555) 234-5678',
      status: 'Active',
      experience: '12 years in academic administration and accounts',
      previousSchool: 'St. Marys Senior Secondary',
      documents: 'Resume, ID Proof, Finance Certification',
      workingYears: 7,
      qualifications: 'MBA Finance, B.Com',
      uploadedDocuments: buildTeacherDocuments(4, 3, 'Finance Certification'),
    },
  ];
  const roles = ['Math Teacher', 'Physics Lecturer', 'Chemistry Teacher', 'Biology Teacher', 'English Faculty', 'History Teacher'];
  const roleDetails = ['Since 2019', 'Key Stage Lead', 'Dept. liaison', 'Curriculum chair', 'Mentor teacher', 'Exam coordinator'];
  return buildMockList(base, 156, (i) => ({
    id: `t-${String(i + 1).padStart(3, '0')}`,
    name: `Teacher ${i + 1}`,
    empId: `CP-2024-${String(100 + i)}`,
    role: roles[i % roles.length],
    roleDetail: roleDetails[i % roleDetails.length],
    category: TEACHER_CATEGORIES[i % TEACHER_CATEGORIES.length],
    department: TEACHER_DEPARTMENTS[i % TEACHER_DEPARTMENTS.length],
    directoryDepartment: STAFF_DIRECTORY_DEPARTMENTS[i % STAFF_DIRECTORY_DEPARTMENTS.length],
    email: `teacher${i + 1}@campus360.edu`,
    phone: `+1 (555) ${String(100 + i).padStart(3, '0')}-${String(2000 + i).padStart(4, '0')}`,
    status: statuses[i % statuses.length],
    experience: `${4 + (i % 16)} years in ${TEACHER_DEPARTMENTS[i % TEACHER_DEPARTMENTS.length]} teaching`,
    previousSchool: TEACHER_PREVIOUS_SCHOOLS[i % TEACHER_PREVIOUS_SCHOOLS.length],
    documents: TEACHER_DOCUMENT_SETS[i % TEACHER_DOCUMENT_SETS.length],
    workingYears: 1 + (i % 12),
    qualifications: TEACHER_QUALIFICATIONS[i % TEACHER_QUALIFICATIONS.length],
    uploadedDocuments: buildTeacherDocuments(i + 1, i, TEACHER_DOCUMENT_SETS[i % TEACHER_DOCUMENT_SETS.length].split(', ').at(-1)),
  }));
};

const createAdministrationMock = () => {
  const base = [
    { id: 'a-001', name: 'Eleanor Vance', empId: 'AD-4001', role: 'Principal', department: 'Office of Provost', email: 'e.vance@school.edu', phone: '+1 (555) 112-8831', status: 'Active' },
    { id: 'a-002', name: 'Julian Thorne', empId: 'AD-4022', role: 'Registrar', department: 'Academic Affairs', email: 'j.thorne@school.edu', phone: '+1 (555) 784-2911', status: 'On Leave' },
    { id: 'a-003', name: 'Marcus Chen', empId: 'AD-4008', role: 'Financial Officer', department: "Bursar's Office", email: 'm.chen@school.edu', phone: '+1 (555) 301-8812', status: 'Active' },
  ];
  const roles = ['Registrar', 'Financial Officer', 'Admissions Director', 'HR Manager', 'Compliance Officer'];
  const departments = ['Academic Affairs', "Bursar's Office", 'Enrollment Services', 'HR Office', 'Admin Operations'];
  return buildMockList(base, 42, (i) => ({
    id: `a-${String(i + 1).padStart(3, '0')}`,
    name: `Admin ${i + 1}`,
    empId: `AD-${4000 + i}`,
    role: roles[i % roles.length],
    department: departments[i % departments.length],
    email: `admin${i + 1}@school.edu`,
    phone: `+1 (555) ${String(220 + i).padStart(3, '0')}-${String(3100 + i).padStart(4, '0')}`,
    status: statuses[(i + 1) % statuses.length],
  }));
};

const createOperationalMock = () => {
  const base = [
    { id: 'o-001', name: 'Marcus Chen', empId: 'OP-8821', role: 'Security Head', department: 'Maintenance', shift: '06:00 AM - 02:00 PM', email: 'm.chen@school.edu', phone: 'Ext: 402', status: 'Active' },
    { id: 'o-002', name: 'Elena Rodriguez', empId: 'OP-9043', role: 'IT Support Lead', department: 'Service', shift: '09:00 AM - 05:00 PM', email: 'e.rodriguez@school.edu', phone: 'Ext: 551', status: 'On Leave' },
    { id: 'o-003', name: 'Jameson Blake', empId: 'OP-7732', role: 'Facilities Manager', department: 'Maintenance', shift: '08:00 AM - 04:00 PM', email: 'j.blake@school.edu', phone: 'Ext: 108', status: 'Active' },
  ];
  const roles = ['Security Officer', 'IT Support Engineer', 'Facilities Manager', 'Network Admin', 'Maintenance Technician'];
  const shifts = ['06:00 AM - 02:00 PM', '08:00 AM - 04:00 PM', '09:00 AM - 05:00 PM', '12:00 PM - 08:00 PM'];
  return buildMockList(base, 42, (i) => ({
    id: `o-${String(i + 1).padStart(3, '0')}`,
    name: `Ops Staff ${i + 1}`,
    empId: `OP-${7000 + i}`,
    role: roles[i % roles.length],
    department: OPERATIONAL_DEPARTMENTS[i % OPERATIONAL_DEPARTMENTS.length],
    shift: shifts[i % shifts.length],
    email: `ops${i + 1}@school.edu`,
    phone: `Ext: ${400 + i}`,
    status: statuses[(i + 2) % statuses.length],
  }));
};

const sectionKeys = ['teachers', 'administration', 'operational'];

const createUiState = () => ({
  searchQuery: '',
  statusFilter: 'all',
  categoryFilter: 'all',
  departmentFilter: 'all',
  page: 1,
  pageSize: 5,
});

const createTeachersDirectoryUiState = () => ({
  ...createUiState(),
  statusFilter: 'Active',
  pageSize: 10,
});

export const fetchEmployeesData = createAsyncThunk('employees/fetchEmployeesData', async () => ({
  teachers: createTeacherMock(),
  administration: createAdministrationMock(),
  operational: createOperationalMock(),
}));

const employeesSlice = createSlice({
  name: 'employees',
  initialState: {
    loadStatus: 'idle',
    data: {
      teachers: [],
      administration: [],
      operational: [],
    },
    ui: {
      teachers: createTeachersDirectoryUiState(),
      administration: createUiState(),
      operational: createUiState(),
    },
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
    setSectionCategoryFilter(state, action) {
      const { section, value } = action.payload;
      state.ui[section].categoryFilter = value;
      state.ui[section].page = 1;
    },
    setSectionDepartmentFilter(state, action) {
      const { section, value } = action.payload;
      state.ui[section].departmentFilter = value;
      state.ui[section].page = 1;
    },
    setSectionPage(state, action) {
      const { section, value } = action.payload;
      state.ui[section].page = value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeesData.pending, (state) => {
        state.loadStatus = 'loading';
      })
      .addCase(fetchEmployeesData.fulfilled, (state, action) => {
        state.loadStatus = 'succeeded';
        sectionKeys.forEach((key) => {
          state.data[key] = action.payload[key] ?? [];
        });
      })
      .addCase(fetchEmployeesData.rejected, (state) => {
        state.loadStatus = 'failed';
      });
  },
});

export const {
  setSectionSearchQuery,
  setSectionStatusFilter,
  setSectionCategoryFilter,
  setSectionDepartmentFilter,
  setSectionPage,
} = employeesSlice.actions;

export const selectEmployeesStatus = (state) => state.employees.loadStatus;
export const selectEmployeesSectionItems = (state, section) => state.employees.data[section] ?? [];
export const selectEmployeesSectionUi = (state, section) => state.employees.ui[section] ?? createUiState();

export default employeesSlice.reducer;

