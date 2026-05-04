/**
 * Mock leave applications for Leave Management drill-down.
 * `decisionDate` is YYYY-MM-DD for approved/rejected; must match `todayISO` to count as "today".
 */

export const LEAVE_KPI_FILTERS = [
  {
    id: 'all',
    icon: 'description',
    label: 'Total Applications',
    meta: 'Academic Year 2024',
    iconWrap: 'leave-kpi-icon--docs',
    metaClass: '',
  },
  {
    id: 'pending',
    icon: 'hourglass_empty',
    label: 'Pending Approval',
    meta: 'Requires Action',
    metaClass: 'leave-kpi-meta--warn',
    iconWrap: 'leave-kpi-icon--pending',
  },
  {
    id: 'approved_today',
    icon: 'check_circle',
    label: 'Approved Today',
    meta: '+3 since morning',
    metaClass: 'leave-kpi-meta--ok',
    iconWrap: 'leave-kpi-icon--ok',
  },
  {
    id: 'rejected_today',
    icon: 'cancel',
    label: 'Rejected Today',
    meta: 'Conflict found',
    metaClass: 'leave-kpi-meta--err',
    iconWrap: 'leave-kpi-icon--reject',
  },
];

export function buildLeaveApplications(todayISO) {
  const past = '2025-11-02';
  const past2 = '2026-01-18';

  return [
    {
      id: '1',
      name: 'Marcus Thorne',
      role: 'Assistant Prof, Humanities',
      initials: 'MT',
      leaveType: 'Vacation',
      leaveTone: 'vacation',
      duration: 'Oct 12 – Oct 15 (4 Days)',
      status: 'pending',
      decisionDate: null,
      rangeStart: '2025-10-12',
      rangeEnd: '2025-10-15',
    },
    {
      id: '2',
      name: 'Elena Rossi',
      role: 'District Coordinator',
      initials: 'ER',
      leaveType: 'Sick Leave',
      leaveTone: 'sick',
      duration: 'Oct 10 (1 Day)',
      status: 'pending',
      decisionDate: null,
      rangeStart: '2025-10-10',
      rangeEnd: '2025-10-10',
    },
    {
      id: '3',
      name: 'Julianne Vane',
      role: 'Head of Science',
      initials: 'JV',
      leaveType: 'Personal',
      leaveTone: 'personal',
      duration: 'Oct 15 – Oct 16 (2 Days)',
      status: 'approved',
      decisionDate: todayISO,
      rangeStart: '2025-10-15',
      rangeEnd: '2025-10-16',
    },
    {
      id: '4',
      name: 'Robert Chen',
      role: 'Math Dept Chair',
      initials: 'RC',
      leaveType: 'Other',
      leaveTone: 'other',
      duration: 'Oct 11 (1 Day)',
      status: 'rejected',
      decisionDate: todayISO,
      rangeStart: '2025-10-11',
      rangeEnd: '2025-10-11',
    },
    {
      id: '5',
      name: 'Amira Hassan',
      role: 'PE Instructor',
      initials: 'AH',
      leaveType: 'Sick Leave',
      leaveTone: 'sick',
      duration: 'Nov 1 – Nov 3 (3 Days)',
      status: 'pending',
      decisionDate: null,
      rangeStart: '2025-11-01',
      rangeEnd: '2025-11-03',
    },
    {
      id: '6',
      name: 'James Okafor',
      role: 'IT Support Lead',
      initials: 'JO',
      leaveType: 'Personal',
      leaveTone: 'personal',
      duration: 'Oct 20 (1 Day)',
      status: 'pending',
      decisionDate: null,
      rangeStart: '2025-10-20',
      rangeEnd: '2025-10-20',
    },
    {
      id: '7',
      name: 'Priya Natarajan',
      role: 'Registrar',
      initials: 'PN',
      leaveType: 'Vacation',
      leaveTone: 'vacation',
      duration: 'Dec 20 – Jan 2 (10 Days)',
      status: 'pending',
      decisionDate: null,
      rangeStart: '2025-12-20',
      rangeEnd: '2026-01-02',
    },
    {
      id: '8',
      name: 'Luis Ortega',
      role: 'Music Teacher',
      initials: 'LO',
      leaveType: 'Vacation',
      leaveTone: 'vacation',
      duration: 'Oct 8 – Oct 9 (2 Days)',
      status: 'approved',
      decisionDate: todayISO,
      rangeStart: '2025-10-08',
      rangeEnd: '2025-10-09',
    },
    {
      id: '9',
      name: 'Hannah Kim',
      role: 'Librarian',
      initials: 'HK',
      leaveType: 'Sick Leave',
      leaveTone: 'sick',
      duration: 'Oct 14 (1 Day)',
      status: 'approved',
      decisionDate: todayISO,
      rangeStart: '2025-10-14',
      rangeEnd: '2025-10-14',
    },
    {
      id: '10',
      name: 'David Mensah',
      role: 'Dean of Students',
      initials: 'DM',
      leaveType: 'Other',
      leaveTone: 'other',
      duration: 'Oct 17 – Oct 18 (2 Days)',
      status: 'rejected',
      decisionDate: todayISO,
      rangeStart: '2025-10-17',
      rangeEnd: '2025-10-18',
    },
    {
      id: '11',
      name: 'Sofia Lindqvist',
      role: 'Art Teacher',
      initials: 'SL',
      leaveType: 'Personal',
      leaveTone: 'personal',
      duration: 'Oct 22 (1 Day)',
      status: 'pending',
      decisionDate: null,
      rangeStart: '2025-10-22',
      rangeEnd: '2025-10-22',
    },
    {
      id: '12',
      name: 'Noah Patel',
      role: 'Lab Technician',
      initials: 'NP',
      leaveType: 'Sick Leave',
      leaveTone: 'sick',
      duration: 'Oct 5 – Oct 6 (2 Days)',
      status: 'approved',
      decisionDate: past,
      rangeStart: '2025-10-05',
      rangeEnd: '2025-10-06',
    },
    {
      id: '13',
      name: 'Grace Oduya',
      role: 'English Lead',
      initials: 'GO',
      leaveType: 'Vacation',
      leaveTone: 'vacation',
      duration: 'Sep 28 – Sep 30 (3 Days)',
      status: 'approved',
      decisionDate: past2,
      rangeStart: '2025-09-28',
      rangeEnd: '2025-09-30',
    },
    {
      id: '14',
      name: 'Tomás Rivera',
      role: 'History Teacher',
      initials: 'TR',
      leaveType: 'Personal',
      leaveTone: 'personal',
      duration: 'Oct 19 (1 Day)',
      status: 'rejected',
      decisionDate: past,
      rangeStart: '2025-10-19',
      rangeEnd: '2025-10-19',
    },
    {
      id: '15',
      name: 'Yuki Tanaka',
      role: 'Physics Teacher',
      initials: 'YT',
      leaveType: 'Vacation',
      leaveTone: 'vacation',
      duration: 'Oct 25 – Oct 27 (3 Days)',
      status: 'pending',
      decisionDate: null,
      rangeStart: '2025-10-25',
      rangeEnd: '2025-10-27',
    },
    {
      id: '16',
      name: 'Fatima Al-Rashid',
      role: 'Counselor',
      initials: 'FA',
      leaveType: 'Sick Leave',
      leaveTone: 'sick',
      duration: 'Oct 7 (1 Day)',
      status: 'approved',
      decisionDate: todayISO,
      rangeStart: '2025-10-07',
      rangeEnd: '2025-10-07',
    },
    {
      id: '17',
      name: 'Chris Bell',
      role: 'Facilities Manager',
      initials: 'CB',
      leaveType: 'Other',
      leaveTone: 'other',
      duration: 'Oct 21 – Oct 23 (3 Days)',
      status: 'approved',
      decisionDate: todayISO,
      rangeStart: '2025-10-21',
      rangeEnd: '2025-10-23',
    },
    {
      id: '18',
      name: 'Nina Volkov',
      role: 'Drama Coach',
      initials: 'NV',
      leaveType: 'Vacation',
      leaveTone: 'vacation',
      duration: 'Oct 3 – Oct 4 (2 Days)',
      status: 'pending',
      decisionDate: null,
      rangeStart: '2025-10-03',
      rangeEnd: '2025-10-04',
    },
  ];
}

function dayStartMs(iso) {
  if (!iso || typeof iso !== 'string') return null;
  const t = Date.parse(`${iso}T12:00:00`);
  return Number.isNaN(t) ? null : t;
}

/**
 * Keep rows whose leave range overlaps the selected filter range (inclusive).
 * If only `fromISO` is set: leave must end on or after that day.
 * If only `toISO` is set: leave must start on or before that day.
 */
export function filterLeavesByDateRange(rows, fromISO, toISO) {
  const fromRaw = fromISO?.trim() ?? '';
  const toRaw = toISO?.trim() ?? '';
  if (!fromRaw && !toRaw) return rows;

  let fromMs = fromRaw ? dayStartMs(fromRaw) : null;
  let toMs = toRaw ? dayStartMs(toRaw) : null;
  if (fromRaw && fromMs === null) return rows;
  if (toRaw && toMs === null) return rows;

  if (fromMs != null && toMs != null && fromMs > toMs) {
    const swap = fromMs;
    fromMs = toMs;
    toMs = swap;
  }

  const filterStart = fromMs ?? -Infinity;
  const filterEnd = toMs ?? Infinity;

  return rows.filter((r) => {
    const rs = dayStartMs(r.rangeStart);
    const re = dayStartMs(r.rangeEnd);
    if (rs == null || re == null) return true;
    return rs <= filterEnd && re >= filterStart;
  });
}

export function filterLeaves(rows, filterId, todayISO) {
  if (filterId === 'all') return rows;
  if (filterId === 'pending') return rows.filter((r) => r.status === 'pending');
  if (filterId === 'approved_today') {
    return rows.filter((r) => r.status === 'approved' && r.decisionDate === todayISO);
  }
  if (filterId === 'rejected_today') {
    return rows.filter((r) => r.status === 'rejected' && r.decisionDate === todayISO);
  }
  return rows;
}

export function leaveCounts(rows, todayISO) {
  return {
    all: rows.length,
    pending: rows.filter((r) => r.status === 'pending').length,
    approved_today: rows.filter((r) => r.status === 'approved' && r.decisionDate === todayISO).length,
    rejected_today: rows.filter((r) => r.status === 'rejected' && r.decisionDate === todayISO).length,
  };
}

export const LEAVE_TABLE_FILTER_HEADINGS = {
  all: 'All leave applications',
  pending: 'Pending approval',
  approved_today: 'Approved today',
  rejected_today: 'Rejected today',
};
