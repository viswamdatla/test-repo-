import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import { fetchEmployeesData, selectEmployeesSectionItems, selectEmployeesStatus } from '../../store/employees/employeesSlice';
import '../Academics/SectionTimeTablePage.scss';
import './EmployeeDetailPage.scss';

const sectionTitle = (section) => {
  if (section === 'teachers') return 'Teacher Profile';
  if (section === 'administration') return 'Administration Profile';
  if (section === 'operational') return 'Operational Staff Profile';
  return 'Employee Profile';
};

const TEACHER_TIMETABLE_DAYS = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
];

const formatWorkingYears = (years) => {
  if (years === undefined || years === null || years === '') return undefined;
  const numericYears = Number(years);
  if (Number.isNaN(numericYears)) return years;
  return `${numericYears} year${numericYears === 1 ? '' : 's'}`;
};

const escapePreviewText = (value) =>
  String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const openTeacherDocumentPreview = (doc, teacherName) => {
  if (doc.url) {
    globalThis.open(doc.url, '_blank', 'noopener,noreferrer');
    return;
  }

  const title = escapePreviewText(doc.label || 'Uploaded Document');
  const fileName = escapePreviewText(doc.fileName || 'Document file');
  const owner = escapePreviewText(teacherName || 'Teacher');
  const html = `<!doctype html>
<html>
  <head>
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; background: #f5f7fb; color: #111827; }
      main { max-width: 760px; margin: 48px auto; background: #fff; border: 1px solid #d9dee8; border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
      .label { color: #005da7; font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
      h1 { margin: 10px 0 8px; font-size: 32px; }
      p { color: #475569; line-height: 1.6; }
      .preview { margin-top: 24px; min-height: 340px; border: 2px dashed #c8d7ef; border-radius: 16px; display: grid; place-items: center; text-align: center; background: #f8fbff; }
      .file { font-weight: 800; color: #111827; }
    </style>
  </head>
  <body>
    <main>
      <div class="label">Uploaded Document Preview</div>
      <h1>${title}</h1>
      <p>Teacher: <strong>${owner}</strong></p>
      <p class="file">${fileName}</p>
      <div class="preview">
        <div>
          <h2>Document preview placeholder</h2>
          <p>Connect a storage URL in <code>doc.url</code> to show the real uploaded file here.</p>
        </div>
      </div>
    </main>
  </body>
</html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  globalThis.open(url, '_blank', 'noopener,noreferrer');
  setTimeout(() => URL.revokeObjectURL(url), 30000);
};

const detailFieldsFor = (employee, section) => {
  if (!employee) return [];
  const common = [
    { label: 'Name', value: employee.name },
    { label: 'Employee ID', value: employee.empId },
    { label: 'Role', value: employee.role },
    { label: 'Department', value: employee.department },
    { label: 'Email', value: employee.email },
    { label: 'Phone', value: employee.phone },
    { label: 'Current Status', value: employee.status },
  ];
  if (section === 'teachers') {
    return [
      { label: 'Department', value: employee.department },
      { label: 'Email', value: employee.email },
      { label: 'Phone', value: employee.phone },
      {
        label: 'Teacher Class / Working Years',
        type: 'classYears',
        classValue: employee.category,
        yearsValue: formatWorkingYears(employee.workingYears),
      },
      { label: 'Experience', value: employee.experience },
      { label: 'Previous School', value: employee.previousSchool },
      { label: 'Documents', value: employee.documents },
      { label: 'Qualifications', value: employee.qualifications },
    ];
  }
  if (section === 'operational') {
    return [...common, { label: 'Shift Time', value: employee.shift }];
  }
  return common;
};

const scoreFromEmployee = (employee) => {
  const token = String(employee?.empId || employee?.id || '');
  return [...token].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
};

const metaFromEmployee = (employee) => {
  const score = scoreFromEmployee(employee);
  const totalLeaves = (score % 8) + 1;
  const approvalStatus = score % 3 === 0 ? 'Rejected' : 'Approved';
  const attendance = 86 + (score % 13);
  const avgGrade = 72 + (score % 22);
  const completedTasks = 110 + (score % 75);
  const resourcesCreated = 18 + (score % 40);
  return { totalLeaves, approvalStatus, attendance, avgGrade, completedTasks, resourcesCreated };
};

const joinedLabelFromScore = (score) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = 2014 + (score % 10);
  const month = months[score % 12];
  return `Joined ${month} ${year}`;
};

const adminKpisFrom = (score) => ({
  budgetEfficiency: (96 + (score % 4) + (score % 10) / 10).toFixed(1),
  budgetDelta: `+${(1 + (score % 3) + (score % 10) / 10).toFixed(1)}%`,
  uptime: (99.5 + (score % 5) / 10).toFixed(1),
  uptimeDelta: `+${(0.2 + (score % 4) / 10).toFixed(1)}%`,
  satisfaction: (4.5 + (score % 6) / 10).toFixed(1),
});

const expertiseFrom = (score) => [
  { label: 'Budget Oversight', pct: 90 + (score % 11) },
  { label: 'Operations Management', pct: 82 + (score % 15) },
  { label: 'Policy Compliance', pct: Math.min(100, 96 + (score % 5)) },
  { label: 'Strategic Planning', pct: 88 + (score % 10) },
];

const adminResponsibilities = (department) => {
  const dept = department || 'the institution';
  return [
    {
      title: 'Annual Budgeting',
      body: `Developing and monitoring operational budgets with fiscal accountability across departments aligned with ${dept}.`,
    },
    {
      title: 'Facility Optimization',
      body: 'Overseeing maintenance and sustainability initiatives for campus facilities and core academic buildings.',
    },
    {
      title: 'Faculty Liaison',
      body: 'Bridging administrative priorities with academic programs and recurring operations committee work.',
    },
    {
      title: 'Compliance Risk',
      body: 'Auditing safety protocols and education standards to maintain strong compliance and documentation.',
    },
  ];
};

const adminTimelineFrom = (employee) => {
  const org = 'Campus360';
  const prior = 'Regional Academy';
  return [
    {
      title: employee.role,
      range: '2021 — Present',
      org,
      body: `Leading administrative programs for ${employee.department || 'Academic Affairs'} and cross-functional initiatives.`,
      current: true,
    },
    {
      title: 'Operations Manager',
      range: '2018 — 2021',
      org,
      body: 'Optimized procurement workflows and streamlined administrative service delivery.',
      current: false,
    },
    {
      title: 'Assistant Registrar',
      range: '2014 — 2018',
      org: prior,
      body: 'Managed enrollment data integrity and academic records operations.',
      current: false,
    },
  ];
};

const opsMetricsFrom = (score) => ({
  responseMins: (3.5 + (score % 8) / 10).toFixed(1),
  assetHealth: 94 + (score % 7),
  auditLabel: score % 4 === 0 ? 'A+' : score % 4 === 1 ? 'A' : 'A-',
  auditSub: score % 2 === 0 ? 'Superior' : 'Strong',
});

const opsDomainsFrom = (department) => {
  const d = department || 'Campus';
  return [
    {
      icon: 'engineering',
      title: 'Facility Maintenance',
      body: `Oversees structural and mechanical assets for ${d}, including predictive maintenance planning.`,
      tags: ['Buildings', 'HVAC'],
    },
    {
      icon: 'gpp_maybe',
      title: 'Safety Protocols',
      body: 'Emergency coordination, drills, and access control aligned with campus safety standards.',
      tags: ['Crisis MGMT', 'Compliance'],
    },
    {
      icon: 'inventory_2',
      title: 'Inventory Management',
      body: 'Centralized equipment kits, audits, and readiness tracking for operational teams.',
      tags: ['Kit-Ops', 'QR Tracking'],
    },
    {
      icon: 'groups',
      title: 'Team Coordination',
      body: 'Shift coverage, cross-training, and deployment readiness across support staff.',
      tags: ['Leadership', 'Scheduler'],
    },
  ];
};

const opsEquipmentFrom = (employee, score) => {
  const id = String(employee?.empId || '').replace(/\D/g, '').slice(-3) || String(score % 900 + 100);
  return [
    { icon: 'medical_services', name: 'Emergency Response Kit', meta: `Asset #SK-${id} • Last audit current`, status: 'Ready' },
    { icon: 'router', name: 'Maintenance Hub Mobile Control', meta: `Asset #MH-${Number(id) + 60} • Network linked`, status: 'Active' },
    { icon: 'radio', name: 'Long-Range Communication Array', meta: `Asset #RT-${Number(id) % 90 + 10} • In service`, status: 'Verified' },
  ];
};

const initialsOf = (name) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const termPerformanceFrom = (employee) => {
  const score = scoreFromEmployee(employee);
  return [
    { label: 'Quizzes', value: 68 + (score % 25) },
    { label: 'Midterms', value: 64 + ((score + 7) % 29) },
    { label: 'Projects', value: 70 + ((score + 11) % 24) },
    { label: 'Finals', value: 60 + ((score + 17) % 31) },
    { label: 'Homework', value: 74 + ((score + 5) % 20) },
  ];
};

const assignedClassesFrom = (employee) => {
  const dept = employee?.department || 'General Studies';
  const tag = employee?.category || 'Standard';
  return [
    { code: '10A', name: `Core ${dept}`, students: 28, room: 'Room 302', score: 89, tag },
    { code: '11B', name: `${dept} Applied`, students: 31, room: 'Lab 02', score: 82, tag },
    { code: '12C', name: `${dept} Advanced`, students: 24, room: 'Room 401', score: 76, tag },
    { code: '09A', name: `${dept} Foundation`, students: 30, room: 'Room 208', score: 84, tag },
    { code: '08B', name: `${dept} Enrichment`, students: 27, room: 'Room 214', score: 79, tag },
    { code: '07C', name: `${dept} Workshop`, students: 26, room: 'Lab 01', score: 87, tag },
    { code: '06A', name: `${dept} Basics`, students: 32, room: 'Room 118', score: 81, tag },
    { code: '05B', name: `${dept} Prep`, students: 29, room: 'Room 110', score: 74, tag },
  ];
};

const teacherClassSlot = (subject, room, accent = 'var(--primary)') => ({
  type: 'class',
  subject,
  room,
  accent,
});

const teacherFreeSlot = { type: 'free' };

const teacherTimetableFrom = (employee) => {
  const dept = employee?.department || 'Subject';
  const shortCategory = employee?.category || 'General';
  return [
    {
      type: 'period',
      time: '09:00 AM',
      ordinal: '1st Period',
      slots: {
        mon: teacherClassSlot(`${dept} 10A`, 'Room 302', 'var(--primary)'),
        tue: teacherClassSlot(`${dept} 11B`, 'Room 305', '#4caf50'),
        wed: teacherClassSlot(`${dept} 10A`, 'Room 302', 'var(--primary)'),
        thu: teacherClassSlot(`${dept} 12C`, 'Room 401', '#009688'),
        fri: teacherClassSlot(`${shortCategory} Mentoring`, 'Room 204', '#795548'),
      },
    },
    {
      type: 'period',
      time: '10:00 AM',
      ordinal: '2nd Period',
      slots: {
        mon: teacherClassSlot(`${dept} 11B`, 'Room 305', '#4caf50'),
        tue: teacherFreeSlot,
        wed: teacherClassSlot(`${dept} 12C`, 'Room 401', '#009688'),
        thu: teacherClassSlot(`${dept} 10A`, 'Room 302', 'var(--primary)'),
        fri: teacherClassSlot('Assessment Review', 'Faculty Room', '#3f51b5'),
      },
    },
    {
      type: 'period',
      time: '11:00 AM',
      ordinal: '3rd Period',
      slots: {
        mon: teacherFreeSlot,
        tue: teacherClassSlot(`${dept} 12C`, 'Room 401', '#009688'),
        wed: teacherClassSlot('Lesson Planning', 'Faculty Room', '#ff9800'),
        thu: teacherFreeSlot,
        fri: teacherClassSlot(`${dept} 11B`, 'Room 305', '#4caf50'),
      },
    },
    { type: 'lunch', label: 'Lunch Break · 12:30–1:15 PM' },
    {
      type: 'period',
      time: '01:15 PM',
      ordinal: '4th Period',
      slots: {
        mon: teacherClassSlot(`${dept} Lab`, 'Lab 02', '#e91e63'),
        tue: teacherClassSlot(`${dept} 10A`, 'Room 302', 'var(--primary)'),
        wed: teacherFreeSlot,
        thu: teacherClassSlot(`${dept} 11B`, 'Room 305', '#4caf50'),
        fri: teacherClassSlot('Remedial Class', 'Room 210', '#9c27b0'),
      },
    },
    {
      type: 'period',
      time: '02:15 PM',
      ordinal: '5th Period',
      slots: {
        mon: teacherClassSlot(`${dept} 12C`, 'Room 401', '#009688'),
        tue: teacherClassSlot('Office Hours', 'Faculty Room', '#ffc107'),
        wed: teacherClassSlot(`${dept} Lab`, 'Lab 02', '#e91e63'),
        thu: teacherClassSlot('Department Meet', 'Conference Hall', '#3f51b5'),
        fri: teacherFreeSlot,
      },
    },
    {
      type: 'period',
      time: '03:15 PM',
      ordinal: '6th Period',
      slots: {
        mon: teacherClassSlot('Club Activity', 'Activity Room', '#f44336'),
        tue: teacherFreeSlot,
        wed: teacherClassSlot(`${dept} 10A`, 'Room 302', 'var(--primary)'),
        thu: teacherClassSlot(`${dept} 12C`, 'Room 401', '#009688'),
        fri: teacherClassSlot('Weekly Review', 'Faculty Room', '#795548'),
      },
    },
    {
      type: 'period',
      time: '04:15 PM',
      ordinal: '7th Period',
      slots: {
        mon: teacherFreeSlot,
        tue: teacherClassSlot('Parent Interaction', 'Counselling Room', '#ff9800'),
        wed: teacherClassSlot('Resource Prep', 'Faculty Room', '#ffc107'),
        thu: teacherFreeSlot,
        fri: teacherClassSlot('Staff Meeting', 'Auditorium', '#3f51b5'),
      },
    },
  ];
};

const renderTeacherTimetableSlot = (display) => {
  if (display.type === 'free') {
    return (
      <div className="sec-tt-slot sec-tt-slot--free">
        <span className="sec-tt-slot-free-label">Free period</span>
      </div>
    );
  }

  return (
    <div className="sec-tt-slot" style={{ borderLeftColor: display.accent }}>
      <span className="sec-tt-slot-subject">{display.subject}</span>
      <div className="sec-tt-slot-teacher">
        <span className="material-symbols-outlined">location_on</span>
        <span>{display.room}</span>
      </div>
    </div>
  );
};

const TeacherUploadedDocumentsCard = ({ employee }) => {
  const documents = Array.isArray(employee.uploadedDocuments) ? employee.uploadedDocuments : [];

  return (
    <article className="emp-detail-card emp-card-documents">
      <div className="emp-uploaded-documents-head">
        <h2>
          <span className="material-symbols-outlined" aria-hidden>
            folder_copy
          </span>
          Uploaded Documents
        </h2>
        <span className="emp-uploaded-documents-pill">Pending Review</span>
      </div>

      {documents.length > 0 ? (
        <div className="emp-uploaded-documents-list">
          {documents.map((doc) => {
            const uploaded = doc.status === 'Uploaded';
            return (
              <div key={doc.id || doc.label} className="emp-uploaded-document-row">
                <div className={`emp-uploaded-document-icon ${uploaded ? '' : 'is-muted'}`}>
                  <span className="material-symbols-outlined">{uploaded ? 'description' : 'draft'}</span>
                </div>
                <div className="emp-uploaded-document-main">
                  <p className="emp-uploaded-document-label">
                    {doc.label}
                    {doc.required && <span>Required</span>}
                  </p>
                  <p className="emp-uploaded-document-file">{doc.fileName || 'Not provided'}</p>
                </div>
                <span className={uploaded ? 'emp-uploaded-document-status' : 'emp-uploaded-document-status is-missing'}>
                  {doc.status || 'Not Provided'}
                </span>
                {uploaded && (
                  <button
                    type="button"
                    className="emp-uploaded-document-view"
                    onClick={() => openTeacherDocumentPreview(doc, employee.name)}
                  >
                    View
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="emp-uploaded-documents-empty">No uploaded documents are recorded for this teacher.</p>
      )}
    </article>
  );
};

export const EmployeeDetailPage = () => {
  const { section, employeeId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loadStatus = useSelector(selectEmployeesStatus);
  const items = useSelector((state) => selectEmployeesSectionItems(state, section || 'teachers'));

  usePageTitle('Employee Details');

  useEffect(() => {
    if (loadStatus === 'idle') dispatch(fetchEmployeesData());
  }, [dispatch, loadStatus]);

  const employee = useMemo(() => items.find((it) => String(it.id) === String(employeeId)), [items, employeeId]);
  const score = useMemo(() => scoreFromEmployee(employee), [employee]);
  const { totalLeaves, approvalStatus, attendance, avgGrade, completedTasks, resourcesCreated } = useMemo(
    () => metaFromEmployee(employee),
    [employee]
  );
  const detailFields = useMemo(() => detailFieldsFor(employee, section), [employee, section]);
  const assignedClasses = useMemo(() => assignedClassesFrom(employee), [employee]);
  const termPerformance = useMemo(() => termPerformanceFrom(employee), [employee]);
  const teacherTimetable = useMemo(() => teacherTimetableFrom(employee), [employee]);

  const adminKpis = useMemo(() => adminKpisFrom(score), [score]);
  const expertise = useMemo(() => expertiseFrom(score), [score]);
  const adminResp = useMemo(() => adminResponsibilities(employee?.department), [employee?.department]);
  const adminTimeline = useMemo(() => adminTimelineFrom(employee), [employee]);
  const opsMetrics = useMemo(() => opsMetricsFrom(score), [score]);
  const opsDomains = useMemo(() => opsDomainsFrom(employee?.department), [employee?.department]);
  const opsEquipment = useMemo(() => opsEquipmentFrom(employee, score), [employee, score]);

  const [leaveFilter, setLeaveFilter] = useState('1w');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const filteredLeaves = useMemo(() => {
    if (!totalLeaves) return 0;
    if (leaveFilter === '1d') return Math.max(0, Math.min(totalLeaves, 1));
    if (leaveFilter === '1w') return Math.max(0, Math.min(totalLeaves, 2));
    if (leaveFilter === '1m') return totalLeaves;
    if (leaveFilter === 'custom') {
      if (!customFrom || !customTo) return totalLeaves;
      const from = new Date(customFrom);
      const to = new Date(customTo);
      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) return 0;
      const diffDays = Math.max(1, Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1);
      const scaled = Math.round((totalLeaves * Math.min(diffDays, 30)) / 30);
      return Math.max(0, Math.min(totalLeaves, scaled));
    }
    return totalLeaves;
  }, [totalLeaves, leaveFilter, customFrom, customTo]);

  if (loadStatus === 'loading' && !employee) {
    return <div className="emp-detail-page">Loading employee details...</div>;
  }

  if (!employee) {
    return (
      <div className="emp-detail-page">
        <button type="button" className="emp-detail-back" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>
        <div className="emp-detail-empty">Employee not found.</div>
      </div>
    );
  }

  const joinedLabel = joinedLabelFromScore(score);
  const isTeacher = section === 'teachers';
  const isAdmin = section === 'administration';
  const isOps = section === 'operational';

  return (
    <div className="emp-detail-page">
      <div className="emp-detail-shell">
        <button type="button" className="emp-detail-back" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>

        {isTeacher && (
          <>
            <section className="emp-detail-hero">
              <div className="emp-detail-avatar" aria-hidden="true">
                {initialsOf(employee.name)}
              </div>
              <div className="emp-detail-hero-content">
                <div className="emp-detail-badges">
                  <span className="emp-badge emp-badge-primary">{employee.category || 'Faculty'}</span>
                  <span className="emp-badge">{employee.empId}</span>
                  <span className="emp-badge">{employee.status}</span>
                </div>
                <h1>{employee.name}</h1>
                <p>
                  {employee.role} • {employee.department}
                </p>
                <div className="emp-detail-hero-actions">
                  <button type="button">
                    <span className="material-symbols-outlined">mail</span>
                    Contact
                  </button>
                  <button type="button">
                    <span className="material-symbols-outlined">download</span>
                    Download Profile
                  </button>
                </div>
              </div>
              <div className="emp-detail-side-kpis">
                <div className="emp-kpi emp-kpi-primary">
                  <span>Overall Attendance</span>
                  <strong>{attendance}%</strong>
                </div>
                <div className="emp-kpi">
                  <span>Class Grade Average</span>
                  <strong>{avgGrade}%</strong>
                </div>
              </div>
            </section>

            <section className="emp-detail-priority-grid">
              <article className="emp-detail-card emp-card-qualifications">
                <h2>Academic Qualifications</h2>
                <div className="emp-detail-grid">
                  {detailFields.map((field) => (
                    field.type === 'classYears' ? (
                      <div key={field.label} className="emp-detail-field emp-detail-field--inline-pair">
                        <div className="emp-detail-mini-tile">
                          <span>Teacher Class</span>
                          <p>{field.classValue || '—'}</p>
                        </div>
                        <div className="emp-detail-mini-tile">
                          <span>Working Years</span>
                          <p>{field.yearsValue || '—'}</p>
                        </div>
                      </div>
                    ) : (
                      <div key={field.label} className="emp-detail-field">
                        <span>{field.label}</span>
                        <p>{field.value || '—'}</p>
                      </div>
                    )
                  ))}
                </div>
              </article>

              <TeacherUploadedDocumentsCard employee={employee} />

              <article className="emp-detail-card">
                <div className="emp-card-head">
                  <h2>Performance Metrics</h2>
                  <span>Current Term</span>
                </div>
                <div className="emp-top-kpi-grid">
                  <div className="emp-detail-metric">
                    <span>Total Leaves</span>
                    <strong>{filteredLeaves}</strong>
                  </div>
                  <div className="emp-detail-metric">
                    <span>Approve / Reject Status</span>
                    <strong className={approvalStatus === 'Approved' ? 'is-approved' : 'is-rejected'}>{approvalStatus}</strong>
                  </div>
                  <div className="emp-detail-metric">
                    <span>Tasks Completed</span>
                    <strong>{completedTasks}</strong>
                  </div>
                  <div className="emp-detail-metric">
                    <span>Resources Created</span>
                    <strong>{resourcesCreated}</strong>
                  </div>
                </div>
                <div className="emp-detail-filter-row">
                  <label htmlFor="leave-filter">Leave Filter</label>
                  <select id="leave-filter" value={leaveFilter} onChange={(e) => setLeaveFilter(e.target.value)}>
                    <option value="1d">1 Day</option>
                    <option value="1w">1 Week</option>
                    <option value="1m">1 Month</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                {leaveFilter === 'custom' && (
                  <div className="emp-detail-custom-range">
                    <div className="emp-detail-custom-field">
                      <label htmlFor="custom-from">From</label>
                      <input id="custom-from" type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                    </div>
                    <div className="emp-detail-custom-field">
                      <label htmlFor="custom-to">To</label>
                      <input id="custom-to" type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                    </div>
                  </div>
                )}
                <div className="emp-progress-list">
                  {termPerformance.map((item) => (
                    <div key={item.label} className="emp-progress-item">
                      <div>
                        <span>{item.label}</span>
                        <p>{item.value}%</p>
                      </div>
                      <div className="emp-progress-track">
                        <div className="emp-progress-fill" style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="emp-detail-card emp-wide">
                <div className="emp-card-head">
                  <h2>Assigned Classes</h2>
                  <span>Active loads</span>
                </div>
                <div className="emp-class-grid">
                  {assignedClasses.map((klass) => (
                    <div key={klass.code} className="emp-class-card">
                      <div className="emp-class-code">{klass.code}</div>
                      <div>
                        <h3>{klass.name}</h3>
                        <p>
                          {klass.students} Students • {klass.room}
                        </p>
                        <div className="emp-progress-track">
                          <div className="emp-progress-fill" style={{ width: `${klass.score}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="emp-detail-card emp-wide">
                <div className="emp-card-head">
                  <h2>Weekly Schedule</h2>
                  <span>Timetable</span>
                </div>
                <div className="emp-teacher-timetable">
                  <div className="sec-tt-legend">
                    <span className="material-symbols-outlined" aria-hidden>
                      calendar_month
                    </span>
                    <p>
                      Teacher timetable follows the same weekly grid used in the student timetable, with assigned
                      classes, rooms, free periods, and lunch break clearly separated.
                    </p>
                  </div>
                  <div className="emp-teacher-timetable-scroll">
                    <div className="sec-tt-grid-shell">
                      <div className="sec-tt-grid-head sec-tt-timetable-grid">
                        <div className="sec-tt-grid-head-cell sec-tt-grid-head-cell--period">Period</div>
                        {TEACHER_TIMETABLE_DAYS.map((day) => (
                          <div key={day.key} className="sec-tt-grid-head-cell sec-tt-grid-head-cell--day">
                            {day.label}
                          </div>
                        ))}
                      </div>

                      <div className="sec-tt-grid-body">
                        {teacherTimetable.map((period) => {
                          if (period.type === 'lunch') {
                            return (
                              <div key="teacher-lunch" className="sec-tt-lunch-row">
                                <span className="material-symbols-outlined" aria-hidden>
                                  restaurant
                                </span>
                                <span>{period.label}</span>
                              </div>
                            );
                          }

                          return (
                            <div key={period.ordinal} className="sec-tt-period-row sec-tt-timetable-grid">
                              <div className="sec-tt-period-col">
                                <span className="sec-tt-period-time">{period.time}</span>
                                <span className="sec-tt-period-ordinal">{period.ordinal}</span>
                              </div>
                              {TEACHER_TIMETABLE_DAYS.map((day) => (
                                <div key={`${period.ordinal}-${day.key}`} className="sec-tt-day-cell">
                                  {renderTeacherTimetableSlot(period.slots[day.key])}
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </section>
          </>
        )}

        {isAdmin && (
          <>
            <section className="emp-admin-hero">
              <div className="emp-admin-hero-glow" aria-hidden="true" />
              <div className="emp-admin-avatar-wrap">
                <div className="emp-detail-avatar emp-admin-avatar" aria-hidden="true">
                  {initialsOf(employee.name)}
                </div>
              </div>
              <div className="emp-admin-hero-main">
                <div className="emp-admin-hero-meta">
                  <span className="emp-badge emp-badge-primary">Active Status</span>
                  <span className="emp-admin-dot" aria-hidden="true">
                    •
                  </span>
                  <span className="emp-admin-joined">{joinedLabel}</span>
                </div>
                <h1>{employee.name}</h1>
                <p className="emp-admin-title">{employee.role}</p>
                <div className="emp-admin-actions">
                  <button type="button" className="emp-btn-outline">
                    <span className="material-symbols-outlined">mail</span>
                    Contact
                  </button>
                  <button type="button" className="emp-btn-primary-gradient">
                    <span className="material-symbols-outlined">download</span>
                    Download Dossier
                  </button>
                </div>
              </div>
            </section>

            <section className="emp-admin-kpi-row">
              <article className="emp-admin-kpi emp-admin-kpi--primary">
                <div className="emp-admin-kpi-head">
                  <span>Budget Efficiency</span>
                  <span className="material-symbols-outlined emp-admin-kpi-icon">account_balance_wallet</span>
                </div>
                <div className="emp-admin-kpi-value-row">
                  <strong>{adminKpis.budgetEfficiency}%</strong>
                  <span className="emp-trend-up">
                    <span className="material-symbols-outlined">arrow_upward</span>
                    {adminKpis.budgetDelta}
                  </span>
                </div>
                <p className="emp-admin-kpi-foot">Versus projected annual targets</p>
              </article>
              <article className="emp-admin-kpi emp-admin-kpi--tertiary">
                <div className="emp-admin-kpi-head">
                  <span>Operational Uptime</span>
                  <span className="material-symbols-outlined emp-admin-kpi-icon">settings_suggest</span>
                </div>
                <div className="emp-admin-kpi-value-row">
                  <strong>{adminKpis.uptime}%</strong>
                  <span className="emp-trend-up">
                    <span className="material-symbols-outlined">arrow_upward</span>
                    {adminKpis.uptimeDelta}
                  </span>
                </div>
                <p className="emp-admin-kpi-foot">Campus facilities and digital systems</p>
              </article>
              <article className="emp-admin-kpi emp-admin-kpi--secondary">
                <div className="emp-admin-kpi-head">
                  <span>Staff Satisfaction</span>
                  <span className="material-symbols-outlined emp-admin-kpi-icon">groups</span>
                </div>
                <div className="emp-admin-kpi-value-row emp-admin-sat">
                  <strong>{adminKpis.satisfaction}</strong>
                  <span className="emp-admin-sat-denom">/ 5.0</span>
                </div>
                <p className="emp-admin-kpi-foot">Based on quarterly faculty survey</p>
              </article>
            </section>

            <div className="emp-bento">
              <div className="emp-bento-main">
                <section className="emp-detail-card emp-bento-card">
                  <div className="emp-section-title-with-icon">
                    <span className="material-symbols-outlined emp-section-title-icon">assignment</span>
                    <h2>Key Responsibilities</h2>
                  </div>
                  <div className="emp-resp-grid">
                    {adminResp.map((r) => (
                      <div key={r.title} className="emp-resp-tile">
                        <h3>{r.title}</h3>
                        <p>{r.body}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="emp-detail-card emp-bento-card">
                  <h2>Career Timeline</h2>
                  <div className="emp-timeline">
                    {adminTimeline.map((item) => (
                      <div key={item.range} className={`emp-timeline-item ${item.current ? 'is-current' : ''}`}>
                        <div className="emp-timeline-dot" aria-hidden="true" />
                        <div className="emp-timeline-body">
                          <div className="emp-timeline-top">
                            <h3>{item.title}</h3>
                            <span className={item.current ? 'emp-timeline-pill is-active' : 'emp-timeline-pill'}>{item.range}</span>
                          </div>
                          <p className="emp-timeline-org">{item.org}</p>
                          <p className="emp-timeline-desc">{item.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="emp-detail-card emp-bento-card emp-record-card">
                  <h2>Directory record</h2>
                  <p className="emp-record-sub">All fields on file for this administrator.</p>
                  <div className="emp-detail-grid">
                    {detailFields.map((field) => (
                      <div key={field.label} className="emp-detail-field">
                        <span>{field.label}</span>
                        <p>{field.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="emp-detail-card emp-bento-card">
                  <div className="emp-card-head">
                    <h2>Leave and approvals</h2>
                    <span>Internal</span>
                  </div>
                  <div className="emp-top-kpi-grid">
                    <div className="emp-detail-metric">
                      <span>Total Leaves</span>
                      <strong>{filteredLeaves}</strong>
                    </div>
                    <div className="emp-detail-metric">
                      <span>Approve / Reject Status</span>
                      <strong className={approvalStatus === 'Approved' ? 'is-approved' : 'is-rejected'}>{approvalStatus}</strong>
                    </div>
                  </div>
                  <div className="emp-detail-filter-row">
                    <label htmlFor="leave-filter-admin">Leave Filter</label>
                    <select id="leave-filter-admin" value={leaveFilter} onChange={(e) => setLeaveFilter(e.target.value)}>
                      <option value="1d">1 Day</option>
                      <option value="1w">1 Week</option>
                      <option value="1m">1 Month</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  {leaveFilter === 'custom' && (
                    <div className="emp-detail-custom-range">
                      <div className="emp-detail-custom-field">
                        <label htmlFor="custom-from-admin">From</label>
                        <input id="custom-from-admin" type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                      </div>
                      <div className="emp-detail-custom-field">
                        <label htmlFor="custom-to-admin">To</label>
                        <input id="custom-to-admin" type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <aside className="emp-bento-side">
                <section className="emp-detail-card emp-expertise-card">
                  <h2>Expertise Focus</h2>
                  <div className="emp-expertise-list">
                    {expertise.map((row) => (
                      <div key={row.label} className="emp-expertise-row">
                        <div className="emp-expertise-labels">
                          <span>{row.label}</span>
                          <span className="emp-expertise-pct">{row.pct}%</span>
                        </div>
                        <div className="emp-progress-track">
                          <div className="emp-progress-fill" style={{ width: `${row.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="emp-verified-card">
                  <h3>
                    <span className="material-symbols-outlined">verified</span>
                    Admin Verified
                  </h3>
                  <div className="emp-verified-rows">
                    <div className="emp-verified-row">
                      <div className="emp-verified-icon">
                        <span className="material-symbols-outlined">workspace_premium</span>
                      </div>
                      <div>
                        <p className="emp-verified-k">Credential</p>
                        <p className="emp-verified-v">Masters in Educational Leadership (M.Ed)</p>
                      </div>
                    </div>
                    <div className="emp-verified-row">
                      <div className="emp-verified-icon">
                        <span className="material-symbols-outlined">verified_user</span>
                      </div>
                      <div>
                        <p className="emp-verified-k">Security Level</p>
                        <p className="emp-verified-v">Tier 1 Administrative Clearance</p>
                      </div>
                    </div>
                    <div className="emp-verified-row">
                      <div className="emp-verified-icon">
                        <span className="material-symbols-outlined">calendar_today</span>
                      </div>
                      <div>
                        <p className="emp-verified-k">Availability</p>
                        <p className="emp-verified-v">Mon - Fri | 08:00 - 17:00</p>
                      </div>
                    </div>
                  </div>
                  <button type="button" className="emp-verified-cta">
                    View Full Access Logs
                  </button>
                </section>

                <section className="emp-detail-card emp-map-card">
                  <div className="emp-map-visual">
                    <div className="emp-map-placeholder" />
                    <div className="emp-map-pin">
                      <span className="material-symbols-outlined">location_on</span>
                      Administration Block A
                    </div>
                  </div>
                  <p className="emp-map-foot">Primary Office: Floor 4, Suite 402 • {employee.department}</p>
                </section>
              </aside>
            </div>
          </>
        )}

        {isOps && (
          <>
            <section className="emp-op-hero">
              <div className="emp-op-hero-gradient" aria-hidden="true" />
              <div className="emp-op-hero-inner">
                <div className="emp-op-photo-wrap">
                  <div className="emp-detail-avatar emp-op-avatar" aria-hidden="true">
                    {initialsOf(employee.name)}
                  </div>
                  <span className="emp-op-online" aria-hidden="true" />
                </div>
                <div className="emp-op-hero-text">
                  <div className="emp-op-name-row">
                    <h1>{employee.name}</h1>
                    <span className="emp-badge emp-badge-primary">Active Duty</span>
                  </div>
                  <p className="emp-op-role">{employee.role}</p>
                  <div className="emp-op-meta-row">
                    <span className="emp-op-meta-item">
                      <span className="material-symbols-outlined">badge</span>
                      ID: {employee.empId}
                    </span>
                    <span className="emp-op-meta-item">
                      <span className="material-symbols-outlined">location_on</span>
                      {employee.department} / Campus
                    </span>
                    <span className="emp-op-meta-item emp-op-meta-verified">
                      <span className="material-symbols-outlined">verified</span>
                      Operations Lead
                    </span>
                  </div>
                </div>
                <div className="emp-op-hero-actions">
                  <button type="button" className="emp-btn-solid-primary">
                    <span className="material-symbols-outlined">mail</span>
                    Contact Staff
                  </button>
                  <button type="button" className="emp-btn-muted">
                    <span className="material-symbols-outlined">schedule</span>
                    View Log
                  </button>
                </div>
              </div>
            </section>

            <section className="emp-op-metrics">
              <article className="emp-op-metric emp-op-metric--primary">
                <div className="emp-op-metric-icon">
                  <span className="material-symbols-outlined">timer</span>
                </div>
                <div>
                  <p className="emp-op-metric-label">Response Time</p>
                  <p className="emp-op-metric-value">
                    {opsMetrics.responseMins} <span>mins</span>
                  </p>
                </div>
              </article>
              <article className="emp-op-metric emp-op-metric--health">
                <div className="emp-op-metric-icon emp-op-metric-icon--green">
                  <span className="material-symbols-outlined">health_metrics</span>
                </div>
                <div>
                  <p className="emp-op-metric-label">Asset Health Score</p>
                  <p className="emp-op-metric-value">
                    {opsMetrics.assetHealth} <span>%</span>
                  </p>
                </div>
              </article>
              <article className="emp-op-metric emp-op-metric--audit">
                <div className="emp-op-metric-icon emp-op-metric-icon--amber">
                  <span className="material-symbols-outlined">security</span>
                </div>
                <div>
                  <p className="emp-op-metric-label">Safety Audit Rating</p>
                  <p className="emp-op-metric-value">
                    {opsMetrics.auditLabel} <span>{opsMetrics.auditSub}</span>
                  </p>
                </div>
              </article>
            </section>

            <div className="emp-bento">
              <div className="emp-bento-main">
                <div className="emp-op-domain-grid">
                  {opsDomains.map((d) => (
                    <article key={d.title} className="emp-op-domain">
                      <span className="material-symbols-outlined emp-op-domain-icon">{d.icon}</span>
                      <h3>{d.title}</h3>
                      <p>{d.body}</p>
                      <div className="emp-op-domain-tags">
                        {d.tags.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>

                <section className="emp-detail-card emp-bento-card">
                  <div className="emp-card-head">
                    <h2>Equipment Assigned</h2>
                    <button type="button" className="emp-link-button">
                      Manage Assets
                    </button>
                  </div>
                  <div className="emp-equipment-list">
                    {opsEquipment.map((eq) => (
                      <div key={eq.name} className="emp-equipment-row">
                        <div className="emp-equipment-icon">
                          <span className="material-symbols-outlined">{eq.icon}</span>
                        </div>
                        <div className="emp-equipment-info">
                          <p className="emp-equipment-name">{eq.name}</p>
                          <p className="emp-equipment-meta">{eq.meta}</p>
                        </div>
                        <span className="emp-equipment-status">{eq.status}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="emp-detail-card emp-bento-card emp-record-card">
                  <h2>Directory record</h2>
                  <p className="emp-record-sub">All fields on file for this staff member.</p>
                  <div className="emp-detail-grid">
                    {detailFields.map((field) => (
                      <div key={field.label} className="emp-detail-field">
                        <span>{field.label}</span>
                        <p>{field.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="emp-detail-card emp-bento-card">
                  <div className="emp-card-head">
                    <h2>Leave and approvals</h2>
                    <span>Internal</span>
                  </div>
                  <div className="emp-top-kpi-grid">
                    <div className="emp-detail-metric">
                      <span>Total Leaves</span>
                      <strong>{filteredLeaves}</strong>
                    </div>
                    <div className="emp-detail-metric">
                      <span>Approve / Reject Status</span>
                      <strong className={approvalStatus === 'Approved' ? 'is-approved' : 'is-rejected'}>{approvalStatus}</strong>
                    </div>
                  </div>
                  <div className="emp-detail-filter-row">
                    <label htmlFor="leave-filter-ops">Leave Filter</label>
                    <select id="leave-filter-ops" value={leaveFilter} onChange={(e) => setLeaveFilter(e.target.value)}>
                      <option value="1d">1 Day</option>
                      <option value="1w">1 Week</option>
                      <option value="1m">1 Month</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  {leaveFilter === 'custom' && (
                    <div className="emp-detail-custom-range">
                      <div className="emp-detail-custom-field">
                        <label htmlFor="custom-from-ops">From</label>
                        <input id="custom-from-ops" type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
                      </div>
                      <div className="emp-detail-custom-field">
                        <label htmlFor="custom-to-ops">To</label>
                        <input id="custom-to-ops" type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
                      </div>
                    </div>
                  )}
                </section>
              </div>

              <aside className="emp-bento-side">
                <section className="emp-detail-card emp-shift-card">
                  <div className="emp-section-title-with-icon">
                    <span className="material-symbols-outlined emp-section-title-icon">event_note</span>
                    <h2>Shift Schedule</h2>
                  </div>
                  <div className="emp-shift-body">
                    <div className="emp-shift-block is-active">
                      <p className="emp-shift-label">Current Shift</p>
                      <p className="emp-shift-title">Scheduled Window</p>
                      <p className="emp-shift-time">{employee.shift || '—'}</p>
                    </div>
                    <div className="emp-shift-block">
                      <p className="emp-shift-label muted">Rotation</p>
                      <p className="emp-shift-title">Standard Week</p>
                      <p className="emp-shift-time">Based on department roster</p>
                    </div>
                    <div className="emp-shift-inspection">
                      <p className="emp-shift-label">Upcoming inspection</p>
                      <div className="emp-shift-inspection-row">
                        <span>Safety walkthrough</span>
                        <span className="emp-shift-pill">TBD</span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="emp-detail-card emp-coverage-card">
                  <h2>Area Coverage</h2>
                  <div className="emp-coverage-map">
                    <div className="emp-coverage-radar" />
                    <span className="emp-coverage-zone">Main precinct • {employee.department}</span>
                  </div>
                  <ul className="emp-coverage-list">
                    <li>Administrative zones</li>
                    <li>Support corridors and services</li>
                    <li>Shared facilities footprint</li>
                  </ul>
                </section>
              </aside>
            </div>
          </>
        )}

        {!isTeacher && !isAdmin && !isOps && (
          <section className="emp-detail-card emp-wide">
            <h2>{sectionTitle(section)}</h2>
            <div className="emp-detail-grid">
              {detailFields.map((field) => (
                <div key={field.label} className="emp-detail-field">
                  <span>{field.label}</span>
                  <p>{field.value || '—'}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

    </div>
  );
};
