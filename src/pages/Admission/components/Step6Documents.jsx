import React from 'react';

export const Step6Documents = ({ formData, updateFormData, onNext, onBack }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  const selectedFeePlan = formData.feePlan || 'Standard';
  const selectedPaymentMethod = formData.paymentMethod || 'Card';

  return (
    <>
      <div className="form-header text-center" style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '32px', fontWeight: 800 }}>Fee & Documents</h3>
        <p>Step 6 of 7: Select a fee plan and upload the required documents.</p>
      </div>

      <form className="admission-grid-12" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' }}>
        
        {/* Left Column */}
        <div style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Fee Plan Selection */}
          <div className="form-card" style={{ marginBottom: 0 }}>
            <div className="form-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined text-primary">payments</span>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Fee Plan Selection</h3>
            </div>
            
            <div className="fee-plans" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[
                { id: 'Standard', label: 'Tuition Only', price: '₹50k' },
                { id: 'Commute', label: 'Tuition + Transport', price: '₹65k' },
                { id: 'Residential', label: 'Tuition + Hostel', price: '₹120k' },
              ].map(plan => (
                <label key={plan.id} className={`fee-plan-card ${selectedFeePlan === plan.id ? 'active' : ''}`} style={{
                  display: 'flex', flexDirection: 'column', padding: '16px', borderRadius: '12px', cursor: 'pointer',
                  border: selectedFeePlan === plan.id ? '2px solid var(--primary)' : '2px solid rgba(41, 118, 199, 0.2)',
                  backgroundColor: selectedFeePlan === plan.id ? 'rgba(0, 93, 167, 0.05)' : 'transparent',
                  transition: 'all 0.2s'
                }}>
                  <input type="radio" name="feePlan" value={plan.id} checked={selectedFeePlan === plan.id} onChange={() => updateFormData({ feePlan: plan.id })} style={{ display: 'none' }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', marginBottom: '4px' }}>{plan.id}</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{plan.label}</span>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary)' }}>{plan.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Document Checklist */}
          <div className="form-card" style={{ marginBottom: 0 }}>
            <div className="form-header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="material-symbols-outlined text-primary">cloud_upload</span>
              <h3 style={{ margin: 0, fontSize: '20px' }}>Document Checklist</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {[
                { id: 'birthCert', label: 'Birth Certificate*' },
                { id: 'reportCard', label: 'Report Card*' },
                { id: 'addressProof', label: 'Address Proof*' },
                { id: 'tc', label: 'Transfer Certificate (TC)' },
                { id: 'photos', label: 'Student Photos (3)*', icon: 'add_photo_alternate' },
                { id: 'medicalCert', label: 'Medical Certificate' },
              ].map(doc => (
                <div key={doc.id} className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, marginLeft: '4px' }}>{doc.label}</label>
                  <label style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', 
                    backgroundColor: 'var(--surface-container-low)', borderRadius: '12px', cursor: 'pointer',
                    border: '1px dashed var(--outline-variant)'
                  }}>
                    <span style={{ fontSize: '14px', color: 'var(--outline)' }}>{formData[doc.id] ? formData[doc.id].name : 'Select file...'}</span>
                    <span className="material-symbols-outlined" style={{ color: 'var(--outline)' }}>{doc.icon || 'attach_file'}</span>
                    <input type="file" style={{ display: 'none' }} onChange={(e) => updateFormData({ [doc.id]: e.target.files[0] })} />
                  </label>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div className="form-card" style={{ marginBottom: 0, border: '1px solid var(--primary-fixed)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Payment Info</h3>
            
            <div className="form-group">
              <label>Initial Payment Amount (₹)*</label>
              <input type="number" defaultValue={formData.initialPayment || "5000"} onChange={e => updateFormData({ initialPayment: e.target.value })} style={{ backgroundColor: 'var(--surface-container-highest)', border: 'none', borderBottom: '2px solid var(--primary)', borderRadius: '8px 8px 0 0' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '24px 0' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>Apply Discount</div>
                <div style={{ fontSize: '10px', color: 'var(--outline)' }}>Scholarship or sibling discount</div>
              </div>
              {/* Toggle switch mock */}
              <div style={{ width: '44px', height: '24px', backgroundColor: formData.applyDiscount ? 'var(--primary)' : 'var(--surface-container-highest)', borderRadius: '9999px', position: 'relative', cursor: 'pointer' }} onClick={() => updateFormData({ applyDiscount: !formData.applyDiscount })}>
                <div style={{ position: 'absolute', top: '2px', left: formData.applyDiscount ? '22px' : '2px', width: '20px', height: '20px', backgroundColor: 'white', borderRadius: '50%', transition: 'all 0.2s' }}></div>
              </div>
            </div>

            <div style={{ paddingTop: '16px', borderTop: '1px solid var(--surface-container)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--outline)' }}>Initial Amount</span>
                <span style={{ fontWeight: 700 }}>₹{formData.initialPayment || "5000"}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: 'var(--outline)' }}>Processing Fee</span>
                <span style={{ fontWeight: 700 }}>₹0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', paddingTop: '12px', borderTop: '1px dashed var(--surface-container)' }}>
                <span style={{ fontWeight: 900 }}>Total Due</span>
                <span style={{ fontWeight: 900, color: 'var(--primary)' }}>₹{formData.initialPayment || "5000"}</span>
              </div>
            </div>
          </div>

          <div className="form-card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Payment Method*</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {[
                { id: 'Cash', icon: 'payments' },
                { id: 'Card', icon: 'credit_card' },
                { id: 'Online', icon: 'language' },
                { id: 'Bank', icon: 'account_balance' },
              ].map(method => (
                <div key={method.id} onClick={() => updateFormData({ paymentMethod: method.id })} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  padding: '16px', borderRadius: '12px', cursor: 'pointer',
                  border: selectedPaymentMethod === method.id ? '2px solid var(--primary)' : '1px solid var(--surface-container)',
                  backgroundColor: selectedPaymentMethod === method.id ? 'rgba(0, 93, 167, 0.05)' : 'transparent',
                  color: selectedPaymentMethod === method.id ? 'var(--primary)' : 'var(--outline)'
                }}>
                  <span className="material-symbols-outlined">{method.icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{method.id}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <div style={{ gridColumn: 'span 12', display: 'flex', justifyContent: 'space-between', marginTop: '48px' }}>
          <button type="button" className="btn-back" onClick={onBack}>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back</span>
          </button>
          <button type="submit" className="btn-next bg-gradient-primary">
            <span>Next Step</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </form>
    </>
  );
};
