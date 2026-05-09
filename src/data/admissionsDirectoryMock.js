/** KPI filter keys — each application belongs to one secondary KPI bucket (or "pipeline" only). */
export const KPI_FILTER = {
  ALL: 'all',
  PENDING_REVIEW: 'pending_review',
  SAVED_DRAFT: 'saved_draft',
  ENROLLED: 'enrolled',
};

const STAGE_PILLS = {
  in_review: { label: 'In Review', pill: 'admissions-stage-pill--amber' },
  draft: { label: 'Draft', pill: 'admissions-stage-pill--slate' },
  document_verified: { label: 'Document Verified', pill: 'admissions-stage-pill--blue' },
  interview: { label: 'Interview', pill: 'admissions-stage-pill--lavender' },
  final_decision: { label: 'Final Decision', pill: 'admissions-stage-pill--green' },
  enrolled: { label: 'Enrolled', pill: 'admissions-stage-pill--green' },
};

/**
 * kpiBucket: which filter includes this row (pending_review, saved_draft, enrolled) or null for pipeline-only.
 * Pipeline-only rows (null) appear only when filter is ALL.
 */
export const ADMISSIONS_APPLICATIONS = [
  { id: 'ADM-2024-001', name: 'Eleanor Wright', initials: 'EW', avatar: 'admissions-avatar--blue', grade: 'Grade 9', date: 'Oct 12, 2023', kpiBucket: null, stage: 'document_verified' },
  { id: 'ADM-2024-002', name: 'Julian Martinez', initials: 'JM', avatar: 'admissions-avatar--amber', grade: 'Grade 11', date: 'Oct 14, 2023', kpiBucket: 'pending_review', stage: 'in_review' },
  { id: 'ADM-2024-003', name: 'Aria Chen', initials: 'AC', avatar: 'admissions-avatar--green', grade: 'Grade 7', date: 'Oct 15, 2023', kpiBucket: 'enrolled', stage: 'enrolled' },
  { id: 'ADM-2024-004', name: 'Lucas Bennett', initials: 'LB', avatar: 'admissions-avatar--rose', grade: 'Grade 10', date: 'Oct 16, 2023', kpiBucket: null, stage: 'interview' },
  { id: 'ADM-2024-005', name: 'Sofia Park', initials: 'SP', avatar: 'admissions-avatar--blue', grade: 'Grade 5', date: 'Oct 18, 2023', kpiBucket: 'pending_review', stage: 'in_review' },
  { id: 'ADM-2024-006', name: 'Miguel Rivas', initials: 'MR', avatar: 'admissions-avatar--amber', grade: 'Grade 8', date: 'Oct 19, 2023', kpiBucket: 'saved_draft', stage: 'draft' },
  { id: 'ADM-2024-007', name: 'Priya Nair', initials: 'PN', avatar: 'admissions-avatar--green', grade: 'Grade 12', date: 'Oct 20, 2023', kpiBucket: 'enrolled', stage: 'enrolled' },
  { id: 'ADM-2024-008', name: 'Owen Blake', initials: 'OB', avatar: 'admissions-avatar--rose', grade: 'Grade 6', date: 'Oct 21, 2023', kpiBucket: 'saved_draft', stage: 'draft' },
  { id: 'ADM-2024-009', name: 'Hana Idris', initials: 'HI', avatar: 'admissions-avatar--blue', grade: 'Grade 4', date: 'Oct 22, 2023', kpiBucket: null, stage: 'document_verified' },
  { id: 'ADM-2024-010', name: 'Derek Okonkwo', initials: 'DO', avatar: 'admissions-avatar--amber', grade: 'Grade 9', date: 'Oct 23, 2023', kpiBucket: 'pending_review', stage: 'in_review' },
  { id: 'ADM-2024-011', name: 'Ivy Sandoval', initials: 'IS', avatar: 'admissions-avatar--green', grade: 'Grade 3', date: 'Oct 24, 2023', kpiBucket: 'enrolled', stage: 'enrolled' },
  { id: 'ADM-2024-012', name: 'Noah Fischer', initials: 'NF', avatar: 'admissions-avatar--rose', grade: 'Grade 10', date: 'Oct 25, 2023', kpiBucket: 'saved_draft', stage: 'draft' },
  { id: 'ADM-2024-013', name: 'Chloe Meyer', initials: 'CM', avatar: 'admissions-avatar--blue', grade: 'Grade 2', date: 'Oct 26, 2023', kpiBucket: null, stage: 'final_decision' },
  { id: 'ADM-2024-014', name: 'Samir Haddad', initials: 'SH', avatar: 'admissions-avatar--amber', grade: 'Grade 11', date: 'Oct 27, 2023', kpiBucket: 'pending_review', stage: 'in_review' },
  { id: 'ADM-2024-015', name: 'Tessa Lind', initials: 'TL', avatar: 'admissions-avatar--green', grade: 'Grade 8', date: 'Oct 28, 2023', kpiBucket: 'enrolled', stage: 'enrolled' },
  { id: 'ADM-2024-016', name: 'Raj Kapoor', initials: 'RK', avatar: 'admissions-avatar--rose', grade: 'Grade 6', date: 'Oct 29, 2023', kpiBucket: 'enrolled', stage: 'enrolled' },
  { id: 'ADM-2024-017', name: 'Emma Walters', initials: 'EL', avatar: 'admissions-avatar--rose', grade: 'Grade 1', date: 'Nov 1, 2023', kpiBucket: 'saved_draft', stage: 'draft' },
  { id: 'ADM-2024-018', name: 'Carlos Mendez', initials: 'CM', avatar: 'admissions-avatar--amber', grade: 'Grade 12', date: 'Nov 2, 2023', kpiBucket: null, stage: 'interview' },
  { id: 'ADM-2024-019', name: 'Zara Ahmed', initials: 'ZA', avatar: 'admissions-avatar--green', grade: 'Grade 5', date: 'Nov 3, 2023', kpiBucket: 'pending_review', stage: 'in_review' },
  { id: 'ADM-2024-020', name: 'Leo Zhang', initials: 'LZ', avatar: 'admissions-avatar--rose', grade: 'Grade 7', date: 'Nov 4, 2023', kpiBucket: 'enrolled', stage: 'enrolled' },
].map((row) => {
  const meta = STAGE_PILLS[row.stage];
  return {
    ...row,
    stageLabel: meta.label,
    stagePillClass: meta.pill,
    applicationId: `#${row.id}`,
  };
});

export function getStageMeta(stageKey) {
  return STAGE_PILLS[stageKey] || { label: stageKey, pill: 'admissions-stage-pill--blue' };
}

/** Filter list by active KPI (ALL shows every row). */
export function filterApplicationsByKpi(apps, activeKpi) {
  if (!activeKpi || activeKpi === KPI_FILTER.ALL) return apps;
  if (activeKpi === KPI_FILTER.PENDING_REVIEW) {
    return apps.filter((a) => a.kpiBucket === 'pending_review');
  }
  if (activeKpi === KPI_FILTER.SAVED_DRAFT) {
    return apps.filter((a) => a.kpiBucket === 'saved_draft');
  }
  if (activeKpi === KPI_FILTER.ENROLLED) {
    return apps.filter((a) => a.kpiBucket === 'enrolled');
  }
  return apps;
}

export function computeKpiCounts(apps, deviceDraftCount = 0) {
  const savedDraftRows = apps.filter((a) => a.kpiBucket === 'saved_draft').length;
  return {
    total: apps.length,
    pendingReview: apps.filter((a) => a.kpiBucket === 'pending_review').length,
    savedDrafts: savedDraftRows + deviceDraftCount,
    enrolled: apps.filter((a) => a.kpiBucket === 'enrolled').length,
  };
}

/** Optional row when a draft exists in localStorage (shown under Saved Drafts filter). */
export const LOCAL_DEVICE_DRAFT_PLACEHOLDER = {
  id: 'local-device-draft',
  applicationId: '—',
  name: 'Your saved application',
  initials: 'YD',
  avatar: 'admissions-avatar--blue',
  grade: '—',
  date: 'This device',
  kpiBucket: 'saved_draft',
  stage: 'draft',
  stageLabel: 'Draft',
  stagePillClass: 'admissions-stage-pill--slate',
  isDevicePlaceholder: true,
};
