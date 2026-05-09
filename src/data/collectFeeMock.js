/** Mock data adapted from orders/new-order (local demo flow — replace with API later). */

export const collectFeeClasses = [
  { id: -2, name: 'Nursery', students: 120 },
  { id: -1, name: 'LKG', students: 120 },
  { id: 0, name: 'UKG', students: 120 },
  ...Array.from({ length: 10 }, (_, index) => ({
    id: index + 1,
    name: `Class ${index + 1}`,
    students: 120,
  })),
];

export const collectFeeSections = [
  { id: 'A', name: 'Section A', students: 30 },
  { id: 'B', name: 'Section B', students: 30 },
  { id: 'C', name: 'Section C', students: 30 },
  { id: 'D', name: 'Section D', students: 30 },
];

export const collectFeeStudents = [
  {
    id: 's1',
    name: 'Arjun Adhikari',
    roll: '6A001',
    books: 'Taken',
    uniform: 'Complete',
    payment: 'Paid',
    guardian: 'Mohan Adhikari',
    parentPhone: '+1 (555) 219-1001',
    initials: 'AA',
  },
  {
    id: 's2',
    name: 'Bina Kumari',
    roll: '6A002',
    books: 'Partial',
    uniform: 'Pending',
    payment: 'Unpaid',
    guardian: 'Sita Devi',
    parentPhone: '+1 (555) 219-1002',
    initials: 'BK',
  },
  {
    id: 's3',
    name: 'Deepak Khanal',
    roll: '6A003',
    books: 'Taken',
    uniform: 'Pending',
    payment: 'Partial',
    guardian: 'Ram Khanal',
    parentPhone: '+1 (555) 219-1003',
    initials: 'DK',
  },
  {
    id: 's4',
    name: 'Pooja Sharma',
    roll: '6A004',
    books: 'Not Taken',
    uniform: 'Complete',
    payment: 'Paid',
    guardian: 'Laxmi Sharma',
    parentPhone: '+1 (555) 219-1004',
    initials: 'PS',
  },
];

/** Default fee lines (inspired by orders/payment fallback). */
export const collectFeeDefaultLines = [
  {
    id: 'line-tuition',
    label: 'Term tuition',
    detail: 'Covers instruction and facilities for the current billing period.',
    amount: 450,
    checked: true,
  },
  {
    id: 'line-transport',
    label: 'Transport (monthly)',
    detail: 'Bus route allocation and safety compliance.',
    amount: 85,
    checked: true,
  },
  {
    id: 'line-lab',
    label: 'Laboratory fee',
    detail: 'Science and computer lab materials.',
    amount: 40,
    checked: false,
  },
  {
    id: 'line-activity',
    label: 'Activities & sports',
    detail: 'Extracurricular programs and equipment.',
    amount: 35,
    checked: true,
  },
];

export const ADMIN_FEE = 5;

export const collectFeePaymentMethods = [
  { id: 'cash', label: 'Cash', description: 'Pay at the school counter', icon: 'payments' },
  { id: 'upi-canara', label: 'Canara Bank UPI', description: 'Institution VPA', icon: 'account_balance' },
  { id: 'upi-bharath', label: 'UPI to Bharath Kumar', description: 'Staff collection', icon: 'person' },
  { id: 'card', label: 'Card', description: 'Debit / credit at POS', icon: 'credit_card' },
  { id: 'credit', label: 'Credit', description: 'Post to credit ledger', icon: 'credit_score' },
  { id: 'other', label: 'Other', description: 'Manual reconciliation', icon: 'more_horiz' },
  { id: 'upi-bob', label: 'BOB UPI', description: 'Bank of Baroda UPI', icon: 'qr_code_2' },
  { id: 'cheque', label: 'Cheque', description: 'Cheque deposit', icon: 'request_quote' },
];
