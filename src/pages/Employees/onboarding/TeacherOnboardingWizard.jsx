import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherOnboardingWizard.scss';

const initialDraft = () => ({
  fullName: '',
  employeeId: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  phone: '',
  address: '',
  teacherLevel: '',
  experienceYears: '',
  qualification: '',
  department: '',
  designation: '',
  salary: '',
  status: 'Active',
  joinDate: '',
  workHoursStart: '',
  workHoursEnd: '',
  subjects: [],
  subjectPicker: '',
  classes: [],
  classInput: '',
  previousSchools: [],
  schoolInput: '',
  profilePhoto: null,
  profilePhotoPreview: null,
  idProof: null,
  certificates: [],
});

const STEPS_SIDEBAR = [
  { id: 1, label: 'Personal Info', icon: 'person' },
  { id: 2, label: 'Professional Info', icon: 'school' },
  { id: 3, label: 'Documents', icon: 'description' },
  { id: 4, label: 'Review', icon: 'verified' },
];

const formatFileSize = (bytes) => {
  if (bytes == null || Number.isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileKind = (file) => {
  if (!file?.type) return 'File';
  if (file.type.includes('pdf')) return 'PDF Document';
  if (file.type.includes('png')) return 'PNG Image';
  if (file.type.includes('jpeg') || file.type.includes('jpg')) return 'JPG Image';
  return 'File';
};

export const TeacherOnboardingWizard = ({ onStepChange }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState(initialDraft);
  const [errors, setErrors] = useState({});

  const setField = useCallback((patch) => {
    setDraft((d) => ({ ...d, ...patch }));
  }, []);

  useEffect(() => {
    onStepChange?.(step);
  }, [step, onStepChange]);

  useEffect(() => {
    return () => {
      if (draft.profilePhotoPreview) URL.revokeObjectURL(draft.profilePhotoPreview);
    };
  }, [draft.profilePhotoPreview]);

  const exitToDirectory = () => navigate('/employees/teachers');

  const validatePersonal = () => {
    const e = {};
    if (!draft.fullName.trim()) e.fullName = 'Full name is required.';
    if (!draft.employeeId.trim()) e.employeeId = 'Employee ID is required.';
    if (!draft.email.trim()) e.email = 'Email is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateProfessional = () => {
    const e = {};
    if (!draft.teacherLevel.trim()) e.teacherLevel = 'Teacher level is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validatePersonal()) return;
    if (step === 2 && !validateProfessional()) return;
    setStep((s) => Math.min(4, s + 1));
  };

  const goBack = () => {
    if (step <= 1) exitToDirectory();
    else setStep((s) => s - 1);
  };

  const saveDraft = () => {
    try {
      const serializable = {
        ...draft,
        profilePhoto: undefined,
        idProof: undefined,
        certificates: draft.certificates.map((c) =>
          typeof c === 'object' && c.file ? { name: c.file.name, size: c.file.size } : c
        ),
        profilePhotoName: draft.profilePhoto?.name,
        idProofName: draft.idProof?.name,
      };
      delete serializable.profilePhotoPreview;
      sessionStorage.setItem('teacherOnboardingDraft', JSON.stringify(serializable));
    } catch {
      /* ignore */
    }
  };

  const submitFinish = () => {
    saveDraft();
    navigate('/employees/teachers');
  };

  const addSubjectFromPicker = () => {
    const v = draft.subjectPicker.trim();
    if (!v || draft.subjects.includes(v)) return;
    setField({ subjects: [...draft.subjects, v], subjectPicker: '' });
  };

  const addClass = () => {
    const v = draft.classInput.trim();
    if (!v || draft.classes.includes(v)) return;
    setField({ classes: [...draft.classes, v], classInput: '' });
  };

  const addSchool = () => {
    const v = draft.schoolInput.trim();
    if (!v || draft.previousSchools.includes(v)) return;
    setField({ previousSchools: [...draft.previousSchools, v], schoolInput: '' });
  };

  const onProfilePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (draft.profilePhotoPreview) URL.revokeObjectURL(draft.profilePhotoPreview);
    setField({
      profilePhoto: file,
      profilePhotoPreview: URL.createObjectURL(file),
    });
  };

  const onIdProof = (e) => {
    const file = e.target.files?.[0];
    if (file) setField({ idProof: file });
  };

  const onCertificates = (e) => {
    const files = e.target.files ? [...e.target.files] : [];
    if (!files.length) return;
    const next = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}`,
      file,
    }));
    setField({ certificates: [...draft.certificates, ...next] });
    e.target.value = '';
  };

  const removeCertificate = (id) => {
    setField({ certificates: draft.certificates.filter((c) => c.id !== id) });
  };

  const joinDateLabel = useMemo(() => {
    if (!draft.joinDate) return '—';
    try {
      return new Date(draft.joinDate + 'T12:00:00').toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return draft.joinDate;
    }
  }, [draft.joinDate]);

  const renderHorizontalStepper = (variant = 'default') => (
    <div className={`tow-stepper-h ${variant === 'review' ? 'tow-stepper-h--review' : ''}`}>
      <div className="tow-stepper-h__row">
        {[
          { n: 1, label: 'Personal Info' },
          { n: 2, label: 'Professional Info' },
          { n: 3, label: 'Documents' },
          { n: 4, label: 'Review' },
        ].map((s, i) => (
          <React.Fragment key={s.n}>
            {i > 0 && <div className="tow-stepper-h__line" />}
            <div className="tow-stepper-h__segment">
              <div
                className={`tow-stepper-h__circle ${
                  step > s.n ? 'tow-stepper-h__circle--done' : ''
                } ${step === s.n ? 'tow-stepper-h__circle--active' : ''}`}
              >
                {step > s.n ? (
                  <span className="material-symbols-outlined tow-fill" style={{ fontSize: 22 }}>
                    check
                  </span>
                ) : (
                  s.n
                )}
              </div>
              <div className="tow-stepper-h__meta">
                <p style={{ color: step >= s.n ? 'var(--tow-primary)' : undefined }}>Step {s.n}</p>
                <p style={{ fontWeight: step === s.n ? 800 : 600 }}>{s.label}</p>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const topBarScholarKit = (
    <header className="tow-topbar">
      <div className="tow-topbar__inner">
        <span className="tow-topbar__brand">ScholarKit</span>
        <nav className="tow-topbar__nav">
          <button type="button" className="tow-topbar__link">
            Help
          </button>
          <button type="button" className="tow-topbar__link" onClick={exitToDirectory}>
            Save &amp; Exit
          </button>
          <button type="button" className="tow-topbar__icon-btn" aria-label="Account">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </nav>
      </div>
    </header>
  );

  const topBarSchoolKit = (
    <header className="tow-topbar">
      <div className="tow-topbar__inner">
        <span className="tow-topbar__brand tow-headline" style={{ fontSize: '1.15rem', fontWeight: 800 }}>
          School Kit Manager
        </span>
        <nav className="tow-topbar__nav">
          <button type="button" className="tow-topbar__icon-btn" aria-label="Help">
            <span className="material-symbols-outlined">help_outline</span>
          </button>
          <button type="button" className="tow-topbar__icon-btn" aria-label="Close" onClick={exitToDirectory}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </nav>
      </div>
    </header>
  );

  const fixedFooter = (opts = {}) => (
    <div className="tow-footer-bar">
      <button type="button" className="tow-btn-ghost" onClick={goBack}>
        <span className="material-symbols-outlined">arrow_back</span>
        Back
      </button>
      <div className="tow-footer-bar__right">
        {opts.saveDraft !== false && (
          <button type="button" className="tow-btn-ghost" onClick={saveDraft}>
            <span className="material-symbols-outlined">save</span>
            Save Draft
          </button>
        )}
        <button type="button" className="tow-btn-primary" onClick={opts.onPrimary || goNext}>
          <span>{opts.primaryLabel || 'Continue'}</span>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="tow">
      {step === 1 ? topBarScholarKit : topBarSchoolKit}

      {step === 1 && (
        <div className="tow-layout">
          <aside className="tow-sidebar">
            <h2 className="tow-sidebar__title">Teacher Onboarding</h2>
            <p className="tow-sidebar__sub">Step 1 of 4: Personal Info</p>
            <nav>
              {STEPS_SIDEBAR.map((s) => (
                <div
                  key={s.id}
                  className={`tow-sidebar__nav-item ${
                    s.id === 1 ? 'tow-sidebar__nav-item--active' : 'tow-sidebar__nav-item--muted'
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={s.id === 1 ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {s.icon}
                  </span>
                  <span>{s.label}</span>
                </div>
              ))}
            </nav>
            <div className="tow-sidebar__help">
              <div className="tow-sidebar__help-card">
                <strong>Need Assistance?</strong>
                Our support team is available 24/7 to help you with your kit selection.
              </div>
            </div>
          </aside>

          <main className="tow-main tow-main--with-sidebar">
            <div className="tow-mobile-progress">
              <h1>Personal Information</h1>
              <div className="tow-mobile-progress__bars">
                <div className="tow-mobile-progress__bar tow-mobile-progress__bar--on" />
                <div className="tow-mobile-progress__bar" />
                <div className="tow-mobile-progress__bar" />
                <div className="tow-mobile-progress__bar" />
              </div>
            </div>

            <div className="tow-hero">
              <h1>Let&apos;s get started.</h1>
              <p>
                Welcome to ScholarKit. Please provide your basic identity details to help us set up your professional
                profile.
              </p>
            </div>

            <form
              className="tow-form"
              onSubmit={(e) => {
                e.preventDefault();
                goNext();
              }}
            >
              <div className="tow-grid-2">
                <div className="tow-span-2">
                  <label className="tow-label">
                    Full Name <span className="tow-req">*</span>
                  </label>
                  <input
                    className="tow-input"
                    placeholder="e.g. Dr. Sarah Jenkins"
                    value={draft.fullName}
                    onChange={(e) => setField({ fullName: e.target.value })}
                  />
                  {errors.fullName && <p className="tow-error">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="tow-label">
                    Employee ID <span className="tow-req">*</span>
                  </label>
                  <input
                    className="tow-input"
                    placeholder="SCH-2024-XXXX"
                    value={draft.employeeId}
                    onChange={(e) => setField({ employeeId: e.target.value })}
                  />
                  {errors.employeeId && <p className="tow-error">{errors.employeeId}</p>}
                </div>
                <div>
                  <label className="tow-label">Date of Birth</label>
                  <input
                    className="tow-input"
                    type="date"
                    value={draft.dateOfBirth}
                    onChange={(e) => setField({ dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="tow-span-2" style={{ paddingTop: 8 }}>
                  <span className="tow-label">Gender</span>
                  <div className="tow-gender-row">
                    <label className={`tow-gender-opt ${draft.gender === 'male' ? 'is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="gender"
                        value="male"
                        checked={draft.gender === 'male'}
                        onChange={() => setField({ gender: 'male' })}
                      />
                      <span className="material-symbols-outlined">male</span>
                      <span>Male</span>
                    </label>
                    <label className={`tow-gender-opt ${draft.gender === 'female' ? 'is-selected' : ''}`}>
                      <input
                        type="radio"
                        name="gender"
                        value="female"
                        checked={draft.gender === 'female'}
                        onChange={() => setField({ gender: 'female' })}
                      />
                      <span className="material-symbols-outlined">female</span>
                      <span>Female</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="tow-label">
                    Email Address <span className="tow-req">*</span>
                  </label>
                  <input
                    className="tow-input"
                    type="email"
                    placeholder="sarah.j@school.edu"
                    value={draft.email}
                    onChange={(e) => setField({ email: e.target.value })}
                  />
                  {errors.email && <p className="tow-error">{errors.email}</p>}
                </div>
                <div>
                  <label className="tow-label">Phone Number</label>
                  <input
                    className="tow-input"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={draft.phone}
                    onChange={(e) => setField({ phone: e.target.value })}
                  />
                </div>
                <div className="tow-span-2">
                  <label className="tow-label">Residential Address</label>
                  <textarea
                    className="tow-textarea"
                    rows={3}
                    placeholder="Enter your full home address..."
                    value={draft.address}
                    onChange={(e) => setField({ address: e.target.value })}
                  />
                </div>
              </div>

              <div className="tow-form-actions">
                <button type="button" className="tow-btn-back" onClick={goBack}>
                  Back
                </button>
                <button type="submit" className="tow-btn-primary">
                  <span>Continue</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    arrow_forward
                  </span>
                </button>
              </div>
            </form>

            <div className="tow-info-card">
              <div className="tow-info-card__row">
                <div>
                  <h3>Why do we need this?</h3>
                  <p>Your information is used strictly for school compliance and logistical delivery of your management kits.</p>
                </div>
                <div className="tow-info-card__avatars">
                  <img
                    className="tow-info-card__avatar"
                    alt=""
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDexQRa_pOb1VYr89dsHV2pn4MjeJfVs1tLAM30VciiAoLfINUnv38Gk4pzI9T9TC1KVLcjFfTmLofuqOmdPV_VY2hrovTKuAhIufiEC6JcbbMjHo_WnMkDyEgWnafL_kq12tFlimjHCsnuk4EoYWxu3yUcsjJVNxmWF3RCu5xb-cldRKxm84qBdO6XTsPOn4y4M5j3kDjb1eZ9DYrhfczWZn3uFWy-WZoQKL54NhnvS2xMVGMYTukZCmHvFC5bJmInZDegTiAU3jo"
                  />
                  <img
                    className="tow-info-card__avatar"
                    alt=""
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFSZH_eNljR1YWQdfvQux5xV4V4m6BD8uatyAVoXFIJGBu9AAKRh-3yTMXgWd6sWjfQNrZFsU-NeTxXkIlKDFft0GhsogZAA5IK6yt_YQ6fEV7CrpdzXlqyDj_FsTMWupeaijshwMjLw3K16sSoepykGb_kHsIO4FofhOoG_TMFR48sqMlhoayzIl-bMUUGN9RMuXbmbvVdvTfIShO1Pk-diK6jIrFPCb-X-f2ufr28GzqMgb98CNsAFQ3Dxaa7PtZwn4q_t9e-GI"
                  />
                  <div className="tow-info-card__more">+12</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {step === 2 && (
        <>
          <main className="tow-main" style={{ maxWidth: 1200, margin: '0 auto' }}>
            {renderHorizontalStepper()}
            <div className="tow-pro-grid">
              <div>
                <div className="tow-pro-aside">
                  <h2>Professional Identity</h2>
                  <p>Define the teacher&apos;s academic role, experience, and administrative status within the School Kit ecosystem.</p>
                  <div className="tow-pro-aside__feat tow-pro-aside__feat--primary">
                    <span className="material-symbols-outlined">verified_user</span>
                    <span>Verified Professional Record</span>
                  </div>
                  <div className="tow-pro-aside__feat tow-pro-aside__feat--muted">
                    <span className="material-symbols-outlined">schedule</span>
                    <span>Auto-calculated work cycles</span>
                  </div>
                  <img
                    className="tow-pro-aside__img"
                    alt=""
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFRS0ozMBfdWO8WdEjBL_9B0HQ1Y0T7JbMvcYtvbnobhn7U9LmpXWSB2cXkAdWofuPYHhKPFCWv69tj7SsrUQHeEV8eyos0JmeQ7TS0UIiO9JwuPFKS86CWACS1GrkI4qdEYnN7m43ynkjTs1rkcc1bPuFKarjc6w6Or9OZLzXNVX8lVGgj8RNxRrYBXWiRLbhy2DM8Fy5JIvhBxRCfp40Qbd1zkeqBYJPOfmbeiSH7rM38yrIlo5ofx2J1bhMzZH043q6PfUGGOY"
                  />
                </div>
              </div>
              <div>
                <div className="tow-card">
                  <h3 className="tow-card__title">Employment Details</h3>
                  <div className="tow-pro-fields">
                    <div>
                      <label className="tow-label">Teacher Level *</label>
                      <select
                        className="tow-select"
                        value={draft.teacherLevel}
                        onChange={(e) => setField({ teacherLevel: e.target.value })}
                      >
                        <option value="">Select Level</option>
                        <option value="Primary School">Primary School</option>
                        <option value="Middle School">Middle School</option>
                        <option value="High School">High School</option>
                        <option value="Senior High">Senior High</option>
                      </select>
                      {errors.teacherLevel && <p className="tow-error">{errors.teacherLevel}</p>}
                    </div>
                    <div>
                      <label className="tow-label">Experience (Years)</label>
                      <input
                        className="tow-input"
                        type="number"
                        min={0}
                        placeholder="e.g. 5"
                        value={draft.experienceYears}
                        onChange={(e) => setField({ experienceYears: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="tow-label">Qualification</label>
                      <select
                        className="tow-select"
                        value={draft.qualification}
                        onChange={(e) => setField({ qualification: e.target.value })}
                      >
                        <option value="">Select Qualification</option>
                        <option value="B.Ed">B.Ed</option>
                        <option value="M.Ed">M.Ed</option>
                        <option value="PhD in Education">PhD in Education</option>
                        <option value="Diploma">Diploma</option>
                      </select>
                    </div>
                    <div>
                      <label className="tow-label">Department</label>
                      <select
                        className="tow-select"
                        value={draft.department}
                        onChange={(e) => setField({ department: e.target.value })}
                      >
                        <option value="">Select Department</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Sciences">Sciences</option>
                        <option value="Humanities">Humanities</option>
                        <option value="Arts & Sports">Arts &amp; Sports</option>
                      </select>
                    </div>
                    <div>
                      <label className="tow-label">Designation</label>
                      <select
                        className="tow-select"
                        value={draft.designation}
                        onChange={(e) => setField({ designation: e.target.value })}
                      >
                        <option value="">Select Designation</option>
                        <option value="Assistant Teacher">Assistant Teacher</option>
                        <option value="Senior Teacher">Senior Teacher</option>
                        <option value="Head of Department">Head of Department</option>
                        <option value="Subject Specialist">Subject Specialist</option>
                      </select>
                    </div>
                    <div>
                      <label className="tow-label">Salary</label>
                      <div className="tow-pro-fields__salary">
                        <span>$</span>
                        <input
                          className="tow-input"
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          value={draft.salary}
                          onChange={(e) => setField({ salary: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="tow-label">Status</label>
                      <select
                        className="tow-select"
                        value={draft.status}
                        onChange={(e) => setField({ status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="tow-label">Join Date</label>
                      <input
                        className="tow-input"
                        type="date"
                        value={draft.joinDate}
                        onChange={(e) => setField({ joinDate: e.target.value })}
                      />
                    </div>
                    <div className="tow-pro-fields__hours">
                      <label className="tow-label tow-span-2" style={{ gridColumn: '1 / -1' }}>
                        Work Hours
                      </label>
                      <input
                        className="tow-input"
                        type="time"
                        value={draft.workHoursStart}
                        onChange={(e) => setField({ workHoursStart: e.target.value })}
                      />
                      <span>to</span>
                      <input
                        className="tow-input"
                        type="time"
                        value={draft.workHoursEnd}
                        onChange={(e) => setField({ workHoursEnd: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="tow-card tow-card--muted">
                  <h3 className="tow-card__title tow-card__title--split">
                    <span>Teaching Subjects</span>
                    <button type="button" className="tow-link-add" onClick={addSubjectFromPicker}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        add
                      </span>
                      Add Subject
                    </button>
                  </h3>
                  <div className="tow-pill-row">
                    {draft.subjects.map((sub) => (
                      <span key={sub} className="tow-pill">
                        {sub}
                        <button
                          type="button"
                          aria-label={`Remove ${sub}`}
                          onClick={() => setField({ subjects: draft.subjects.filter((x) => x !== sub) })}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                            close
                          </span>
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    className="tow-select"
                    style={{ background: '#fff' }}
                    value={draft.subjectPicker}
                    onChange={(e) => setField({ subjectPicker: e.target.value })}
                  >
                    <option value="">Select another subject...</option>
                    <option value="History">History</option>
                    <option value="Literature">Literature</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Calculus II">Calculus II</option>
                    <option value="Physics">Physics</option>
                  </select>
                </div>

                <div className="tow-card tow-card--muted">
                  <h3 className="tow-card__title" style={{ marginBottom: 16 }}>
                    Classes Assigned
                  </h3>
                  <div className="tow-pill-row">
                    {draft.classes.map((c) => (
                      <span key={c} className="tow-pill tow-pill-outline">
                        {c}
                        <button
                          type="button"
                          aria-label={`Remove ${c}`}
                          onClick={() => setField({ classes: draft.classes.filter((x) => x !== c) })}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                            close
                          </span>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tow-add-row">
                    <input
                      className="tow-input"
                      placeholder="e.g., 10-A"
                      value={draft.classInput}
                      onChange={(e) => setField({ classInput: e.target.value })}
                    />
                    <button type="button" className="tow-btn-add" onClick={addClass}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        add
                      </span>
                      Add
                    </button>
                  </div>
                </div>

                <div className="tow-card tow-card--muted">
                  <h3 className="tow-card__title" style={{ marginBottom: 16 }}>
                    Previous Schools
                  </h3>
                  {draft.previousSchools.map((sch) => (
                    <div key={sch} className="tow-school-row">
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{sch}</span>
                      <button
                        type="button"
                        aria-label={`Remove ${sch}`}
                        onClick={() =>
                          setField({ previousSchools: draft.previousSchools.filter((x) => x !== sch) })
                        }
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}
                  <div className="tow-add-row">
                    <input
                      className="tow-input"
                      placeholder="School name"
                      value={draft.schoolInput}
                      onChange={(e) => setField({ schoolInput: e.target.value })}
                    />
                    <button type="button" className="tow-btn-add" onClick={addSchool}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        add
                      </span>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
          {fixedFooter({ saveDraft: false })}
        </>
      )}

      {step === 3 && (
        <>
          <main className="tow-main" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="tow-doc-head">
              <h1>Add New Teacher</h1>
              <p>Step 3 of 4: Documents &amp; Credentials</p>
            </div>
            <div className="tow-stepper-grid">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={`tow-step-tile ${n === 3 ? 'tow-step-tile--active' : ''} ${
                    n < 3 ? 'tow-step-tile--dim' : ''
                  }`}
                >
                  <div
                    className={`tow-step-tile__circle ${
                      n <= 2 ? 'tow-step-tile__circle--on' : ''
                    }`}
                  >
                    {n <= 2 ? (
                      <span className="material-symbols-outlined tow-fill">check_circle</span>
                    ) : (
                      n
                    )}
                  </div>
                  <div>
                    <p className="tow-step-tile__lbl" style={{ color: n === 3 ? 'var(--tow-primary)' : undefined }}>
                      {n === 3 ? 'Active' : n < 3 ? `Step ${n}` : 'Next'}
                    </p>
                    <p className="tow-step-tile__name" style={{ fontWeight: n === 3 ? 800 : 600 }}>
                      {n === 1 && 'Personal Info'}
                      {n === 2 && 'Professional Info'}
                      {n === 3 && 'Documents'}
                      {n === 4 && 'Review'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="tow-doc-grid">
              <div className="tow-card">
                <h3 className="tow-card__title" style={{ marginBottom: 8 }}>
                  Profile Photo
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--tow-on-variant)', marginBottom: 24 }}>
                  Recommended: 400×400px JPG or PNG.
                </p>
                <div className="tow-dropzone" style={{ aspectRatio: '1', padding: 24 }}>
                  <input type="file" accept="image/*" onChange={onProfilePhoto} />
                  {draft.profilePhotoPreview ? (
                    <img
                      src={draft.profilePhotoPreview}
                      alt=""
                      style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 12, objectFit: 'cover' }}
                    />
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--tow-on-variant)' }}>
                        account_circle
                      </span>
                      <p style={{ marginTop: 12, fontWeight: 700, color: 'var(--tow-primary)' }}>Upload Photo</p>
                      <p style={{ fontSize: 12, color: 'var(--tow-on-variant)', marginTop: 8 }}>or drag and drop</p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <div className="tow-card" style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div>
                      <h3 className="tow-card__title" style={{ marginBottom: 4 }}>
                        ID Proof Upload
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--tow-on-variant)' }}>
                        National ID, Passport, or Driver&apos;s License.
                      </p>
                    </div>
                    <span className="tow-badge">Required</span>
                  </div>
                  <div className="tow-dropzone">
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf" onChange={onIdProof} />
                    <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--tow-primary)' }}>
                      upload_file
                    </span>
                    <p style={{ fontWeight: 600, marginTop: 8 }}>
                      {draft.idProof ? draft.idProof.name : 'Click to upload or drag and drop'}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--tow-on-variant)', marginTop: 4 }}>
                      Maximum file size 5MB (PDF, JPG, PNG)
                    </p>
                  </div>
                </div>

                <div className="tow-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                    <div>
                      <h3 className="tow-card__title" style={{ marginBottom: 4 }}>
                        Qualification Certificates
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--tow-on-variant)' }}>
                        Degrees, certifications, and teaching licenses.
                      </p>
                    </div>
                    <span className="tow-badge">Multi-select</span>
                  </div>
                  <div className="tow-cert-add">
                    <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,application/pdf" onChange={onCertificates} />
                    <div className="tow-cert-add__icon">
                      <span className="material-symbols-outlined">add_circle</span>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--tow-primary)' }}>Add another certificate</p>
                      <p style={{ fontSize: 12, color: 'var(--tow-on-primary-fixed-variant, #004883)' }}>
                        Multiple PDF or image files supported
                      </p>
                    </div>
                  </div>
                  <div>
                    {draft.certificates.map((c) => {
                      const isPdf = c.file?.type?.includes('pdf');
                      return (
                        <div key={c.id} className="tow-file-row">
                          <div className="tow-file-row__meta">
                            <div className={`tow-file-row__icon ${isPdf ? '' : 'tow-file-row__icon--img'}`}>
                              <span className="material-symbols-outlined">
                                {isPdf ? 'picture_as_pdf' : 'image'}
                              </span>
                            </div>
                            <div>
                              <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>{c.file?.name}</p>
                              <p style={{ fontSize: 12, color: 'var(--tow-on-variant)' }}>
                                {formatFileSize(c.file?.size)} • {fileKind(c.file)}
                              </p>
                            </div>
                          </div>
                          <button type="button" aria-label="Remove file" onClick={() => removeCertificate(c.id)}>
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="tow-doc-alert">
              <span className="material-symbols-outlined">info</span>
              <p>
                All documents must be clear and legible. Original documents may be requested during the physical verification
                process at the school administrative office.
              </p>
            </div>
          </main>
          {fixedFooter({})}
        </>
      )}

      {step === 4 && (
        <>
          <main className="tow-main" style={{ maxWidth: 1200, margin: '0 auto' }}>
            {renderHorizontalStepper('review')}
            <div className="tow-review-hero">
              <h1>Review &amp; Submit</h1>
              <p>
                Please review the information below to ensure everything is correct before finalizing the teacher&apos;s profile
                registration.
              </p>
            </div>
            <div className="tow-review-grid">
              <div className="tow-review-card">
                <div className="tow-review-card__head">
                  <div className="tow-review-card__title-row">
                    <div
                      className="tow-review-card__icon"
                      style={{ background: 'rgba(41, 118, 199, 0.15)', color: 'var(--tow-primary)' }}
                    >
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <h3>Personal Info</h3>
                  </div>
                  <button type="button" className="tow-review-card__edit" onClick={() => setStep(1)}>
                    Edit
                  </button>
                </div>
                <div className="tow-review-card__person-row">
                  <div className="tow-review-card__photo">
                    {draft.profilePhotoPreview ? (
                      <img src={draft.profilePhotoPreview} alt="" />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--tow-on-variant)',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 40 }}>
                          person
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="tow-review-card__field" style={{ marginBottom: 0 }}>
                    <span>Full Name</span>
                    <p>{draft.fullName || '—'}</p>
                  </div>
                </div>
                <div className="tow-review-card__field">
                  <span>Email Address</span>
                  <p style={{ fontWeight: 500 }}>{draft.email || '—'}</p>
                </div>
                <div className="tow-review-card__field">
                  <span>Phone Number</span>
                  <p style={{ fontWeight: 500 }}>{draft.phone || '—'}</p>
                </div>
              </div>

              <div className="tow-review-card">
                <div className="tow-review-card__head">
                  <div className="tow-review-card__title-row">
                    <div
                      className="tow-review-card__icon"
                      style={{ background: 'rgba(193, 217, 254, 0.5)', color: 'var(--tow-on-secondary-container)' }}
                    >
                      <span className="material-symbols-outlined">work</span>
                    </div>
                    <h3>Professional Info</h3>
                  </div>
                  <button type="button" className="tow-review-card__edit" onClick={() => setStep(2)}>
                    Edit
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div className="tow-review-card__field">
                    <span>Employee ID</span>
                    <p style={{ fontWeight: 500 }}>{draft.employeeId || '—'}</p>
                  </div>
                  <div className="tow-review-card__field">
                    <span>Designation</span>
                    <p style={{ fontWeight: 500 }}>{draft.designation || '—'}</p>
                  </div>
                  <div className="tow-review-card__field">
                    <span>Department</span>
                    <p style={{ fontWeight: 500 }}>{draft.department || '—'}</p>
                  </div>
                  <div className="tow-review-card__field">
                    <span>Join Date</span>
                    <p style={{ fontWeight: 500 }}>{joinDateLabel}</p>
                  </div>
                </div>
              </div>

              <div className="tow-review-card">
                <div className="tow-review-card__head">
                  <div className="tow-review-card__title-row">
                    <div
                      className="tow-review-card__icon"
                      style={{ background: 'rgba(160, 105, 0, 0.12)', color: '#7f5300' }}
                    >
                      <span className="material-symbols-outlined">school</span>
                    </div>
                    <h3>Subjects &amp; Classes</h3>
                  </div>
                  <button type="button" className="tow-review-card__edit" onClick={() => setStep(2)}>
                    Edit
                  </button>
                </div>
                <div className="tow-review-pills">
                  {draft.subjects.length === 0 && draft.classes.length === 0 && <span>—</span>}
                  {draft.subjects.map((s) => (
                    <span key={s}>{s}</span>
                  ))}
                  {draft.classes.map((c) => (
                    <span key={c}>
                      Class {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="tow-review-card">
                <div className="tow-review-card__head">
                  <div className="tow-review-card__title-row">
                    <div
                      className="tow-review-card__icon"
                      style={{ background: 'rgba(255, 218, 214, 0.5)', color: 'var(--tow-error)' }}
                    >
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <h3>Documents</h3>
                  </div>
                  <button type="button" className="tow-review-card__edit" onClick={() => setStep(3)}>
                    Edit
                  </button>
                </div>
                <div>
                  {draft.idProof && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 12,
                        background: 'var(--tow-surface-low)',
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{draft.idProof.name}</span>
                      </div>
                      <span className="material-symbols-outlined tow-fill" style={{ color: 'var(--tow-primary)', fontSize: 20 }}>
                        verified
                      </span>
                    </div>
                  )}
                  {draft.certificates.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 12,
                        background: 'var(--tow-surface-low)',
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{c.file?.name}</span>
                      </div>
                      <span className="material-symbols-outlined tow-fill" style={{ color: 'var(--tow-primary)', fontSize: 20 }}>
                        verified
                      </span>
                    </div>
                  ))}
                  {!draft.idProof && draft.certificates.length === 0 && <p style={{ color: 'var(--tow-on-variant)' }}>—</p>}
                </div>
              </div>
            </div>

            <div className="tow-review-confirm">
              <h4>
                <span className="material-symbols-outlined">info</span>
                Final Confirmation
              </h4>
              <p>
                By clicking &quot;Continue&quot;, you confirm that the provided information is accurate. The teacher will be added to
                the School Kit Management system and assigned their requested kits automatically.
              </p>
            </div>
          </main>
          {fixedFooter({ onPrimary: submitFinish })}
        </>
      )}
    </div>
  );
};
