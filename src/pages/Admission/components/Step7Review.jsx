import React, { useMemo } from 'react';
import { AdmissionDraftNextGroup } from './AdmissionSaveDraftNext';
import { collectFeePaymentMethods } from '../../../data/collectFeeMock';

function formatRupee(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return '₹0.00';
  return `₹${x.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const Step7Review = ({ formData, onSubmit, onBack, onSaveDraft }) => {
  const initialPaymentAmount = Number(formData.initialPayment ?? 5000) || 0;
  const admissionFeeAmount = Number(formData.admissionFee ?? 1000) || 0;
  const enteredDiscountAmount = Number(formData.discountAmount ?? 0) || 0;
  const subtotalAmount = initialPaymentAmount + admissionFeeAmount;
  const effectiveDiscountAmount = formData.applyDiscount ? Math.min(enteredDiscountAmount, subtotalAmount) : 0;
  const totalDueAmount = Math.max(0, subtotalAmount - effectiveDiscountAmount);

  const paymentMethodId = formData.admissionPaymentMethodId ?? formData.paymentMethod ?? 'cash';
  const secondPaymentMethodId = formData.admissionSecondPaymentMethodId ?? 'upi-canara';
  const splitEnabled = Boolean(formData.admissionSplitEnabled);
  const splitPrimaryRaw = Number(formData.admissionSplitPrimaryAmount ?? 0) || 0;

  const payNowRaw = formData.admissionPayNowInput;
  const payNowClamped = useMemo(() => {
    const cap = totalDueAmount;
    if (payNowRaw === undefined || payNowRaw === '' || payNowRaw === null) return cap;
    const n = Number(payNowRaw);
    if (Number.isNaN(n)) return 0;
    return Math.min(Math.max(0, n), cap);
  }, [totalDueAmount, payNowRaw]);

  const splitPrimaryClamped = splitEnabled
    ? Math.min(Math.max(0, splitPrimaryRaw), payNowClamped)
    : payNowClamped;
  const splitSecondaryAmount = splitEnabled ? Math.max(0, payNowClamped - splitPrimaryClamped) : 0;

  const paymentLabel =
    collectFeePaymentMethods.find((m) => m.id === paymentMethodId)?.label ??
    (typeof formData.paymentMethod === 'string' ? formData.paymentMethod : String(paymentMethodId));
  const secondPaymentLabel =
    collectFeePaymentMethods.find((m) => m.id === secondPaymentMethodId)?.label ?? secondPaymentMethodId;

  const remarks = formData.admissionPaymentRemarks ?? '';
  const remainingAfterPay = Math.max(0, totalDueAmount - payNowClamped);

  return (
    <>
      <div className="form-header text-center" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '36px', fontWeight: 800 }}>Final Review</h3>
        <p>Step 7 of 7: Please verify all information before submitting the application.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* Student Info */}
          <div className="form-card" style={{ marginBottom: 0, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div className="icon-wrapper color-primary bg-primary-fixed" style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">person</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Student Info</h3>
            </div>
            <dl className="admission-review-dl admission-review-dl--student">
              <div className="admission-review-field admission-review-field--full">
                <dt>Full Name</dt>
                <dd>{formData.firstName || 'Alexander'} {formData.lastName || 'Sterling'}</dd>
              </div>
              <div className="admission-review-field">
                <dt>Date of Birth</dt>
                <dd>{formData.dob || '12 May 2014'}</dd>
              </div>
              <div className="admission-review-field">
                <dt>Gender</dt>
                <dd>{formData.gender || 'Male'}</dd>
              </div>
            </dl>
          </div>

          {/* Academic Info */}
          <div className="form-card" style={{ marginBottom: 0, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div className="icon-wrapper color-tertiary bg-tertiary-fixed" style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">school</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Academic Info</h3>
            </div>
            <dl style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <dt style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)' }}>Applying For Grade</dt>
                <dd style={{ fontWeight: 600 }}>{formData.classApplied || 'Grade 4 (Standard Curriculum)'}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)' }}>Previous School</dt>
                <dd style={{ fontWeight: 600 }}>{formData.previousSchool || 'Oakwood International Academy'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Guardian Info - Spans full width */}
        <div className="form-card" style={{ marginBottom: 0, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div className="icon-wrapper color-secondary bg-secondary-fixed" style={{ backgroundColor: 'var(--secondary-container)', color: 'var(--secondary)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined">family_history</span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Guardian Info</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            <div>
              <dt style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)' }}>Primary Guardian</dt>
              <dd style={{ fontWeight: 600 }}>{formData.motherName || 'Sarah Sterling'} (Mother)</dd>
              <dd style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>{formData.motherPhone || '+1 (555) 0123-4567'}</dd>
            </div>
            <div>
              <dt style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)' }}>Emergency Contact</dt>
              <dd style={{ fontWeight: 600 }}>{formData.emergencyName || 'David Sterling'}</dd>
              <dd style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>{formData.emergencyPhone || '+1 (555) 9876-5432'}</dd>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Address & Transport */}
          <div className="form-card" style={{ marginBottom: 0, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div className="icon-wrapper color-primary bg-primary-fixed" style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">location_on</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Address & Transport</h3>
            </div>
            <dl style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <dt style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)' }}>Residential Address</dt>
                <dd style={{ fontSize: '14px', color: 'var(--on-surface-variant)' }}>{formData.presAddress || '742 Evergreen Terrace'}, {formData.presCity || 'Springfield'}, {formData.presState || 'IL'} {formData.presPin || '62704'}</dd>
              </div>
              <div>
                <dt style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)' }}>Transport Mode</dt>
                <dd style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="material-symbols-outlined text-primary text-sm">directions_bus</span>
                  {formData.transportRequired === 'no'
                    ? 'Not Required'
                    : `School Bus Service (${formData.busRouteNumber || '—'} • ${formData.pickupDropPoint || '—'})`}
                </dd>
              </div>
            </dl>
          </div>

          {/* Payment summary */}
          <div className="form-card" style={{ marginBottom: 0, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div className="icon-wrapper color-tertiary bg-tertiary-fixed" style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Fee &amp; Payment</h3>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ color: '#16a34a' }}>check_circle</span>
                Plan: {formData.feePlan || 'Standard'} — initial ₹{formData.initialPayment || '5000'}, admission fee ₹{formData.admissionFee || '1000'}
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ color: '#16a34a', flexShrink: 0 }}>check_circle</span>
                <span>
                  Total due: {formatRupee(totalDueAmount)}. Paying now: {formatRupee(payNowClamped)}
                  {remainingAfterPay > 0.009 ? (
                    <span style={{ display: 'block', marginTop: '6px' }}>
                      Balance after this payment: {formatRupee(remainingAfterPay)}
                    </span>
                  ) : null}
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ color: '#16a34a', flexShrink: 0 }}>check_circle</span>
                <span>
                  {splitEnabled && splitSecondaryAmount >= 0.01 ? (
                    <>
                      Split payment: {paymentLabel} {formatRupee(splitPrimaryClamped)}; {secondPaymentLabel}{' '}
                      {formatRupee(splitSecondaryAmount)}
                    </>
                  ) : (
                    <>Payment method: {paymentLabel}</>
                  )}
                </span>
              </li>
              {remarks.trim() ? (
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--outline)', flexShrink: 0 }}>notes</span>
                  <span>Remarks: {remarks.trim()}</span>
                </li>
              ) : null}
            </ul>
          </div>

          {/* Documents checklist */}
          <div className="form-card" style={{ marginBottom: 0, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div className="icon-wrapper color-primary bg-primary-fixed" style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">cloud_upload</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Documents</h3>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ color: formData.birthCert ? '#16a34a' : 'var(--outline)' }}>{formData.birthCert ? 'check_circle' : 'pending'}</span>
                Birth Certificate {formData.birthCert ? 'Uploaded' : 'Pending'}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ color: formData.reportCard ? '#16a34a' : 'var(--outline)' }}>{formData.reportCard ? 'check_circle' : 'pending'}</span>
                Report Card {formData.reportCard ? 'Uploaded' : 'Pending'}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ color: formData.addressProof ? '#16a34a' : 'var(--outline)' }}>{formData.addressProof ? 'check_circle' : 'pending'}</span>
                Address Proof {formData.addressProof ? 'Uploaded' : 'Pending'}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ color: formData.photos ? '#16a34a' : 'var(--outline)' }}>{formData.photos ? 'check_circle' : 'pending'}</span>
                Student Photos {formData.photos ? 'Uploaded' : 'Pending'}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', marginTop: '48px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px', backgroundColor: 'var(--surface-container-low)', borderRadius: '12px', maxWidth: '600px' }}>
          <span className="material-symbols-outlined color-tertiary">info</span>
          <p style={{ fontSize: '14px', color: 'var(--on-surface-variant)', margin: 0 }}>
            By clicking 'Confirm & Submit', you acknowledge that all information provided is accurate to the best of your knowledge. Inaccurate information may lead to the cancellation of the admission process.
          </p>
        </div>

        <div className="form-actions space-between form-actions--review-footer">
          <button type="button" className="btn-back" onClick={onBack}>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back</span>
          </button>
          <AdmissionDraftNextGroup onSaveDraft={onSaveDraft}>
            <button type="button" className="btn-next bg-gradient-primary" onClick={onSubmit}>
              <span>Confirm &amp; Submit</span>
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
            </button>
          </AdmissionDraftNextGroup>
        </div>
      </div>
    </>
  );
};
