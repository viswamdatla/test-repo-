/** Derives Academic Kit–style profile data from student records (no Tailwind). */

const HOUSES = ['Blue House', 'Green House', 'Red House', 'Yellow House'];
const GENDERS = ['Male', 'Female', 'Non-binary'];

const hashString = (s) => {
  let h = 5381;
  const str = String(s || '');
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(h);
};

const formatDisplayDate = (iso) => {
  if (!iso || typeof iso !== 'string') return '—';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const syntheticAdmissionDate = (h) => {
  const month = 1 + (h % 12);
  const day = 1 + (h % 28);
  const year = 2023 + (h % 2);
  const d = new Date(year, month - 1, day);
  return d.toISOString().slice(0, 10);
};

const bookKitItems = (booksStatus) => {
  const base = [
    { key: 'workbooks', label: 'Workbooks', icon: 'menu_book', value: 45 },
    { key: 'textbooks', label: 'Textbooks', icon: 'import_contacts', value: 72.5 },
    { key: 'notebooks', label: 'Notebooks', icon: 'edit_note', value: 18.5 },
  ];
  if (booksStatus === 'taken') {
    return base.map((b) => ({ ...b, status: 'taken' }));
  }
  if (booksStatus === 'not_taken') {
    return base.map((b) => ({ ...b, status: 'pending', icon: 'pending' }));
  }
  return base.map((b, i) => ({
    ...b,
    status: i === 1 ? 'pending' : 'taken',
    icon: i === 1 ? 'pending' : b.icon,
  }));
};

const uniformKitItems = (uniformStatus) => {
  const items = [
    { key: 'shirt', label: 'Shirt', size: 'Size 34' },
    { key: 'pant', label: 'Pant', size: 'Size 32' },
    { key: 'socks', label: 'Socks', size: 'Regular' },
    { key: 'belt', label: 'Belt', size: 'L' },
    { key: 'tie', label: 'Tie', size: 'Standard' },
  ];
  if (uniformStatus === 'complete') {
    return items.map((x) => ({ ...x, status: 'taken' }));
  }
  return items.map((x, i) => ({
    ...x,
    status: i === 2 ? 'pending' : 'taken',
  }));
};

const booksOverviewLabel = (booksStatus) => {
  if (booksStatus === 'taken') return 'Complete';
  if (booksStatus === 'not_taken') return 'Pending';
  return 'Partial';
};

const uniformOverviewLabel = (uniformStatus) => {
  if (uniformStatus === 'complete') return 'Complete';
  return 'Pending';
};

const paymentAmounts = (paymentStatus, kitTotal, h) => {
  if (paymentStatus === 'paid') {
    return { paid: kitTotal, balance: 0 };
  }
  if (paymentStatus === 'partial') {
    const paid = Math.round(kitTotal * (0.65 + (h % 15) / 100));
    return { paid, balance: Math.max(0, kitTotal - paid) };
  }
  const paid = Math.min(80, Math.round(kitTotal * 0.08 + (h % 25)));
  return { paid, balance: Math.max(0, kitTotal - paid) };
};

export const ACADEMIC_YEAR_LABEL = '2024-2025';

export function buildStudentProfileView(student) {
  const h = hashString(student.id || student.admissionNo || '0');
  const booksStatus = student.booksStatus || 'taken';
  const uniformStatus = student.uniformStatus || 'complete';
  const paymentStatus = student.paymentStatus || 'paid';

  const bookItems = Array.isArray(student.bookKitItems) && student.bookKitItems.length
    ? student.bookKitItems
    : bookKitItems(booksStatus);
  const uniformItems = Array.isArray(student.uniformKitItems) && student.uniformKitItems.length
    ? student.uniformKitItems
    : uniformKitItems(uniformStatus);

  const sumBooks = bookItems.reduce((s, b) => s + (Number(b.value) || 0), 0);
  const roundedTotal =
    typeof student.kitTotalValue === 'number'
      ? student.kitTotalValue
      : Math.round((sumBooks + 105 + (h % 25)) * 100) / 100;
  const { paid, balance } =
    typeof student.amountPaid === 'number'
      ? { paid: student.amountPaid, balance: Math.max(0, roundedTotal - student.amountPaid) }
      : paymentAmounts(paymentStatus, roundedTotal, h);

  const takenBook = bookItems.filter((b) => b.status === 'taken').length;
  const takenUniform = uniformItems.filter((u) => u.status === 'taken').length;
  const totalPieces = bookItems.length + uniformItems.length;
  const takenPieces = takenBook + takenUniform;
  const completionPct = totalPieces ? Math.round((takenPieces / totalPieces) * 100) : 0;

  const gender = student.gender || GENDERS[h % GENDERS.length];
  const house = student.house || HOUSES[h % HOUSES.length];
  const admissionDateRaw = student.admissionDate || syntheticAdmissionDate(h);

  return {
    gender,
    house,
    admissionDateDisplay: formatDisplayDate(admissionDateRaw),
    dateOfBirthDisplay: formatDisplayDate(student.dateOfBirth),
    bookItems,
    uniformItems,
    bookCollectedLabel: `${takenBook}/${bookItems.length} Collected`,
    uniformCollectedLabel: `${takenUniform}/${uniformItems.length} Collected`,
    kitTotal: roundedTotal,
    paid: Math.round(paid * 100) / 100,
    balance: Math.round(balance * 100) / 100,
    completionPct,
    booksOverviewLabel: booksOverviewLabel(booksStatus),
    uniformOverviewLabel: uniformOverviewLabel(uniformStatus),
    uniformOverviewIsComplete: uniformStatus === 'complete',
  };
}
