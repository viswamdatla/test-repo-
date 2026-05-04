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
    },
  ];
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
