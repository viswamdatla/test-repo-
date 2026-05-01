import React, { useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { usePageTitle } from '../../../hooks/usePageTitle';
import {
  flattenAllClassNames,
  resolveStageForClass,
  sectionFromSlug,
  sectionToSlug,
  slugToClassLevel,
} from './studentManagementConfig';
import {
  fetchAcademicsData,
  selectAcademicsStructure,
  selectClassSections,
  selectAcademicsSectionItems,
  selectAcademicsStatus,
} from '../../../store/academics/academicsSlice';
import { ACADEMIC_YEAR_LABEL, buildStudentProfileView } from './studentProfileViewModel';
import '../AcademicsPages.scss';
import './StudentManagementFlow.scss';

const initialsFromName = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const StudentManagementStudentDetailPage = () => {
  const { classSlug, sectionSlug, studentId } = useParams();
  const { wizardBase } = useOutletContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loadStatus = useSelector(selectAcademicsStatus);
  const structure = useSelector(selectAcademicsStructure);
  const students = useSelector((s) => selectAcademicsSectionItems(s, 'students'));

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

  const student = useMemo(() => students.find((s) => s.id === studentId), [students, studentId]);

  const validStudent = useMemo(() => {
    if (!student || !stage || !classLevel || !section) return false;
    return (
      student.stage === stage &&
      student.classLevel === classLevel &&
      (student.section || '') === section
    );
  }, [student, stage, classLevel, section]);

  const profile = useMemo(
    () => (student ? buildStudentProfileView(student) : null),
    [student]
  );

  const insights = useMemo(() => {
    if (!profile) return [];
    const rows = [];
    const bookPending = profile.bookItems.some((b) => b.status === 'pending');
    const uniPending = profile.uniformItems.some((u) => u.status === 'pending');
    if (uniPending) {
      rows.push({
        tone: 'primary',
        title: 'Uniform item pending',
        body: 'Complete size verification when the remaining piece is collected.',
      });
    } else {
      rows.push({
        tone: 'primary',
        title: 'Uniform size match',
        body: 'Sizes were last reviewed at the start of term. Last check: OK.',
      });
    }
    if (bookPending) {
      rows.push({
        tone: 'orange',
        title: 'Textbook collection pending',
        body: 'Items may be ready in the warehouse for parent pickup.',
      });
    }
    return rows;
  }, [profile]);

  useEffect(() => {
    if (!validClass || !stage) {
      navigate(wizardBase, { replace: true });
      return;
    }
    if (!section) {
      navigate(`${wizardBase}/${classSlug}`, { replace: true });
      return;
    }
  }, [stage, validClass, section, navigate, wizardBase, classSlug]);

  usePageTitle(student && validStudent ? `${student.name} — Profile` : 'Student profile');

  const listPath = `${wizardBase}/${classSlug}/${sectionToSlug(section || '')}`;

  if (!stage || !validClass || !section) return null;

  if (loadStatus === 'loading' && !student) {
    return (
      <div className="sm-profile-page">
        <p className="sm-loading">Loading…</p>
      </div>
    );
  }

  if (!student || !validStudent || !profile) {
    return (
      <div className="sm-profile-page sm-profile-page--narrow">
        <button type="button" className="sm-back" onClick={() => navigate(listPath)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Students
        </button>
        <h1 className="sm-profile-fallback-title">Student not found</h1>
        <p className="sm-profile-fallback-sub">This student is not in the selected class and section.</p>
      </div>
    );
  }

  const admissionTag = student.admissionNo ? `#${student.admissionNo}` : `#${student.id}`;
  const mailGuardian = student.email
    ? `mailto:${encodeURIComponent(student.email)}?subject=${encodeURIComponent(`Regarding ${student.name}`)}`
    : null;

  return (
    <div className="sm-profile-page">
      <button type="button" className="sm-back sm-profile-back" onClick={() => navigate(listPath)}>
        <span className="material-symbols-outlined">arrow_back</span>
        Students
      </button>

      <section className="sm-profile-hero">
        <div className="sm-profile-hero-main">
          <div className="sm-profile-photo-wrap">
            <div className="sm-profile-photo">{initialsFromName(student.name)}</div>
            <div className="sm-profile-photo-badge" aria-hidden>
              <span className="material-symbols-outlined sm-profile-photo-badge-ic">check</span>
            </div>
          </div>
          <div className="sm-profile-hero-copy">
            <h1 className="sm-profile-name">{student.name}</h1>
            <div className="sm-profile-meta-row">
              <span className="sm-profile-id-pill">{admissionTag}</span>
              <span className="sm-profile-class-line">
                <span className="material-symbols-outlined sm-profile-class-ic">school</span>
                {student.classLevel} — Section {student.section}
              </span>
            </div>
            <div className="sm-profile-hero-actions">
              <button
                type="button"
                className="sm-profile-btn sm-profile-btn-primary"
                onClick={() => window.alert('Profile editor is not wired yet.')}
              >
                <span className="material-symbols-outlined">edit</span>
                Modify profile
              </button>
              <button
                type="button"
                className="sm-profile-btn sm-profile-btn-secondary"
                onClick={() => window.print()}
              >
                <span className="material-symbols-outlined">print</span>
                ID card
              </button>
            </div>
          </div>
        </div>
        <div className="sm-profile-hero-kit">
          <p className="sm-profile-kit-kicker">Kit status overview</p>
          <div className="sm-profile-kit-progress-head">
            <span className="sm-profile-kit-progress-label">Completion</span>
            <span className="sm-profile-kit-progress-pct">{profile.completionPct}%</span>
          </div>
          <div className="sm-profile-kit-bar">
            <div className="sm-profile-kit-bar-fill" style={{ width: `${profile.completionPct}%` }} />
          </div>
          <div className="sm-profile-kit-badges">
            <div className="sm-profile-kit-mini">
              <p className="sm-profile-kit-mini-label">Book kit</p>
              <p
                className={`sm-profile-kit-mini-value ${profile.booksOverviewLabel === 'Complete' ? 'is-ok' : 'is-warn'}`}
              >
                {profile.booksOverviewLabel}
              </p>
            </div>
            <div className="sm-profile-kit-mini">
              <p className="sm-profile-kit-mini-label">Uniform</p>
              <p className={`sm-profile-kit-mini-value ${profile.uniformOverviewIsComplete ? 'is-ok' : 'is-warn'}`}>
                {profile.uniformOverviewLabel}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="sm-profile-grid">
        <div className="sm-profile-col-main">
          <div className="sm-profile-two-cards">
            <div className="sm-profile-card">
              <div className="sm-profile-card-head">
                <div className="sm-profile-card-icon sm-profile-card-icon-blue">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <h2 className="sm-profile-card-title">Personal info</h2>
              </div>
              <dl className="sm-profile-rows">
                <div className="sm-profile-row">
                  <dt>Full name</dt>
                  <dd>{student.name}</dd>
                </div>
                <div className="sm-profile-row">
                  <dt>Gender</dt>
                  <dd>{profile.gender}</dd>
                </div>
                <div className="sm-profile-row">
                  <dt>Date of birth</dt>
                  <dd>{profile.dateOfBirthDisplay}</dd>
                </div>
                <div className="sm-profile-row">
                  <dt>Guardian name</dt>
                  <dd>{student.guardian || '—'}</dd>
                </div>
                <div className="sm-profile-row">
                  <dt>Contact number</dt>
                  <dd>{student.phone || '—'}</dd>
                </div>
              </dl>
            </div>

            <div className="sm-profile-card">
              <div className="sm-profile-card-head">
                <div className="sm-profile-card-icon sm-profile-card-icon-amber">
                  <span className="material-symbols-outlined">school</span>
                </div>
                <h2 className="sm-profile-card-title">Academic info</h2>
              </div>
              <dl className="sm-profile-rows">
                <div className="sm-profile-row">
                  <dt>Roll number</dt>
                  <dd>{student.rollNo || '—'}</dd>
                </div>
                <div className="sm-profile-row">
                  <dt>Academic year</dt>
                  <dd>{ACADEMIC_YEAR_LABEL}</dd>
                </div>
                <div className="sm-profile-row">
                  <dt>Admission date</dt>
                  <dd>{profile.admissionDateDisplay}</dd>
                </div>
                <div className="sm-profile-row">
                  <dt>House</dt>
                  <dd className="sm-profile-house">{profile.house}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="sm-profile-card sm-profile-card-flush">
            <div className="sm-profile-kit-panel-head">
              <div className="sm-profile-card-head sm-profile-card-head-inline">
                <div className="sm-profile-card-icon sm-profile-card-icon-soft">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <h2 className="sm-profile-card-title">Kit distribution status</h2>
              </div>
              <button
                type="button"
                className="sm-profile-link-btn"
                onClick={() => window.alert('Distribution history would open here.')}
              >
                <span className="material-symbols-outlined">history</span>
                Distribution history
              </button>
            </div>

            <div className="sm-profile-kit-panel-body">
              <div className="sm-profile-kit-section">
                <div className="sm-profile-kit-section-head">
                  <h3 className="sm-profile-kit-section-title">Book kit distribution</h3>
                  <span
                    className={`sm-profile-kit-count ${profile.bookItems.some((b) => b.status === 'pending') ? 'is-warn' : 'is-ok'}`}
                  >
                    {profile.bookCollectedLabel}
                  </span>
                </div>
                <div className="sm-profile-book-grid">
                  {profile.bookItems.map((b) => (
                    <div
                      key={b.key}
                      className={`sm-profile-book-card ${b.status === 'pending' ? 'is-pending' : ''}`}
                    >
                      <div
                        className={`sm-profile-book-icon ${b.status === 'taken' ? 'is-ok' : 'is-pending'}`}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={
                            b.status === 'taken' && b.icon !== 'pending'
                              ? { fontVariationSettings: "'FILL' 0" }
                              : undefined
                          }
                        >
                          {b.icon}
                        </span>
                      </div>
                      <p className="sm-profile-book-label">{b.label}</p>
                      {b.status === 'taken' ? (
                        <>
                          <span className="sm-profile-chip sm-profile-chip-ok">Taken</span>
                          <p className="sm-profile-book-value">Value: ${Number(b.value).toFixed(2)}</p>
                        </>
                      ) : (
                        <>
                          <span className="sm-profile-chip sm-profile-chip-pending">Pending</span>
                          <button
                            type="button"
                            className="sm-profile-assign"
                            onClick={() => window.alert(`Assign ${b.label}?`)}
                          >
                            Assign now
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="sm-profile-kit-section">
                <div className="sm-profile-kit-section-head">
                  <h3 className="sm-profile-kit-section-title">Uniform kit (sizes &amp; status)</h3>
                  <span
                    className={`sm-profile-kit-count ${profile.uniformItems.some((u) => u.status === 'pending') ? 'is-warn' : 'is-ok'}`}
                  >
                    {profile.uniformCollectedLabel}
                  </span>
                </div>
                <div className="sm-profile-uniform-grid">
                  {profile.uniformItems.map((u, idx) => (
                    <div
                      key={u.key}
                      className={`sm-profile-uniform-cell ${idx > 0 ? 'has-divider' : ''}`}
                    >
                      <p className="sm-profile-uniform-label">{u.label}</p>
                      <p className="sm-profile-uniform-size">{u.size}</p>
                      <span
                        className={`sm-profile-uniform-status ${u.status === 'taken' ? 'is-ok' : 'is-pending'}`}
                      >
                        {u.status === 'taken' ? 'Taken' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sm-profile-col-side">
          <div className="sm-profile-card sm-profile-pay-card">
            <div className="sm-profile-pay-deco" aria-hidden />
            <div className="sm-profile-card-head">
              <div className="sm-profile-card-icon sm-profile-card-icon-primary-solid">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h2 className="sm-profile-card-title">Payment summary</h2>
            </div>
            <div className="sm-profile-pay-rows">
              <div className="sm-profile-pay-row">
                <span>Total kit value</span>
                <strong>${profile.kitTotal.toFixed(2)}</strong>
              </div>
              <div className="sm-profile-pay-row sm-profile-pay-row--green">
                <span>Paid amount</span>
                <strong>${profile.paid.toFixed(2)}</strong>
              </div>
              <div className="sm-profile-pay-row sm-profile-pay-row--orange">
                <span>Balance due</span>
                <strong>${profile.balance.toFixed(2)}</strong>
              </div>
            </div>
            <button
              type="button"
              className="sm-profile-record-pay"
              onClick={() => window.alert('Record payment flow is not wired yet.')}
            >
              <span className="material-symbols-outlined">receipt_long</span>
              Record payment
            </button>
          </div>

          <div className="sm-profile-insights">
            <h3 className="sm-profile-insights-title">Quick insights</h3>
            {insights.map((row) => (
              <div key={row.title} className="sm-profile-insight">
                <span className={`sm-profile-insight-dot ${row.tone === 'orange' ? 'is-orange' : ''}`} />
                <div>
                  <p className="sm-profile-insight-title">{row.title}</p>
                  <p className="sm-profile-insight-body">{row.body}</p>
                </div>
              </div>
            ))}
            <div className="sm-profile-insights-deco" aria-hidden />
          </div>

          <div className="sm-profile-quick-grid">
            {mailGuardian ? (
              <a className="sm-profile-quick-btn" href={mailGuardian}>
                <span className="material-symbols-outlined">mail</span>
                <span>Contact parent</span>
              </a>
            ) : (
              <button
                type="button"
                className="sm-profile-quick-btn"
                onClick={() => window.alert('No email on file.')}
              >
                <span className="material-symbols-outlined">mail</span>
                <span>Contact parent</span>
              </button>
            )}
            <button type="button" className="sm-profile-quick-btn" onClick={() => window.print()}>
              <span className="material-symbols-outlined">description</span>
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
