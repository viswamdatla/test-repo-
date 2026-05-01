import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { usePageTitle } from '../../../hooks/usePageTitle';
import {
  flattenAllClassNames,
  resolveStageForClass,
  sectionFromSlug,
  slugToClassLevel,
} from './studentManagementConfig';
import {
  bulkImportStudents,
  fetchAcademicsData,
  selectAcademicsStructure,
  selectClassSections,
  selectAcademicsSectionItems,
  selectAcademicsStatus,
} from '../../../store/academics/academicsSlice';
import '../AcademicsPages.scss';
import './StudentManagementFlow.scss';

const PAGE_SIZE = 8;
const ACADEMIC_YEAR = '2024-25';

const PAY_FILTERS = [
  { id: 'all', label: 'All Students' },
  { id: 'paid', label: 'Paid' },
  { id: 'unpaid', label: 'Unpaid' },
  { id: 'partial', label: 'Partial' },
];

const initialsFromName = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const normalizeStudentRow = (s) => ({
  ...s,
  rollNo: s.rollNo || s.admissionNo || '—',
  booksStatus: s.booksStatus || 'taken',
  uniformStatus: s.uniformStatus || 'complete',
  paymentStatus: s.paymentStatus || 'paid',
});

const normBooks = (v) => {
  const x = String(v || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_');
  if (['taken', 'partial', 'not_taken'].includes(x)) return x;
  if (x === 'not-taken') return 'not_taken';
  return undefined;
};

const normUniform = (v) => {
  const x = String(v || '').toLowerCase().trim();
  if (['complete', 'pending'].includes(x)) return x;
  return undefined;
};

const normPayment = (v) => {
  const x = String(v || '').toLowerCase().trim();
  if (['paid', 'unpaid', 'partial'].includes(x)) return x;
  return undefined;
};

function BooksStatusPill({ value }) {
  const map = {
    taken: { label: 'Taken', icon: 'check_circle', mod: 'sm-pill-books-ok', fill: true },
    partial: { label: 'Partial', icon: 'pending', mod: 'sm-pill-books-warn', fill: true },
    not_taken: { label: 'Not Taken', icon: 'cancel', mod: 'sm-pill-books-bad', fill: false },
  };
  const c = map[value] || map.taken;
  return (
    <span className={`sm-pill ${c.mod}`}>
      <span
        className="material-symbols-outlined sm-pill-ic"
        style={c.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {c.icon}
      </span>
      {c.label}
    </span>
  );
}

function UniformStatusPill({ value }) {
  const map = {
    complete: { label: 'Complete', icon: 'check_circle', mod: 'sm-pill-uniform-ok', fill: true },
    pending: { label: 'Pending', icon: 'error', mod: 'sm-pill-uniform-bad', fill: false },
  };
  const c = map[value] || map.complete;
  return (
    <span className={`sm-pill ${c.mod}`}>
      <span
        className="material-symbols-outlined sm-pill-ic"
        style={c.fill ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {c.icon}
      </span>
      {c.label}
    </span>
  );
}

function PaymentStatusPill({ value }) {
  const map = {
    paid: { label: 'Paid', mod: 'sm-pill-pay-paid' },
    unpaid: { label: 'Unpaid', mod: 'sm-pill-pay-unpaid' },
    partial: { label: 'Partial', mod: 'sm-pill-pay-partial' },
  };
  const c = map[value] || map.paid;
  return <span className={`sm-pill sm-pill-plain ${c.mod}`}>{c.label}</span>;
}

export const StudentManagementStudentListPage = () => {
  const { classSlug, sectionSlug } = useParams();
  const { wizardBase } = useOutletContext();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loadStatus = useSelector(selectAcademicsStatus);
  const structure = useSelector(selectAcademicsStructure);
  const students = useSelector((s) => selectAcademicsSectionItems(s, 'students'));
  const fileRef = useRef(null);
  const headCheckboxRef = useRef(null);
  const [importMessage, setImportMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [payFilter, setPayFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState({});

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

  useEffect(() => {
    if (!validClass || !stage) {
      navigate(wizardBase, { replace: true });
      return;
    }
    if (!section) {
      navigate(`${wizardBase}/${classSlug}`, { replace: true });
    }
  }, [stage, validClass, section, navigate, wizardBase, classSlug]);

  const roster = useMemo(() => {
    const raw = students.filter(
      (s) => s.stage === stage && s.classLevel === classLevel && (s.section || '') === section
    );
    return raw.map(normalizeStudentRow);
  }, [students, stage, classLevel, section]);

  const rosterStats = useMemo(() => {
    const total = roster.length;
    const unpaid = roster.filter((s) => s.paymentStatus === 'unpaid').length;
    const kitTaken = roster.filter((s) => s.booksStatus === 'taken').length;
    const kitPct = total ? Math.round((kitTaken / total) * 100) : 0;
    const pendingPayments = roster.filter((s) => s.paymentStatus !== 'paid').length;
    return { total, unpaid, kitPct, pendingPayments };
  }, [roster]);

  const tableSource = useMemo(() => {
    let rows = roster;
    if (payFilter !== 'all') {
      rows = rows.filter((s) => s.paymentStatus === payFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.guardian || '').toLowerCase().includes(q) ||
          String(s.rollNo || '')
            .toLowerCase()
            .includes(q) ||
          String(s.admissionNo || '')
            .toLowerCase()
            .includes(q)
      );
    }
    return [...rows].sort((a, b) => a.name.localeCompare(b.name));
  }, [roster, payFilter, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(tableSource.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = tableSource.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [payFilter, searchQuery, classSlug, sectionSlug]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    setSelectedIds({});
  }, [payFilter, searchQuery, classSlug, sectionSlug]);

  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selectedIds[r.id]);
  const somePageSelected = pageRows.some((r) => selectedIds[r.id]);

  useEffect(() => {
    const el = headCheckboxRef.current;
    if (el) el.indeterminate = somePageSelected && !allPageSelected;
  }, [somePageSelected, allPageSelected]);

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  const toggleSelectAllPage = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => {
        const next = { ...prev };
        pageRows.forEach((r) => {
          delete next[r.id];
        });
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = { ...prev };
        pageRows.forEach((r) => {
          next[r.id] = true;
        });
        return next;
      });
    }
  };

  const selectedStudents = useMemo(
    () => roster.filter((s) => selectedIds[s.id]),
    [roster, selectedIds]
  );
  const selectedCount = selectedStudents.length;

  usePageTitle(section && classLevel ? `${classLevel} ${section} — Students` : 'Student Management');

  const exportExcel = () => {
    const rows = roster.map((s) => ({
      RollNo: s.rollNo || '',
      AdmissionNo: s.admissionNo || '',
      Name: s.name || '',
      Guardian: s.guardian || '',
      BooksStatus: s.booksStatus || '',
      UniformStatus: s.uniformStatus || '',
      PaymentStatus: s.paymentStatus || '',
      Email: s.email || '',
      Phone: s.phone || '',
      DateOfBirth: s.dateOfBirth || '',
      Address: s.address || '',
      Status: s.status || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');
    XLSX.writeFile(workbook, `students_${classLevel.replace(/\s+/g, '-')}_${section}.xlsx`);
  };

  const parseImportWorkbook = async (file) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) return [];
    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    return rows
      .map((r) => ({
        name: r.Name || r.name || '',
        admissionNo: r.AdmissionNo || r.admissionNo || '',
        rollNo: r.RollNo || r.rollNo || '',
        guardian: r.Guardian || r.guardian || '',
        email: r.Email || r.email || '',
        phone: r.Phone || r.phone || '',
        dateOfBirth: r.DateOfBirth || r.dateOfBirth || '',
        address: r.Address || r.address || '',
        status: r.Status || r.status || 'Active',
        booksStatus: normBooks(r.BooksStatus || r.booksStatus),
        uniformStatus: normUniform(r.UniformStatus || r.uniformStatus),
        paymentStatus: normPayment(r.PaymentStatus || r.paymentStatus),
      }))
      .filter((r) => String(r.name).trim());
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const records = await parseImportWorkbook(file);
    if (records.length === 0) {
      setImportMessage('Import failed: Excel must include a Name column and at least one row.');
      return;
    }
    dispatch(bulkImportStudents({ stage, classLevel, section, records }));
    setImportMessage(`Imported ${records.length} students into ${classLevel} - ${section}.`);
    e.target.value = '';
  };

  const showFrom = tableSource.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showTo = Math.min(safePage * PAGE_SIZE, tableSource.length);

  const pageButtonRange = useMemo(() => {
    const pc = pageCount;
    const cur = safePage;
    if (pc <= 5) return Array.from({ length: pc }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(cur - 1, pc - 2));
    const out = [];
    for (let p = start; p <= Math.min(start + 2, pc); p += 1) out.push(p);
    return out;
  }, [pageCount, safePage]);

  if (!stage || !validClass || !section) return null;

  return (
    <div className="sm-roster-page">
      <div className="sm-roster-toolbar-top">
        <button type="button" className="sm-back" onClick={() => navigate(`${wizardBase}/${classSlug}`)}>
          <span className="material-symbols-outlined">arrow_back</span>
          Sections
        </button>
        <div className="sm-roster-toolbar-actions">
          <button type="button" className="sm-action-btn" onClick={() => fileRef.current?.click()}>
            Bulk Import
          </button>
          <button type="button" className="sm-action-btn" onClick={exportExcel} disabled={roster.length === 0}>
            Export
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            className="sm-file-hidden"
            onChange={onFileChange}
          />
        </div>
      </div>

      <header className="sm-roster-page-head">
        <div>
          <h1 className="sm-roster-title">
            {classLevel} — Section {section}
          </h1>
          <p className="sm-roster-year">
            <span className="material-symbols-outlined sm-roster-year-ic">calendar_month</span>
            Academic Year {ACADEMIC_YEAR}
          </p>
        </div>
      </header>

      {importMessage && <p className="sm-import-msg sm-roster-import-msg">{importMessage}</p>}
      {loadStatus === 'loading' && <p className="sm-loading">Loading students…</p>}

      <div className="sm-roster-stats">
        <div className="sm-roster-stat sm-roster-stat-wide">
          <span className="sm-roster-stat-kicker">Roster overview</span>
          <h2 className="sm-roster-stat-title">Student distribution</h2>
          <div className="sm-roster-stat-legend">
            <div className="sm-roster-legend-item">
              <span className="sm-roster-dot sm-roster-dot-primary" />
              <span className="sm-roster-legend-text">{rosterStats.total} Total Students</span>
            </div>
            <div className="sm-roster-legend-item">
              <span className="sm-roster-dot sm-roster-dot-tertiary" />
              <span className="sm-roster-legend-text">{rosterStats.unpaid} Unpaid</span>
            </div>
          </div>
        </div>
        <div className="sm-roster-stat sm-roster-stat-primary">
          <span className="material-symbols-outlined sm-roster-stat-icon">package_2</span>
          <h3 className="sm-roster-stat-value">{rosterStats.kitPct}%</h3>
          <p className="sm-roster-stat-caption">Kits distributed</p>
        </div>
        <div className="sm-roster-stat sm-roster-stat-wallet">
          <span className="material-symbols-outlined sm-roster-stat-icon">account_balance_wallet</span>
          <h3 className="sm-roster-stat-value">{rosterStats.pendingPayments}</h3>
          <p className="sm-roster-stat-caption">Pending payments</p>
        </div>
      </div>

      <div className="sm-roster-filters">
        <div className="sm-roster-search-wrap">
          <span className="material-symbols-outlined sm-roster-search-ic">search</span>
          <input
            type="search"
            className="sm-roster-search-input"
            placeholder="Search student name or roll number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search students"
          />
        </div>
        <div className="sm-roster-pills">
          {PAY_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`sm-roster-filter-pill ${payFilter === f.id ? 'active' : ''}`}
              onClick={() => setPayFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
          <span className="sm-roster-pills-divider" aria-hidden />
          <button type="button" className="sm-roster-filter-icon" title="More filters" aria-label="More filters">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      <div className="sm-roster-table-card">
        <div className="sm-roster-table-scroll">
          <table className="sm-roster-table">
            <thead>
              <tr>
                <th className="sm-roster-th-check">
                  <input
                    ref={headCheckboxRef}
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleSelectAllPage}
                    aria-label="Select all on this page"
                  />
                </th>
                <th>Student name</th>
                <th>Roll no</th>
                <th>Books status</th>
                <th>Uniform status</th>
                <th>Payment status</th>
                <th className="sm-roster-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((stu, idx) => (
                <tr key={stu.id} className="sm-roster-tr">
                  <td>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedIds[stu.id])}
                      onChange={() => toggleRow(stu.id)}
                      aria-label={`Select ${stu.name}`}
                    />
                  </td>
                  <td>
                    <div className="sm-roster-student-cell">
                      <div className={`sm-roster-avatar sm-roster-avatar-${idx % 3}`}>{initialsFromName(stu.name)}</div>
                      <div>
                        <Link className="sm-roster-name-link" to={stu.id} relative="path">
                          {stu.name}
                        </Link>
                        <p className="sm-roster-guardian">Guardian: {stu.guardian || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="sm-roster-td-muted">{stu.rollNo}</td>
                  <td>
                    <BooksStatusPill value={stu.booksStatus} />
                  </td>
                  <td>
                    <UniformStatusPill value={stu.uniformStatus} />
                  </td>
                  <td>
                    <PaymentStatusPill value={stu.paymentStatus} />
                  </td>
                  <td className="sm-roster-td-actions">
                    <button
                      type="button"
                      className="sm-roster-more"
                      aria-label={`Actions for ${stu.name}`}
                      onClick={() => navigate(stu.id, { relative: 'path' })}
                    >
                      <span className="material-symbols-outlined">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tableSource.length === 0 && loadStatus !== 'loading' && (
          <p className="sm-empty-hint sm-roster-empty">No students match this view.</p>
        )}
        {tableSource.length > 0 && (
          <div className="sm-roster-pagination">
            <p className="sm-roster-page-summary">
              Showing <strong>{showFrom}</strong>-<strong>{showTo}</strong> of{' '}
              <strong>{tableSource.length}</strong> students
            </p>
            <div className="sm-roster-page-btns">
              <button
                type="button"
                className="sm-roster-page-nav"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {pageButtonRange.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`sm-roster-page-num ${p === safePage ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="sm-roster-page-nav"
                disabled={safePage >= pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                aria-label="Next page"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedCount > 0 && (
        <div className="sm-roster-float">
          <div className="sm-roster-float-bubble">
            <div className="sm-roster-float-avatars">
              {selectedStudents.slice(0, 3).map((s, i) => (
                <span key={s.id} className={`sm-roster-float-av sm-roster-avatar-${i % 3}`}>
                  {initialsFromName(s.name)}
                </span>
              ))}
            </div>
            <p className="sm-roster-float-text">
              {selectedCount} student{selectedCount === 1 ? '' : 's'} selected for order
            </p>
          </div>
          <button
            type="button"
            className="sm-roster-cta"
            onClick={() =>
              window.alert(
                `${selectedCount} student${selectedCount === 1 ? '' : 's'} ready for order processing.`
              )
            }
          >
            Proceed to order
            <span className="material-symbols-outlined sm-roster-cta-ic">arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
};
