import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import {
  ADMIN_FEE,
  collectFeeClasses,
  collectFeeDefaultLines,
  collectFeePaymentMethods,
  collectFeeSections,
  collectFeeStudents,
} from '../../data/collectFeeMock';
import './CollectFeeFlowPage.scss';

const STEPS = [
  { id: 1, label: 'Class & student' },
  { id: 2, label: 'Fee lines' },
  { id: 3, label: 'Payment' },
];

function formatReceiptDate(d) {
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatReceiptTime(d) {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

const RECEIPT_SCHOOL = {
  name: 'Campus360 Pro',
  address: '124 Education Avenue, Academic District',
  contact: 'finance@campus360pro.edu | +1 (555) 010-0200',
};

function formatOrderIdForDisplay(id) {
  const s = String(id ?? '').replace(/^#/, '');
  return s.startsWith('CFP') ? `#${s}` : `#${s}`;
}

export const CollectFeeFlowPage = () => {
  usePageTitle('Collect Fee');
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [lines, setLines] = useState(() => collectFeeDefaultLines.map((l) => ({ ...l })));
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [remarks, setRemarks] = useState('');
  const [completed, setCompleted] = useState(false);
  const [receiptMeta, setReceiptMeta] = useState(null);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return collectFeeStudents;
    return collectFeeStudents.filter((s) => {
      const name = (s.name ?? '').toLowerCase();
      const roll = (s.roll ?? '').toLowerCase();
      return name.includes(q) || roll.includes(q);
    });
  }, [studentSearch]);

  const student = useMemo(
    () => collectFeeStudents.find((s) => s.id === studentId) ?? null,
    [studentId],
  );

  useEffect(() => {
    if (studentId && !filteredStudents.some((s) => s.id === studentId)) {
      setStudentId(null);
    }
  }, [filteredStudents, studentId]);

  const subtotal = useMemo(
    () => lines.filter((l) => l.checked).reduce((sum, l) => sum + l.amount, 0),
    [lines],
  );
  const total = subtotal + ADMIN_FEE;

  const toggleLine = (id) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, checked: !l.checked } : l)));
  };

  const canGoStep2 = selectedClass && selectedSection && studentId;
  const canGoStep3 = subtotal > 0;

  const paidLines = useMemo(() => lines.filter((l) => l.checked), [lines]);
  const paymentLabel = collectFeePaymentMethods.find((m) => m.id === paymentMethod)?.label ?? paymentMethod;
  const paymentIcon = collectFeePaymentMethods.find((m) => m.id === paymentMethod)?.icon ?? 'payments';

  const subtotalLinesOnly = useMemo(
    () => paidLines.reduce((sum, l) => sum + l.amount, 0),
    [paidLines],
  );

  const paymentReceiptDetail = useMemo(() => {
    if (paymentMethod === 'card') return `${paymentLabel} (Visa ending in 4421)`;
    if (paymentMethod === 'upi') return `${paymentLabel} (institution UPI)`;
    if (paymentMethod === 'cheque') return `${paymentLabel} (reference on cheque)`;
    return paymentLabel;
  }, [paymentMethod, paymentLabel]);

  const handleComplete = () => {
    const issuedAt = new Date();
    const y = issuedAt.getFullYear();
    const n = Math.floor(1000 + Math.random() * 9000);
    setReceiptMeta({ orderId: `CFP-${y}-${n}`, issuedAt });
    setCompleted(true);
    window.dispatchEvent(new CustomEvent('skm-order-confirmed', { detail: { studentId } }));
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedClass(null);
    setSelectedSection(null);
    setStudentId(null);
    setStudentSearch('');
    setLines(collectFeeDefaultLines.map((l) => ({ ...l })));
    setPaymentMethod('cash');
    setRemarks('');
    setReceiptMeta(null);
    setCompleted(false);
  };

  if (completed && receiptMeta && student && selectedClass && selectedSection) {
    const { orderId, issuedAt } = receiptMeta;
    const orderDisplay = formatOrderIdForDisplay(orderId);

    return (
      <div className="cf-flow cf-flow--success">
        <div className="cf-success-bg" aria-hidden />

        {/* KitRegistry-style confirmation */}
        <section className="cf-pay-confirm no-print" aria-labelledby="cf-success-title">
          <div className="cf-pay-confirm__icon-wrap">
            <div className="cf-pay-confirm__icon-glow" aria-hidden />
            <div className="cf-pay-confirm__icon">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
          </div>
          <div className="cf-pay-confirm__head">
            <h1 id="cf-success-title" className="cf-pay-confirm__title">
              Payment Successful!
            </h1>
            <p className="cf-pay-confirm__lead">
              The transaction has been processed and the order is now active.
            </p>
          </div>

          <div className="cf-pay-confirm__card-outer">
            <div className="cf-pay-confirm__card-inner">
              <div className="cf-pay-confirm__card-head">
                <span className="cf-pay-confirm__card-title">Receipt Details</span>
                <span className="cf-pay-confirm__badge">Paid</span>
              </div>
              <div className="cf-pay-confirm__grid">
                <div className="cf-pay-confirm__field">
                  <span className="cf-pay-confirm__label">Order ID</span>
                  <p className="cf-pay-confirm__value">{orderDisplay}</p>
                </div>
                <div className="cf-pay-confirm__field">
                  <span className="cf-pay-confirm__label">Student Name</span>
                  <p className="cf-pay-confirm__value">{student.name}</p>
                </div>
                <div className="cf-pay-confirm__field">
                  <span className="cf-pay-confirm__label">Amount Paid</span>
                  <p className="cf-pay-confirm__amount">${total.toFixed(2)}</p>
                </div>
                <div className="cf-pay-confirm__field">
                  <span className="cf-pay-confirm__label">Payment Method</span>
                  <div className="cf-pay-confirm__method">
                    <span className="material-symbols-outlined" aria-hidden>
                      {paymentIcon}
                    </span>
                    <p className="cf-pay-confirm__value">{paymentLabel}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="cf-pay-confirm__dots" aria-hidden>
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="cf-pay-confirm__actions">
            <button type="button" className="cf-btn cf-btn--primary" onClick={handlePrintReceipt}>
              <span className="material-symbols-outlined">print</span>
              Print Receipt
            </button>
            <Link to="/financial-services" className="cf-btn cf-btn--text-primary">
              <span className="material-symbols-outlined">dashboard</span>
              Back to Dashboard
            </Link>
          </div>

          <p className="cf-pay-confirm__support">
            Questions about your order?{' '}
            <a href="mailto:support@campus360pro.edu" className="cf-pay-confirm__support-link">
              Contact Registry Support
            </a>
          </p>
        </section>

        {/* ScholarFlow-style printable receipt */}
        <div className="cf-print-wrap">
          <div className="no-print cf-print-toolbar">
            <div className="cf-print-toolbar__left">
              <span className="material-symbols-outlined">description</span>
              <span className="cf-print-toolbar__order">Order {orderDisplay}</span>
            </div>
            <button type="button" className="cf-btn cf-btn--primary" onClick={handlePrintReceipt}>
              <span className="material-symbols-outlined">print</span>
              Print Receipt
            </button>
          </div>

          <main className="cf-receipt-doc" aria-label="Printable fee receipt">
            <header className="cf-receipt-doc__header">
              <div className="cf-receipt-doc__brand">
                <div className="cf-receipt-doc__brand-mark" aria-hidden>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    school
                  </span>
                </div>
                <div>
                  <h2 className="cf-receipt-doc__school">{RECEIPT_SCHOOL.name}</h2>
                  <p className="cf-receipt-doc__addr">{RECEIPT_SCHOOL.address}</p>
                  <p className="cf-receipt-doc__addr">{RECEIPT_SCHOOL.contact}</p>
                </div>
              </div>
              <div className="cf-receipt-doc__title-block">
                <h2 className="cf-receipt-doc__receipt-word">Receipt</h2>
                <div className="cf-receipt-doc__meta-row">
                  <span className="cf-receipt-doc__meta-k">Order ID:</span>
                  <span className="cf-receipt-doc__meta-v">{orderDisplay}</span>
                </div>
                <div className="cf-receipt-doc__meta-row">
                  <span className="cf-receipt-doc__meta-k">Date:</span>
                  <span className="cf-receipt-doc__meta-v">{formatReceiptDate(issuedAt)}</span>
                </div>
                <div className="cf-receipt-doc__meta-row">
                  <span className="cf-receipt-doc__meta-k">Time:</span>
                  <span className="cf-receipt-doc__meta-v">{formatReceiptTime(issuedAt)}</span>
                </div>
              </div>
            </header>

            <section className="cf-receipt-doc__panels">
              <div>
                <h3 className="cf-receipt-doc__panel-title">Student Details</h3>
                <div className="cf-receipt-doc__stack">
                  <div>
                    <span className="cf-receipt-doc__small-k">Full Name</span>
                    <span className="cf-receipt-doc__strong-lg">{student.name}</span>
                  </div>
                  <div>
                    <span className="cf-receipt-doc__small-k">Roll Number</span>
                    <span className="cf-receipt-doc__strong">{student.roll}</span>
                  </div>
                  <div>
                    <span className="cf-receipt-doc__small-k">Guardian</span>
                    <span className="cf-receipt-doc__strong">{student.guardian}</span>
                  </div>
                  <div>
                    <span className="cf-receipt-doc__small-k">Phone</span>
                    <span className="cf-receipt-doc__strong">{student.parentPhone}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="cf-receipt-doc__panel-title">Academic Info</h3>
                <div className="cf-receipt-doc__stack">
                  <div>
                    <span className="cf-receipt-doc__small-k">Class / Grade</span>
                    <span className="cf-receipt-doc__strong-lg">{selectedClass.name}</span>
                  </div>
                  <div>
                    <span className="cf-receipt-doc__small-k">Section</span>
                    <span className="cf-receipt-doc__strong">{selectedSection.name}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="cf-receipt-doc__table-wrap">
              <table className="cf-receipt-doc__table">
                <thead>
                  <tr>
                    <th scope="col">Description</th>
                    <th scope="col" className="cf-receipt-doc__col-num">
                      Unit Price
                    </th>
                    <th scope="col" className="cf-receipt-doc__col-num">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paidLines.map((line) => (
                    <tr key={line.id}>
                      <td>
                        <p className="cf-receipt-doc__line-title">{line.label}</p>
                        {line.detail ? <p className="cf-receipt-doc__line-detail">{line.detail}</p> : null}
                      </td>
                      <td className="cf-receipt-doc__col-num">${line.amount.toFixed(2)}</td>
                      <td className="cf-receipt-doc__col-num cf-receipt-doc__col-bold">${line.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>
                      <p className="cf-receipt-doc__line-title">Administrative fee</p>
                      <p className="cf-receipt-doc__line-detail">Processing and documentation.</p>
                    </td>
                    <td className="cf-receipt-doc__col-num">${ADMIN_FEE.toFixed(2)}</td>
                    <td className="cf-receipt-doc__col-num cf-receipt-doc__col-bold">${ADMIN_FEE.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {remarks.trim() ? (
              <p className="cf-receipt-doc__remarks">
                <strong>Notes:</strong> {remarks.trim()}
              </p>
            ) : null}

            <footer className="cf-receipt-doc__footer">
              <div className="cf-receipt-doc__footer-left">
                <div>
                  <p className="cf-receipt-doc__panel-title">Payment Method</p>
                  <p className="cf-receipt-doc__pay-line">{paymentReceiptDetail}</p>
                </div>
                <div className="cf-receipt-doc__sign">
                  <div className="cf-receipt-doc__sign-line" />
                  <p className="cf-receipt-doc__panel-title">Authorized Signature</p>
                </div>
              </div>
              <div className="cf-receipt-doc__summary">
                <div className="cf-receipt-doc__summary-row">
                  <span>Subtotal</span>
                  <span>${subtotalLinesOnly.toFixed(2)}</span>
                </div>
                <div className="cf-receipt-doc__summary-row">
                  <span>Processing Fee</span>
                  <span>$0.00</span>
                </div>
                <div className="cf-receipt-doc__summary-row">
                  <span>Administrative fee</span>
                  <span>${ADMIN_FEE.toFixed(2)}</span>
                </div>
                <div className="cf-receipt-doc__summary-total">
                  <span>Total Amount</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </footer>

            <div className="cf-receipt-doc__closing">
              <p className="cf-receipt-doc__thanks">Thank you for your payment</p>
              <p className="cf-receipt-doc__legal">
                This is a computer-generated receipt. No physical signature is required for digital verification.
              </p>
              <div className="cf-receipt-doc__qr" aria-hidden title="Verification placeholder">
                <span className="material-symbols-outlined">qr_code_2</span>
              </div>
            </div>
          </main>

          <p className="no-print cf-print-hint">
            <span className="material-symbols-outlined">info</span>
            Optimize your printing settings by checking &apos;Background Graphics&apos; in the print dialog.
          </p>
        </div>

        <div className="cf-flow__success-actions no-print">
          <button type="button" className="cf-btn cf-btn--ghost" onClick={resetFlow}>
            Collect another fee
          </button>
          <Link to="/financial-services/fee-management" className="cf-btn cf-btn--primary">
            Back to Fee Management
          </Link>
          <Link to="/financial-services" className="cf-btn cf-btn--outline">
            Finance dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cf-flow">
      <header className="cf-flow__hero">
        <div className="cf-flow__hero-row">
          <div>
            <p className="cf-flow__eyebrow">Financial services · Orders flow (integrated)</p>
            <h1 className="cf-flow__title">Collect fee</h1>
            <p className="cf-flow__subtitle">
              Same flow as the orders module: pick class and section, choose a student, confirm fee lines, then record
              payment.
            </p>
          </div>
          <button type="button" className="cf-btn cf-btn--ghost" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
            Back
          </button>
        </div>

        <ol className="cf-steps" aria-label="Progress">
          {STEPS.map((s, idx) => (
            <li key={s.id} className={`cf-steps__item ${step >= s.id ? 'is-done' : ''} ${step === s.id ? 'is-current' : ''}`}>
              <span className="cf-steps__num">{idx + 1}</span>
              <span className="cf-steps__label">{s.label}</span>
            </li>
          ))}
        </ol>
      </header>

      {step === 1 && (
        <section className="cf-panel" aria-labelledby="cf-step1-title">
          <h2 id="cf-step1-title" className="cf-panel__title">
            Select class, section, and student
          </h2>

          <div className="cf-field">
            <span className="cf-field__label">Class</span>
            <div className="cf-class-grid">
              {collectFeeClasses.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`cf-tile ${selectedClass?.id === c.id ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelectedClass(c);
                    setSelectedSection(null);
                    setStudentId(null);
                    setStudentSearch('');
                  }}
                >
                  <span className="cf-tile__name">{c.name}</span>
                  <span className="cf-tile__meta">{c.students} students</span>
                </button>
              ))}
            </div>
          </div>

          {selectedClass && (
            <div className="cf-field">
              <span className="cf-field__label">Section</span>
              <div className="cf-pill-row">
                {collectFeeSections.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    className={`cf-pill ${selectedSection?.id === sec.id ? 'is-selected' : ''}`}
                    onClick={() => {
                      setSelectedSection(sec);
                      setStudentId(null);
                      setStudentSearch('');
                    }}
                  >
                    {sec.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedClass && selectedSection && (
            <div className="cf-field">
              <span className="cf-field__label">Student</span>
              <label className="cf-student-search">
                <span className="material-symbols-outlined" aria-hidden>
                  search
                </span>
                <input
                  type="search"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search student by name or roll number..."
                  aria-label="Search students by name or roll number"
                  autoComplete="off"
                />
              </label>
              <div className="cf-student-list" role="listbox" aria-label="Students in section">
                {filteredStudents.length === 0 ? (
                  <p className="cf-student-empty">No students match your search.</p>
                ) : (
                  filteredStudents.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="option"
                      aria-selected={studentId === s.id}
                      className={`cf-student ${studentId === s.id ? 'is-selected' : ''}`}
                      onClick={() => setStudentId(s.id)}
                    >
                      <span className="cf-student__avatar">{s.initials}</span>
                      <span className="cf-student__body">
                        <span className="cf-student__name">{s.name}</span>
                        <span className="cf-student__meta">
                          Roll {s.roll} · {s.payment} · {s.guardian}
                        </span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="cf-actions">
            <button type="button" className="cf-btn cf-btn--primary" disabled={!canGoStep2} onClick={() => setStep(2)}>
              Continue
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>
      )}

      {step === 2 && student && (
        <section className="cf-panel" aria-labelledby="cf-step2-title">
          <h2 id="cf-step2-title" className="cf-panel__title">
            Fee lines
          </h2>
          <div className="cf-summary-strip">
            <div>
              <p className="cf-summary-strip__k">Student</p>
              <p className="cf-summary-strip__v">{student.name}</p>
            </div>
            <div>
              <p className="cf-summary-strip__k">Roll</p>
              <p className="cf-summary-strip__v">{student.roll}</p>
            </div>
            <div>
              <p className="cf-summary-strip__k">Class</p>
              <p className="cf-summary-strip__v">
                {selectedClass.name} · {selectedSection.name}
              </p>
            </div>
            <div>
              <p className="cf-summary-strip__k">Guardian</p>
              <p className="cf-summary-strip__v">{student.guardian}</p>
            </div>
          </div>

          <ul className="cf-line-list">
            {lines.map((line) => (
              <li key={line.id} className="cf-line">
                <label className="cf-line__label">
                  <input type="checkbox" checked={line.checked} onChange={() => toggleLine(line.id)} />
                  <span>{line.label}</span>
                </label>
                <span className="cf-line__amt">${line.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="cf-totals">
            <div className="cf-totals__row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="cf-totals__row">
              <span>Administrative fee</span>
              <span>${ADMIN_FEE.toFixed(2)}</span>
            </div>
            <div className="cf-totals__row cf-totals__row--total">
              <span>Total due</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="cf-actions">
            <button type="button" className="cf-btn cf-btn--ghost" onClick={() => setStep(1)}>
              Back
            </button>
            <button type="button" className="cf-btn cf-btn--primary" disabled={!canGoStep3} onClick={() => setStep(3)}>
              Continue to payment
            </button>
          </div>
        </section>
      )}

      {step === 3 && student && (
        <section className="cf-panel" aria-labelledby="cf-step3-title">
          <h2 id="cf-step3-title" className="cf-panel__title">
            Payment
          </h2>
          <p className="cf-panel__lead">
            Amount to collect: <strong>${total.toFixed(2)}</strong>
          </p>

          <div className="cf-field">
            <span className="cf-field__label">Method</span>
            <div className="cf-method-grid">
              {collectFeePaymentMethods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`cf-method ${paymentMethod === m.id ? 'is-selected' : ''}`}
                  onClick={() => setPaymentMethod(m.id)}
                >
                  <span className="material-symbols-outlined">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="cf-field">
            <label className="cf-field__label" htmlFor="cf-remarks">
              Remarks (optional)
            </label>
            <textarea
              id="cf-remarks"
              className="cf-textarea"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Receipt notes, reference no., etc."
            />
          </div>

          <div className="cf-actions">
            <button type="button" className="cf-btn cf-btn--ghost" onClick={() => setStep(2)}>
              Back
            </button>
            <button type="button" className="cf-btn cf-btn--primary" onClick={handleComplete}>
              Complete payment
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
