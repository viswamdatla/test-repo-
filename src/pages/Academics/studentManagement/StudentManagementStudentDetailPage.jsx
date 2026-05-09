import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAcademicsData, selectAcademicsSectionItems } from '../../../store/academics/academicsSlice';
import { usePageTitle } from '../../../hooks/usePageTitle';
import './StudentProfilePage.scss';

function classLevelToRegistrySectionCode(level) {
  const m = /^Class\s+(\d+)$/i.exec(level || '');
  if (m) return String(Number(m[1])).padStart(2, '0');
  const map = { Nursery: 'NUR', LKG: 'LKG', UKG: 'UKG' };
  return (
    map[level] ||
    String(level || 'X')
      .replace(/\s+/g, '')
      .slice(0, 3)
      .toUpperCase()
  );
}

function studentRegistrySectionKey(st) {
  if (st?.sectionId) return String(st.sectionId);
  const letter = String(st?.section ?? '');
  return `${classLevelToRegistrySectionCode(st?.classLevel)}-${letter}`;
}

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

const CALENDAR_DAYS_SPEC = [
  { day: 1, kind: 'present' },
  { day: 2, kind: 'present' },
  { day: 3, kind: 'present' },
  { day: 4, kind: 'absent' },
  { day: 5, kind: 'present' },
  { day: 6, kind: 'weekend' },
  { day: 7, kind: 'weekend' },
  { day: 8, kind: 'present' },
  { day: 9, kind: 'present' },
  { day: 10, kind: 'today' },
  { day: 11, kind: 'neutral' },
  { day: 12, kind: 'neutral' },
  { day: 13, kind: 'weekend' },
  { day: 14, kind: 'weekend' },
];

function gradeBadgeModifiers(grade) {
  const g = String(grade || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
  if (g === 'A+') return 'grade-badge--aplus';
  if (g === 'A') return 'grade-badge--a';
  if (g === 'B+') return 'grade-badge--bplus';
  if (g === 'B') return 'grade-badge--b';
  if (g === 'C+') return 'grade-badge--cplus';
  if (g === 'C') return 'grade-badge--c';
  if (g === 'D') return 'grade-badge--d';
  if (g === 'F') return 'grade-badge--f';
  return 'grade-badge--d';
}

function calDayMods(kind) {
  if (kind === 'present') return 'cal-day cal-day--present';
  if (kind === 'absent') return 'cal-day cal-day--absent';
  if (kind === 'weekend') return 'cal-day cal-day--weekend';
  if (kind === 'today') return 'cal-day cal-day--today';
  return 'cal-day cal-day--neutral';
}

function BackButton({ onClick }) {
  return (
    <button type="button" className="back-btn" onClick={onClick}>
      <span className="material-symbols-outlined" aria-hidden>
        arrow_back
      </span>
      Back to Students
    </button>
  );
}

function LoadingState() {
  return (
    <div className="student-profile-page profile-loading">
      <div className="profile-spinner" aria-hidden />
      <span>Loading…</span>
    </div>
  );
}

function NotFoundState({ onBack }) {
  return (
    <div className="student-profile-page profile-not-found">
      <BackButton onClick={onBack} />
      <h1 className="profile-header__title">Student not found</h1>
      <p className="profile-not-found__sub">This student is not in the selected class and section.</p>
    </div>
  );
}

function ProfileHeader({ student, onEdit, onMessage }) {
  const active = String(student.profileStatus || 'Active').toLowerCase() === 'active';
  return (
    <header className="profile-header">
      <div className="profile-header__main">
        <div className="profile-header__id-row">
          <span className={`status-badge ${active ? 'status-badge--active' : 'status-badge--inactive'}`}>
            {active ? 'Active' : 'Inactive'}
          </span>
          <span className="profile-header__admission">Student ID: #{student.studentAdmissionId}</span>
        </div>
        <h1 className="profile-header__title">{student.name}</h1>
        <p className="profile-header__meta">
          <span className="material-symbols-outlined" aria-hidden>
            location_on
          </span>
          {student.classLevel} • Section {student.section} • Roll No: {student.rollNo}
        </p>
      </div>
      <div className="profile-header__actions">
        <button type="button" className="profile-btn profile-btn--outline" onClick={onEdit}>
          <span className="material-symbols-outlined">edit</span>
          Edit Profile
        </button>
        <button type="button" className="profile-btn profile-btn--primary" onClick={onMessage}>
          <span className="material-symbols-outlined">mail</span>
          Message Guardian
        </button>
      </div>
    </header>
  );
}

function PersonalInfoCard({ student }) {
  return (
    <section className="profile-card profile-card--personal">
      <div className="profile-photo-placeholder" aria-hidden>
        <span className="material-symbols-outlined">person</span>
      </div>
      <h2 className="profile-card__title">Personal Information</h2>
      <dl>
        <div className="profile-detail-row">
          <dt>Date of Birth</dt>
          <dd>{student.dob || student.dateOfBirth || '—'}</dd>
        </div>
        <div className="profile-detail-row">
          <dt>Gender</dt>
          <dd>{student.gender || '—'}</dd>
        </div>
        <div className="profile-detail-row">
          <dt>Blood Group</dt>
          <dd>{student.bloodGroup || '—'}</dd>
        </div>
        <div className="profile-detail-row">
          <dt>Height / Weight</dt>
          <dd>
            {student.height || '—'} / {student.weight || '—'}
          </dd>
        </div>
        <div className="profile-detail-row profile-detail-row--stack">
          <dt>Address</dt>
          <dd>{student.address || '—'}</dd>
        </div>
      </dl>
    </section>
  );
}

function AcademicSummaryCard({ student }) {
  const subjects = Array.isArray(student.subjects) ? student.subjects : [];
  const pctAtt =
    student.totalDays && student.presentDays != null
      ? Math.round((student.presentDays / student.totalDays) * 100)
      : typeof student.attendancePct === 'number'
        ? student.attendancePct
        : 0;

  return (
    <section className="profile-card profile-card--academic">
      <div className="academic-summary__head">
        <div>
          <h2 className="profile-card__title academic-summary__title">Academic Summary</h2>
          <p className="academic-summary__sub">
            {student.classLevel} • Section {student.section} • Standing:{' '}
            <span className="academic-summary__standing">{student.academicStanding || 'Pass'}</span>
          </p>
        </div>
        <span className="promotion-badge">{student.promoted !== false ? 'Promotion: Yes' : 'Promotion: No'}</span>
      </div>

      <div className="academic-summary__stats">
        <div className="profile-stat-block profile-stat-block--gpa">
          <span className="profile-stat-block__watermark" aria-hidden>
            <span className="material-symbols-outlined profile-stat-block__watermark-icon">workspace_premium</span>
          </span>
          <p className="profile-stat-block__hint">Cumulative GPA</p>
          <p className="profile-stat-block__value">
            {typeof student.gpa === 'number' ? student.gpa.toFixed(2) : student.gpa}
            <span className="profile-stat-block__fraction">/4.0</span>
          </p>
        </div>
        <div className="profile-stat-block profile-stat-block--att">
          <p className="profile-stat-block__hint">Attendance</p>
          <p className="profile-stat-block__value">
            {pctAtt}
            <span className="profile-stat-block__fraction">%</span>
          </p>
          <p className="profile-stat-block__footnotes">
            {student.presentDays ?? '—'} Present / {student.absentDays ?? '—'} Absent (Total: {student.totalDays ?? '—'}{' '}
            Days)
          </p>
          <div className="profile-progress-bar">
            <div
              className="profile-progress-bar__fill profile-progress-bar__fill--tertiary"
              style={{ width: `${Math.min(100, Math.max(0, pctAtt))}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="profile-subject-caption">Subject-wise Performance</h3>
        <div className="profile-subject-table-wrap">
          <table className="profile-subject-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Marks</th>
                <th>Grade</th>
                <th className="profile-subject-table__bar-col" aria-hidden>
                  {' '}
                </th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((row) => {
                const total = Number(row.total) || 100;
                const marks = Number(row.marks) || 0;
                const barPct = Math.min(100, Math.round((marks / total) * 100));
                return (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td className="subject-marks-cell">
                      {marks}/{total}
                    </td>
                    <td>
                      <span className={`grade-badge ${gradeBadgeModifiers(row.grade)}`}>{row.grade}</span>
                    </td>
                    <td>
                      <div className="profile-progress-bar">
                        <div className="profile-progress-bar__fill" style={{ width: `${barPct}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function GuardianCard({ student }) {
  const father = student.father || {};
  const mother = student.mother || {};
  return (
    <section className="profile-card">
      <h2 className="profile-card__title">
        <span className="material-symbols-outlined" aria-hidden>
          family_restroom
        </span>
        Guardian Information
      </h2>
      <div className="guardian-grid">
        <div className="guardian-card">
          <p className="guardian-card__label">Father</p>
          <p className="guardian-card__name">{father.name}</p>
          <p className="guardian-card__role">{father.occupation}</p>
          <div className="guardian-card__detail">
            <span className="material-symbols-outlined">call</span>
            <span>{father.phone}</span>
          </div>
          <div className="guardian-card__detail">
            <span className="material-symbols-outlined">mail</span>
            <span>{father.email}</span>
          </div>
          <div className="guardian-card__income">
            <span className="guardian-card__income-label">Annual Income:</span>
            <span className="guardian-card__income-value">{formatINR(father.annualIncome)}</span>
          </div>
        </div>
        <div className="guardian-card">
          <p className="guardian-card__label">Mother</p>
          <p className="guardian-card__name">{mother.name}</p>
          <p className="guardian-card__role">{mother.occupation}</p>
          <div className="guardian-card__detail">
            <span className="material-symbols-outlined">call</span>
            <span>{mother.phone}</span>
          </div>
          <div className="guardian-card__detail">
            <span className="material-symbols-outlined">mail</span>
            <span>{mother.email}</span>
          </div>
          <div className="guardian-card__income">
            <span className="guardian-card__income-label">Annual Income:</span>
            <span className="guardian-card__income-value">{formatINR(mother.annualIncome)}</span>
          </div>
        </div>
      </div>
      <div className="emergency-strip">
        <p className="emergency-strip__label">Emergency Contacts</p>
        <div className="emergency-strip__row">
          <span>
            <strong>Primary:</strong> {father.phone} ({father.name})
          </span>
          <span>
            <strong>Secondary:</strong> {mother.phone} ({mother.name})
          </span>
        </div>
      </div>
    </section>
  );
}

function HealthCard({ student }) {
  const vaccinationOk = String(student.vaccination || '').toLowerCase().includes('up to date');
  return (
    <section className="profile-card">
      <h2 className="profile-card__title">
        <span className="material-symbols-outlined profile-card__title-icon--health" aria-hidden>
          health_and_safety
        </span>
        Health & Safety
      </h2>
      <div className="health-grid">
        <div className="health-box">
          <p className="health-box__label">Conditions</p>
          <p className="health-box__value">{student.conditions}</p>
        </div>
        <div className="health-box">
          <p className="health-box__label">Allergies</p>
          <p className="health-box__value">{student.allergies}</p>
        </div>
        <div
          className={`health-box ${vaccinationOk ? 'health-box--vaccination-ok' : 'health-box--vaccination-warn'}`}
        >
          <p className="health-box__label">Vaccination</p>
          <p className="health-box__value">{student.vaccination}</p>
        </div>
      </div>
    </section>
  );
}

function AdminCard({ student }) {
  return (
    <section className="profile-card admin-list">
      <h2 className="profile-card__title">
        <span className="material-symbols-outlined" aria-hidden>
          badge
        </span>
        Administration
      </h2>
      <dl>
        <div className="profile-detail-row">
          <dt>Admission Date</dt>
          <dd>{student.admissionDate}</dd>
        </div>
        <div className="profile-detail-row">
          <dt>Transport</dt>
          <dd className="profile-detail-row__muted">{student.transport}</dd>
        </div>
        <div className="profile-detail-row">
          <dt>Hostel</dt>
          <dd>{student.hostel}</dd>
        </div>
        <div className="profile-detail-row">
          <dt>Docs Verified</dt>
          <dd>
            {student.docsVerified ? (
              <span className="docs-verified">
                <span className="material-symbols-outlined">check_circle</span>
                Yes
              </span>
            ) : (
              <span>No</span>
            )}
          </dd>
        </div>
        <div className="profile-detail-row profile-detail-row--stack">
          <dt>Previous School</dt>
          <dd>{student.previousSchool}</dd>
        </div>
      </dl>
    </section>
  );
}

function ExtracurricularCard({ student }) {
  return (
    <section className="profile-card">
      <h2 className="profile-card__title">Extracurricular</h2>
      <div className="extra-list">
        <div className="extra-row">
          <div className="extra-row__icon-wrap">
            <span className="material-symbols-outlined">sports_soccer</span>
          </div>
          <div>
            <p className="extra-row__label">Sports</p>
            <p className="extra-row__value">{student.sport}</p>
          </div>
        </div>
        <div className="extra-row">
          <div className="extra-row__icon-wrap">
            <span className="material-symbols-outlined">palette</span>
          </div>
          <div>
            <p className="extra-row__label">Clubs</p>
            <p className="extra-row__value">{student.club}</p>
          </div>
        </div>
        <div className="extra-row extra-row--achievement">
          <div>
            <p className="extra-row__label">Achievements</p>
            <p className="extra-row__value">{student.achievement}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickActionsCard() {
  return (
    <section className="profile-card profile-card--actions">
      <h2 className="profile-card__title">Quick Actions</h2>
      <div className="actions-grid">
        <button type="button" className="action-btn">
          <span className="material-symbols-outlined">description</span>
          Report
        </button>
        <button type="button" className="action-btn">
          <span className="material-symbols-outlined profile-action-icon-fill">verified</span>
          Verify
        </button>
      </div>
    </section>
  );
}

function AttendanceSnapshotCard() {
  return (
    <section className="profile-card attendance-snapshot-card">
      <div className="attendance-snapshot-card__heading">
        <h2 className="profile-card__title attendance-snapshot-card__title">Attendance Snapshot</h2>
        <span>April 2024</span>
      </div>
      <div className="attendance-cal-week-row" aria-hidden>
        <span>M</span>
        <span>T</span>
        <span>W</span>
        <span>T</span>
        <span>F</span>
        <span>S</span>
        <span>S</span>
      </div>
      <div className="attendance-calendar">
        {CALENDAR_DAYS_SPEC.map(({ day, kind }) => (
          <div key={`cal-${day}-${kind}`} className={calDayMods(kind)}>
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-legend">
        <div className="calendar-legend__item">
          <span className="calendar-legend__dot calendar-legend__dot--present" />
          Present
        </div>
        <div className="calendar-legend__item">
          <span className="calendar-legend__dot calendar-legend__dot--absent" />
          Absent
        </div>
      </div>
    </section>
  );
}

function FinancialSnapshotCard({ student }) {
  const total = Number(student.totalFee) || 0;
  const paid = Number(student.feesPaid) || 0;
  const scholar = Number(student.scholarship) || 0;
  const outstanding = Math.max(0, total - paid - scholar);
  const pct = total > 0 ? Math.min(100, Math.round(((paid + scholar) / total) * 100)) : 0;

  return (
    <section className="profile-card profile-card--financial">
      <div className="profile-financial-rows">
        <h2 className="profile-card__title">
          <span className="material-symbols-outlined" aria-hidden>
            payments
          </span>
          Financial Snapshot
        </h2>
        <div className="financial-row">
          <span className="financial-row__label">Total Annual Fee</span>
          <span className="financial-row__value">{formatINR(total)}</span>
        </div>
        <div className="financial-row">
          <span className="financial-row__label">Fees Paid</span>
          <span className="financial-row__value">{formatINR(paid)}</span>
        </div>
        <div className="profile-progress-bar financial-row__bar">
          <div className="profile-progress-bar__fill profile-progress-bar__fill--white" style={{ width: `${pct}%` }} />
        </div>
        <div className="financial-row financial-row--large">
          <span className="financial-row__label financial-row__label--strong">Outstanding Balance</span>
          <span>{formatINR(outstanding)}</span>
        </div>
        <div className="financial-divider financial-row">
          <span className="financial-row__footer-label">Scholarship Applied</span>
          <span>{formatINR(scholar)}</span>
        </div>
      </div>
    </section>
  );
}

export default function StudentManagementStudentDetailPage() {
  const { studentId, sectionId: sectionRouteParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loadStatus = useSelector((s) => s.academics.loadStatus);

  const studentsList = useSelector((s) => selectAcademicsSectionItems(s, 'students'));

  const resolvedSectionKey = useMemo(() => {
    const fromRoute = sectionRouteParam ? decodeURIComponent(sectionRouteParam) : '';
    return location.state?.sectionId || fromRoute;
  }, [location.state, sectionRouteParam]);

  const rosterPath =
    resolvedSectionKey ? `/academics/student-management/section/${encodeURIComponent(resolvedSectionKey)}` : null;

  const goBack = () => {
    if (rosterPath) navigate(rosterPath);
    else navigate(-1);
  };

  useEffect(() => {
    if (loadStatus === 'idle') dispatch(fetchAcademicsData());
  }, [dispatch, loadStatus]);

  const student = useMemo(
    () => studentsList.find((st) => st.id === studentId) ?? null,
    [studentsList, studentId],
  );

  const sectionMatches = useMemo(() => {
    if (!student || !resolvedSectionKey) return true;
    return studentRegistrySectionKey(student) === resolvedSectionKey;
  }, [student, resolvedSectionKey]);

  usePageTitle(student && sectionMatches ? `${student.name} — Profile` : 'Student profile');

  if (loadStatus === 'idle' || loadStatus === 'loading') {
    return <LoadingState />;
  }

  if (loadStatus === 'failed') {
    return (
      <div className="student-profile-page profile-not-found">
        <BackButton onClick={() => navigate('/academics/student-management')} />
        <h1 className="profile-header__title">Unable to load students</h1>
        <p className="profile-not-found__sub">Refresh the page or try again later.</p>
      </div>
    );
  }

  if (!student || !sectionMatches) {
    return <NotFoundState onBack={goBack} />;
  }

  const guardianMail = student.email || student.father?.email;

  const onMessage = () => {
    if (guardianMail) {
      window.location.href = `mailto:${encodeURIComponent(guardianMail)}?subject=${encodeURIComponent(`Regarding ${student.name}`)}`;
      return;
    }
    window.alert('No guardian email on file.');
  };

  const onEdit = () => window.alert('Profile editor is not wired yet.');

  return (
    <div className="student-profile-page">
      <BackButton onClick={goBack} />

      <ProfileHeader student={student} onEdit={onEdit} onMessage={onMessage} />

      <div className="bento-grid">
        <PersonalInfoCard student={student} />
        <AcademicSummaryCard student={student} />
        <div className="profile-col-left">
          <GuardianCard student={student} />
          <HealthCard student={student} />
          <AdminCard student={student} />
          <ExtracurricularCard student={student} />
        </div>
        <div className="profile-col-right">
          <QuickActionsCard />
          <AttendanceSnapshotCard />
          <FinancialSnapshotCard student={student} />
        </div>
      </div>
    </div>
  );
}
