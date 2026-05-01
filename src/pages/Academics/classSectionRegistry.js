export const SECTION_LETTERS = ['A', 'B', 'C'];

function splitCountAcrossSections(total, sectionCount) {
  const base = Math.floor(total / sectionCount);
  const rem = total % sectionCount;
  return Array.from({ length: sectionCount }, (_, i) => base + (i < rem ? 1 : 0));
}

export const CLASS_CARDS = [
  { code: 'NUR', label: 'Nursery', count: 21 },
  { code: 'LKG', label: 'LKG', count: 34 },
  { code: 'UKG', label: 'UKG', count: 28 },
  { code: '01', label: 'Class 1', count: 42 },
  { code: '02', label: 'Class 2', count: 38 },
  { code: '03', label: 'Class 3', count: 45 },
  { code: '04', label: 'Class 4', count: 40 },
  { code: '05', label: 'Class 5', count: 36 },
  { code: '06', label: 'Class 6', count: 48 },
  { code: '07', label: 'Class 7', count: 41 },
  { code: '08', label: 'Class 8', count: 39 },
  { code: '09', label: 'Class 9', count: 37 },
  { code: '10', label: 'Class 10', count: 32, isSenior: true },
].map((row) => {
  if (row.code === 'NUR') {
    return { ...row, sections: [] };
  }
  const counts = splitCountAcrossSections(row.count, SECTION_LETTERS.length);
  const sections = SECTION_LETTERS.map((letter, i) => ({
    id: `${row.code}-${letter}`,
    pill: letter,
    title: `Section ${letter}`,
    count: counts[i],
  }));
  return { ...row, sections };
});

const classByCode = new Map(CLASS_CARDS.map((c) => [c.code, c]));

/**
 * sectionId format: "{classCode}-{letter}" e.g. "06-A", "NUR-A"
 */
export function parseSectionId(sectionId) {
  if (!sectionId || typeof sectionId !== 'string') return null;
  const idx = sectionId.lastIndexOf('-');
  if (idx <= 0) return null;
  const classCode = sectionId.slice(0, idx);
  const sectionLetter = sectionId.slice(idx + 1);
  return { classCode, sectionLetter };
}

export function getClassByCode(code) {
  return classByCode.get(code) ?? null;
}

export function getSectionContext(sectionId) {
  const parsed = parseSectionId(sectionId);
  if (!parsed) return null;
  const cls = getClassByCode(parsed.classCode);
  if (!cls) return null;
  const section = cls.sections?.find((s) => s.id === sectionId);
  if (!section) return null;
  return {
    ...parsed,
    classLabel: cls.label,
    section,
    totalStudentsInClass: cls.count,
  };
}

export function getSectionNavTitle(sectionId) {
  const ctx = getSectionContext(sectionId);
  if (!ctx) return 'Students';
  return `${ctx.classLabel} - Section ${ctx.sectionLetter}`;
}
