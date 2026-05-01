import React from 'react';

export const Step7Review = ({ formData, onSubmit, onBack }) => {
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
            <dl style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <dt style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)' }}>Full Name</dt>
                <dd style={{ fontWeight: 600 }}>{formData.firstName || 'Alexander'} {formData.lastName || 'Sterling'}</dd>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <dt style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)' }}>Date of Birth</dt>
                  <dd style={{ fontWeight: 600 }}>{formData.dob || '12 May 2014'}</dd>
                </div>
                <div>
                  <dt style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--outline)' }}>Gender</dt>
                  <dd style={{ fontWeight: 600 }}>{formData.gender || 'Male'}</dd>
                </div>
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
                  {formData.transportRequired === 'no' ? 'Not Required' : `School Bus Service (${formData.pickupPoint || 'Zone 1'})`}
                </dd>
              </div>
            </dl>
          </div>

          {/* Fees & Documents */}
          <div className="form-card" style={{ marginBottom: 0, position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div className="icon-wrapper color-tertiary bg-tertiary-fixed" style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Fees & Documents</h3>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px', listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ color: '#16a34a' }}>check_circle</span>
                Registration Fee Selected ({formData.feePlan || 'Standard'} - ₹{formData.initialPayment || '5000'})
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ color: '#16a34a' }}>check_circle</span>
                Birth Certificate {formData.birthCert ? 'Uploaded' : 'Pending'}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: 'var(--on-surface-variant)' }}>
                <span className="material-symbols-outlined" style={{ color: '#16a34a' }}>check_circle</span>
                Report Cards {formData.reportCard ? 'Uploaded' : 'Pending'}
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

        <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '600px' }}>
          <button type="button" onClick={onBack} style={{ flex: 1, padding: '16px 32px', backgroundColor: 'var(--surface-container-highest)', color: 'var(--on-surface)', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </button>
          <button type="button" onClick={onSubmit} style={{ flex: 2, padding: '16px 32px', background: 'linear-gradient(to right, var(--primary), var(--primary-container))', color: 'white', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            Confirm & Submit
            <span className="material-symbols-outlined">rocket_launch</span>
          </button>
        </div>
      </div>
    </>
  );
};
