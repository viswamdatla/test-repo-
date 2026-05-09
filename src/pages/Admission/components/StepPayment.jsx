import React, { useMemo } from 'react';
import { AdmissionDraftNextGroup } from './AdmissionSaveDraftNext';
import { collectFeePaymentMethods } from '../../../data/collectFeeMock';
import '../../FinancialServices/CollectFeeFlowPage.scss';

function formatRupee(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return '₹0.00';
  return `₹${x.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const StepPayment = ({ formData, updateFormData, onNext, onBack, onSaveDraft }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  const selectedFeePlan = formData.feePlan || 'Standard';
  const initialPaymentAmount = Number(formData.initialPayment ?? 5000) || 0;
  const admissionFeeAmount = Number(formData.admissionFee ?? 1000) || 0;
  const enteredDiscountAmount = Number(formData.discountAmount ?? 0) || 0;
  const subtotalAmount = initialPaymentAmount + admissionFeeAmount;
  const effectiveDiscountAmount = formData.applyDiscount ? Math.min(enteredDiscountAmount, subtotalAmount) : 0;
  const totalDueAmount = Math.max(0, subtotalAmount - effectiveDiscountAmount);

  const paymentMethodId = formData.admissionPaymentMethodId ?? 'cash';
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

  const remainingAfterThisPayment = Math.max(0, totalDueAmount - payNowClamped);

  const splitPrimaryClamped = splitEnabled
    ? Math.min(Math.max(0, splitPrimaryRaw), payNowClamped)
    : payNowClamped;
  const splitSecondaryAmount = splitEnabled ? Math.max(0, payNowClamped - splitPrimaryClamped) : 0;

  const paymentLabel =
    collectFeePaymentMethods.find((m) => m.id === paymentMethodId)?.label ?? paymentMethodId;
  const secondPaymentLabel =
    collectFeePaymentMethods.find((m) => m.id === secondPaymentMethodId)?.label ?? secondPaymentMethodId;

  const remarks = formData.admissionPaymentRemarks ?? '';

  const setPaymentMethod = (id) => {
    const payload = { admissionPaymentMethodId: id };
    if (secondPaymentMethodId === id) {
      const alt = collectFeePaymentMethods.find((x) => x.id !== id);
      if (alt) payload.admissionSecondPaymentMethodId = alt.id;
    }
    updateFormData(payload);
  };

  const toggleSplit = () => {
    const next = !splitEnabled;
    updateFormData({
      admissionSplitEnabled: next,
      ...(next ? { admissionSplitPrimaryAmount: payNowClamped } : {}),
    });
  };

  return (
    <>
      <div className="form-header text-center admission-payment-page-header">
        <h3>Fee &amp; Payment</h3>
        <p>Step 6 of 7: Choose a fee plan, how much to pay now, and payment methods.</p>
      </div>

      <form className="admission-payment-form" onSubmit={handleSubmit} noValidate>
        <div className="admission-payment-layout">
          <div className="admission-payment-main">
            <div className="form-card admission-payment-card admission-payment-card--fee-column">
              <div className="form-header admission-payment-card-head">
                <span className="material-symbols-outlined text-primary">payments</span>
                <h3>Fee Plan Selection</h3>
              </div>

              <div className="fee-plans admission-fee-plans-grid">
                {[
                  { id: 'Standard', label: 'Tuition Only', price: '₹50k' },
                  { id: 'Commute', label: 'Tuition + Transport', price: '₹65k' },
                  { id: 'Residential', label: 'Tuition + Hostel', price: '₹120k' },
                ].map((plan) => (
                  <label
                    key={plan.id}
                    className={`fee-plan-card admission-fee-plan ${selectedFeePlan === plan.id ? 'active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="feePlan"
                      value={plan.id}
                      checked={selectedFeePlan === plan.id}
                      onChange={() => updateFormData({ feePlan: plan.id })}
                    />
                    <span className="admission-fee-plan-tier">{plan.id}</span>
                    <span className="admission-fee-plan-label">{plan.label}</span>
                    <span className="admission-fee-plan-price">{plan.price}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-card admission-payment-card admission-payment-method-stack">
              <h3 className="admission-payment-method-stack__title">Select Payment Method</h3>
              <p className="cf-pay-main__payable admission-payment-final-payable">
                Final payable (after discount): <strong>{formatRupee(totalDueAmount)}</strong>
              </p>

              <div className="cf-field admission-pay-partial-field">
                <label className="cf-field__label" htmlFor="adm-pay-now">
                  Amount to pay now
                </label>
                <input
                  id="adm-pay-now"
                  type="number"
                  min={0}
                  step="0.01"
                  className="cf-input"
                  placeholder={`Full amount (${totalDueAmount})`}
                  value={formData.admissionPayNowInput ?? ''}
                  onChange={(e) => updateFormData({ admissionPayNowInput: e.target.value })}
                  onFocus={(e) => e.target.select()}
                />
                <p className="admission-pay-partial-hint">
                  Leave blank to pay the full amount in this step. Enter less to pay little by little — the rest stays as
                  balance.
                </p>
                {remainingAfterThisPayment > 0.009 ? (
                  <p className="admission-pay-remaining">
                    Remaining balance after this payment: <strong>{formatRupee(remainingAfterThisPayment)}</strong>
                  </p>
                ) : null}
              </div>

              <div className="cf-field">
                <span className="cf-field__label">Payment options</span>
                <div className="cf-method-card-grid">
                  {collectFeePaymentMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`cf-method-card ${paymentMethodId === m.id ? 'is-selected' : ''}`}
                      onClick={() => setPaymentMethod(m.id)}
                    >
                      {paymentMethodId === m.id ? (
                        <span className="cf-method-card__check material-symbols-outlined" aria-hidden>
                          check_circle
                        </span>
                      ) : null}
                      <span className="cf-method-card__icon">
                        <span className="material-symbols-outlined">{m.icon}</span>
                      </span>
                      <span className="cf-method-card__label">{m.label}</span>
                      {m.description ? <span className="cf-method-card__desc">{m.description}</span> : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="cf-split-bar admission-split-bar">
                <div>
                  <span className="cf-split-bar__label">Enable Split Payment</span>
                  <p className="admission-split-bar__sub">Pay using two different methods for the amount above.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={splitEnabled}
                  className={`cf-switch ${splitEnabled ? 'is-on' : ''}`}
                  onClick={toggleSplit}
                >
                  <span className="cf-switch__thumb" />
                </button>
              </div>

              {splitEnabled ? (
                <div className="cf-split-fields">
                  <div className="cf-field">
                    <label className="cf-field__label" htmlFor="adm-split-primary-amt">
                      {`Amount via ${paymentLabel}`}
                    </label>
                    <input
                      id="adm-split-primary-amt"
                      type="number"
                      min={0}
                      step="0.01"
                      className="cf-input"
                      value={splitPrimaryRaw === 0 ? '' : splitPrimaryRaw}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') {
                          updateFormData({ admissionSplitPrimaryAmount: 0 });
                          return;
                        }
                        const n = Math.min(Math.max(0, Number(raw) || 0), payNowClamped);
                        updateFormData({ admissionSplitPrimaryAmount: n });
                      }}
                      onBlur={() => {
                        if (!Number.isFinite(splitPrimaryRaw) || splitPrimaryRaw < 0) {
                          updateFormData({ admissionSplitPrimaryAmount: 0 });
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                  <div className="cf-field cf-field--readonly">
                    <span className="cf-field__label">Remaining (2nd method)</span>
                    <div className="cf-readonly-val">{formatRupee(splitSecondaryAmount)}</div>
                  </div>
                  <div className="cf-field">
                    <label className="cf-field__label" htmlFor="adm-second-method">
                      Second method (receives remaining amount)
                    </label>
                    <select
                      id="adm-second-method"
                      className="cf-select"
                      value={secondPaymentMethodId}
                      onChange={(e) => updateFormData({ admissionSecondPaymentMethodId: e.target.value })}
                    >
                      {collectFeePaymentMethods
                        .filter((m) => m.id !== paymentMethodId)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                    </select>
                    <p className="cf-second-hint">
                      {secondPaymentLabel.toUpperCase()}: {formatRupee(splitSecondaryAmount)}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="cf-field">
                <label className="cf-field__label" htmlFor="adm-payment-remarks">
                  Remarks (optional)
                </label>
                <textarea
                  id="adm-payment-remarks"
                  className="cf-textarea"
                  rows={3}
                  maxLength={200}
                  value={remarks}
                  onChange={(e) => updateFormData({ admissionPaymentRemarks: e.target.value })}
                  placeholder="e.g. Partial payment reference, UPI ID, cheque number…"
                />
                <p className="admission-remarks-count">{remarks.length}/200</p>
              </div>
            </div>
          </div>

          <div className="admission-payment-sidebar">
            <div className="form-card admission-payment-card admission-payment-card--accent">
              <h3>Payment Info</h3>

              <div className="form-group">
                <label htmlFor="initial-payment-amt">Initial Payment Amount (₹)*</label>
                <input
                  id="initial-payment-amt"
                  className="admission-amount-input"
                  type="number"
                  value={formData.initialPayment ?? '5000'}
                  onChange={(e) => updateFormData({ initialPayment: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="admission-fee-amt">Admission Fee (₹)*</label>
                <input
                  id="admission-fee-amt"
                  className="admission-amount-input"
                  type="number"
                  value={formData.admissionFee ?? '1000'}
                  onChange={(e) => updateFormData({ admissionFee: e.target.value })}
                />
              </div>

              <div className="admission-discount-row">
                <div>
                  <div className="admission-discount-title">Apply Discount</div>
                  <div className="admission-discount-sub">Scholarship or sibling discount</div>
                </div>
                <button
                  type="button"
                  className={`admission-discount-toggle ${formData.applyDiscount ? 'is-on' : ''}`}
                  aria-pressed={Boolean(formData.applyDiscount)}
                  onClick={() =>
                    updateFormData({
                      applyDiscount: !formData.applyDiscount,
                      discountAmount: !formData.applyDiscount ? formData.discountAmount ?? '' : '',
                    })
                  }
                >
                  <span className="admission-discount-knob" />
                </button>
              </div>

              {formData.applyDiscount && (
                <div className="form-group">
                  <label htmlFor="discount-amt">Discount Amount (₹)</label>
                  <input
                    id="discount-amt"
                    className="admission-amount-input"
                    type="number"
                    value={formData.discountAmount ?? ''}
                    onChange={(e) => updateFormData({ discountAmount: e.target.value })}
                    placeholder="Enter discount amount"
                  />
                </div>
              )}

              <div className="admission-payment-totals">
                <div className="admission-payment-total-line">
                  <span>Initial Amount</span>
                  <span>₹{initialPaymentAmount}</span>
                </div>
                <div className="admission-payment-total-line">
                  <span>Admission Fee</span>
                  <span>₹{admissionFeeAmount}</span>
                </div>
                <div className="admission-payment-total-line">
                  <span>Processing Fee</span>
                  <span>₹0</span>
                </div>
                {formData.applyDiscount && (
                  <div className="admission-payment-total-line admission-payment-total-line--discount">
                    <span>Discount</span>
                    <span>-₹{effectiveDiscountAmount}</span>
                  </div>
                )}
                <div className="admission-payment-total-due">
                  <span>Total Due</span>
                  <span>₹{totalDueAmount}</span>
                </div>
                <div className="admission-payment-total-line admission-payment-sidebar-paynow">
                  <span>Paying now</span>
                  <span>{formatRupee(payNowClamped)}</span>
                </div>
                {splitEnabled && splitSecondaryAmount >= 0.01 ? (
                  <div className="admission-payment-split-summary">
                    <span className="admission-payment-split-summary-line">
                      {paymentLabel}: {formatRupee(splitPrimaryClamped)}
                    </span>
                    <span className="admission-payment-split-summary-line">
                      {secondPaymentLabel}: {formatRupee(splitSecondaryAmount)}
                    </span>
                  </div>
                ) : (
                  <div className="admission-payment-sidebar-method">{paymentLabel}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions space-between admission-payment-actions">
          <button type="button" className="btn-back" onClick={onBack}>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back</span>
          </button>
          <AdmissionDraftNextGroup onSaveDraft={onSaveDraft}>
            <button type="submit" className="btn-next bg-gradient-primary">
              <span>Next</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </AdmissionDraftNextGroup>
        </div>
      </form>
    </>
  );
};
